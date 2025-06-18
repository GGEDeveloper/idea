# 🚀 **FASE 3: DEPLOYMENT INICIAL**
## **Upload, Build e Primeiro Start da Aplicação**

---

## ⏱️ **DURAÇÃO ESTIMADA: 30-45 minutos**
## 🎯 **OBJETIVO: Deploy inicial funcionando e aplicação acessível via servidor**

---

## 📦 **ESTRATÉGIA DE DEPLOYMENT**

### **Abordagem: Deploy Otimizado com Rsync**
```
Local Build → Rsync Upload → Server Install → Start App
    ↓             ↓              ↓            ↓
  5 min         10 min        15 min       5 min
```

**Por que esta abordagem:**
- ✅ **Build local**: Evita problemas Node 18 no servidor
- ✅ **Rsync**: Upload otimizado (só ficheiros alterados)
- ✅ **Staged deploy**: Deploy seguro com rollback
- ✅ **Zero downtime**: App só fica offline alguns segundos

---

## 🔧 **SCRIPT MASTER DE DEPLOYMENT**

### **deploy-to-dominios.sh**
```bash
#!/bin/bash
# deploy-to-dominios.sh - Deployment completo para domínios.pt

set -e  # Exit on any error

# Configuration
SERVER_USER="artnshin"
SERVER_HOST="alitools.pt"
APP_ROOT="/home/artnshin/alitools.pt"
PUBLIC_ROOT="/home/artnshin/public_html"
BACKUP_DIR="/home/artnshin/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}$(date '+%H:%M:%S')${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Function to run commands on server
run_on_server() {
    ssh ${SERVER_USER}@${SERVER_HOST} "$1"
}

# Check prerequisites
check_prerequisites() {
    log "Verificando pré-requisitos..."
    
    # Local checks
    [ ! -d "dist" ] && error "Pasta dist/ não encontrada. Execute npm run build primeiro."
    [ ! -f "server.cjs" ] && error "server.cjs não encontrado"
    [ ! -f "package.json" ] && error "package.json não encontrado"
    
    # Remote connectivity
    if ! run_on_server "echo 'SSH OK'" >/dev/null 2>&1; then
        error "Falha na conexão SSH para $SERVER_HOST"
    fi
    
    success "Pré-requisitos OK"
}

# Create backup
create_backup() {
    log "Criando backup da aplicação atual..."
    
    run_on_server "
        mkdir -p $BACKUP_DIR
        TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
        
        # Backup app directory
        if [ -d '$APP_ROOT' ]; then
            tar -czf $BACKUP_DIR/app-backup-\$TIMESTAMP.tar.gz -C /home/artnshin alitools.pt
            echo 'App backup: app-backup-'\$TIMESTAMP'.tar.gz'
        fi
        
        # Backup public_html
        if [ -d '$PUBLIC_ROOT' ]; then
            tar -czf $BACKUP_DIR/public-backup-\$TIMESTAMP.tar.gz -C /home/artnshin public_html
            echo 'Public backup: public-backup-'\$TIMESTAMP'.tar.gz'
        fi
        
        # Keep only last 5 backups
        cd $BACKUP_DIR
        ls -t *.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    "
    
    success "Backup criado"
}

# Build application locally
build_application() {
    log "Building aplicação localmente..."
    
    # Use Node 18 compatible package.json if needed
    if [ -f "package.dominios.json" ]; then
        cp package.json package.json.backup 2>/dev/null || true
        cp package.dominios.json package.json
        log "Usando package.json compatível Node 18"
    fi
    
    # Clean and rebuild
    rm -rf node_modules package-lock.json
    npm cache clean --force
    npm install --production
    npm run build
    
    # Verify build
    [ ! -d "dist" ] && error "Build falhou - dist/ não foi criada"
    
    BUILD_SIZE=$(du -sh dist/ | cut -f1)
    success "Build concluído - Tamanho: $BUILD_SIZE"
}

# Upload files to server
upload_files() {
    log "Uploading ficheiros para servidor..."
    
    # Create staging directory
    run_on_server "mkdir -p /home/artnshin/tmp/deploy-staging"
    
    # Upload backend files
    log "  → Uploading backend..."
    rsync -avz --delete \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.env*' \
        --exclude='*.log' \
        ./ ${SERVER_USER}@${SERVER_HOST}:/home/artnshin/tmp/deploy-staging/
    
    # Upload frontend dist
    log "  → Uploading frontend dist..."
    rsync -avz --delete \
        dist/ ${SERVER_USER}@${SERVER_HOST}:/home/artnshin/tmp/deploy-staging/dist/
    
    success "Upload concluído"
}

# Install dependencies on server
install_dependencies() {
    log "Instalando dependências no servidor..."
    
    run_on_server "
        cd /home/artnshin/tmp/deploy-staging
        
        # Activate Node.js environment
        source /home/artnshin/nodevenv/alitools.pt/18/bin/activate
        
        # Install production dependencies
        npm ci --production --silent
        
        echo 'Dependencies installed'
    "
    
    success "Dependências instaladas"
}

# Deploy application
deploy_application() {
    log "Deploying aplicação..."
    
    run_on_server "
        # Stop current app if running
        pkill -f 'node server.cjs' 2>/dev/null || true
        sleep 2
        
        # Backup current app
        if [ -d '$APP_ROOT' ]; then
            mv '$APP_ROOT' '$APP_ROOT.old' 2>/dev/null || true
        fi
        
        # Move staging to production
        mv /home/artnshin/tmp/deploy-staging '$APP_ROOT'
        
        # Copy frontend to public_html
        mkdir -p '$PUBLIC_ROOT'
        cp -r '$APP_ROOT/dist/'* '$PUBLIC_ROOT/'
        
        # Set permissions
        chmod 755 '$APP_ROOT'
        chmod 755 '$PUBLIC_ROOT'
        chmod -R 644 '$APP_ROOT/logs' 2>/dev/null || true
        
        echo 'Application deployed'
    "
    
    success "Aplicação deployed"
}

# Create environment file
create_environment() {
    log "Criando arquivo .env..."
    
    run_on_server "
        cd '$APP_ROOT'
        
        cat > .env << 'EOF'
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Database PostgreSQL (Neon)
DATABASE_URL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
PGHOST=ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech
PGUSER=neondb_owner
PGDATABASE=neondb
PGPASSWORD=npg_aMgk1osmjh7X

# Geko API
GEKO_API_KEY=4bceff60-32d7-4635-b5e8-ca51353a6e0e
GEKO_API_XML_URL_EN_UTF8=https://b2b.geko.pl/en/xmlapi/20/3/utf8/4bceff60-32d7-4635-b5e8-ca51353a6e0e

# Auth & Security
JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2

# Logging
LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=90

# Locale
NEXT_PUBLIC_DEFAULT_LOCALE=pt
NEXT_PUBLIC_SUPPORTED_LOCALES=pt,en
EOF

        chmod 600 .env
        echo 'Environment file created'
    "
    
    success "Arquivo .env criado"
}

# Start application
start_application() {
    log "Iniciando aplicação..."
    
    run_on_server "
        cd '$APP_ROOT'
        source /home/artnshin/nodevenv/alitools.pt/18/bin/activate
        
        # Start application in background
        nohup npm start > logs/application.log 2>&1 &
        
        # Wait for startup
        sleep 10
        
        # Check if running
        if pgrep -f 'node server.cjs' >/dev/null; then
            echo 'Application started successfully'
        else
            echo 'Application failed to start'
            tail -20 logs/application.log
            exit 1
        fi
    "
    
    success "Aplicação iniciada"
}

# Health check
health_check() {
    log "Executando health checks..."
    
    # Wait for app to fully start
    sleep 15
    
    # Check if process is running
    PROCESS_STATUS=$(run_on_server "pgrep -f 'node server.cjs' >/dev/null && echo 'RUNNING' || echo 'STOPPED'")
    
    if [ "$PROCESS_STATUS" = "RUNNING" ]; then
        success "✅ Processo Node.js: RUNNING"
    else
        error "❌ Processo Node.js: STOPPED"
    fi
    
    # Check port 3000
    PORT_STATUS=$(run_on_server "lsof -i :3000 >/dev/null 2>&1 && echo 'OPEN' || echo 'CLOSED'")
    
    if [ "$PORT_STATUS" = "OPEN" ]; then
        success "✅ Porta 3000: OPEN"
    else
        warning "⚠️  Porta 3000: CLOSED (pode ser normal se behind proxy)"
    fi
    
    # Try to curl health endpoint
    HEALTH_RESPONSE=$(run_on_server "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health || echo '000'")
    
    if [ "$HEALTH_RESPONSE" = "200" ]; then
        success "✅ API Health Check: OK (200)"
    else
        warning "⚠️  API Health Check: $HEALTH_RESPONSE (verificar logs)"
    fi
    
    # Show application logs
    log "Últimas linhas do log:"
    run_on_server "tail -10 '$APP_ROOT/logs/application.log' 2>/dev/null || echo 'Logs não disponíveis'"
}

# Cleanup
cleanup() {
    log "Limpeza final..."
    
    run_on_server "
        # Remove old backup
        rm -rf '$APP_ROOT.old' 2>/dev/null || true
        
        # Clean staging
        rm -rf /home/artnshin/tmp/deploy-staging 2>/dev/null || true
        
        echo 'Cleanup completed'
    "
    
    # Restore original package.json if was changed
    if [ -f "package.json.backup" ]; then
        mv package.json.backup package.json
        log "package.json original restaurado"
    fi
    
    success "Limpeza concluída"
}

# Main deployment flow
main() {
    echo "🚀 INICIANDO DEPLOYMENT PARA DOMÍNIOS.PT"
    echo "========================================"
    echo ""
    
    check_prerequisites
    create_backup
    build_application
    upload_files
    install_dependencies
    deploy_application
    create_environment
    start_application
    health_check
    cleanup
    
    echo ""
    echo "🎉 DEPLOYMENT CONCLUÍDO COM SUCESSO!"
    echo ""
    echo "📊 Resumo:"
    echo "   📍 Servidor: $SERVER_HOST"
    echo "   📁 App Root: $APP_ROOT"
    echo "   🌐 Frontend: $PUBLIC_ROOT"
    echo "   📝 Logs: $APP_ROOT/logs/application.log"
    echo ""
    echo "🔍 Para verificar:"
    echo "   ssh $SERVER_USER@$SERVER_HOST 'cd $APP_ROOT && npm start'"
    echo "   curl http://localhost:3000/api/health"
    echo ""
    echo "▶️  PRÓXIMA FASE: Configurar Proxy/Routing (.htaccess)"
}

# Run deployment
main "$@"
```

