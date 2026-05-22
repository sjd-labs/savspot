import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    include: ['{src,test}/**/*.{test,spec}.ts'],
    exclude: ['**/*.integration.spec.ts', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.module.ts', '**/index.ts', '**/main.ts'],
      thresholds: {
        statements: 70,
        branches: 50,
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    // Order matters: longer/more-specific aliases first so `@/generated/...`
    // resolves to the mocks before the broader `@` alias re-points at ./src
    // (which would otherwise hit the real generated client and break tests).
    alias: {
      '@/generated/prisma/runtime/library': path.resolve(
        __dirname,
        './test/__mocks__/prisma-runtime.ts',
      ),
      '@/generated/prisma': path.resolve(
        __dirname,
        './test/__mocks__/prisma-generated.ts',
      ),
      '@savspot/shared': path.resolve(__dirname, './src/shared/index.ts'),
      '@savspot/ee': path.resolve(__dirname, './src/ee/index.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
