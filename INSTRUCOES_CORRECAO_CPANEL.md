# 🔧 CORREÇÃO DA CONFIGURAÇÃO CPANEL - ALITOOLS.PT

**Baseado na configuração atual detectada**  
**Problemas críticos identificados e soluções**  

---

## ❌ **PROBLEMAS IDENTIFICADOS NA CONFIGURAÇÃO ATUAL**

### **1. PATHS RELATIVOS (CRÍTICO)**
- ❌ **Application Root**: `alitool.pt` (path relativo)
- ❌ **Document Root**: `/alitools.pt/dist` (path relativo)
- ✅ **Correto**: Paths absolutos obrigatórios

### **2. STARTUP FILE INCORRETO**
- ❌ **Current**: `server.js`
- ✅ **Correto**: `server.cjs`

### **3. INCONSISTÊNCIA DE NOMES**
- Application root usa: `alitool.pt`
- Document root usa: `/alitools.pt/dist`
- **Resultado**: Conflito de paths

---

## 🎯 **UPLOAD E EXECUÇÃO AJUSTADOS**

### **📤 PASSO 1: UPLOAD PARA DIRETÓRIO EXISTENTE**

**NÃO criar pasta nova!** Usar a estrutura existente:

1. **cPanel File Manager** → navegar para:
   ```
   /home/artnshin/alitool.pt
   ```

2. **Upload do pacote corrigido**:
   - `alitools-deployment-corrigido.tar.gz`
   - Extrair neste diretório

3. **Renomear arquivos**:
   ```
   package.production.json → package.json
   production.env → .env
   ```

### **🚀 PASSO 2: EXECUTAR SCRIPT AJUSTADO**

```bash
# Via SSH ou Terminal cPanel:
cd /home/artnshin/alitool.pt
chmod +x deploy-servidor-existente.sh
./deploy-servidor-existente.sh
```

**Este script irá:**
- ✅ Detectar automaticamente o diretório correto
- ✅ Fazer backup da instalação atual
- ✅ Instalar dependências
- ✅ Fazer build se necessário
- ✅ Testar se aplicação inicia
- ✅ **Mostrar exatamente o que corrigir no cPanel**

---

## 🔧 **PASSO 3: CORREÇÕES OBRIGATÓRIAS NO CPANEL**

### **Node.js Apps - CORREÇÕES:**

**ANTES (Problemático):**
```
Application Root: alitool.pt                    ❌
Application Startup File: server.js             ❌
```

**DEPOIS (Correto):**
```
Node.js Version: 18.20.7                        ✅ (manter)
Application Mode: Production                     ✅ (manter)
Application Root: /home/artnshin/alitool.pt     🔥 CORRIGIR
Application URL: alitools.pt                     ✅ (manter)
Application Startup File: server.cjs            🔥 CORRIGIR
```

### **Domains - CORREÇÃO:**

**ANTES (Problemático):**
```
alitools.pt Document Root: /alitools.pt/dist    ❌
```

**DEPOIS (Correto):**
```
alitools.pt Document Root: /home/artnshin/alitool.pt/dist    🔥 CORRIGIR
```

### **Environment Variables:**
✅ **Manter como estão** - já estão corretas

---

## 📋 **PASSO 4: PROCESSO COMPLETO DE CORREÇÃO**

### **1. No cPanel → Node.js Apps:**
1. Localizar aplicação `alitools.pt`
2. Clicar **"Edit"** ou **"Configure"**
3. **Alterar**:
   - Application Root: `/home/artnshin/alitool.pt`
   - Application Startup File: `server.cjs`
4. **Save** alterações

### **2. No cPanel → Domains:**
1. Localizar domínio `alitools.pt`
2. Clicar **"Manage"**
3. **Alterar Document Root**:
   - De: `/alitools.pt/dist`
   - Para: `/home/artnshin/alitool.pt/dist`
4. **Save** alterações

### **3. Restart da Aplicação:**
1. No cPanel → Node.js Apps
2. Localizar `alitools.pt`
3. **"Stop App"** (se estiver running)
4. **"Start App"**
5. Verificar status: **"Running"**

---

## ✅ **VERIFICAÇÃO FINAL**

### **Testes Obrigatórios:**
```bash
# 1. Health Check
curl -I https://alitools.pt/api/health
# Esperado: HTTP/2 200 + JSON

# 2. Homepage
curl -I https://alitools.pt/
# Esperado: HTTP/2 200 + HTML

# 3. Admin
curl -I https://alitools.pt/admin
# Esperado: HTTP/2 200

# 4. CRÍTICO: ArtnShine deve continuar funcionando
curl -I https://artnshine.pt/
# Esperado: HTTP/2 200 (NÃO PODE FALHAR!)
```

### **Logs para Troubleshooting:**
```bash
# Se algo falhar, verificar logs via SSH:
ssh artnshin@alitools.pt
tail -f /home/artnshin/alitool.pt/logs/error.log
tail -f /home/artnshin/logs/passenger-alitools.log
```

---

## 🚨 **TROUBLESHOOTING ESPECÍFICO**

### **Se App não inicia após correções:**
1. **Verificar paths no cPanel** - devem ser absolutos
2. **Verificar se server.cjs existe**:
   ```bash
   ls -la /home/artnshin/alitool.pt/server.cjs
   ```
3. **Testar manualmente**:
   ```bash
   cd /home/artnshin/alitool.pt
   node server.cjs
   ```

### **Se receber "404 Not Found":**
1. **Verificar Document Root** em Domains
2. **Verificar se dist/ existe**:
   ```bash
   ls -la /home/artnshin/alitool.pt/dist/
   ```

### **Se API retorna erros:**
1. **Verificar proxy .htaccess** em dist/
2. **Verificar se Node.js está running**
3. **Verificar environment variables**

---

## 📊 **CONFIGURAÇÃO FINAL ESPERADA**

```
CPANEL CONFIGURATION:
====================
Node.js Apps:
├── Application Root: /home/artnshin/alitool.pt
├── Application URL: alitools.pt  
├── Startup File: server.cjs
└── Status: Running

Domains:
├── alitools.pt → /home/artnshin/alitool.pt/dist
└── artnshine.pt → /public_html (não tocar)

SERVER STRUCTURE:
================
/home/artnshin/alitool.pt/
├── server.cjs              ← Startup file
├── package.json            ← Dependencies
├── .env                    ← Environment vars
├── dist/                   ← Frontend (Document Root)
│   ├── index.html
│   ├── assets/
│   └── .htaccess
├── src/                    ← Source code
├── db/                     ← Database modules
└── node_modules/           ← Dependencies
```

---

## 🎯 **RESUMO EXECUTIVO**

### **DOWNLOAD E EXECUTE:**
1. ✅ **Download**: `alitools-deployment-corrigido.tar.gz`
2. ✅ **Upload**: Para `/home/artnshin/alitool.pt`
3. ✅ **Execute**: `./deploy-servidor-existente.sh`
4. ✅ **Corrija**: cPanel conforme instruções do script
5. ✅ **Teste**: URLs para confirmar funcionamento

### **RESULTADO ESPERADO:**
- ✅ `https://alitools.pt/` funciona
- ✅ `https://alitools.pt/api/health` retorna JSON
- ✅ `https://artnshine.pt/` continua funcionando
- ✅ cPanel mostra status "Running"

---

**🚀 CORREÇÃO BASEADA NA CONFIGURAÇÃO ATUAL - USE ESTE PACOTE CORRIGIDO!** 