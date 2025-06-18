# 🥉 **OPÇÃO 3: cPanel Otimizado (PARA SHARED HOSTING)**

## **Setup Node.js nativo no cPanel:**

### **1. Configuração no cPanel**
```bash
# Via cPanel Node.js App Setup:
Application Mode: Production
Node.js Version: 18+
Application Root: public_html/app
Application URL: alitools.pt
Application Startup File: server.cjs
```

### **2. Deploy Script Otimizado**
```bash
#!/bin/bash
# cpanel-deploy.sh

echo "📦 Deploy cPanel otimizado..."

# Build local (mais rápido)
npm run build

# Upload via rsync (mais eficiente que FTP)
rsync -avz --delete ./dist/ user@alitools.pt:~/public_html/
rsync -avz server.cjs package*.json user@alitools.pt:~/app/

# SSH commands
ssh user@alitools.pt << 'EOF'
  cd ~/app
  npm ci --production
  
  # Restart via cPanel API
  curl -u user:pass -X POST \
    "https://alitools.pt:2083/execute/NodeJS/restart_app" \
    -d "app_name=myapp"
EOF
```

### **3. .htaccess Otimizado**
```apache
# .htaccess na public_html
RewriteEngine On

# API requests para Node.js
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# SPA routing para React
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache para assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
  ExpiresActive On
  ExpiresDefault "access plus 1 year"
</FilesMatch>
```

---

# 🚀 **OPÇÃO 4: Caddy + Docker (MAIS SIMPLES)**

## **Por que Caddy é revolucionário:**
- ✅ SSL automático (Let's Encrypt)
- ✅ Configuração mínima
- ✅ HTTP/2 por padrão
- ✅ Zero downtime reloads

### **1. Caddyfile (incrível simplicidade)**
```caddy
# Frontend
alitools.pt {
    root * /srv
    try_files {path} /index.html
    file_server
}

# API
api.alitools.pt {
    reverse_proxy app:3000
}
```

### **2. docker-compose.yml com Caddy**
```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: idea-app
    restart: unless-stopped
    networks:
      - caddy-network

  caddy:
    image: caddy:2.7-alpine
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./dist:/srv
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - caddy-network

volumes:
  caddy_data:
  caddy_config:

networks:
  caddy-network:
    driver: bridge
```

---

# ⚡ **OPÇÃO 5: CI/CD Pipeline Completo (EMPRESARIAL)**

## **GitHub Actions + Webhook Deploy**

### **1. Workflow CI/CD (.github/workflows/deploy.yml)**
```yaml
name: Production Deploy

on:
  push:
    branches: [ master ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/master'
    
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/alitools.pt
            git pull origin master
            
            # Zero-downtime deploy
            pm2 startOrReload ecosystem.config.js --env production
            
            # Health check
            sleep 5
            curl -f http://localhost/api/health || exit 1
            
            # Notify success
            echo "✅ Deploy successful"
```

### **2. Webhook Endpoint (deploy.php)**
```php
<?php
// deploy.php - Webhook receiver

$secret = 'your-secret-key';
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verify GitHub signature
if (!hash_equals('sha256=' . hash_hmac('sha256', $payload, $secret), $signature)) {
    http_response_code(403);
    exit('Forbidden');
}

// Execute deploy script
$output = shell_exec('/path/to/deploy.sh 2>&1');
echo $output;

// Log deploy
file_put_contents('/var/log/deploy.log', 
    date('Y-m-d H:i:s') . " - Deploy executed\n", 
    FILE_APPEND
);
?>
```

---

# 📊 **COMPARAÇÃO DAS OPÇÕES:**

| Opção | Complexidade | Performance | Escalabilidade | Custo | Recomendado para |
|-------|-------------|-------------|----------------|-------|------------------|
| **PM2 + Nginx** | Média | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Baixo | **Produção profissional** |
| **Docker** | Média | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Médio | **Máxima portabilidade** |
| **cPanel** | Baixa | ⭐⭐⭐ | ⭐⭐ | Baixo | **Shared hosting** |
| **Caddy + Docker** | Baixa | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Médio | **SSL automático** |
| **CI/CD Pipeline** | Alta | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Alto | **Equipas grandes** |

---

# 🎯 **RECOMENDAÇÃO FINAL:**

### **Para o teu caso (domínios.pt):**
1. **Imediato**: Use `PM2 + Nginx` - é o gold standard
2. **Futuro**: Migre para `Docker` para máxima portabilidade
3. **Se budget baixo**: Otimize o `cPanel` atual

### **Próximos passos:**
1. Criar `ecosystem.config.js`
2. Setup do Nginx 
3. Script de deploy automatizado
4. Monitorização com PM2

**Qual opção queres implementar primeiro?** 