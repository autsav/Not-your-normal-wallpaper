
import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    title: 'AI Wallpaper Studio - Generate'
  },
  {
    path: 'gallery',
    loadComponent: () => import('./components/gallery/gallery.component').then(m => m.GalleryComponent),
    title: 'AI Wallpaper Studio - Gallery'
  },
  {
    path: 'about',
    loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent),
    title: 'AI Wallpaper Studio - About'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
