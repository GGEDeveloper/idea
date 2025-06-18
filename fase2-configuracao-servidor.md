# 🖥️ **FASE 2: CONFIGURAÇÃO DO SERVIDOR**
## **Setup completo do cPanel e estrutura no domínios.pt**

---

## ⏱️ **DURAÇÃO ESTIMADA: 45-60 minutos**
## 🎯 **OBJETIVO: Configurar ambiente Node.js no servidor e estrutura de diretorias**

---

## 🗂️ **ESTRUTURA FINAL NO SERVIDOR**

```
/home/artnshin/
├── alitools.pt/                    # Root da aplicação Node.js
│   ├── server.cjs                 # Backend principal
│   ├── package.json               # Dependências
│   ├── .env                       # Environment variables
│   ├── src/                       # API routes
│   ├── db/                        # Database modules
│   ├── logs/                      # Application logs
│   └── node_modules/              # Dependencies
│
├── public_html/                   # Frontend servido pelo Apache
│   ├── index.html                 # SPA entry point
│   ├── assets/                    # CSS, JS compilados
│   ├── .htaccess                  # Proxy configuration
│   └── dist/                      # Build artifacts (symlink)
│
└── tmp/                           # Deploy temporário
    └── deploy-staging/
```

---

## 🖥️ **CONFIGURAÇÃO DO cPANEL NODE.JS**

### **1. Acesso ao cPanel**
```bash
# Login via browser:
URL: https://alitools.pt:2083
User: artnshin
Pass: [sua_password]

# OU via SSH para configuração direta:
ssh artnshin@alitools.pt
```

### **2. Setup da Node.js App no cPanel**

**Navegação: cPanel → Software → Setup Node.js App**

```yaml
# Configurações da App Node.js:
Application Mode: Production
Node.js Version: 18.20.7  # (a mais alta disponível)
Application Root: /home/artnshin/alitools.pt
Application URL: alitools.pt
Application Startup File: server.cjs
Environment Variables: [configurar abaixo]
```

### **3. Environment Variables no cPanel**

**No painel Node.js App → Environment Variables:**

```bash
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

# App Config
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=90

# Locale
NEXT_PUBLIC_DEFAULT_LOCALE=pt
NEXT_PUBLIC_SUPPORTED_LOCALES=pt,en
```

---

## 📁 **CRIAÇÃO DA ESTRUTURA DE DIRETÓRIOS**

### **Script de Setup Completo**

```bash
#!/bin/bash
# setup-server-structure.sh - Executar via SSH no servidor

echo "🏗️ Criando estrutura de diretórios no servidor..."

# Navegar para home directory
cd /home/artnshin

# Criar estrutura da aplicação
mkdir -p alitools.pt/{src,db,logs,tmp}
mkdir -p public_html/assets
mkdir -p tmp/deploy-staging

# Permissões corretas
chmod 755 alitools.pt
chmod 755 public_html
chmod 644 alitools.pt/logs
chmod 600 alitools.pt/.env  # Quando criado

# Criar links simbólicos úteis
ln -sf /home/artnshin/alitools.pt/dist /home/artnshin/public_html/dist

# Logs directory com rotação
mkdir -p alitools.pt/logs/{app,access,error}
touch alitools.pt/logs/app/application.log
touch alitools.pt/logs/error/error.log

echo "✅ Estrutura criada com sucesso!"

# Verificar estrutura
echo "📁 Estrutura atual:"
tree -L 3 /home/artnshin/ || ls -la /home/artnshin/
```

---

## 🔐 **CONFIGURAÇÃO DE PERMISSÕES E SEGURANÇA**

### **Permissões de Arquivos**
```bash
# Permissões seguras para o servidor
chmod 755 /home/artnshin/alitools.pt
chmod 755 /home/artnshin/public_html
chmod 600 /home/artnshin/alitools.pt/.env
chmod 644 /home/artnshin/alitools.pt/server.cjs
chmod 644 /home/artnshin/alitools.pt/package.json
chmod -R 755 /home/artnshin/alitools.pt/src
chmod -R 755 /home/artnshin/alitools.pt/db
chmod -R 644 /home/artnshin/alitools.pt/logs
```

### **Configuração SSH Keys**
```bash
# No seu computador local - gerar key se não existir
ssh-keygen -t rsa -b 4096 -C "deploy@alitools.pt"

# Copiar key para servidor
ssh-copy-id artnshin@alitools.pt

# Testar conexão
ssh artnshin@alitools.pt "whoami && pwd"
```

