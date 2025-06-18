#!/bin/bash
# deploy-simples.sh - Deploy direto usando comandos existentes

echo "🚀 Deploy SIMPLES para domínios.pt usando comandos existentes..."

SERVER_USER="artnshin"
SERVER_HOST="alitools.pt"
APP_ROOT="/home/artnshin/alitools.pt"
PUBLIC_ROOT="/home/artnshin/public_html"

# Função para executar no servidor
run_on_server() {
    ssh ${SERVER_USER}@${SERVER_HOST} "$1"
}

echo "1️⃣ Atualizando código no servidor..."
run_on_server "
    cd $APP_ROOT
    git pull origin master
    echo 'Código atualizado'
"

echo "2️⃣ Instalando dependências e fazendo build..."
run_on_server "
    cd $APP_ROOT
    source /home/artnshin/nodevenv/alitools.pt/18/bin/activate
    
    # Usar package compatível se existir
    if [ -f 'package.dominios.json' ]; then
        cp package.dominios.json package.json
    fi
    
    npm install
    npm run build
    echo 'Build concluído'
"

echo "3️⃣ Copiando frontend para public_html..."
run_on_server "
    cd $APP_ROOT
    cp -r dist/* $PUBLIC_ROOT/
    echo 'Frontend copiado'
"

echo "4️⃣ Criando .env se não existir..."
run_on_server "
    cd $APP_ROOT
    if [ ! -f '.env' ]; then
        cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
GEKO_API_KEY=4bceff60-32d7-4635-b5e8-ca51353a6e0e
JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
EOF
        echo '.env criado'
    else
        echo '.env já existe'
    fi
"

echo "5️⃣ Configurando .htaccess para proxy..."
run_on_server "
    cd $PUBLIC_ROOT
    cat > .htaccess << 'EOF'
RewriteEngine On

# Proxy API calls para Node.js
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/\$1 [P,L]

# SPA routing - servir index.html para todas as rotas
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
EOF
    echo '.htaccess configurado'
"

echo "6️⃣ Parando aplicação anterior..."
run_on_server "pkill -f 'node server.cjs' 2>/dev/null || true"

echo "7️⃣ Iniciando aplicação com npm start..."
run_on_server "
    cd $APP_ROOT
    source /home/artnshin/nodevenv/alitools.pt/18/bin/activate
    nohup npm start > logs/app.log 2>&1 &
    sleep 5
    echo 'Aplicação iniciada'
"

echo "8️⃣ Verificando se está funcionando..."
sleep 10

# Health checks
PROCESS_CHECK=$(run_on_server "pgrep -f 'node server.cjs' >/dev/null && echo 'OK' || echo 'FAILED'")
API_CHECK=$(run_on_server "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health || echo '000'")

echo ""
echo "📊 RESULTADO:"
echo "============="
echo "   Processo Node.js: $PROCESS_CHECK"
echo "   API Health Check: $API_CHECK"
echo ""

if [ "$PROCESS_CHECK" = "OK" ] && [ "$API_CHECK" = "200" ]; then
    echo "🎉 ✅ DEPLOY CONCLUÍDO COM SUCESSO!"
    echo ""
    echo "🌐 Aplicação disponível em:"
    echo "   Frontend: http://alitools.pt/"
    echo "   API: http://alitools.pt/api/health"
    echo ""
    echo "📝 Para verificar logs:"
    echo "   ssh $SERVER_USER@$SERVER_HOST 'tail -f $APP_ROOT/logs/app.log'"
else
    echo "❌ Problemas encontrados. Verificar logs:"
    echo "   ssh $SERVER_USER@$SERVER_HOST 'tail -20 $APP_ROOT/logs/app.log'"
fi

echo ""
echo "💡 COMANDOS USADOS:"
echo "   Build: npm run build"
echo "   Start: npm start"
echo "   (Exatamente como sugeriste!)" 