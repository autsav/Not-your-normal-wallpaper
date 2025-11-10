import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { WallpaperService } from '../../services/wallpaper.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto text-white">
      <div class="bg-white/10 p-8 rounded-lg shadow-2xl backdrop-blur-lg">
        @if (!generatedImage()) {
          <h1 class="text-4xl font-bold text-center mb-2">Create Your AI Wallpaper</h1>
          <p class="text-center text-white/70 mb-8">Describe the wallpaper you want to generate. Be as creative as you like!</p>

          <form [formGroup]="wallpaperForm" (ngSubmit)="generateWallpaper()">
            <div class="mb-6">
              <div class="flex justify-between items-center mb-2">
                <label for="prompt" class="block text-lg font-medium text-indigo-300">Prompt</label>
                <button type="button" (click)="suggestPrompt()" class="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-semibold flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Suggest a Prompt</span>
                </button>
              </div>
              <textarea formControlName="prompt" id="prompt" rows="4" class="w-full bg-black/20 border border-white/20 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="e.g., A neon-lit cyberpunk city skyline at night, raining, cinematic"></textarea>
              @if (wallpaperForm.controls.prompt.invalid && (wallpaperForm.controls.prompt.dirty || wallpaperForm.controls.prompt.touched)) {
                <p class="text-red-400 text-sm mt-1">Prompt is required.</p>
              }
            </div>

            <div class="mb-8">
              <label for="negativePrompt" class="block mb-2 text-lg font-medium text-indigo-300">Negative Prompt (Optional)</label>
              <input type="text" formControlName="negativePrompt" id="negativePrompt" class="w-full bg-black/20 border border-white/20 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="e.g., blurry, low quality, text, watermark">
            </div>

            <button type="submit" [disabled]="wallpaperForm.invalid || loading()" class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition text-xl flex items-center justify-center space-x-2">
              @if (loading()) {
                <div class="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                <span>Generating...</span>
              } @else {
                <span>Generate Wallpaper</span>
              }
            </button>
          </form>
        } @else {
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-6">Your Masterpiece is Ready!</h2>
            <div class="aspect-[9/16] w-64 mx-auto rounded-lg overflow-hidden shadow-lg border-2 border-indigo-500">
               <img [src]="'data:image/png;base64,' + generatedImage()" alt="Generated Wallpaper" class="w-full h-full object-cover">
            </div>

            <div class="mt-8 flex justify-center space-x-4">
               <button (click)="saveToGallery()" [disabled]="savedToGallery()" class="bg-green-600 hover:bg-green-700 disabled:bg-green-800/70 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition text-lg">
                 Save to Gallery
               </button>
               <button (click)="startOver()" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition text-lg">
                 Create Another
               </button>
            </div>
            @if(savedToGallery()) {
              <p class="text-green-400 mt-4">Saved to your gallery!</p>
            }
          </div>
        }

        @if (error()) {
          <div class="mt-6 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
            <p><strong>Generation Failed</strong></p>
            <p>{{ error() }}</p>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly geminiService = inject(GeminiService);
  private readonly wallpaperService = inject(WallpaperService);

  loading = signal(false);
  error = signal<string | null>(null);
  generatedImage = signal<string | null>(null);
  savedToGallery = signal(false);

  wallpaperForm = this.fb.group({
    prompt: ['', Validators.required],
    negativePrompt: [''],
  });

  private readonly promptSuggestions = [
    'A majestic bioluminescent forest at night, with glowing mushrooms and ethereal creatures, cinematic lighting, ultra detailed.',
    'An astronaut discovering an ancient alien artifact on a desolate Mars-like planet, dramatic dust storm in the background, 4K, photorealistic.',
    'A serene Japanese zen garden in spring, with cherry blossoms, a koi pond, and a traditional pagoda, watercolor style.',
    'Steampunk city skyline at sunset, intricate brass machinery, airships flying in the sky, warm golden hour lighting.',
    'A minimalist abstract painting of a soundwave, using only three colors: deep indigo, electric cyan, and pure white.',
    'An enchanting underwater city of Atlantis, with coral architecture and schools of vibrant fish, fantasy art.',
    'Portrait of a futuristic cybernetic ronin with a glowing katana, in a rainy, neon-lit alley of Neo-Tokyo, cyberpunk aesthetic.',
    'A cozy, cluttered wizard\'s study filled with ancient books, magical artifacts, and a crackling fireplace, warm and inviting.',
    'Surreal landscape where the ocean meets the clouds, with giant floating islands and waterfalls cascading into the sky, dreamlike.',
    'A photorealistic close-up of a chameleon\'s eye, reflecting a tiny, detailed galaxy within its iris.'
  ];

  suggestPrompt(): void {
    const randomIndex = Math.floor(Math.random() * this.promptSuggestions.length);
    const suggestion = this.promptSuggestions[randomIndex];
    this.wallpaperForm.controls.prompt.setValue(suggestion);
  }

  async generateWallpaper(): Promise<void> {
    if (this.wallpaperForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.generatedImage.set(null);
    this.savedToGallery.set(false);

    const { prompt, negativePrompt } = this.wallpaperForm.value;

    try {
      const imageData = await this.geminiService.generateImage(prompt!, negativePrompt || undefined);
      if (imageData) {
        this.generatedImage.set(imageData);
      } else {
        this.error.set('Failed to generate image. The model did not return any data.');
      }
    // FIX: The error variable 'e' in a catch block is of type 'unknown' with strict TypeScript settings.
    // The previous `e: any` is not type-safe. This handles the error properly by checking its type.
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        this.error.set(e.message);
      } else {
        this.error.set('An unexpected error occurred. Please check the console for details.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  saveToGallery(): void {
    if (!this.generatedImage() || this.savedToGallery()) return;
    
    const wallpaperData = {
      prompt: this.wallpaperForm.value.prompt!,
      negativePrompt: this.wallpaperForm.value.negativePrompt || undefined,
      imageData: this.generatedImage()!,
    };

    this.wallpaperService.addWallpaper(wallpaperData);
    this.savedToGallery.set(true);
  }

  startOver(): void {
    this.generatedImage.set(null);
    this.error.set(null);
    this.savedToGallery.set(false);
    // Optionally reset form
    // this.wallpaperForm.reset();
  }
}
