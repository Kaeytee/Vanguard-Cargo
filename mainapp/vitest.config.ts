/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Mock static assets
    mockReset: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Mock image imports
      '~images': resolve(__dirname, './src/test/__mocks__'),
    },
  },
  // Add support for static asset imports in tests
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
