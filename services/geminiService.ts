
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutSession, Alert } from "../types";

// Always initialize with a named parameter for the API key.
// Vite uses import.meta.env for environment variables
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

/**
 * Analyzes a TITAN 133 workout session using Gemini 3 Flash.
 * Provides high-intensity coaching feedback based on protocol adherence.
 */
export async function getWorkoutInsights(session: WorkoutSession): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this TITAN 133 bodybuilding session: ${JSON.stringify(session)}. 
      Focus on mechanical tension rules and RPE 0-1 adherence.`,
      config: {
        systemInstruction: "You are the TITAN 133 AI Coach. Provide a one-sentence, intense, motivating critique or encouragement in the style of an elite bodybuilding coach.",
      },
    });

    return response.text || "PROTOCOL ADHERED. CONTINUE THE GRIND.";
  } catch (error) {
    console.error("Titan AI Insight Error:", error);
    return "Maintain intensity. Data synchronization pending.";
  }
}

/**
 * Scans recent workout history to generate automated performance alerts.
 * Uses Gemini 3 Pro for complex reasoning over historical data.
 */
export async function generateHealthAlerts(sessions: WorkoutSession[]): Promise<Alert[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Evaluate the last 5 sessions for trends: ${JSON.stringify(sessions.slice(0, 5))}. 
      Detect deload requirements, strength plateaus, or volume imbalances.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              severity: { type: Type.STRING },
              title: { type: Type.STRING },
              message: { type: Type.STRING },
              createdAt: { type: Type.STRING }
            },
            required: ["id", "type", "severity", "title", "message", "createdAt"]
          },
        },
      },
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Titan AI Alert Error:", error);
    return [];
  }
}