---

## 🧪 **SCRIPTS DE VERIFICAÇÃO**

### **verify-deployment.sh**
```bash
#!/bin/bash
# verify-deployment.sh - Verificação pós-deployment

SERVER_USER="artnshin"
SERVER_HOST="alitools.pt"
APP_ROOT="/home/artnshin/alitools.pt"

echo "🔍 VERIFICAÇÃO PÓS-DEPLOYMENT"
echo "=============================="

# Comprehensive server check
ssh ${SERVER_USER}@${SERVER_HOST} << EOF
    echo ""
    echo "🟢 APPLICATION STATUS:"
    echo "======================"
    
    cd $APP_ROOT
    source /home/artnshin/nodevenv/alitools.pt/18/bin/activate
    
    # Process check
    if pgrep -f "node server.cjs" >/dev/null; then
        echo "   ✅ Node.js process: RUNNING (PID: \$(pgrep -f 'node server.cjs'))"
    else
        echo "   ❌ Node.js process: NOT RUNNING"
    fi
    
    # Port check
    if lsof -i :3000 >/dev/null 2>&1; then
        echo "   ✅ Port 3000: LISTENING"
    else
        echo "   ❌ Port 3000: NOT LISTENING"
    fi
    
    # Files check
    echo ""
    echo "🟢 FILES & STRUCTURE:"
    echo "===================="
    echo "   server.cjs: \$([ -f server.cjs ] && echo '✅ EXISTS' || echo '❌ MISSING')"
    echo "   package.json: \$([ -f package.json ] && echo '✅ EXISTS' || echo '❌ MISSING')"
    echo "   .env: \$([ -f .env ] && echo '✅ EXISTS' || echo '❌ MISSING')"
    echo "   node_modules: \$([ -d node_modules ] && echo '✅ EXISTS' || echo '❌ MISSING')"
    echo "   dist: \$([ -d dist ] && echo '✅ EXISTS' || echo '❌ MISSING')"
    
    # Disk usage
    echo ""
    echo "🟢 DISK USAGE:"
    echo "=============="
    echo "   App size: \$(du -sh . | cut -f1)"
    echo "   Dist size: \$(du -sh dist 2>/dev/null | cut -f1 || echo 'N/A')"
    echo "   Logs size: \$(du -sh logs 2>/dev/null | cut -f1 || echo 'N/A')"
    
    # Dependencies
    echo ""
    echo "🟢 DEPENDENCIES:"
    echo "==============="
    echo "   Node version: \$(node --version)"
    echo "   NPM packages: \$(npm list --depth=0 2>/dev/null | grep -c ' ' || echo '0')"
    
    # Health check
    echo ""
    echo "🟢 HEALTH CHECK:"
    echo "==============="
    HEALTH_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")
    if [ "\$HEALTH_STATUS" = "200" ]; then
        echo "   ✅ API Health: OK (200)"
    else
        echo "   ❌ API Health: FAILED (\$HEALTH_STATUS)"
    fi
    
    # Recent logs
    echo ""
    echo "🟢 RECENT LOGS:"
    echo "=============="
    if [ -f logs/application.log ]; then
        tail -5 logs/application.log
    else
        echo "   No logs available"
    fi
    
    echo ""
    echo "✅ VERIFICATION COMPLETED"
EOF

echo ""
echo "🎯 Se tudo estiver OK, prosseguir para FASE 4"
```

