import { GoogleGenAI, Type } from "@google/genai";
import { Message, EvaluationReport, Scenario } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const chatWithGemini = async (scenario: Scenario, history: Message[]) => {
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
};

export const evaluateRoleplay = async (scenario: Scenario, history: Message[]): Promise<EvaluationReport> => {
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
};
