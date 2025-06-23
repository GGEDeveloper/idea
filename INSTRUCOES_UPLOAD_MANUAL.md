# 🚀 INSTRUÇÕES COMPLETAS - DEPLOYMENT MANUAL NO SERVIDOR

**Método**: Upload manual + execução no servidor  
**Arquivo criado**: `alitools-deployment-manual.tar.gz` (1.2MB)  
**Vantagem**: Sem necessidade de SSH do local  

---

## 📋 **RESUMO DO PROCESSO**

1. ✅ **CONCLUÍDO**: Criação do pacote de deployment
2. 📤 **PRÓXIMO**: Upload do pacote para o servidor
3. 🗂️ **PRÓXIMO**: Extração dos arquivos no servidor  
4. ▶️ **PRÓXIMO**: Execução do script de deployment
5. 🔧 **PRÓXIMO**: Configuração do cPanel

---

## 📤 **PASSO 1: UPLOAD DO PACOTE**

### **Opção A: File Manager do cPanel (Recomendado)**

1. **Acesse o cPanel do dominios.pt**
   - Login no painel do dominios.pt
   - Localizar **"File Manager"**

2. **Navegue para o diretório correto**
   ```
   /home/artnshin/
   ```

3. **Crie o diretório do projeto (se não existir)**
   - Criar pasta: `alitools_project`
   - Entrar na pasta `alitools_project`

4. **Upload do arquivo**
   - Clique em **"Upload"**
   - Selecione: `alitools-deployment-manual.tar.gz`
   - Aguarde upload completar (1.2MB)

### **Opção B: FTP/SFTP**

```bash
# Se tiver cliente FTP configurado:
# Upload para: /home/artnshin/alitools_project/
# Arquivo: alitools-deployment-manual.tar.gz
```

---

## 🗂️ **PASSO 2: EXTRAÇÃO DOS ARQUIVOS**

### **Via Terminal SSH (se tiver acesso)**

```bash
# Conectar ao servidor
ssh artnshin@alitools.pt

# Navegar para o diretório
cd /home/artnshin/alitools_project

# Extrair arquivos
tar -xzf alitools-deployment-manual.tar.gz

# Verificar extração
ls -la
```

### **Via File Manager cPanel**

1. **No File Manager, navegar para**:
   ```
   /home/artnshin/alitools_project/
   ```

2. **Localizar o arquivo**:
   - `alitools-deployment-manual.tar.gz`

3. **Extrair**:
   - Clique direito no arquivo → **"Extract"**
   - Confirmar extração
   - Aguardar processo completar

4. **Verificar estrutura**:
   ```
   /home/artnshin/alitools_project/
   ├── server.cjs              ← Servidor principal
   ├── app.js                  ← Entry point
   ├── package.json            ← (será renomeado)
   ├── .env                    ← (será renomeado)
   ├── deploy-servidor.sh      ← 🔥 SCRIPT PRINCIPAL
   ├── dist/                   ← Frontend build
   ├── src/                    ← Código fonte
   └── db/                     ← Database modules
   ```

---

## ▶️ **PASSO 3: EXECUÇÃO DO DEPLOYMENT**

### **Preparação Final**

1. **Via File Manager**: 
   - Renomear `package.production.json` → `package.json`
   - Renomear `production.env` → `.env`

2. **Ou via Terminal SSH**:
   ```bash
   cd /home/artnshin/alitools_project
   mv package.production.json package.json
   mv production.env .env
   ```

### **Execução do Script**

**Via Terminal SSH:**
```bash
# Conectar ao servidor
ssh artnshin@alitools.pt

# Navegar para diretório
cd /home/artnshin/alitools_project

# Dar permissão de execução
chmod +x deploy-servidor.sh

# ✅ EXECUTAR DEPLOYMENT
./deploy-servidor.sh
```

**Via cPanel Terminal (se disponível):**
```bash
cd /home/artnshin/alitools_project
chmod +x deploy-servidor.sh
./deploy-servidor.sh
```

---

## 🔄 **O QUE ACONTECE DURANTE A EXECUÇÃO**

### **Fases do Script:**
1. **Verificações Iniciais** (30 segundos)
   - Verifica se arquivos necessários estão presentes
   - Confirma estrutura do projeto

2. **Preparação do Ambiente** (1 minuto)
   - Para processos Node.js existentes
   - Cria backup da instalação atual
   - Configura estrutura de diretórios

