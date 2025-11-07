import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeSignal = signal<Theme>('light');

  readonly currentTheme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.currentTheme() === 'dark');
  readonly isLight = computed(() => this.currentTheme() === 'light');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Check for saved theme preference or default to light
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        this.setTheme(savedTheme);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
      }
    }
  }

  setTheme(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.themeSignal.set(theme);
    localStorage.setItem('theme', theme);

    // Apply theme to document
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}
