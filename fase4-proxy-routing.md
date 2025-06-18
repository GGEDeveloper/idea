# 🌐 **FASE 4: PROXY E ROUTING (.htaccess)**
## **Configuração CRÍTICA para acesso público via alitools.pt**

---

## ⏱️ **DURAÇÃO ESTIMADA: 15-30 minutos**
## 🎯 **OBJETIVO: Configurar proxy Apache para redirecionar tráfego público para Node.js**

---

## 🚨 **CORREÇÃO FUNDAMENTAL:**

### **❌ ANTES (ERRADO):**
- Usuários acedem via `localhost:3000` ❌
- Aplicação só funciona via SSH ❌
- Sem acesso público ❌

### **✅ DEPOIS (CORRETO):**
- Usuários acedem via `http://alitools.pt` ✅
- Apache faz proxy para Node.js porta 3000 ✅
- Acesso público funcionando ✅

---

## 📋 **ARQUITETURA DE PROXY**

```
PUBLIC ACCESS FLOW:
==================

Internet → alitools.pt:80 → Apache → .htaccess → Decision:
                                                      ↓
                            ┌─ /api/* → Proxy to :3000 (Node.js)
                            │
                            └─ /* → Serve React files (public_html)

INTERNAL TESTING:
================
SSH → localhost:3000 → Node.js (direct access)
```

---

## 🔧 **CONFIGURAÇÃO .htaccess PRINCIPAL**

### **public_html/.htaccess**
```apache
# ========================================
# CONFIGURAÇÃO .htaccess PARA ALITOOLS.PT
# Proxy API calls para Node.js + SPA routing
# ========================================

# Enable URL Rewriting
RewriteEngine On

# ===============================
# API PROXY TO NODE.JS (PORT 3000)
# ===============================

# Proxy all /api/* requests to Node.js
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# Alternative proxy rule (if above doesn't work)
# RewriteCond %{REQUEST_URI} ^/api/
# RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]

# ===============================
# SPA ROUTING (REACT ROUTER)
# ===============================

# Handle React Router - serve index.html for all non-API routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# ===============================
# SECURITY HEADERS
# ===============================

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# HTTPS enforcement (uncomment when SSL is active)
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# ===============================
# CACHE OPTIMIZATION
# ===============================

# Cache static assets
<filesMatch "\\.(ico|pdf|flv|jpg|jpeg|png|gif|js|css|swf|woff|woff2)$">
    Header set Cache-Control "max-age=31536000, public"
</filesMatch>

# Don't cache HTML files
<filesMatch "\\.(html|htm)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
</filesMatch>

# ===============================
# GZIP COMPRESSION
# ===============================

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# ===============================
# PROXY SETTINGS
# ===============================

# Proxy timeout settings (if mod_proxy is available)
<IfModule mod_proxy.c>
    ProxyTimeout 300
    ProxyPreserveHost On
</IfModule>

# ===============================
# ERROR PAGES
# ===============================

# Custom error pages
ErrorDocument 500 /index.html
ErrorDocument 404 /index.html
ErrorDocument 403 /index.html
```

---

## 🚀 **SCRIPT DE CONFIGURAÇÃO AUTOMÁTICA**

