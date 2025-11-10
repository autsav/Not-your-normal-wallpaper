import { Injectable, signal } from '@angular/core';
import { Wallpaper } from '../models/wallpaper.model';

@Injectable({
  providedIn: 'root',
})
export class WallpaperService {
  private readonly storageKey = 'ai-wallpapers';
  // A signal to hold the array of wallpapers, initialized from localStorage.
  wallpapers = signal<Wallpaper[]>(this.loadFromStorage());

  /**
   * Adds a new wallpaper to the collection and persists it to localStorage.
   * @param wallpaper - The wallpaper data to add, without id and createdAt.
   */
  addWallpaper(wallpaper: Omit<Wallpaper, 'id' | 'createdAt'>): void {
    const newWallpaper: Wallpaper = {
      ...wallpaper,
      id: self.crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.wallpapers.update(wallpapers => [newWallpaper, ...wallpapers]);
    this.saveToStorage(this.wallpapers());
  }

  /**
   * Loads wallpapers from localStorage.
   * @returns An array of Wallpaper objects.
   */
  private loadFromStorage(): Wallpaper[] {
    try {
      // Check if running in a browser environment before accessing localStorage.
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedWallpapers = localStorage.getItem(this.storageKey);
        if (storedWallpapers) {
          // Parse and revive date objects from JSON string.
          return JSON.parse(storedWallpapers).map((w: any) => ({ ...w, createdAt: new Date(w.createdAt) }));
        }
      }
    } catch (e) {
      console.error('Error loading wallpapers from localStorage', e);
    }
    return [];
  }

  /**
   * Saves the current list of wallpapers to localStorage.
   * @param wallpapers - The array of wallpapers to save.
   */
  private saveToStorage(wallpapers: Wallpaper[]): void {
    try {
      // Check if running in a browser environment before accessing localStorage.
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.storageKey, JSON.stringify(wallpapers));
      }
    } catch (e) {
      console.error('Error saving wallpapers to localStorage', e);
    }
  }
}
