import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: ['tests/e2e/**'],
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js'
  }
});