### **setup-proxy.sh**
```bash
#!/bin/bash
# setup-proxy.sh - Configurar proxy .htaccess automaticamente

SERVER_USER="artnshin"
SERVER_HOST="alitools.pt"
PUBLIC_ROOT="/home/artnshin/public_html"

echo "🌐 Configurando proxy .htaccess para alitools.pt..."

# Função para executar comandos no servidor
run_on_server() {
    ssh ${SERVER_USER}@${SERVER_HOST} "$1"
}

# Criar .htaccess com configuração completa
create_htaccess() {
    echo "📝 Criando .htaccess..."
    
    run_on_server "
        cd '$PUBLIC_ROOT'
        
        # Backup existing .htaccess
        if [ -f '.htaccess' ]; then
            cp .htaccess .htaccess.backup.\$(date +%Y%m%d_%H%M%S)
            echo 'Backup do .htaccess existente criado'
        fi
        
        # Create new .htaccess
        cat > .htaccess << 'EOF'
# ========================================
# CONFIGURAÇÃO .htaccess PARA ALITOOLS.PT
# Proxy API calls para Node.js + SPA routing
# ========================================

# Enable URL Rewriting
RewriteEngine On

# ===============================
# API PROXY TO NODE.JS (PORT 3000)
# ===============================

# Proxy all /api/* requests to Node.js
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/\$1 [P,L]

# ===============================
# SPA ROUTING (REACT ROUTER)
# ===============================

# Handle React Router - serve index.html for all non-API routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# ===============================
# SECURITY HEADERS
# ===============================

Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection \"1; mode=block\"

# ===============================
# CACHE OPTIMIZATION
# ===============================

<filesMatch \"\\\\.(js|css|png|jpg|jpeg|gif|ico|woff|woff2)$\">
    Header set Cache-Control \"max-age=31536000, public\"
</filesMatch>

<filesMatch \"\\\\.(html|htm)$\">
    Header set Cache-Control \"no-cache, no-store, must-revalidate\"
</filesMatch>

# ===============================
# GZIP COMPRESSION
# ===============================

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# ===============================
# ERROR PAGES
# ===============================

ErrorDocument 404 /index.html
ErrorDocument 500 /index.html
EOF

        chmod 644 .htaccess
        echo '.htaccess criado com sucesso'
    "
}

# Verificar se Apache modules estão disponíveis
check_apache_modules() {
    echo "🔍 Verificando módulos Apache..."
    
    run_on_server "
        # Check if mod_rewrite is enabled
        if apache2ctl -M 2>/dev/null | grep -q rewrite; then
            echo '✅ mod_rewrite: ENABLED'
        else
            echo '⚠️  mod_rewrite: Status unknown (shared hosting)'
        fi
        
        # Check if mod_proxy is enabled
        if apache2ctl -M 2>/dev/null | grep -q proxy; then
            echo '✅ mod_proxy: ENABLED'
        else
            echo '⚠️  mod_proxy: Status unknown (shared hosting)'
        fi
        
        # Note: Em shared hosting, nem sempre conseguimos verificar módulos
        echo 'ℹ️  Em shared hosting, módulos geralmente estão ativados'
    "
}

# Testar proxy configuration
test_proxy() {
    echo "🧪 Testando configuração de proxy..."
    
    # Wait for configuration to take effect
    sleep 5
    
    # Test static files
    echo "  → Testando acesso a ficheiros estáticos..."
    STATIC_STATUS=$(run_on_server "curl -s -o /dev/null -w '%{http_code}' http://alitools.pt/ || echo '000'")
    
    if [ "$STATIC_STATUS" = "200" ]; then
        echo "✅ Frontend: OK (200)"
    else
        echo "⚠️  Frontend: $STATIC_STATUS"
    fi
    
    # Test API proxy
    echo "  → Testando proxy API..."
    API_STATUS=$(run_on_server "curl -s -o /dev/null -w '%{http_code}' http://alitools.pt/api/health || echo '000'")
    
    if [ "$API_STATUS" = "200" ]; then
        echo "✅ API Proxy: OK (200)"
    else
        echo "⚠️  API Proxy: $API_STATUS"
    fi
}

# Create index.html if missing
ensure_index_html() {
    echo "📄 Verificando index.html..."
    
    run_on_server "
        cd '$PUBLIC_ROOT'
        
        if [ ! -f 'index.html' ]; then
            echo 'Criando index.html básico...'
            cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang=\"pt\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>AliTools.pt - E-commerce</title>
</head>
<body>
    <div id=\"root\">
        <h1>AliTools.pt</h1>
        <p>Aplicação a carregar...</p>
        <p><em>Se esta mensagem persistir, verifique a configuração.</em></p>
    </div>
</body>
</html>
EOF
            echo 'index.html básico criado'
        else
            echo 'index.html já existe'
        fi
    "
}

# Main function
main() {
    echo "🌐 CONFIGURANDO PROXY PARA ALITOOLS.PT"
    echo "====================================="
    echo ""
    
    ensure_index_html
    check_apache_modules
    create_htaccess
    test_proxy
    
    echo ""
    echo "🎉 CONFIGURAÇÃO DE PROXY CONCLUÍDA!"
    echo ""
    echo "📋 Resumo:"
    echo "   🌐 Frontend: http://alitools.pt/"
    echo "   🔥 API: http://alitools.pt/api/*"
    echo "   📁 .htaccess: $PUBLIC_ROOT/.htaccess"
    echo ""
    echo "🔍 Para testar:"
    echo "   curl http://alitools.pt/"
    echo "   curl http://alitools.pt/api/health"
    echo ""
    echo "⚠️  Se API proxy não funcionar, verificar se:"
    echo "   1. Node.js app está a correr na porta 3000"
    echo "   2. mod_proxy está ativo no Apache"
    echo "   3. .htaccess tem permissões corretas"
}

# Run setup
main "$@"
```

---

## 🧪 **TESTES DE VERIFICAÇÃO**