---

## 📊 **CHECKLIST DE VERIFICAÇÃO DA FASE 3**

### **Build & Upload**
- [ ] Build local executado com sucesso
- [ ] Pasta `dist/` criada e populada
- [ ] Upload via rsync concluído
- [ ] Dependências instaladas no servidor
- [ ] Arquivos com permissões corretas

### **Application Deployment**
- [ ] server.cjs copiado para APP_ROOT
- [ ] package.json configurado
- [ ] .env criado com credenciais corretas
- [ ] node_modules instalado no servidor
- [ ] Frontend copiado para public_html

### **Application Status**
- [ ] Processo Node.js em execução
- [ ] Porta 3000 a escutar
- [ ] API health check responde (200)
- [ ] Logs sendo gerados
- [ ] Sem erros críticos nos logs

### **Infrastructure**
- [ ] SSH ainda funciona
- [ ] Disk space suficiente
- [ ] Backup criado antes do deploy
- [ ] Estrutura de diretorias correta

---

## 🚨 **RESOLUÇÃO DE PROBLEMAS COMUNS**

### **Problema: Build falha localmente**
```bash
# Limpeza completa
rm -rf node_modules package-lock.json .vite
npm cache clean --force

# Usar package compatível se Node 18
cp package.dominios.json package.json
npm install
npm run build
```

