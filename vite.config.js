import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readdirSync, statSync, copyFileSync, existsSync, mkdirSync } from 'fs';

// Função para copiar arquivos recursivamente
function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = resolve(src, entry);
    const destPath = resolve(dest, entry);
    
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

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
    plugins: [
      react(),
      {
        name: 'copy-static-assets',
        closeBundle: () => {
          try {
            // Copiar arquivos de localização
            copyDir(
              resolve(__dirname, 'public/locales'),
              resolve(__dirname, 'dist/locales')
            );
            console.log('Arquivos de localização copiados com sucesso!');
          } catch (error) {
            console.error('Erro ao copiar arquivos de localização:', error);
          }
        },
      },
    ],
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
