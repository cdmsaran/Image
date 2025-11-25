import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API Client
// Note: process.env.API_KEY is assumed to be available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Edits an image using Gemini 2.5 Flash Image.
 * @param base64Image The source image in base64 format (no data URI prefix).
 * @param mimeType The MIME type of the source image.
 * @param prompt The user's editing instruction.
 * @returns The base64 data of the generated image.
 */
export const generateEditedImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    // Clean base64 string if it contains headers
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Specific model requested
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
      // Note: responseMimeType is NOT supported for nano banana series.
      // aspect ratio can be hinted via prompt or supported values in config (1:1, 3:4, etc.)
      // Since 3:2 is not a standard config enum, we rely on the prompt for cropping if needed.
    });

    // Extract image from response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
