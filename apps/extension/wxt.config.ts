import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  // @ts-expect-error - Vite version conflict between main deps and vitest bundled vite
  vite: (): UserConfig => ({
    plugins: [tailwindcss()],
    build: {
      // Increase chunk size warning limit for extension context
      // Extensions don't have the same performance constraints as websites
      chunkSizeWarningLimit: 600,
    },
  }),
  manifest: {
    name: 'Verba',
    description: 'AI-powered text enhancement and rewriting',
    version: '0.1.0',
    permissions: [
      'contextMenus',
      'storage',
      'activeTab',
      'scripting',
    ],
    host_permissions: [
      'http://localhost/*',
      'https://*.verba.app/*',
    ],
    icons: {
      16: '/icon/16.png',
      32: '/icon/32.png',
      48: '/icon/48.png',
      96: '/icon/96.png',
      128: '/icon/128.png',
    },
  },
});