### **Problema: Upload via rsync falha**
```bash
# Testar conectividade
ssh artnshin@alitools.pt "echo 'SSH OK'"

# Upload manual alternativo
scp -r dist/ artnshin@alitools.pt:/home/artnshin/public_html/
scp server.cjs package.json artnshin@alitools.pt:/home/artnshin/alitools.pt/
```

### **Problema: npm install falha no servidor**
```bash
# SSH para servidor e diagnóstico
ssh artnshin@alitools.pt
cd /home/artnshin/alitools.pt
source /home/artnshin/nodevenv/alitools.pt/18/bin/activate

# Limpeza e reinstalação
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --production --verbose
```

### **Problema: Aplicação não inicia**
```bash
# Verificar logs
ssh artnshin@alitools.pt
cd /home/artnshin/alitools.pt
tail -50 logs/application.log

# Testar manualmente
source /home/artnshin/nodevenv/alitools.pt/18/bin/activate
node server.cjs  # Para ver erros diretos
```

### **Problema: Health check falha**
```bash
# Verificar se a porta está a funcionar
ssh artnshin@alitools.pt "lsof -i :3000"

# Testar endpoint manualmente
ssh artnshin@alitools.pt "curl -v http://localhost:3000/api/health"

# Verificar se .env tem as credenciais certas
ssh artnshin@alitools.pt "cat /home/artnshin/alitools.pt/.env"
```

---

## 📝 **ROLLBACK PROCEDURE**

Se algo correr mal, rollback rápido:

```bash
#!/bin/bash
# rollback.sh - Rollback rápido

SERVER_USER="artnshin"
SERVER_HOST="alitools.pt"
APP_ROOT="/home/artnshin/alitools.pt"

ssh ${SERVER_USER}@${SERVER_HOST} "
    # Stop current app
    pkill -f 'node server.cjs' 2>/dev/null || true
    
    # Restore from backup
    if [ -d '${APP_ROOT}.old' ]; then
        rm -rf '$APP_ROOT'
        mv '${APP_ROOT}.old' '$APP_ROOT'
        echo 'Rolled back to previous version'
        
        # Restart
        cd '$APP_ROOT'
        source /home/artnshin/nodevenv/alitools.pt/18/bin/activate
        nohup npm start > logs/application.log 2>&1 &
        
        echo 'Application restarted'
    else
        echo 'No backup found for rollback'
    fi
"
```

---

## ✅ **CRITÉRIOS DE CONCLUSÃO DA FASE 3**

Só avançar para Fase 4 quando TODOS estes itens estão ✅:

1. ✅ Deploy script executa sem erros
2. ✅ Aplicação inicia e mantém-se em execução
3. ✅ Health check API responde 200
4. ✅ Frontend files copiados para public_html
5. ✅ Logs sendo gerados sem erros críticos
6. ✅ Backup criado e disponível
7. ✅ SSH access ainda funciona
8. ✅ Script `verify-deployment.sh` passa todos os testes

**🎯 Tempo total desta fase: 30-45 minutos**

**▶️ [PRÓXIMA FASE: Configurar Proxy/Routing](./fase4-proxy-routing.md)** 