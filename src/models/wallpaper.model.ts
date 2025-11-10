// Defines the data structure for a wallpaper object.
export interface Wallpaper {
  id: string;
  prompt: string;
  negativePrompt?: string;
  imageData: string; // base64 encoded string
  createdAt: Date;
}
