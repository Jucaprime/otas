
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function generateNoteContent(prompt: string, existingContent: string = ''): Promise<string> {
  if (!process.env.API_KEY) {
    return "API key not configured. Please set the API_KEY environment variable.";
  }

  try {
    const fullPrompt = `
      You are a creative assistant helping a user write notes.
      The user's request is: "${prompt}".
      ${existingContent ? `The current note content is:\n---\n${existingContent}\n---\nContinue or elaborate on this.` : ''}
      Generate a concise and helpful response based on the request.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
          temperature: 0.7,
          topP: 1,
          topK: 32,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    return "Sorry, I couldn't generate content at this time. Please try again later.";
  }
}
