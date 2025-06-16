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
    base: './', // Garante que os assets sejam carregados corretamente
    // Vitest configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
    },
    server: {
      port: 5174,
      strictPort: true,
      open: false,
      // Configuração para servir arquivos estáticos
      fs: {
        strict: false, // Permite servir arquivos fora do diretório raiz
        allow: ['..'] // Permite acessar arquivos em diretórios pai
      },
      proxy: {
        // Proxy para a API do backend
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          // ws: true, // Manter se realmente usar WebSockets para a API, senão pode remover
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log(`[VITE PROXY Req] Sending ${req.method} request to: ${proxyReq.host}${proxyReq.path}`);
              // NÃO REMOVER COOKIES OU AUTHORIZATION A NÃO SER QUE HAJA UM MOTIVO MUITO ESPECÍFICO
              // proxyReq.removeHeader('authorization');
              // proxyReq.removeHeader('cookie'); 
              // proxyReq.removeHeader('x-forwarded-for');
              // console.log('[VITE PROXY Req Headers]', proxyReq.getHeaders());
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log(`[VITE PROXY Res] Received ${proxyRes.statusCode} from ${req.url}`);
              // console.log('[VITE PROXY Res Headers]', proxyRes.headers);
            });
            proxy.on('error', (err, req, res) => {
              console.error('[VITE PROXY] Error:', err);
            });
          },
        },
        // Remover configuração de proxy para /v1 (Clerk)
        /*
        '/v1': {
          target: 'https://api.clerk.com',
          changeOrigin: true,
          secure: false,
          ws: true,
        }
        */
      },
    },
    define: {
      // Manter apenas as variáveis de ambiente que a sua aplicação frontend realmente precisa
      // 'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY), // REMOVER
      // 'import.meta.env.VITE_CLERK_FRONTEND_API': JSON.stringify(env.VITE_CLERK_FRONTEND_API), // REMOVER
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL), // Manter se usado
    },
  }
})
