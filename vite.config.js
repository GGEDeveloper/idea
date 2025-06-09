import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // Vitest configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
    },
    plugins: [react()],
    define: {
      // Expõe as variáveis de ambiente para o cliente
      'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY),
      'import.meta.env.VITE_CLERK_FRONTEND_API': JSON.stringify(env.VITE_CLERK_FRONTEND_API),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        // Configuração para o Clerk
        '/v1': {
          target: 'https://api.clerk.com',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  }
})
