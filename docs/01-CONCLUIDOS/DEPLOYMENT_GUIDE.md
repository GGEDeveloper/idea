# Guia de Deployment - IDEA E-commerce

**Data**: 25 de Janeiro de 2025  
**Versão**: 1.0  
**Target**: Domínios.pt e Servidores de Produção

---

## 🎯 **OVERVIEW**

Este guia fornece instruções completas para fazer deploy da aplicação IDEA E-commerce em produção. A aplicação está configurada para funcionar como um **fullstack unificado** com frontend e backend integrados num comando único.

---

## 🚀 **OPÇÕES DE DEPLOYMENT**

### **Opção 1: Comando Único (Recomendado)**
```bash
npm run prod:full
```

### **Opção 2: PM2 Process Manager**
```bash
./deploy.sh pm2
```

### **Opção 3: Docker**
```bash
docker-compose up -d
```

### **Opção 4: Script de Deploy Automático**
```bash
./deploy.sh
```

---

## 📋 **PRÉ-REQUISITOS**

### **Sistema**
- Node.js 18+ 
- npm 8+
- PM2 (opcional, mas recomendado)
- Docker (opcional)
- curl (para health checks)

### **Ambiente**
- ✅ Base de dados PostgreSQL (Neon configurada)
- ✅ Variáveis de ambiente configuradas
- ✅ Domínio e SSL (para produção)

---

## ⚙️ **CONFIGURAÇÃO INICIAL**

### **1. Variáveis de Ambiente**
```bash
# Copiar template
cp env.example .env

# Editar com valores reais
nano .env
```

**Variáveis Críticas**:
```bash
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:5432/db?sslmode=require
JWT_SECRET=your-super-secure-secret-key-32-chars
GEKO_API_KEY=your-geko-api-key
FRONTEND_URL=https://yourdomain.pt
```

### **2. Instalação**
```bash
# Instalar dependências
npm ci --omit=dev

# Verificar configuração
npm run health
```

---

## 🔧 **DEPLOYMENT METHODS**

### **Método 1: Comando Único (npm run prod:full)**

O mais simples para deployment rápido:

```bash
# Build + Start em produção
npm run prod:full
```

**O que faz**:
1. `npm run build` - Compila frontend React
2. `npm run prod:copy-assets` - Copia assets públicos
3. `NODE_ENV=production node server.cjs` - Inicia servidor

**Vantagens**: Simples, rápido  
**Desvantagens**: Sem clustering, sem auto-restart

---

### **Método 2: Script de Deploy (Recomendado)**

O script `deploy.sh` automatiza todo o processo:

```bash
# Deploy completo
./deploy.sh

# Deploy apenas com PM2
./deploy.sh pm2

# Apenas build
./deploy.sh build

# Teste de conectividade
./deploy.sh test
```

**O que faz**:
1. ✅ Verifica .env
2. ✅ Valida variáveis obrigatórias  
3. ✅ Instala dependências
4. ✅ Build da aplicação
5. ✅ Testa base de dados
6. ✅ Deploy com PM2 ou modo simples

---

### **Método 3: PM2 Process Manager**

Para deployment profissional com clustering:

```bash
# Install PM2 globalmente (se necessário)
npm install -g pm2

# Deploy com PM2
npm run prod:pm2

# Monitorização
npm run prod:pm2:logs
pm2 status
pm2 monit

# Gestão
npm run prod:pm2:restart
npm run prod:pm2:stop
```

**Configuração PM2** (`ecosystem.config.js`):
- **Clustering**: Usa todos os cores disponíveis
- **Auto-restart**: Reinício automático em falhas
- **Logging**: Logs estruturados em `./logs/`
- **Memory limit**: Restart se usar >1GB RAM

---

### **Método 4: Docker**

Para ambientes containerizados:

```bash
# Build & Start
docker-compose up -d

# Apenas a aplicação
docker-compose up idea-ecommerce

# Com PostgreSQL local
docker-compose --profile local-db up

# Com Nginx
docker-compose --profile nginx up

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

**Features Docker**:
- **Multi-stage build**: Otimizado para produção
- **Health checks**: Monitorização automática
- **Non-root user**: Segurança aprimorada
- **Alpine base**: Imagem leve

---

## 🌐 **CONFIGURAÇÃO DOMÍNIOS.PT**

### **1. Upload dos Ficheiros**
```bash
# Via FTP/SFTP
rsync -avz --exclude node_modules ./ user@servidor.dominios.pt:/var/www/html/

