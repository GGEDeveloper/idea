# 🚀 INSTRUÇÕES FINAIS DE DEPLOYMENT - ALITOOLS.PT

**Data**: Janeiro 2025  
**Solução**: Deployment Hardcore Definitivo  
**Target**: dominios.pt cPanel  

---

## 📋 **PRÉ-REQUISITOS**

### **Verificações Locais (WSL/Ubuntu)**
```bash
# Verificar que estamos no diretório correto
pwd  # deve mostrar /home/pixie/idea

# Verificar arquivos críticos
ls -la server.cjs package.production.json production.env .htaccess

# Verificar que pode construir localmente
npm install
npm run build
ls -la dist/  # deve conter index.html e assets/
```

### **Acesso SSH ao Servidor**
```bash
# Testar conexão SSH
ssh artnshin@alitools.pt "echo 'SSH OK'"

# Se falhar, verificar chaves SSH ou usar password
```

---

## 🎯 **EXECUÇÃO DO DEPLOYMENT**

### **Passo 1: Executar Script Automatizado**
```bash
./deploy-hardcore.sh
```

**O script irá:**
- ✅ Verificar todos os arquivos necessários
- ✅ Fazer build local da aplicação
- ✅ Criar pacote de deployment
- ✅ Enviar arquivos para servidor via SSH/SCP
- ✅ Configurar estrutura de diretórios isolados
- ✅ Instalar dependências no servidor
- ✅ Testar se a aplicação inicia corretamente
- ✅ Fornecer instruções para configuração cPanel

### **Passo 2: Configuração Manual cPanel**

**Acesse: dominios.pt cPanel → Node.js Apps**

**CONFIGURAÇÃO EXATA:**
```
Node.js Version: 18.20.7
Application Mode: Production  
Application Root: /home/artnshin/alitools_project
Application URL: alitools.pt
Application Startup File: server.cjs
Document Root: /home/artnshin/alitools_project/dist
```

**⚠️ CRÍTICO: PATHS ABSOLUTOS - NUNCA RELATIVOS!**

### **Passo 3: Environment Variables cPanel**

**Acesse: cPanel → Environment Variables**

**ADICIONAR ESTAS VARIÁVEIS (copie exatamente):**
```
NODE_ENV=production
PORT=3001  
FRONTEND_URL=https://alitools.pt
DATABASE_URL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
GEKO_API_KEY=4bceff60-32d7-4635-b5e8-ca51353a6e0e
```

**🔍 VERIFICAR:** Eliminar duplicações, garantir que não há espaços extra

### **Passo 4: Start da Aplicação**

**No cPanel:**
1. Ir para Node.js Apps
2. Localizar alitools.pt  
3. Clicar em **"Start App"**
4. Verificar status: **"Running"**

---

## ✅ **VERIFICAÇÃO DE FUNCIONAMENTO**

### **Testes Obrigatórios**
```bash
# 1. Health Check da API
curl -I https://alitools.pt/api/health
# Esperado: HTTP/2 200 + JSON status

# 2. Homepage Frontend  
curl -I https://alitools.pt/
# Esperado: HTTP/2 200 + HTML content

# 3. Assets estáticos
curl -I https://alitools.pt/assets/
# Esperado: HTTP/2 200 ou 404 específico do asset

# 4. CRÍTICO: ArtnShine continua funcionando
curl -I https://artnshine.pt/
# Esperado: HTTP/2 200 (NÃO PODE FALHAR!)
```

### **Resposta Health Check Esperada**
```json
{
  "status": "ok",
  "environment": "production", 
  "dbStatus": "connected",
  "passenger": "enabled"
}
```

---

## 🔧 **TROUBLESHOOTING**

### **Problema: Script deployment falha**
```bash
# Verificar conexão SSH
ssh artnshin@alitools.pt

# Verificar permissões de escrita
ssh artnshin@alitools.pt "ls -la /home/artnshin/"

# Re-executar apenas upload
scp -r dist/ server.cjs package.production.json artnshin@alitools.pt:/home/artnshin/alitools_project/
```

