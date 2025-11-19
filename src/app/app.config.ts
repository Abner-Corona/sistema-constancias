import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { routes } from 'src/app/app.routes';
import { ApiInterceptor } from 'src/app/interceptors/api.interceptor';
import Morelos from './morelos-preset';
import { es } from 'primelocale/es.json';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([ApiInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      translation: es,
      theme: {
        preset: Morelos,
        options: {
          darkModeSelector: '.dark',
        },
      },
      ripple: true,
    }),
  ],
};
