import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // IMPORTANT: The API_KEY is expected to be set in the environment variables.
    // Do not expose this key in the client-side code in a real application.
    if (process.env.API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      console.error('API_KEY environment variable not set.');
    }
  }

  async generateImage(prompt: string, negativePrompt?: string): Promise<string | null> {
    if (!this.ai) {
      console.error('Gemini AI client is not initialized.');
      return null;
    }

    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          // Mobile wallpaper aspect ratio
          aspectRatio: '9:16',
          ...(negativePrompt && { negativePrompt }),
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
      }
      return null;
    } catch (error) {
      console.error('Error generating image with Gemini API:', error);
      return null;
    }
  }

  async editImage(imageData: string, prompt: string): Promise<string | null> {
    if (!this.ai) {
      console.error('Gemini AI client is not initialized.');
      return null;
    }

    try {
      const imagePart = {
        inlineData: {
          mimeType: 'image/png',
          data: imageData,
        },
      };
      const textPart = {
        text: prompt,
      };

      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });

      // Check for image data in the response
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if ('inlineData' in part && part.inlineData?.data) {
            return part.inlineData.data;
          }
        }
      }

      console.warn('Gemini API did not return an image for editing request. The model may have responded with text instead.');
      return null;
    } catch (error) {
      console.error('Error editing image with Gemini API:', error);
      return null;
    }
  }
}