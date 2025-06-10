import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Remove the configuration object
  ],
  // Ensure consistent CSS processing in development and production
  css: {
    devSourcemap: true,
  },
  build: {
    sourcemap: true,
    cssMinify: true,
  }
})