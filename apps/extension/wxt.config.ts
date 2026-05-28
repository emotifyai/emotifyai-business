import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  dev: {
    server: {
      port: 4250,
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Increase chunk size warning limit for extension context
      // Extensions don't have the same performance constraints as websites
      chunkSizeWarningLimit: 600,
    },
  }),
  manifest: {
    name: 'EmotifyAI',
    description: 'AI-powered text enhancement and rewriting',
    version: '0.2.0',
    permissions: [
      'contextMenus',
      'storage',
      'activeTab',
      'scripting',
      'identity',
    ],
    externally_connectable: {
      matches: [
        'https://emotifyai.com/*',
      ],
    },
    icons: {
      16: '/icon/16.png',
      32: '/icon/32.png',
      48: '/icon/48.png',
      96: '/icon/96.png',
      128: '/icon/128.png',
    },
  },
});
