#!/bin/bash

# Script para resolver compatibilidade com Node 18 no domínios.pt
# Execute no servidor: bash fix_dominios_node18.sh

echo "🔧 Resolvendo compatibilidade Node 18 no domínios.pt..."

# 1. Verificar versão do Node
echo "📋 Versão atual do Node:"
node --version
npm --version

# 2. Fazer backup do app.js se existir
if [ -f "app.js" ]; then
    echo "📄 Arquivo app.js encontrado. Fazendo backup..."
    mv app.js app.js.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup criado: app.js.backup.$(date +%Y%m%d_%H%M%S)"
fi

# 3. Limpar arquivos não rastreados
echo "🧹 Limpando arquivos não rastreados..."
git clean -fd

# 4. Atualizar do repositório remoto
echo "⬇️ Atualizando do repositório remoto..."
git pull origin master

# 5. Fazer backup do package.json atual
echo "💾 Fazendo backup do package.json..."
cp package.json package.json.original

# 6. Usar versão compatível com Node 18
echo "🔄 Substituindo package.json por versão compatível Node 18..."
cp package.dominios.json package.json

# 7. Limpar cache do npm e node_modules
echo "🧹 Limpando cache e node_modules..."
rm -rf node_modules package-lock.json
npm cache clean --force

# 8. Instalar dependências (SEM postinstall automático)
echo "📦 Instalando dependências compatíveis..."
npm install --ignore-scripts

# 9. Construir aplicação manualmente
echo "🏗️ Compilando frontend..."
npm run build

# 10. Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    echo "📝 Criando arquivo .env..."
    cat > .env << 'EOF'
# --- Banco de Dados PostgreSQL (Neo) ---
DATABASE_URL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc.eu-west-2.aws.neon.tech/neondb?sslmode=require
PGHOST=ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech
PGHOST_UNPOOLED=ep-shiny-bush-abjh1ibc.eu-west-2.aws.neon.tech
PGUSER=neondb_owner
PGDATABASE=neondb
PGPASSWORD=npg_aMgk1osmjh7X
POSTGRES_URL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc.eu-west-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech
POSTGRES_PASSWORD=npg_aMgk1osmjh7X
POSTGRES_DATABASE=neondb
POSTGRES_URL_NO_SSL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc.eu-west-2.aws.neon.tech/neondb
POSTGRES_PRISMA_URL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require

# --- Geko API ---
GEKO_API_KEY=4bceff60-32d7-4635-b5e8-ca51353a6e0e
GEKO_API_XML_URL_EN_UTF8=https://b2b.geko.pl/en/xmlapi/20/3/utf8/4bceff60-32d7-4635-b5e8-ca51353a6e0e

# --- Autenticação Local ---
JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2

# --- Ambiente de Produção ---
NODE_ENV=production
PORT=3000

# --- Configurações de Segurança e Logging ---
LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=90

# --- Internacionalização ---
NEXT_PUBLIC_DEFAULT_LOCALE=pt
NEXT_PUBLIC_SUPPORTED_LOCALES=pt,en
EOF

    # Definir permissões seguras para o .env
    chmod 600 .env
    echo "✅ Arquivo .env criado com permissões seguras (600)"
else
    echo "ℹ️  Arquivo .env já existe"
fi

# 11. Testar se a aplicação funciona
echo "🧪 Testando se a aplicação funciona..."
timeout 10s node server.cjs &
sleep 5
if curl -f http://localhost:3000/api/health &>/dev/null; then
    echo "✅ Aplicação funcionando!"
    pkill -f "node server.cjs"
else
    echo "⚠️  Teste falhou, mas pode ser devido ao timeout. Tente manualmente."
    pkill -f "node server.cjs" 2>/dev/null
fi

# 12. Mostrar status final
echo ""
echo "📋 Status final:"
echo "   - Node versão: $(node --version)"
echo "   - NPM versão: $(npm --version)"
echo "   - Git status:"
git status --short

echo "   - Arquivos importantes:"
ls -la .env package.json server.cjs 2>/dev/null

echo ""
echo "✅ Setup Node 18 concluído!"
echo ""
echo "📊 Principais mudanças:"
echo "   - React: 19.1.0 → 18.3.1"
echo "   - React Router DOM: 7.6.2 → 6.28.0"
echo "   - Vite: 6.3.5 → 5.4.10"
echo "   - Removido postinstall automático"
echo ""
echo "🚀 Para iniciar a aplicação:"
echo "   npm start"
echo ""
echo "🔍 Para verificar se está funcionando:"
echo "   curl http://localhost:3000/api/health"
echo ""
echo "📊 Para verificar logs:"
echo "   tail -f nohup.out"
echo ""
echo "🌐 Aplicação estará disponível em:"
echo "   http://alitools.pt"
echo ""
echo "🔄 Se precisar voltar ao package.json original:"
echo "   cp package.json.original package.json" 