### **Problema: App não inicia no cPanel**
1. **Verificar Application Startup File**: deve ser `server.cjs`
2. **Verificar Application Root**: path absoluto `/home/artnshin/alitools_project`
3. **Verificar logs**: cPanel → Error Logs
4. **Testar via SSH**:
   ```bash
   ssh artnshin@alitools.pt
   cd /home/artnshin/alitools_project
   node server.cjs  # deve iniciar sem erros
   ```

### **Problema: 500 Internal Server Error**
```bash
# SSH para servidor e verificar logs
ssh artnshin@alitools.pt
tail -f /home/artnshin/logs/passenger-alitools.log

# Verificar dependências
cd /home/artnshin/alitools_project
npm list --production

# Verificar environment
printenv | grep -E "(DATABASE_URL|JWT_SECRET|NODE_ENV)"
```

### **Problema: Assets não carregam**
1. **Verificar Document Root**: deve apontar para `/home/artnshin/alitools_project/dist`
2. **Verificar se build foi feito**: pasta `dist/` deve existir
3. **Verificar .htaccess**: deve estar na pasta dist/

### **Problema: API retorna 404**
1. **Verificar .htaccess**: proxy rules para porta 3001
2. **Verificar se Node.js está running**
3. **Testar API diretamente**: `curl http://localhost:3001/api/health` via SSH

---

## ⚡ **COMANDOS RÁPIDOS DE DEBUG**

### **Via SSH no Servidor**
```bash
# Conectar
ssh artnshin@alitools.pt

# Verificar estrutura 
ls -la /home/artnshin/alitools_project/

# Verificar se Node.js está rodando
ps aux | grep node

# Testar servidor local
cd /home/artnshin/alitools_project
timeout 5s node server.cjs

# Verificar logs
tail -20 /home/artnshin/logs/passenger-alitools.log
```

### **Restart Completo (Se Necessário)**
```bash
# No cPanel: Node.js Apps → Stop App → Start App

# Ou via SSH (emergency):
ssh artnshin@alitools.pt "pkill -f 'node server.cjs'"
# Depois: cPanel Start App
```

---

## 🎯 **ESTRUTURA FINAL ESPERADA**

```
/home/artnshin/alitools_project/          ← Application Root
├── server.cjs                           ← ✅ Startup File  
├── app.js                               ← ✅ Passenger Entry
├── package.json                         ← ✅ Production config
├── .env                                 ← ✅ Environment vars
├── .htaccess                           ← ✅ Proxy rules
├── dist/                               ← ✅ Document Root
│   ├── index.html                      ← Frontend app
│   ├── assets/                         ← CSS, JS, images
│   └── .htaccess                       ← Routing rules
├── src/                                ← Source code
├── db/                                 ← Database modules
├── public/                             ← Public assets
├── node_modules/                       ← Dependencies
├── logs/                               ← Application logs
└── backups/                            ← Backup files
```

---

## 🏆 **SUCCESS CRITERIA**

### **✅ Deployment Bem-Sucedido Quando:**
- [ ] `https://alitools.pt/` carrega homepage
- [ ] `https://alitools.pt/api/health` retorna status 200 + JSON
- [ ] `https://alitools.pt/admin` acesso à área administrativa  
- [ ] `https://artnshine.pt/` continua funcionando (CRÍTICO!)
- [ ] Logs não mostram erros críticos
- [ ] cPanel mostra app status "Running"

### **🚨 Red Flags (Parar e Investigar):**
- `https://artnshine.pt/` para de funcionar
- Erros de SSL/certificate 
- Database connection timeouts
- Memory/CPU usage anormalmente alto
- 5xx errors consistentes

---

## 📞 **SUPPORT CHECKLIST**

### **Informações para Suporte (se necessário):**
- **Projeto**: alitools.pt 
- **Servidor**: dominios.pt (artnshin account)
- **Tecnologia**: Node.js 18.20.7 + Express + React
- **Database**: Neon PostgreSQL (external)
- **Port**: 3001 (internal), 80/443 (external)
- **Critical Path**: `/home/artnshin/alitools_project`

### **Logs Úteis:**
- Passenger: `/home/artnshin/logs/passenger-alitools.log`
- Access: cPanel → Raw Access Logs
- Error: cPanel → Error Logs

---

**🚀 DEPLOYMENT READY - EXECUTE `./deploy-hardcore.sh` TO BEGIN!** 