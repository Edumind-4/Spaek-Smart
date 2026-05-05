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
      
      console.error("Gemini API Error:", errorMsg);
      throw error;
    }
  }
  throw lastError;
};

export const chatWithGemini = async (scenario: Scenario, history: Message[]) => {
  return withRetry(async () => {
    // If NO API KEY, fail immediately
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined') {
       throw new Error('GEMINI_API_KEY is not defined in the environment.'); 
    }

    const model = "gemini-3.1-pro-preview";
    
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
};

export const evaluateRoleplay = async (scenario: Scenario, history: Message[]): Promise<EvaluationReport> => {
  return withRetry(async () => {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined') {
      throw new Error('GEMINI_API_KEY is not defined in the environment.');
    }

    const model = "gemini-3.1-pro-preview";
    
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
      const evaluation = JSON.parse(response.text.trim()) as EvaluationReport;
      return evaluation;
    } catch (err) {
      console.error("Failed to parse evaluation JSON", err);
      throw new Error("Evaluation failed");
    }
  });
};

