import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-background',
  standalone: true,
  template: ``,
  styles: [`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: -1;
      background-color: #111827; /* bg-gray-900 */
      background-image:
        radial-gradient(ellipse at top, transparent 40%, #4f46e533),
        radial-gradient(ellipse at bottom, #4f46e533, transparent 40%);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundComponent {}
