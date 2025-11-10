import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { WallpaperService } from '../../services/wallpaper.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col lg:flex-row gap-8 text-white">
      <!-- Form Controls -->
      <div class="lg:w-1/3 flex flex-col gap-6 p-6 bg-black/20 rounded-xl shadow-lg backdrop-blur-md border border-white/10">
        <h2 class="text-2xl font-bold text-indigo-400">Create Your Aura</h2>
        
        <div>
          <label for="prompt" class="block mb-2 font-semibold text-white/80">Prompt</label>
          <textarea id="prompt" name="prompt" rows="6"
            [ngModel]="prompt()" (ngModelChange)="prompt.set($event)"
            class="w-full bg-black/30 border border-white/20 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            placeholder="e.g., A vibrant wallpaper of a futuristic city skyline at dusk..."></textarea>
        </div>

        <div>
          <label for="negative-prompt" class="block mb-2 font-semibold text-white/80">Negative Prompt</label>
          <textarea id="negative-prompt" name="negativePrompt" rows="3"
            [ngModel]="negativePrompt()" (ngModelChange)="negativePrompt.set($event)"
            class="w-full bg-black/30 border border-white/20 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            placeholder="e.g., blurry, low quality, text, watermark..."></textarea>
        </div>
        
        <button (click)="generateWallpaper()" [disabled]="isLoading()"
          class="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            @if (isLoading()) {
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ statusMessage() }}</span>
            } @else {
              <span>Generate Aura</span>
            }
        </button>

        @if (error()) {
          <div class="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-sm">
            <p class="font-bold">Generation Failed</p>
            <p>{{ error() }}</p>
          </div>
        }
      </div>

      <!-- Image Display -->
      <div class="lg:w-2/3 flex-grow flex flex-col items-center justify-center p-6 bg-black/20 rounded-xl shadow-lg backdrop-blur-md border border-white/10 min-h-[60vh]">
        @if (!generatedImage() && !isLoading()) {
          <div class="text-center text-white/50">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p class="mt-4 text-xl">Your generated wallpaper will appear here.</p>
            <p>Enter a prompt and click "Generate Aura".</p>
          </div>
        }

        @if (isLoading()) {
           <div class="text-center text-white/80">
            <svg class="animate-spin h-12 w-12 text-indigo-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-4 text-xl font-semibold">{{ statusMessage() }}</p>
            <p class="text-white/60">This may take a moment...</p>
          </div>
        }

        @if (generatedImage() && !isLoading()) {
          <div class="w-full h-full flex flex-col items-center justify-center gap-4">
            <div class="aspect-[9/16] h-[70vh] max-h-full rounded-lg overflow-hidden shadow-2xl">
              <img [src]="'data:image/png;base64,' + generatedImage()" alt="Generated AI wallpaper" class="w-full h-full object-contain">
            </div>
            <div class="flex flex-wrap items-center justify-center gap-4 mt-4">
               <button (click)="saveToGallery()" [disabled]="isImageSaved()" class="py-2 px-5 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition disabled:bg-green-800 disabled:cursor-not-allowed">
                {{ isImageSaved() ? 'Saved to Gallery' : 'Save to Gallery' }}
              </button>
              <button (click)="upscaleImage()" class="py-2 px-5 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition">
                Upscale
              </button>
              <a [href]="'data:image/png;base64,' + generatedImage()" [download]="downloadFilename()" class="py-2 px-5 bg-gray-600 hover:bg-gray-700 rounded-md font-semibold transition text-center">
                Download
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly geminiService = inject(GeminiService);
  private readonly wallpaperService = inject(WallpaperService);

  prompt = signal<string>('A vibrant wallpaper of a futuristic city skyline at dusk, neon lights reflecting on wet streets, in a synthwave style.');
  negativePrompt = signal<string>('blurry, low quality, ugly, text, watermark, deformed');
  
  generatedImage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  statusMessage = signal<string>('');
  isImageSaved = signal<boolean>(false);

  downloadFilename = computed(() => {
    return this.prompt().slice(0, 30).replace(/\s/g, '_') + '.png';
  });

  async generateWallpaper(): Promise<void> {
    if (!this.prompt().trim()) {
      this.error.set('Prompt cannot be empty.');
      return;
    }

    this.isLoading.set(true);
    this.generatedImage.set(null);
    this.error.set(null);
    this.isImageSaved.set(false);
    this.statusMessage.set('Generating...');
    
    try {
      const imageData = await this.geminiService.generateImage(this.prompt(), this.negativePrompt());
      if (imageData) {
        this.generatedImage.set(imageData);
      } else {
        this.error.set('The AI did not return an image. Please try a different prompt.');
      }
    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred.');
    } finally {
      this.isLoading.set(false);
      this.statusMessage.set('');
    }
  }

  saveToGallery(): void {
    const imageData = this.generatedImage();
    if (!imageData) return;

    this.wallpaperService.addWallpaper({
      prompt: this.prompt(),
      negativePrompt: this.negativePrompt(),
      imageData: imageData,
    });
    this.isImageSaved.set(true);
  }

  async upscaleImage(): Promise<void> {
    const currentImage = this.generatedImage();
    if (!currentImage) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.statusMessage.set('Upscaling image...');
    
    try {
      const upscaledImageData = await this.geminiService.upscaleImage(currentImage);
      if (upscaledImageData) {
        this.generatedImage.set(upscaledImageData);
        this.isImageSaved.set(false); // Can save the upscaled version
      } else {
        this.error.set('The AI could not upscale the image. It might have responded with text instead.');
      }
    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred during upscaling.');
    } finally {
      this.isLoading.set(false);
      this.statusMessage.set('');
    }
  }
}