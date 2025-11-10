import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WallpaperService } from '../../services/wallpaper.service';
import { Wallpaper } from '../../models/wallpaper.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto text-white">
      <h1 class="text-4xl font-bold text-center mb-8">Your Wallpaper Gallery</h1>

      @if (wallpapers().length === 0) {
        <div class="text-center bg-white/10 p-8 rounded-lg">
            <p class="text-xl text-white/70">Your gallery is empty.</p>
            <p class="mt-2">Go to the "Generate" page to create your first AI wallpaper!</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            @for (wallpaper of wallpapers(); track wallpaper.id) {
                <div class="group relative aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden cursor-pointer" (click)="selectWallpaper(wallpaper)">
                    <img [src]="'data:image/png;base64,' + wallpaper.imageData" [alt]="wallpaper.prompt" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                        <p class="text-white text-xs line-clamp-2">{{ wallpaper.prompt }}</p>
                    </div>
                </div>
            }
        </div>
      }

      @if (selectedWallpaper()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="closeModal()">
            <div class="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden" (click)="$event.stopPropagation()">
                <div class="md:w-1/3 flex-shrink-0 bg-black flex items-center justify-center">
                    <img [src]="'data:image/png;base64,' + selectedWallpaper()!.imageData" [alt]="selectedWallpaper()!.prompt" class="w-auto h-auto max-w-full max-h-[50vh] md:max-h-[90vh] object-contain">
                </div>
                <div class="p-6 flex-grow flex flex-col text-white overflow-y-auto">
                    <h2 class="text-2xl font-bold mb-4">Wallpaper Details</h2>
                    <div class="space-y-4 flex-grow">
                        <div>
                            <h3 class="font-semibold text-indigo-400">Prompt:</h3>
                            <p class="bg-black/20 p-2 rounded-md mt-1 text-white/90">{{ selectedWallpaper()!.prompt }}</p>
                        </div>
                        @if (selectedWallpaper()!.negativePrompt) {
                            <div>
                                <h3 class="font-semibold text-indigo-400">Negative Prompt:</h3>
                                <p class="bg-black/20 p-2 rounded-md mt-1 text-white/90">{{ selectedWallpaper()!.negativePrompt }}</p>
                            </div>
                        }
                        <div>
                            <h3 class="font-semibold text-indigo-400">Created:</h3>
                            <p class="bg-black/20 p-2 rounded-md mt-1 text-white/90">{{ selectedWallpaper()!.createdAt | date:'medium' }}</p>
                        </div>
                    </div>
                    <div class="mt-auto pt-4 flex space-x-4">
                        <a [href]="'data:image/png;base64,' + selectedWallpaper()!.imageData" [download]="'ai-wallpaper-' + selectedWallpaper()!.id.slice(0,8) + '.png'" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition text-center flex-grow">
                            Download
                        </a>
                        <button (click)="closeModal()" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition flex-grow">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  private readonly wallpaperService = inject(WallpaperService);
  readonly wallpapers = this.wallpaperService.wallpapers;

  selectedWallpaper = signal<Wallpaper | null>(null);

  selectWallpaper(wallpaper: Wallpaper): void {
    this.selectedWallpaper.set(wallpaper);
  }

  closeModal(): void {
    this.selectedWallpaper.set(null);
  }
}
