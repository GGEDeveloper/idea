import { defineConfig } from 'vite';
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

export default defineConfig({
  plugins: [
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
          console.error('Erro ao copiar arquivos estáticos:', error);
        }
      },
    },
  ],
});
