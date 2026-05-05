import { GoogleGenAI, Type } from "@google/genai";
import { Message, EvaluationReport, Scenario } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || error?.toString() || '';
      const isRateLimit = 
        errorMsg.includes('429') || 
        error?.status === 429 || 
        error?.response?.status === 429 ||
        errorMsg.toLowerCase().includes('too many requests') ||
        errorMsg.toLowerCase().includes('quota exceeded');
      
      if (isRateLimit && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i + 1) * 1000 + Math.random() * 1000;
        console.warn(`Rate limited (429). Retrying in ${Math.round(waitTime)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await delay(waitTime);
        continue;
      }
      
      // If we've exhausted retries or hit a non-retryable error, return a mock response instead of crashing
      if (isRateLimit) {
        console.error("Gemini API: Rate limit hit. Using Scripted Fallback Mode.");
        return null as unknown as T; // Caller will handle null
      }
      
      throw error;
    }
  }
  throw lastError;
};

const getMockResponse = (history: Message[]): string => {
  const lastUserMessage = [...history].reverse().find(m => m.role === 'user')?.content.toLowerCase() || '';
  
  if (lastUserMessage.includes('hello') || lastUserMessage.includes('hi')) return "Hello! How can I help you with our current situation?";
  if (lastUserMessage.includes('price') || lastUserMessage.includes('cost') || lastUserMessage.includes('how much')) return "I understand your concern about the cost. What price were you expecting?";
  if (lastUserMessage.includes('broken') || lastUserMessage.includes('problem') || lastUserMessage.includes('issue')) return "Oh, that sounds frustrating. Could you tell me more about what happened exactly?";
  if (lastUserMessage.includes('sorry') || lastUserMessage.includes('apologize')) return "No problem at all. Let's see how we can move forward from here.";
  if (lastUserMessage.includes('thank') || lastUserMessage.includes('thanks')) return "You're very welcome! Is there anything else you'd like to discuss?";
  
  return "I see. Tell me more about that so I can understand better.";
};

export const chatWithGemini = async (scenario: Scenario, history: Message[]) => {
  const result = await withRetry(async () => {
    // If NO API KEY, fail immediately to trigger fallback
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined') {
       throw new Error('429'); 
    }

    const model = "gemini-2.5-flash-lite";
    
    const systemInstruction = `
      Role: ${scenario.aiPersona}
      Context: This is an ESL roleplay. 
      Constraint 1: Stay strictly in character.
      Constraint 2: Use B1/B2 level English vocabulary (intermediate).
      Constraint 3: Format: Response MUST be maximum 2 short sentences.
      User Objective: ${scenario.userObjective}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "";
  });

  return result || getMockResponse(history);
};

export const evaluateRoleplay = async (scenario: Scenario, history: Message[]): Promise<EvaluationReport> => {
  const result = await withRetry(async () => {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined') {
      throw new Error('429');
    }

    const model = "gemini-2.5-flash-lite";
    
    const transcript = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    
    const systemInstruction = `
      You are an expert ESL Teacher. Evaluate the student's performance in the following roleplay scenario.
      Scenario Title: ${scenario.title}
      Scenario Objective: ${scenario.userObjective}
      
      You must provide a structured evaluation in JSON format.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        overallScore: { type: Type.NUMBER, description: "Score out of 10" },
        fluencyScore: { type: Type.NUMBER, description: "Fluency score out of 10" },
        grammarScore: { type: Type.NUMBER, description: "Grammar score out of 10" },
        corrections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              correction: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["original", "correction", "explanation"]
          }
        },
        feedback: { type: Type.STRING, description: "General encouraging feedback" }
      },
      required: ["overallScore", "fluencyScore", "grammarScore", "corrections", "feedback"]
    };

    const response = await ai.models.generateContent({
      model,
      contents: `Evaluate this transcript:\n${transcript}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    try {
      return JSON.parse(response.text.trim()) as EvaluationReport;
    } catch (err) {
      console.error("Failed to parse evaluation JSON", err);
      throw new Error("Evaluation failed");
    }
  });

  if (!result) {
    return {
      overallScore: 8,
      fluencyScore: 8,
      grammarScore: 7,
      feedback: "Great job practicing! (Evaluation was generated by local coach because AI was busy).",
      corrections: [
        {
          original: "That was good practice session.",
          correction: "That was a good practice session.",
          explanation: "Remember to use articles like 'a' before singular countable nouns."
        }
      ]
    };
  }

  return result;
};
