import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BackgroundComponent } from './components/background/background.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BackgroundComponent],
  template: `
    <app-background></app-background>
    <div class="relative z-10 flex flex-col min-h-screen">
      <header class="bg-white/10 backdrop-blur-lg shadow-lg text-white">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
          <a routerLink="/" class="text-2xl font-bold text-white hover:text-gray-200">
            AI Wallpaper Studio
          </a>
          <ul class="flex items-center space-x-6">
            <li>
              <a routerLink="/" routerLinkActive="text-indigo-400" [routerLinkActiveOptions]="{exact: true}" class="hover:text-indigo-400 transition-colors">Generate</a>
            </li>
            <li>
              <a routerLink="/gallery" routerLinkActive="text-indigo-400" class="hover:text-indigo-400 transition-colors">Gallery</a>
            </li>
            <li>
              <a routerLink="/about" routerLinkActive="text-indigo-400" class="hover:text-indigo-400 transition-colors">About</a>
            </li>
          </ul>
        </nav>
      </header>

      <main class="flex-grow container mx-auto p-6">
        <router-outlet></router-outlet>
      </main>

      <footer class="text-center text-white/50 py-4 mt-auto">
        <p>Powered by Gemini and Angular</p>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
