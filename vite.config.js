import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js', // Ficheiro de setup para testes
  },
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
