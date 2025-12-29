import { getSettings, watchStorage } from './storage';
import { logger } from './logger';
import type { Settings } from '@/types';

/**
 * Theme management utility for the extension
 * Applies theme classes to the document and manages theme switching
 */

let currentTheme: 'light' | 'dark' = 'light';

/**
 * Initialize theme system
 * Should be called when the extension loads
 */
export async function initializeTheme(): Promise<void> {
  try {
    const settings = await getSettings();
    await applyTheme(settings.theme);
    
    // Watch for theme changes
    watchStorage('local:settings', async (newSettings) => {
      if (newSettings?.theme) {
        await applyTheme(newSettings.theme);
      }
    });
  } catch (error) {
    logger.error('Failed to initialize theme system', error);
  }
}

/**
 * Apply theme based on user preference
 */
export async function applyTheme(themePreference: Settings['theme']): Promise<void> {
  let resolvedTheme: 'light' | 'dark';
  
  if (themePreference === 'auto') {
    // Use system preference
    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } else {
    resolvedTheme = themePreference;
  }
  
  // Apply theme to document
  const html = document.documentElement;
  
  if (resolvedTheme === 'dark') {
    html.classList.add('dark');
    html.classList.remove('light');
  } else {
    html.classList.add('light');
    html.classList.remove('dark');
  }
  
  currentTheme = resolvedTheme;
  // Store the resolved theme for other parts of the extension
  document.documentElement.setAttribute('data-theme', resolvedTheme);
}

/**
 * Get the current resolved theme
 */
export function getCurrentTheme(): 'light' | 'dark' {
  return currentTheme;
}

/**
 * Listen for system theme changes when in auto mode
 */
export function setupSystemThemeListener(): void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  mediaQuery.addEventListener('change', async (e) => {
    const settings = await getSettings();
    if (settings.theme === 'auto') {
      await applyTheme('auto');
    }
  });
}