### **Firewall e Network (via cPanel)**
```yaml
# cPanel → Security → IP Blocker
# Permitir apenas IPs necessários para deploy
Allowed IPs:
  - Seu IP de desenvolvimento
  - GitHub Actions IPs (se usar CI/CD)
  - Cloudflare IPs (se usar CDN)
```

---

## 🔧 **SCRIPTS DE CONFIGURAÇÃO AUTOMATIZADA**

### **server-config.sh**
```bash
#!/bin/bash
# server-config.sh - Configuração completa do servidor

SERVER_USER="artnshin"
SERVER_HOST="alitools.pt"
APP_ROOT="/home/artnshin/alitools.pt"

echo "🖥️ Configurando servidor $SERVER_HOST..."

# Função para executar comandos no servidor
run_on_server() {
    ssh ${SERVER_USER}@${SERVER_HOST} "$1"
}

# 1. Verificar conectividade
echo "📡 Testando conexão SSH..."
if ! run_on_server "echo 'SSH OK'"; then
    echo "❌ Falha na conexão SSH"
    exit 1
fi

echo "✅ SSH conectado"

# 2. Criar estrutura
echo "🏗️ Criando estrutura de diretórios..."
run_on_server "
    cd /home/artnshin
    mkdir -p alitools.pt/{src,db,logs,tmp,scripts}
    mkdir -p public_html/assets
    mkdir -p tmp/deploy-staging
    
    # Permissões
    chmod 755 alitools.pt public_html
    chmod -R 755 alitools.pt/logs
    
    echo 'Estrutura criada'
"

# 3. Verificar Node.js
echo "🔍 Verificando Node.js no servidor..."
NODE_VERSION=$(run_on_server "source /home/artnshin/nodevenv/alitools.pt/18/bin/activate && node --version")
echo "✅ Node.js: $NODE_VERSION"

# 4. Testar cPanel Node.js App
echo "🧪 Verificando configuração cPanel..."
run_on_server "
    source /home/artnshin/nodevenv/alitools.pt/18/bin/activate
    cd $APP_ROOT
    
    # Criar package.json mínimo se não existir
    if [ ! -f package.json ]; then
        cat > package.json << 'EOF'
{
  \"name\": \"idea-ecommerce\",
  \"version\": \"1.0.0\",
  \"main\": \"server.cjs\",
  \"scripts\": {
    \"start\": \"node server.cjs\"
  }
}
EOF
    fi
    
    echo 'cPanel config OK'
"

# 5. Criar arquivo .env template
echo "📝 Criando template .env..."
run_on_server "
    cd $APP_ROOT
    
    cat > .env.template << 'EOF'
# Environment Variables Template
# Copie para .env e configure os valores
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgres://user:pass@host/database?sslmode=require

# API Keys
GEKO_API_KEY=your_api_key_here

# Security
JWT_SECRET=your_jwt_secret_here

# Logging
LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=90
EOF

    echo '.env template criado'
"

echo ""
echo "🎉 CONFIGURAÇÃO DO SERVIDOR CONCLUÍDA!"
echo ""
echo "📋 Próximos passos manuais no cPanel:"
echo "   1. Setup Node.js App com os parâmetros fornecidos"
echo "   2. Configurar Environment Variables"
echo "   3. Ativar a aplicação"
echo ""
echo "🔍 Para verificar:"
echo "   ssh $SERVER_USER@$SERVER_HOST 'ls -la $APP_ROOT'"
```

