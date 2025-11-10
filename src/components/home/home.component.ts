import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { WallpaperService } from '../../services/wallpaper.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="max-w-4xl mx-auto text-white">
      <h1 class="text-4xl font-bold text-center mb-2">Create Your AI Wallpaper</h1>
      <p class="text-center text-white/70 mb-8">
        Describe your vision and let our AI bring it to life as a stunning mobile wallpaper.
      </p>

      <div class="bg-white/10 p-8 rounded-lg shadow-2xl backdrop-blur-lg">
        <form (submit)="generateWallpaper()">
          <div class="mb-4">
            <label for="prompt" class="block mb-2 font-semibold">Prompt</label>
            <textarea
              id="prompt"
              rows="3"
              class="w-full bg-gray-900/50 border border-white/20 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-white"
              [ngModel]="prompt()"
              (ngModelChange)="prompt.set($event)"
              name="prompt"
              placeholder="e.g., A tranquil zen garden with cherry blossoms under a full moon"
            ></textarea>
          </div>
          <div class="mb-6">
            <label for="negativePrompt" class="block mb-2 font-semibold">Negative Prompt (Optional)</label>
            <input
              type="text"
              id="negativePrompt"
              class="w-full bg-gray-900/50 border border-white/20 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-white"
              [ngModel]="negativePrompt()"
              (ngModelChange)="negativePrompt.set($event)"
              name="negativePrompt"
              placeholder="e.g., blurry, text, watermark, ugly"
            />
          </div>
          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center space-x-2"
          >
            @if (isLoading()) {
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating...</span>
            } @else {
              <span>Generate Wallpaper</span>
            }
          </button>
        </form>
      </div>

      @if (error()) {
        <div class="mt-6 bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-md">
          <p>{{ error() }}</p>
        </div>
      }

      @if (isLoading() && !generatedImage()) {
        <div class="mt-8 text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-white/50 mb-4"></div>
            <p class="text-lg">Generating your masterpiece... this can take a moment.</p>
        </div>
      }

      @if (generatedImage()) {
        <div class="mt-8 bg-white/5 p-4 rounded-lg">
          <h2 class="text-2xl font-bold mb-4 text-center">Your New Wallpaper!</h2>
          <div class="flex justify-center">
            <img [src]="fullImageUrl()" alt="Generated Wallpaper" class="rounded-lg shadow-lg max-h-[70vh] border-4 border-white/20" />
          </div>
          <div class="mt-6 flex justify-center space-x-4">
             <button (click)="saveWallpaper()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition">
              Save to Gallery
            </button>
            <a [href]="fullImageUrl()" download="ai-wallpaper.png" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition">
              Download
            </a>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly geminiService = inject(GeminiService);
  private readonly wallpaperService = inject(WallpaperService);

  prompt = signal('A cyberpunk cityscape at night, neon lights reflecting on wet streets, flying cars');
  negativePrompt = signal('ugly, distorted, blurry, watermark, text');
  generatedImage = signal<string | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  async generateWallpaper(): Promise<void> {
    if (!this.prompt().trim()) {
      this.error.set('Prompt cannot be empty.');
      return;
    }

    this.isLoading.set(true);
    this.generatedImage.set(null);
    this.error.set(null);

    try {
      const imageData = await this.geminiService.generateImage(this.prompt(), this.negativePrompt());
      if (imageData) {
        this.generatedImage.set(imageData);
      } else {
        this.error.set('Failed to generate wallpaper. The API might have returned no image.');
      }
    } catch (e) {
      this.error.set('An error occurred while generating the wallpaper.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  saveWallpaper(): void {
    const imageData = this.generatedImage();
    const prompt = this.prompt();
    const negativePrompt = this.negativePrompt();

    if (imageData) {
      this.wallpaperService.addWallpaper({
        prompt,
        negativePrompt,
        imageData,
      });
      // A better UX would use a toast, but alert is simple and effective here.
      alert('Wallpaper saved to gallery!');
      this.generatedImage.set(null);
    }
  }

  fullImageUrl(): string | null {
    const imageData = this.generatedImage();
    return imageData ? `data:image/png;base64,${imageData}` : null;
  }
}
