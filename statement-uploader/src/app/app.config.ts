import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideMarkdown } from 'ngx-markdown';
import { KatexModule } from 'ng-katex';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), 
    // provideClientHydration(), 
    provideHttpClient(),
    provideMarkdown(),
    provideAnimations(),
    KatexModule
  ],
};