### **verify-server-setup.sh**
```bash
#!/bin/bash
# verify-server-setup.sh - Verificação completa da configuração

SERVER_USER="artnshin"
SERVER_HOST="alitools.pt"

echo "🔍 Verificando configuração do servidor..."

# Testes de conectividade e estrutura
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    echo "📋 Relatório de Verificação do Servidor"
    echo "======================================="
    
    # Node.js environment
    echo ""
    echo "🟢 Node.js Environment:"
    source /home/artnshin/nodevenv/alitools.pt/18/bin/activate
    echo "   Node version: $(node --version)"
    echo "   NPM version: $(npm --version)"
    echo "   Environment: $(echo $NODE_ENV)"
    
    # Estrutura de diretórios
    echo ""
    echo "🟢 Estrutura de Diretórios:"
    echo "   App root: $(ls -la /home/artnshin/alitools.pt 2>/dev/null && echo 'OK' || echo 'MISSING')"
    echo "   Public html: $(ls -la /home/artnshin/public_html 2>/dev/null && echo 'OK' || echo 'MISSING')"
    echo "   Logs: $(ls -la /home/artnshin/alitools.pt/logs 2>/dev/null && echo 'OK' || echo 'MISSING')"
    
    # Permissões
    echo ""
    echo "🟢 Permissões:"
    echo "   App root: $(stat -c '%a' /home/artnshin/alitools.pt 2>/dev/null || echo 'N/A')"
    echo "   Public html: $(stat -c '%a' /home/artnshin/public_html 2>/dev/null || echo 'N/A')"
    
    # Rede e portas
    echo ""
    echo "🟢 Network:"
    echo "   Porta 3000 disponível: $(lsof -i :3000 >/dev/null 2>&1 && echo 'EM USO' || echo 'LIVRE')"
    
    # Disk space
    echo ""
    echo "🟢 Disk Space:"
    df -h /home/artnshin | tail -1
    
    echo ""
    echo "✅ Verificação concluída"
EOF

echo ""
echo "🎯 Se tudo estiver OK, avançar para FASE 3"
```

---

## 📊 **CHECKLIST DE VERIFICAÇÃO DA FASE 2**

### **cPanel Configuration**
- [ ] Node.js App criada no cPanel
- [ ] Application Mode: Production
- [ ] Application Root: `/home/artnshin/alitools.pt`
- [ ] Startup File: `server.cjs`
- [ ] Environment Variables configuradas
- [ ] App Status: Stopped (pronto para deploy)

### **Server Structure**
- [ ] Diretório `/home/artnshin/alitools.pt` criado
- [ ] Diretório `/home/artnshin/public_html` existe
- [ ] Subdiretórios (src/, db/, logs/) criados
- [ ] Permissões corretas aplicadas
- [ ] Symlinks configurados

### **Access & Security**
- [ ] SSH funcionando sem password (key-based)
- [ ] cPanel acessível
- [ ] Node.js environment ativo
- [ ] Porta 3000 disponível
- [ ] Firewall configurado (se necessário)

### **Environment Configuration**
- [ ] `.env.template` criado no servidor
- [ ] Environment variables documentadas
- [ ] Database connectivity testada (próxima fase)
- [ ] Paths configurados corretamente

---

## 🚨 **RESOLUÇÃO DE PROBLEMAS COMUNS**

### **Problema: cPanel Node.js App não aparece**
```bash
# Solução: Verificar se Node.js está disponível no plano
# Contactar suporte do domínios.pt se necessário
# Alternativa: usar Passenger (se disponível)
```

### **Problema: SSH permission denied**
```bash
# Regenerar SSH keys
ssh-keygen -t rsa -b 4096 -f ~/.ssh/alitools_pt
ssh-copy-id -i ~/.ssh/alitools_pt artnshin@alitools.pt

# Adicionar ao ~/.ssh/config:
Host alitools.pt
    HostName alitools.pt
    User artnshin
    IdentityFile ~/.ssh/alitools_pt
```

### **Problema: Permissões de diretório**
```bash
# Corrigir permissões via SSH
ssh artnshin@alitools.pt "
    chmod 755 /home/artnshin/alitools.pt
    chmod 755 /home/artnshin/public_html
    chmod -R 644 /home/artnshin/alitools.pt/logs
"
```

### **Problema: Environment variables não funcionam**
```bash
# Verificar se são configuradas no cPanel Node.js App
# NÃO no .env file (que não é lido pelo cPanel)
# Reiniciar app depois de alterar
```

---

## ✅ **CRITÉRIOS DE CONCLUSÃO DA FASE 2**

Só avançar para Fase 3 quando TODOS estes itens estão ✅:

1. ✅ cPanel Node.js App configurada
2. ✅ Estrutura de diretórios criada
3. ✅ SSH access funcionando
4. ✅ Node.js environment ativo
5. ✅ Permissões corretas aplicadas
6. ✅ Environment variables configuradas
7. ✅ Porta 3000 disponível
8. ✅ Script `verify-server-setup.sh` passa

**🎯 Tempo total desta fase: 45-60 minutos**

**▶️ [PRÓXIMA FASE: Deployment Inicial](./fase3-deployment-inicial.md)** 