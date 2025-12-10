import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
    plugins: [WxtVitest()],
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        exclude: [
            '**/node_modules/**',
            '**/tests/e2e/**', // Exclude E2E tests from vitest
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
});
