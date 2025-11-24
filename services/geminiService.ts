import { GoogleGenAI } from "@google/genai";
import { Step, MappingResult } from "../types";

const apiKey = process.env.API_KEY || ''; // Fallback to empty if not set, will be handled in UI

const ai = new GoogleGenAI({ apiKey });

export const explainMapping = async (
  docBefore: string,
  step: Step,
  trackedPos: number,
  result: MappingResult
): Promise<string> => {
  if (!apiKey) {
    return "API Key not configured. Please check your environment variables to enable AI explanations.";
  }

  const prompt = `
    You are an expert ProseMirror engineer teaching a student.
    
    Context:
    - Original Document: "${docBefore}"
    - Action: ${step.type === 'INSERT' ? `Insert "${step.slice}" at index ${step.from}` : `Delete from index ${step.from} to ${step.to}`}
    - Tracked Position (Before): ${trackedPos}
    - Mapped Position (After): ${result.newPos}
    ${result.deleted ? '- NOTE: The position was inside a deleted range.' : ''}

    Explain WHY the position moved from ${trackedPos} to ${result.newPos} (or why it stayed the same) in 1-2 short, conversational sentences suitable for a beginner. Use the term "StepMap" if relevant but keep it simple.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI tutor. Please try again later.";
  }
};

export const askGeneralQuestion = async (question: string): Promise<string> => {
   if (!apiKey) {
    return "API Key not configured.";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a ProseMirror expert. Answer this question briefly and clearly: ${question}`,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error(error);
    return "Error answering question.";
  }
}