# Deployment Profissional com PM2 + Nginx

## 🚀 **Setup PM2 + Nginx (Recomendado para Produção)**

### **1. Instalar PM2 globalmente**
```bash
npm install -g pm2
```

### **2. Criar ecosystem.config.js**
```javascript
module.exports = {
  apps: [{
    name: 'idea-ecommerce',
    script: 'server.cjs',
    instances: 'max', // Usa todos os CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Auto restart
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    autorestart: true,
    
    // Logs
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### **3. Configurar Nginx** 
```nginx
server {
    listen 80;
    server_name alitools.pt;

    # Frontend estático
    location / {
        root /path/to/your/app/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

### **4. Comandos de Deploy**
```bash
# Build da aplicação
npm run build

# Deploy com PM2
pm2 start ecosystem.config.js --env production

# Comandos úteis
pm2 list              # Ver aplicações
pm2 logs              # Ver logs
pm2 restart all       # Restart sem downtime
pm2 reload all        # Zero-downtime reload
pm2 monit             # Monitor recursos
pm2 startup           # Auto-start no boot
pm2 save              # Salvar configuração atual
```

### **5. Script de Deploy Automático**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando deploy..."

# Pull do Git
git pull origin master

# Instalar dependências
npm ci --production

# Build do frontend
npm run build

# Restart da aplicação (zero downtime)
pm2 reload ecosystem.config.js --env production

echo "✅ Deploy concluído!"

# Verificar status
pm2 list
```

---

## 📊 **Vantagens PM2:**
- **Clustering**: Usa todos os CPU cores
- **Zero Downtime**: Restart sem interrupção
- **Monitorização**: CPU, RAM, logs em tempo real
- **Auto-restart**: Se crashar, reinicia automaticamente
- **Load Balancing**: Distribui carga entre instâncias
- **Logs**: Estruturados e rotativos 