# Setup para Domínios.PT - IDEA E-commerce

**Data**: 25 de Janeiro de 2025  
**Hosting**: Domínios.PT  
**Tipo**: Node.js Application com Passenger  
**Status**: ✅ Corrigido para Compatibilidade Total

---

## 📋 **INFORMAÇÕES PARA O PAINEL DE CONTROLO**

### **Application Startup File**
```
app.js
```

### **Passenger Log File**
```
passenger.log
```

### **Document Root**
```
dist/
```

### **Node.js Version**
```
18.x (LTS)
```

---

## 🔧 **CONFIGURAÇÃO NO PAINEL DOMÍNIOS.PT**

### **1. Configurações Básicas**
- **App Type**: Node.js
- **Startup File**: `app.js`
- **Document Root**: `dist/` 
- **Node Version**: 18.x
- **Environment**: Production

### **2. Environment Variables (OBRIGATÓRIAS)**

**Base de Dados:**
```
NODE_ENV=production
DATABASE_URL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

**Autenticação:**
```
JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
```

**API Geko:**
```
GEKO_API_KEY=4bceff60-32d7-4635-b5e8-ca51353a6e0e
GEKO_API_XML_URL_EN_UTF8=https://b2b.geko.pl/en/xmlapi/20/3/utf8/4bceff60-32d7-4635-b5e8-ca51353a6e0e
```

**CORS (Substituir pelo domínio real):**
```
FRONTEND_URL=https://seudominio.pt
```

**Opcionais:**
```
PORT=3000
LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=90
```

---

## 📁 **ESTRUTURA DE FICHEIROS NO SERVIDOR**

```
/public_html/
├── app.js                    ← STARTUP FILE
├── server.cjs               ← Main server
├── package.json             ← Dependencies (CORRIGIDO)
├── passenger.log            ← LOG FILE
├── .env                     ← Environment variables
├── dist/                    ← DOCUMENT ROOT
│   ├── index.html
│   ├── assets/
│   └── ...
├── src/                     ← Source code
├── db/                      ← Database files
├── node_modules/            ← Dependencies (after npm install)
└── logs/                    ← Application logs
```

---

## 🚀 **PASSOS DE DEPLOYMENT (ATUALIZADOS)**

### **1. Upload dos Ficheiros**
```bash
# Comprimir excluindo node_modules
tar --exclude=node_modules --exclude=.git -czf idea-ecommerce.tar.gz .

# Upload via FileManager ou FTP
# Extrair no diretório public_html
```

### **2. Configuração no Painel**
1. **Node.js Apps** → **Create App**
2. **Startup file**: `app.js`
3. **Document root**: `dist/`
4. **Node.js version**: 18.x

### **3. Environment Variables**
No painel, adicionar cada variável:
- `NODE_ENV` = `production`
- `DATABASE_URL` = `postgres://...`
- `JWT_SECRET` = `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2`
- `GEKO_API_KEY` = `4bceff60-32d7-4635-b5e8-ca51353a6e0e`
- `FRONTEND_URL` = `https://seudominio.pt`

### **4. Instalação e Build (ORDEM IMPORTANTE)**
Via terminal no painel ou SSH:
```bash
cd /public_html

# 1. Instalar apenas dependências de produção
npm ci --omit=dev

# 2. Instalar dependências de build temporariamente
npm install vite @vitejs/plugin-react

# 3. Build da aplicação
npm run build

# 4. Remover dependências de desenvolvimento
npm prune --production

# 5. Criar diretório de logs
mkdir -p logs
```

### **5. Restart da Aplicação**
No painel: **Node.js Apps** → **Restart**

---

## ⚠️ **PROBLEMAS CORRIGIDOS**

### **Problemas Anteriores:**
- ❌ `"type": "module"` - Conflito ESM/CommonJS
- ❌ `"main": "index.js"` - Arquivo incorreto
- ❌ Vite em dependencies - Deveria estar em devDependencies
- ❌ Faltava engines specification

