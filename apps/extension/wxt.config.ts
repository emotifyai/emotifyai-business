import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';
import path from 'path';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // @ts-ignore
  modules: ['@wxt-dev/module-react'],
  dev: {
    server: {
      port: 4250,
    },
  },
  // @ts-ignore
  vite: (): UserConfig => ({
    // @ts-ignore
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    test: {
      environment: 'happy-dom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      exclude: [
        '**/node_modules/**',
        '**/tests/e2e/**',
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'tests/e2e/',
          '**/*.test.ts',
          '**/*.test.tsx',
        ],
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
    version: '0.1.1',
    permissions: [
      'contextMenus',
      'storage',
      'activeTab',
      'scripting',
      'identity',
    ],
    // Remove host_permissions - use activeTab instead
    // host_permissions: [
    //   'http://localhost/*',
    //   'https://emotifyai.com/*',
    //   'https://*/*',
    //   'http://*/*',
    // ],
    externally_connectable: {
      matches: [
        'http://localhost:3000/*',
        'https://emotifyai.com/*',
        'https://emotifyai-app.netlify.app/*',
        'https://bright-marzipan-1b48f4.netlify.app/*',
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
