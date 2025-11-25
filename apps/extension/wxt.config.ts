import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
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
      16: '/icon-16.png',
      32: '/icon-32.png',
      48: '/icon-48.png',
      96: '/icon-96.png',
      128: '/icon-128.png',
    },
  },
});
