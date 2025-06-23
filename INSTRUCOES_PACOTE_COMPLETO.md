# 📦 PACOTE COMPLETO ALITOOLS.PT

**Arquivo**: `alitools-projeto-completo.tar.gz`  
**Destino**: `/home/artnshin/alitools.pt`  
**Conteúdo**: Projeto completo pronto para produção  

---

## 🎯 **O QUE ESTÁ INCLUÍDO**

### **✅ APLICAÇÃO COMPLETA:**
- ✅ **server.cjs** - Servidor principal (porta 3001)
- ✅ **app.js** - Entry point para Passenger
- ✅ **package-alitools.json** - Dependencies production-ready
- ✅ **.env-alitools** - Environment variables completas
- ✅ **dist/** - Frontend build React (PRONTO)

### **✅ CÓDIGO FONTE COMPLETO:**
- ✅ **src/** - Todo o código fonte React/Node.js
- ✅ **db/** - Módulos de database
- ✅ **public/** - Assets públicos
- ✅ **.htaccess** - Configuração de proxy

### **✅ CONFIGURAÇÕES:**
- ✅ **vite.config.js** - Build configuration
- ✅ **postcss.config.cjs** - CSS processing
- ✅ **tailwind.config.js** - Styling

### **✅ SCRIPT DE SETUP:**
- ✅ **setup-alitools.sh** - Setup automático completo

---

## 🚀 **INSTRUÇÕES DE INSTALAÇÃO**

### **PASSO 1: UPLOAD DO PACOTE**

1. **cPanel File Manager**
2. **Navegar para**: `/home/artnshin/`
3. **Se existir pasta `alitools.pt`**: 
   - Fazer backup: `mv alitools.pt alitools.pt.backup.$(date +%H%M%S)`
4. **Criar pasta nova**: `alitools.pt`
5. **Entrar na pasta**: `alitools.pt`
6. **Upload**: `alitools-projeto-completo.tar.gz`
7. **Extrair**: Clique direito → Extract

### **PASSO 2: SETUP AUTOMÁTICO**

**Via SSH ou Terminal cPanel:**
```bash
cd /home/artnshin/alitools.pt
chmod +x setup-alitools.sh
./setup-alitools.sh
```

**O script fará automaticamente:**
- ✅ Renomear arquivos para nomes corretos
- ✅ Verificar se todos os arquivos estão presentes
- ✅ Instalar dependências npm
- ✅ Testar se servidor inicia
- ✅ Configurar permissões
- ✅ Mostrar instruções para cPanel

### **PASSO 3: CONFIGURAÇÃO CPANEL**

**Após o script mostrar as instruções:**

**Node.js Apps:**
```
Node.js Version: 18.20.7
Application Mode: Production
Application Root: /home/artnshin/alitools.pt
Application URL: alitools.pt
Application Startup File: server.cjs
```

**Domains (alitools.pt):**
```
Document Root: /home/artnshin/alitools.pt/dist
```

### **PASSO 4: START E TESTE**

1. **cPanel → Node.js Apps → Start App**
2. **Verificar status: "Running"**
3. **Testar**:
   ```bash
   curl -I https://alitools.pt/api/health
   curl -I https://alitools.pt/
   curl -I https://artnshine.pt/  # Verificar que continua OK
   ```

---

## 📋 **ESTRUTURA FINAL NO SERVIDOR**

```
/home/artnshin/alitools.pt/
├── server.cjs                    ← 🚀 Startup File
├── app.js                        ← 🚀 Passenger Entry
├── package.json                  ← 🚀 Dependencies
├── .env                          ← 🚀 Environment
├── setup-alitools.sh             ← 🔧 Setup Script
├── .htaccess                     ← 🔧 Proxy Config
├── dist/                         ← 🎨 Document Root
│   ├── index.html                ← Frontend App
│   ├── assets/                   ← CSS, JS, Images
│   └── .htaccess                 ← SPA Routing
├── src/                          ← 💻 Source Code
│   ├── api/                      ← Backend APIs
│   ├── components/               ← React Components
│   ├── pages/                    ← React Pages
│   └── ...
├── db/                           ← 🗄️ Database Modules
├── public/                       ← 📁 Public Assets
├── node_modules/                 ← 📦 Dependencies (após npm install)
└── status-alitools.txt           ← 📊 Status File
```

---

## ⚡ **VANTAGENS DESTE PACOTE**

### **🔥 COMPLETO E PRONTO:**
- ✅ **Build já feito** - dist/ pronto para servir
- ✅ **Dependências listadas** - só fazer npm install
- ✅ **Configuração final** - environment variables corretas
- ✅ **Script automático** - setup sem complicações

### **🛡️ SEGURO:**
- ✅ **Backup automático** - script faz backup da instalação atual
- ✅ **Validações** - verifica se tudo está correto
- ✅ **Teste integrado** - confirma que servidor inicia
- ✅ **Permissões corretas** - configura automaticamente

### **🎯 ESPECÍFICO:**
- ✅ **Porta 3001** - configurada corretamente
- ✅ **Paths absolutos** - evita problemas de configuração
- ✅ **Isolamento total** - não afeta artnshine.pt

---

## 🚨 **TROUBLESHOOTING**

### **Se setup-alitools.sh falhar:**
```bash
# Verificar Node.js
node --version
npm --version

# Verificar arquivos
ls -la server.cjs package.json .env dist/

# Executar manualmente
npm install --production
node server.cjs  # Deve iniciar sem erros
```

### **Se App não iniciar no cPanel:**
1. **Verificar Application Root**: `/home/artnshin/alitools.pt`
2. **Verificar Startup File**: `server.cjs`
3. **Verificar logs**: cPanel Error Logs
4. **Testar manual**:
   ```bash
   cd /home/artnshin/alitools.pt
   node server.cjs
   ```

### **Se 404 na página:**
1. **Verificar Document Root**: `/home/artnshin/alitools.pt/dist`
2. **Verificar dist/ existe**: `ls -la dist/`
3. **Verificar .htaccess**: `ls -la dist/.htaccess`

---

## ✅ **VERIFICAÇÃO FINAL**

### **Sucesso quando:**
- ✅ `https://alitools.pt/` carrega homepage React
- ✅ `https://alitools.pt/api/health` retorna JSON
- ✅ `https://alitools.pt/admin` área administrativa
- ✅ `https://artnshine.pt/` continua funcionando
- ✅ cPanel mostra status "Running"

### **Health Check esperado:**
```json
{
  "status": "ok",
  "environment": "production",
  "dbStatus": "connected",
  "passenger": "enabled"
}
```

---

## 🎯 **RESUMO EXECUTIVO**

### **📥 DOWNLOAD:**
- `alitools-projeto-completo.tar.gz` (~1.2MB)

### **📤 UPLOAD:**
- Para `/home/artnshin/alitools.pt`
- Extrair e executar `./setup-alitools.sh`

### **🔧 CONFIGURAR:**
- cPanel conforme instruções do script

### **✅ TESTAR:**
- URLs para confirmar funcionamento

---

**🚀 ESTE É O PACOTE FINAL COMPLETO - TUDO INCLUÍDO E PRONTO PARA PRODUÇÃO!**

**Tamanho compacto, setup automático, zero complicações.** 