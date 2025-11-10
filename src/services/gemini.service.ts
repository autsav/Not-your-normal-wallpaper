import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

/**
 * Custom error class for API-specific issues.
 */
export class GeminiApiError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'GeminiApiError';
  }
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (process.env.API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      console.error('API_KEY environment variable not set.');
    }
  }

  /**
   * Creates a user-friendly error message from a raw API error.
   * @param error - The caught error object.
   * @returns A string with a helpful message for the user.
   */
  private createFriendlyErrorMessage(error: unknown): string {
    let friendlyMessage = 'An unexpected error occurred while communicating with the AI. Please check the browser console for more details.';
    if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
            friendlyMessage = 'The API key is invalid or missing. Please ensure it is configured correctly.';
        } else if (error.message.includes('SAFETY')) {
            friendlyMessage = 'The request was blocked by the AI\'s safety filter. Please adjust your prompt to be less sensitive and try again.';
        } else if (error.message.includes('429') || error.message.toLowerCase().includes('rate limit')) {
           friendlyMessage = 'You have made too many requests in a short period. Please wait a moment and try again.';
        } else if (error.message.includes('500') || error.message.toLowerCase().includes('server error')) {
           friendlyMessage = 'The AI service is currently experiencing issues. Please try again later.';
        } else if (error.message.toLowerCase().includes('invalid')) {
           friendlyMessage = `The request was invalid. The AI reported: ${error.message}`;
        }
    }
    return friendlyMessage;
  }

  async generateImage(prompt: string, negativePrompt?: string): Promise<string | null> {
    if (!this.ai) {
      throw new GeminiApiError('Gemini AI client is not initialized. Check API key configuration.');
    }

    try {
      // FIX: Moved negativePrompt into the config object as per best practice.
      const response = await this.ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
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
      throw new GeminiApiError(this.createFriendlyErrorMessage(error), error);
    }
  }

  async editImage(imageData: string, prompt: string): Promise<string | null> {
    if (!this.ai) {
      throw new GeminiApiError('Gemini AI client is not initialized. Check API key configuration.');
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

      // FIX: The `contents` property for single-turn multimodal requests should be an object, not an array.
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });

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
      throw new GeminiApiError(this.createFriendlyErrorMessage(error), error);
    }
  }

  async upscaleImage(imageData: string): Promise<string | null> {
    if (!this.ai) {
      throw new GeminiApiError('Gemini AI client is not initialized. Check API key configuration.');
    }

    try {
      const imagePart = {
        inlineData: {
          mimeType: 'image/png',
          data: imageData,
        },
      };
      const textPart = {
        text: 'Upscale this image to 4K resolution. Enhance all details, improve lighting and shadows, and make it look photorealistic and ultra-sharp. Do not change the composition or content.',
      };

      // FIX: The `contents` property for single-turn multimodal requests should be an object, not an array.
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if ('inlineData' in part && part.inlineData?.data) {
            return part.inlineData.data;
          }
        }
      }
      
      console.warn('Gemini API did not return an upscaled image.');
      return null;
    } catch (error) {
      console.error('Error upscaling image with Gemini API:', error);
      throw new GeminiApiError(this.createFriendlyErrorMessage(error), error);
    }
  }
}
