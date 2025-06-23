# 🔧 CONFIGURAÇÃO CORRETA DO CPANEL - ALITOOLS.PT

## 🚨 **PATHS CORRETOS - MUITO IMPORTANTE!**

### ❌ **PATHS INCORRETOS (NÃO USAR):**
```
Application Root: /home/artnshin/alitools_project  ← ERRADO!
Document Root: /home/artnshin/alitools_project/dist  ← ERRADO!
```

### ✅ **PATHS CORRETOS (USAR ESTES):**
```
Application Root: /home/artnshin/alitools.pt  ← CORRETO!
Document Root: /home/artnshin/alitools.pt/dist  ← CORRETO!
```

---

## 🎯 **CONFIGURAÇÃO EXATA DO CPANEL**

### **1️⃣ Node.js Apps (Setup da Aplicação):**

**Acesse**: cPanel → Node.js Apps

**Configuração da App `alitools.pt`:**
```
Node.js Version: 18.20.7
Application Mode: Production
Application Root: /home/artnshin/alitools.pt
Application URL: alitools.pt
Application Startup File: server.cjs
Environment Variables: (já configuradas)
```

### **2️⃣ Domains (Setup do Document Root):**

**Acesse**: cPanel → Domains

**Configuração do domínio `alitools.pt`:**
```
Domain: alitools.pt
Document Root: /home/artnshin/alitools.pt/dist
```

---

## 🔍 **VERIFICAÇÃO DE PATHS**

### **Via File Manager, confirme que existem:**
```
/home/artnshin/alitools.pt/
├── server.cjs           ← Startup File
├── package.json         ← Dependencies
├── .env                 ← Environment
├── app.js               ← Passenger Entry
├── dist/                ← Document Root (Frontend)
│   ├── index.html       ← Homepage React
│   ├── assets/          ← CSS, JS, Images
│   └── .htaccess        ← SPA Routing
├── src/                 ← Source Code
├── db/                  ← Database Modules
├── public/              ← Public Assets
└── node_modules/        ← Dependencies (após npm install)
```

---

## ⚠️ **CORREÇÃO SE JÁ CONFIGURADO ERRADO**

### **Se você já configurou com `/home/artnshin/alitools_project`:**

1. **Node.js Apps:**
   - Edit App → Alterar Application Root para: `/home/artnshin/alitools.pt`

2. **Domains:**
   - Edit Domain → Alterar Document Root para: `/home/artnshin/alitools.pt/dist`

3. **Restart App:**
   - Node.js Apps → Restart

---

## 🚀 **TESTE FINAL**

### **Após configurar corretamente:**

**URLs que devem funcionar:**
- ✅ `https://alitools.pt/` → Homepage React
- ✅ `https://alitools.pt/api/health` → JSON: {"status": "ok"}
- ✅ `https://alitools.pt/admin` → Área administrativa
- ✅ `https://artnshine.pt/` → Site existente (não afetado)

**Status esperado no cPanel:**
- ✅ Node.js Apps: Status "Running"
- ✅ CPU/Memory usage normal
- ✅ Sem erros nos logs

---

## 📋 **RESUMO EXECUTIVO**

### **PATHS CORRETOS:**
- **Application Root**: `/home/artnshin/alitools.pt`
- **Document Root**: `/home/artnshin/alitools.pt/dist`
- **Startup File**: `server.cjs`

### **PATHS INCORRETOS (NÃO USAR):**
- ❌ `/home/artnshin/alitools_project`
- ❌ `/home/artnshin/alitools_project/dist`

---

**🎯 USE SEMPRE O PATH `/home/artnshin/alitools.pt` - ESSE É O CORRETO!** 