3. **Instalação de Dependências** (2-3 minutos)
   - Limpa instalação anterior
   - Instala dependências npm de produção

4. **Verificação de Configuração** (30 segundos)
   - Valida arquivo .env
   - Confirma estrutura da aplicação

5. **Teste da Aplicação** (30 segundos)
   - Testa se servidor Node.js inicia
   - Verifica porta 3001

6. **Configuração de Permissões** (10 segundos)
   - Define permissões corretas nos arquivos

7. **Finalização e Instruções** (10 segundos)
   - Cria arquivo de status
   - **Mostra instruções para cPanel**

---

## 🔧 **PASSO 4: CONFIGURAÇÃO DO CPANEL**

**Após o script terminar, ele mostrará as instruções exatas:**

### **Node.js Apps Configuration:**
```
Node.js Version: 18.20.7
Application Mode: Production
Application Root: /home/artnshin/alitools_project
Application URL: alitools.pt
Application Startup File: server.cjs
Document Root: /home/artnshin/alitools_project/dist
```

### **Environment Variables (se necessário no cPanel):**
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://alitools.pt
DATABASE_URL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
GEKO_API_KEY=4bceff60-32d7-4635-b5e8-ca51353a6e0e
```

### **Start da Aplicação:**
1. No cPanel → Node.js Apps
2. Localizar `alitools.pt`
3. Clicar **"Start App"**
4. Verificar status: **"Running"**

---

## ✅ **VERIFICAÇÃO FINAL**

### **Testes após configurar cPanel:**
```bash
# Health Check
curl -I https://alitools.pt/api/health

# Homepage
curl -I https://alitools.pt/

# Admin
curl -I https://alitools.pt/admin

# ⚠️ CRÍTICO: ArtnShine deve continuar funcionando
curl -I https://artnshine.pt/
```

### **Resposta esperada Health Check:**
```json
{
  "status": "ok",
  "environment": "production",
  "dbStatus": "connected",
  "passenger": "enabled"
}
```

---

## 🚨 **TROUBLESHOOTING**

### **Arquivo não faz upload:**
- Verificar tamanho (1.2MB - deve ser rápido)
- Tentar via File Manager cPanel
- Verificar espaço em disco no servidor

### **Extração falha:**
- Verificar se arquivo foi completamente carregado
- Tentar extrair manualmente via SSH
- Verificar permissões do diretório

### **Script não executa:**
```bash
# Dar permissões
chmod +x deploy-servidor.sh

# Verificar se Node.js está disponível
which node
node --version

# Executar com debug
bash -x deploy-servidor.sh
```

### **npm install falha:**
- Verificar conectividade do servidor
- Verificar se Node.js está configurado no cPanel
- Verificar espaço em disco

### **App não inicia no cPanel:**
1. Verificar se **Application Root** está correto
2. Verificar se **Document Root** está correto  
3. Verificar logs do cPanel
4. Testar manualmente via SSH:
   ```bash
   cd /home/artnshin/alitools_project
   node server.cjs
   ```

---

## 📊 **ARQUIVOS INCLUÍDOS NO PACOTE**

- ✅ `server.cjs` - Servidor principal
- ✅ `app.js` - Entry point para Passenger
- ✅ `package.production.json` - Dependências de produção
- ✅ `production.env` - Environment variables
- ✅ `.htaccess` - Configuração de proxy
- ✅ `deploy-servidor.sh` - **Script principal**
- ✅ `dist/` - Frontend build (React)
- ✅ `src/` - Código fonte completo
- ✅ `db/` - Módulos de database
- ✅ `public/` - Assets públicos

**Total**: 192 arquivos (1.2MB compactado)

---

## 🎯 **PRÓXIMOS PASSOS**

### **1. AGORA:**
- ✅ Upload do `alitools-deployment-manual.tar.gz`
- ✅ Extração no diretório `/home/artnshin/alitools_project`
- ✅ Renomear arquivos conforme instruções

### **2. EXECUÇÃO:**
- ✅ `chmod +x deploy-servidor.sh`
- ✅ `./deploy-servidor.sh`

### **3. CONFIGURAÇÃO:**
- ✅ Configurar cPanel conforme mostrado pelo script
- ✅ Start da aplicação

### **4. TESTE:**
- ✅ Verificar funcionamento
- ✅ Confirmar que artnshine.pt continua OK

---

**🚀 DEPLOYMENT MANUAL READY - FAÇA UPLOAD E EXECUTE!** 