### **test-public-access.sh**
```bash
#!/bin/bash
# test-public-access.sh - Testar acesso público real

echo "🔍 TESTANDO ACESSO PÚBLICO REAL"
echo "==============================="

# Test from external (your computer)
echo ""
echo "🌐 Testes Externos (do seu computador):"
echo "======================================="

# Frontend test
echo -n "  Frontend (http://alitools.pt/): "
FRONTEND_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://alitools.pt/ || echo '000')
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ OK ($FRONTEND_STATUS)"
else
    echo "❌ FAILED ($FRONTEND_STATUS)"
fi

# API test
echo -n "  API (http://alitools.pt/api/health): "
API_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://alitools.pt/api/health || echo '000')
if [ "$API_STATUS" = "200" ]; then
    echo "✅ OK ($API_STATUS)"
else
    echo "❌ FAILED ($API_STATUS)"
fi

# Test SPA routing
echo -n "  SPA Routing (http://alitools.pt/products): "
SPA_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://alitools.pt/products || echo '000')
if [ "$SPA_STATUS" = "200" ]; then
    echo "✅ OK ($SPA_STATUS)"
else
    echo "❌ FAILED ($SPA_STATUS)"
fi

# Test from server (internal)
echo ""
echo "🖥️ Testes Internos (do servidor):"
echo "================================="

ssh artnshin@alitools.pt << 'EOF'
    echo -n "  Internal Node.js (localhost:3000): "
    INTERNAL_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health || echo '000')
    if [ "$INTERNAL_STATUS" = "200" ]; then
        echo "✅ OK ($INTERNAL_STATUS)"
    else
        echo "❌ FAILED ($INTERNAL_STATUS)"
    fi
    
    echo -n "  Internal Apache (localhost:80): "
    APACHE_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost/ || echo '000')
    if [ "$APACHE_STATUS" = "200" ]; then
        echo "✅ OK ($APACHE_STATUS)"
    else
        echo "❌ FAILED ($APACHE_STATUS)"
    fi
EOF

echo ""
echo "📊 RESUMO DOS TESTES:"
echo "===================="
if [ "$FRONTEND_STATUS" = "200" ] && [ "$API_STATUS" = "200" ]; then
    echo "🎉 ✅ APLICAÇÃO FUNCIONANDO PUBLICAMENTE!"
    echo "   👥 Usuários podem aceder via http://alitools.pt"
    echo "   🔥 API está acessível via http://alitools.pt/api/*"
else
    echo "⚠️  ❌ PROBLEMAS ENCONTRADOS:"
    [ "$FRONTEND_STATUS" != "200" ] && echo "   - Frontend não acessível publicamente"
    [ "$API_STATUS" != "200" ] && echo "   - API proxy não está funcionando"
    echo ""
    echo "🛠️  PRÓXIMOS PASSOS:"
    echo "   1. Verificar se Node.js app está a correr"
    echo "   2. Verificar configuração .htaccess"
    echo "   3. Contactar suporte domínios.pt se necessário"
fi
```

---

## 📊 **CHECKLIST DE VERIFICAÇÃO DA FASE 4**

### **Configuração .htaccess**
- [ ] .htaccess criado em `/home/artnshin/public_html/`
- [ ] Regras de proxy para `/api/*` configuradas
- [ ] SPA routing configurado para React Router
- [ ] Security headers adicionados
- [ ] Cache optimization configurado
- [ ] Permissões corretas (644)

### **Funcionalidade Pública**
- [ ] http://alitools.pt/ carrega (Frontend)
- [ ] http://alitools.pt/api/health responde (API)
- [ ] SPA routing funciona (ex: /products)
- [ ] Recursos estáticos carregam (CSS, JS, images)
- [ ] Sem erros 404/500 em requests normais

### **Performance**
- [ ] GZIP compression ativo
- [ ] Cache headers configurados
- [ ] Proxy timeout adequado
- [ ] Security headers ativos

---

## 🚨 **RESOLUÇÃO DE PROBLEMAS**

### **Problema: API proxy não funciona (404)**
```bash
# Verificar se mod_proxy está ativo
# Via cPanel → Error Logs ou contactar suporte

# Alternativa: usar ProxyPass direto
RewriteRule ^api/(.*)$ http://127.0.0.1:3000/api/$1 [P,L]
```

### **Problema: SPA routing não funciona**
```bash
# Verificar se existe index.html
# Verificar se mod_rewrite está ativo
# Testar regra simples:
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule . /index.html [L]
```

### **Problema: Permissões .htaccess**
```bash
# Corrigir permissões
ssh artnshin@alitools.pt "chmod 644 /home/artnshin/public_html/.htaccess"
```

---

## ✅ **CRITÉRIOS DE CONCLUSÃO DA FASE 4**

Só avançar para Fase 5 quando TODOS estes itens estão ✅:

1. ✅ .htaccess criado e configurado
2. ✅ Frontend acessível via http://alitools.pt/
3. ✅ API acessível via http://alitools.pt/api/health
4. ✅ SPA routing funcionando
5. ✅ Security headers ativos
6. ✅ Cache e compression otimizados
7. ✅ Testes externos passam
8. ✅ **ZERO referências a localhost:3000 para usuários**

**🎯 Tempo total desta fase: 15-30 minutos**

**▶️ [PRÓXIMA FASE: Otimização e Performance](./fase5-otimizacao-performance.md)** 