# Ou comprimir e upload
tar --exclude=node_modules -czf idea.tar.gz .
# Upload idea.tar.gz e extrair no servidor
```

### **2. No Servidor**
```bash
# Extrair (se comprimido)
tar -xzf idea.tar.gz

# Configurar ambiente
cp env.example .env
nano .env

# Install e deploy
npm ci --omit=dev
./deploy.sh
```

### **3. Proxy/Apache Configuration**
```apache
<VirtualHost *:80>
    ServerName yourdomain.pt
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ProxyPreserveHost On
</VirtualHost>
```

---

## 🔍 **MONITORIZAÇÃO E LOGS**

### **Health Check**
```bash
# Local
curl http://localhost:3000/api/health

# Produção
curl https://yourdomain.pt/api/health
```

**Resposta Esperada**:
```json
{
  "status": "ok",
  "environment": "production",
  "dbStatus": "connected",
  "uptime": 1234,
  "memory": {...}
}
```

### **Logs**
```bash
# PM2 logs
npm run prod:pm2:logs

# Docker logs
docker-compose logs -f

# Arquivo de logs (PM2)
tail -f logs/combined.log
tail -f logs/error.log
```

---

## 🛠️ **TROUBLESHOOTING**

### **Problemas Comuns**

**1. Erro de Base de Dados**
```bash
# Verificar connectividade
npm run health

# Verificar variáveis
echo $DATABASE_URL
```

**2. Assets não carregam**
```bash
# Verificar build
ls -la dist/
npm run build
```

**3. CORS errors**
```bash
# Verificar FRONTEND_URL
echo $FRONTEND_URL
```

**4. PM2 não inicia**
```bash
# Verificar logs
pm2 logs
pm2 status

# Reiniciar
pm2 delete all
npm run prod:pm2
```

### **Debug Mode**
```bash
# Variáveis debug
DEBUG=* npm run prod:start

# Logs detalhados
LOG_LEVEL=debug npm run prod:start
```

---

## 📊 **PERFORMANCE E OTIMIZAÇÃO**

### **Configurações de Produção**
- ✅ **Clustering**: PM2 com todos os cores
- ✅ **Caching**: Headers de cache para assets estáticos
- ✅ **Compression**: Gzip automático do Express
- ✅ **Security**: Headers de segurança OWASP
- ✅ **Error Handling**: Logs estruturados

### **Monitorização**
```bash
# Uso de recursos
pm2 monit

# Memory usage
ps aux | grep node

# Disk usage
df -h
du -sh logs/
```

---

## 🔐 **SEGURANÇA**

### **Checklist de Segurança**
- ✅ **HTTPS**: SSL configurado
- ✅ **Environment**: Variáveis não expostas
- ✅ **Headers**: X-Frame-Options, CSP, etc.
- ✅ **JWT**: Secret seguro (32+ chars)
- ✅ **CORS**: Origin restrito em produção
- ✅ **Database**: SSL enabled

### **Backup**
```bash
# Database backup (automático via Neon)
# Logs backup
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/

# Code backup
git push origin master
```

---

## ✅ **CHECKLIST FINAL**

Antes de por em produção:

- [ ] ✅ `.env` configurado com todas as variáveis
- [ ] ✅ Base de dados acessível
- [ ] ✅ `npm run prod:build` executa sem erros  
- [ ] ✅ Health check responde OK
- [ ] ✅ Assets estáticos servem corretamente
- [ ] ✅ CORS configurado para domínio
- [ ] ✅ SSL/HTTPS ativo
- [ ] ✅ PM2 ou Docker rodando estável
- [ ] ✅ Logs directory criado
- [ ] ✅ Backup strategy definida

---

## 🆘 **SUPORTE**

**Para problemas**:
1. Verificar logs: `npm run prod:pm2:logs`
2. Health check: `curl /api/health`
3. Verificar env vars: `printenv | grep -E '(NODE_ENV|DATABASE_URL)'`
4. Restart: `npm run prod:pm2:restart`

**Recovery rápido**:
```bash
# Stop all
npm run prod:pm2:stop

# Fresh start
./deploy.sh pm2
```

---

*Este guia cobre deployment para domínios.pt e servidores VPS standard. Para ambientes cloud específicos (AWS, Google Cloud, Azure), consulte documentação adicional.* 