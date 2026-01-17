
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export async function* streamChat(message: string, history: { role: string, parts: { text: string }[] }[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  // Convert our internal format to Gemini's format
  // Note: Gemini expects roles 'user' and 'model'
  const chatHistory = history.map(h => ({
    role: h.role === 'USER' ? 'user' : 'model',
    parts: [{ text: h.parts[0].text }]
  }));

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [...chatHistory, { role: 'user', parts: [{ text: message }] }],
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) yield text;
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
}