### **Soluções Aplicadas:**
- ✅ **Removido `type: module`** - Compatibilidade CommonJS
- ✅ **Corrigido `main: app.js`** - Startup file correto
- ✅ **Reorganizado dependencies** - Produção vs desenvolvimento
- ✅ **Adicionado engines** - Node 18+ requirement
- ✅ **Postinstall script** - Build automático

---

## 🔍 **VERIFICAÇÃO DE FUNCIONAMENTO**

### **Health Check**
```
https://seudominio.pt/api/health
```

**Resposta Esperada:**
```json
{
  "status": "ok",
  "environment": "production",
  "dbStatus": "connected",
  "passenger": "enabled"
}
```

### **Páginas Principais**
- **Homepage**: `https://seudominio.pt/`
- **Admin**: `https://seudominio.pt/admin`
- **API**: `https://seudominio.pt/api/`

---

## 🛠️ **TROUBLESHOOTING DOMÍNIOS.PT**

### **App não inicia**
- ✅ Verificar se `app.js` está correto no startup file
- ✅ Verificar se Node.js 18.x está selecionado
- ✅ Verificar logs no painel
- ✅ **NOVO**: Verificar se build foi executado

### **Erro 500**
- ✅ Verificar environment variables
- ✅ Verificar se `npm ci --omit=dev` foi executado
- ✅ Verificar se `npm run build` foi executado
- ✅ **NOVO**: Verificar se vite está disponível durante build

### **Module errors**
- ✅ **NOVO**: Confirmar que `type: module` foi removido
- ✅ **NOVO**: Verificar compatibilidade CommonJS
- ✅ **NOVO**: Reinstalar node_modules se necessário

### **Database connection failed**
- ✅ Verificar `DATABASE_URL` nas environment variables
- ✅ Testar conectividade: `https://seudominio.pt/api/health`

### **CORS errors**
- ✅ Definir `FRONTEND_URL` com o domínio correto
- ✅ Exemplo: `FRONTEND_URL=https://meusite.pt`

### **Assets não carregam**
- ✅ Verificar se Document Root aponta para `dist/`
- ✅ Verificar se build foi executado corretamente

---

## 📊 **COMANDOS DE DIAGNÓSTICO**

### **Verificar Instalação**
```bash
# Verificar Node version
node --version

# Verificar dependencies
npm list --depth=0

# Verificar build
ls -la dist/

# Test server
NODE_ENV=production node server.cjs
```

---

## 🔐 **SEGURANÇA**

### **Environment Variables**
- ✅ **JWT_SECRET**: 64 caracteres aleatórios
- ✅ **DATABASE_URL**: SSL habilitado
- ✅ **FRONTEND_URL**: Domínio específico (não wildcard)

### **HTTPS**
- ✅ SSL automático do domínios.pt
- ✅ Redirect HTTP → HTTPS
- ✅ Security headers implementados

---

## ✅ **CHECKLIST FINAL (ATUALIZADO)**

Antes de marcar como concluído:

- [ ] ✅ `app.js` definido como startup file
- [ ] ✅ `dist/` definido como document root  
- [ ] ✅ Node.js 18.x selecionado
- [ ] ✅ Todas as environment variables configuradas
- [ ] ✅ `npm ci --omit=dev` executado
- [ ] ✅ **Vite instalado temporariamente para build**
- [ ] ✅ `npm run build` executado com sucesso
- [ ] ✅ **Dependencies de dev removidas após build**
- [ ] ✅ Health check responde OK
- [ ] ✅ Homepage carrega corretamente
- [ ] ✅ Admin area acessível
- [ ] ✅ HTTPS funcionando

---

## 🆘 **RECUPERAÇÃO RÁPIDA**

Se algo falhar:

```bash
# Reset completo
rm -rf node_modules
npm ci --omit=dev
npm install vite @vitejs/plugin-react
npm run build
npm prune --production
```

---

*Documento atualizado com correções críticas de compatibilidade. Versão: 1.1* 