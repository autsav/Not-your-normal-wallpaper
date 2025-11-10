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
      <header class="sticky top-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-lg text-white">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
          <a routerLink="/" class="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 hover:opacity-80 transition-opacity">
            Aura Studio
          </a>
          <ul class="flex items-center space-x-4 md:space-x-6 text-white/80">
            <li>
              <a routerLink="/" routerLinkActive="bg-white/20 text-white font-semibold" [routerLinkActiveOptions]="{exact: true}" class="px-3 py-2 rounded-md hover:bg-white/10 transition-colors">Generate</a>
            </li>
            <li>
              <a routerLink="/gallery" routerLinkActive="bg-white/20 text-white font-semibold" class="px-3 py-2 rounded-md hover:bg-white/10 transition-colors">Gallery</a>
            </li>
            <li>
              <a routerLink="/about" routerLinkActive="bg-white/20 text-white font-semibold" class="px-3 py-2 rounded-md hover:bg-white/10 transition-colors">About</a>
            </li>
          </ul>
        </nav>
      </header>

      <main class="flex-grow container mx-auto p-6">
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-black/20 backdrop-blur-lg text-center text-white/50 py-4 mt-auto">
        <p>Powered by Gemini and Angular</p>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}