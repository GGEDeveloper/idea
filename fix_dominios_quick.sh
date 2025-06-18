#!/bin/bash

# Script rápido para resolver problemas específicos no domínios.pt
# Execute: bash fix_dominios_quick.sh

echo "🚀 Correção rápida para domínios.pt..."

# 1. Parar todos os processos node existentes
echo "🛑 Parando processos existentes..."
pkill -f node 2>/dev/null || true
sleep 2

# 2. Verificar se porta 3000 está livre agora
if lsof -i :3000 2>/dev/null; then
    echo "⚠️  Porta 3000 ainda em uso. Tentando forçar..."
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 2
fi

# 3. Limpar instalação completamente
echo "🧹 Limpando instalação..."
rm -rf node_modules package-lock.json .vite 2>/dev/null || true

# 4. Usar package.json correto e atualizado
echo "📦 Usando package.json compatível..."
cp package.dominios.json package.json

# 5. Instalar TODAS as dependências (incluindo devDependencies)
echo "⬇️ Instalando dependências completas..."
npm install

# 6. Verificar se Vite foi instalado
if ! command -v npm run build &> /dev/null; then
    echo "⚠️  Problema com build script, tentando instalar Vite globalmente..."
    npm install -g vite || npm install vite
fi

# 7. Compilar frontend
echo "🏗️ Compilando frontend..."
npm run build

# 8. Verificar se build foi bem-sucedido
if [ ! -d "dist" ]; then
    echo "❌ Build falhou! Tentando alternativa..."
    npx vite build
fi

# 9. Iniciar aplicação em background
echo "🚀 Iniciando aplicação..."
nohup npm start > app.log 2>&1 &

# 10. Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 8

# 11. Testar se está funcionando
echo "🧪 Testando aplicação..."
if curl -f http://localhost:3000/api/health 2>/dev/null; then
    echo "✅ Aplicação funcionando!"
    echo "🌐 Acesse: http://alitools.pt"
else
    echo "⚠️  Aplicação pode estar iniciando ainda..."
    echo "📊 Verificar logs: tail -f app.log"
fi

# 12. Mostrar status
echo ""
echo "📋 Status final:"
echo "   - Processos Node:"
ps aux | grep node | grep -v grep

echo "   - Porta 3000:"
lsof -i :3000 2>/dev/null || echo "     Porta livre"

echo "   - Logs da aplicação:"
tail -n 5 app.log 2>/dev/null || echo "     Arquivo de log não encontrado"

echo ""
echo "✅ Processo concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Verificar logs: tail -f app.log"
echo "   2. Testar API: curl http://localhost:3000/api/health"
echo "   3. Acesse: http://alitools.pt"
echo ""
echo "🛑 Para parar: pkill -f node"
echo "🔄 Para reiniciar: nohup npm start > app.log 2>&1 &" 