# Setup Final - ALITOOLS.PT (Domínios.PT)

**Data**: 25 de Janeiro de 2025  
**Domínio**: alitools.pt  
**Servidor**: /home/artnshin/alitool.pt  
**Status**: 🔧 Correções Necessárias

---

## ❌ **PROBLEMAS IDENTIFICADOS NA CONFIGURAÇÃO ATUAL**

### **1. Package.json Incorreto**
- ❌ `"main": "index.js"` → Deveria ser `"app.js"`
- ❌ `"type": "module"` → Conflito ESM/CommonJS
- ❌ Vite em dependencies → Deveria estar em devDependencies

### **2. Environment Variables Duplicadas**
- ❌ `JWT_SECRET` aparece 2 vezes
- ❌ `DATABASE_URL` sem separação correta

### **3. Falta Document Root**
- ❌ Document Root não configurado no painel

---

## ✅ **CORREÇÕES OBRIGATÓRIAS**

### **1. Atualizar Configuração no Painel**

**CONFIGURAÇÃO ATUAL (Manter):**
```
Node.js version: 18.20.7
Application mode: Production
Application root: alitools.pt
Application URL: alitools.pt
Application startup file: app.js
Passenger log file: /home/artnshin/logs/passenger-alitools.log
```

**ADICIONAR (OBRIGATÓRIO):**
```
Document Root: dist/
```

### **2. Corrigir Environment Variables**

**REMOVER DUPLICAÇÃO - USAR APENAS ESTAS:**
```
NODE_ENV=production
DATABASE_URL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
FRONTEND_URL=https://alitools.pt
GEKO_API_KEY=4bceff60-32d7-4635-b5e8-ca51353a6e0e
GEKO_API_XML_URL_EN_UTF8=https://b2b.geko.pl/en/xmlapi/20/3/utf8/4bceff60-32d7-4635-b5e8-ca51353a6e0e
```

### **3. Upload do package.json Corrigido**

**SUBIR ESTE package.json:**
```json
{
  "name": "idea",
  "version": "1.0.0",
  "main": "app.js",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server.cjs",
    "dev:full": "concurrently \"vite\" \"nodemon server.cjs\"",
    "prod:build": "npm run build && npm run prod:copy-assets",
    "prod:copy-assets": "cp -r public/* dist/ 2>/dev/null || true",
    "prod:start": "NODE_ENV=production node server.cjs",
    "prod:full": "npm run prod:build && npm run prod:start",
    "health": "curl -f http://localhost:3000/api/health || exit 1",
    "postinstall": "npm run build",
    "test": "vitest"
  },
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^4.21.2",
    "fast-xml-parser": "^5.2.5",
    "framer-motion": "^12.16.0",
    "i18next": "^25.2.1",
    "i18next-browser-languagedetector": "^8.1.0",
    "i18next-http-backend": "^3.0.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.16.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-hot-toast": "^2.5.2",
    "react-i18next": "^15.5.2",
    "react-icons": "^5.5.0",
    "react-router-dom": "^7.6.2",
    "swiper": "^11.2.8"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.5.1",
    "autoprefixer": "^10.4.21",
    "concurrently": "^9.1.2",
    "nodemon": "^3.1.10",
    "postcss": "^8.5.4",
    "tailwindcss": "^3.4.17",
    "vite": "^6.3.5",
    "vitest": "^3.2.2"
  }
}
```

---

## 🚀 **PASSOS DE CORREÇÃO (ORDEM EXATA)**

### **Passo 1: Configurar Document Root**
No painel domínios.pt:
1. Ir à configuração da app Node.js
2. **Adicionar** campo "Document Root": `dist/`
3. Salvar alterações

### **Passo 2: Limpar Environment Variables**
No painel domínios.pt:
1. **APAGAR** a entrada duplicada de `JWT_SECRET`
2. **CORRIGIR** `DATABASE_URL` para estar numa linha só
3. Manter apenas as 6 variáveis listadas acima

### **Passo 3: Upload do package.json Correto**
Via File Manager ou SSH:
1. Substituir package.json atual pelo corrigido
2. Upload para `/home/artnshin/alitool.pt/`

### **Passo 4: Reinstalar e Build**
Via terminal SSH:
```bash
cd /home/artnshin/alitool.pt

# Limpar instalação anterior
rm -rf node_modules package-lock.json

# Instalar dependencies corretas
npm install --production

# Instalar build tools temporariamente
npm install vite @vitejs/plugin-react autoprefixer postcss tailwindcss

# Build da aplicação
npm run build

# Limpar dev dependencies
npm prune --production

# Criar logs directory
mkdir -p logs
```

### **Passo 5: Restart da Aplicação**
No painel: **Node.js Apps** → **Restart**

---

## 🔍 **VERIFICAÇÃO DE FUNCIONAMENTO**

### **Health Check**
```
https://alitools.pt/api/health
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
- **Homepage**: https://alitools.pt/
- **Admin**: https://alitools.pt/admin
- **API**: https://alitools.pt/api/

---

## 📊 **ESTRUTURA FINAL NO SERVIDOR**

```
/home/artnshin/alitool.pt/           ← APPLICATION ROOT
├── app.js                          ← ✅ STARTUP FILE
├── server.cjs                      ← ✅ MAIN SERVER
├── package.json                    ← ✅ CORRIGIDO
├── postcss.config.cjs              ← ✅ COMMONJS
├── .env                            ← ✅ ENVIRONMENT
├── dist/                           ← ✅ DOCUMENT ROOT
│   ├── index.html                  ← Frontend files
│   ├── assets/
│   └── ...
├── src/                            ← Source code
├── db/                             ← Database files
├── node_modules/                   ← Dependencies
└── logs/                           ← Application logs
```

---

## ⚠️ **TROUBLESHOOTING**

### **Se app não iniciar:**
1. Verificar se Document Root está configurado
2. Verificar se package.json foi atualizado
3. Verificar logs: `/home/artnshin/logs/passenger-alitools.log`

### **Se build falhar:**
```bash
# Debug do build
npm run build --verbose

# Verificar dependencies
npm list --depth=0
```

### **Se database falhar:**
1. Testar: `https://alitools.pt/api/health`
2. Verificar DATABASE_URL nas environment variables

---

## ✅ **CHECKLIST FINAL**

Antes de testar:

- [ ] ✅ Document Root configurado como `dist/`
- [ ] ✅ Environment variables limpas (sem duplicações)
- [ ] ✅ package.json corrigido uploadado
- [ ] ✅ `npm install --production` executado
- [ ] ✅ `npm run build` executado com sucesso
- [ ] ✅ Node.js app restart feito
- [ ] ✅ Health check responde OK
- [ ] ✅ Homepage carrega
- [ ] ✅ Admin area acessível

---

## 🎯 **RESUMO**

**3 Correções Críticas:**
1. ✅ **Document Root**: Adicionar `dist/`
2. ✅ **Environment**: Limpar duplicações
3. ✅ **package.json**: Upload da versão corrigida

**Depois disto, alitools.pt deve funcionar perfeitamente!** 