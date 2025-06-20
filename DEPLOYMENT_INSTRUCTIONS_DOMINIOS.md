# 🚀 INSTRUÇÕES DE DEPLOYMENT - PROJETO IDEA - DOMINIOS.PT

## ⚠️ **IMPORTANTE: LEIA TODAS AS INSTRUÇÕES ANTES DE COMEÇAR**

Este guide foi criado com base nas lições aprendidas de experiências anteriores para garantir um deployment seguro e sem afetar o artnshine.pt.

---

## 📋 **PRÉ-REQUISITOS VERIFICADOS ✅**
- [x] Projeto local funcionando
- [x] Build executado com sucesso
- [x] Configurações .env corretas
- [x] Scripts de deployment preparados
- [x] artnshine.pt funcional (verificado)

---

## 🎯 **METODOLOGIA: PATH ABSOLUTO + ISOLAMENTO TOTAL**

### **❌ NUNCA FAZER:**
- Usar paths relativos no Document Root
- Colocar arquivos em /public_html (reservado para artnshine.pt)
- Fazer alterações sem verificar isolamento

### **✅ SEMPRE FAZER:**
- Usar path absoluto: `/home/artnshin/idea_project`
- Manter isolamento total entre projetos
- Verificar artnshine.pt antes e depois

---

## 🔧 **PASSO 1: ACESSO AO CPANEL**

1. **Abrir cPanel dominios.pt**
2. **Verificar que artnshine.pt está funcional**:
   ```
   Navegador: https://artnshine.pt
   Status esperado: Site carrega normalmente
   ```

3. **Aceder a Node.js Selector**:
   - Procurar por "Node.js" ou "Node.js Selector"

---

## 🏗️ **PASSO 2: CRIAR ESTRUTURA ISOLADA**

### **2.1 Criar Diretório do Projeto**
No **File Manager** do cPanel:

1. Navegar para **Home Directory** (`/home/artnshin/`)
2. **Criar nova pasta**: `idea_project`
3. **Verificar path completo**: `/home/artnshin/idea_project`

### **2.2 Configurar Node.js App**
No **Node.js Selector**:

1. **Criar Nova Aplicação**:
   - **Node.js Version**: 18.x (ou mais recente disponível)
   - **Application Mode**: Production
   - **Application Root**: `/home/artnshin/idea_project`
   - **Application URL**: `alitools.pt`
   - **Application Startup File**: `server.cjs`

2. **Guardar configuração**

---

## 📁 **PASSO 3: UPLOAD DOS ARQUIVOS**

### **3.1 Preparar Arquivos Localmente**
No computador local (já feito):
```bash
# Arquivos já preparados e limpos
# .env configurado corretamente
# Build removido (será regenerado no servidor)
```

### **3.2 Upload via File Manager**
1. **Abrir File Manager** → navegar para `/home/artnshin/idea_project`
2. **Upload dos arquivos do projeto**:
   - Selecionar TODOS os arquivos exceto `node_modules/` e `dist/`
   - Fazer upload (pode demorar alguns minutos)
   - **IMPORTANTE**: Incluir arquivos ocultos (.env, .gitignore, etc.)

### **3.3 Verificar Upload**
Confirmar que estes arquivos estão presentes:
- [ ] `server.cjs`
- [ ] `package.json`
- [ ] `ecosystem.config.js`
- [ ] `.env`
- [ ] `src/` (diretório completo)
- [ ] `public/` (diretório completo)
- [ ] Outros arquivos do projeto

---

## ⚙️ **PASSO 4: INSTALAÇÃO E BUILD**

### **4.1 Abrir Terminal SSH ou Terminal cPanel**
1. No cPanel, procurar **Terminal** ou usar SSH:
   ```bash
   ssh artnshin@dominios.pt  # Se SSH estiver ativo
   ```

2. **Navegar para o diretório do projeto**:
   ```bash
   cd /home/artnshin/idea_project
   ```

### **4.2 Instalar Dependências**
```bash
# Verificar versão Node.js
node --version  # Deve ser 18.x ou superior

# Instalar dependências
npm install
```

### **4.3 Fazer Build da Aplicação**
```bash
# Build para produção
npm run build

# Verificar se dist/ foi criado
ls -la dist/
```

---

## 🌐 **PASSO 5: CONFIGURAR DOMÍNIO E PROXY**

### **5.1 Configurar Document Root**
No cPanel → **Subdomains** ou **Addon Domains**:

1. **Para alitools.pt**:
   - **Document Root**: `/home/artnshin/idea_project/dist`
   - **IMPORTANTE**: Usar PATH ABSOLUTO completo

### **5.2 Criar .htaccess para SPA**
No diretório `dist/`, criar `.htaccess`:
```apache
# SPA Routing
RewriteEngine On
RewriteBase /

# API Proxy
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# SPA Frontend
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Cache Headers
<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType text/css "access plus 1 year"
ExpiresByType application/javascript "access plus 1 year"
ExpiresByType image/png "access plus 1 year"
ExpiresByType image/jpg "access plus 1 year"
ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

---

## 🚀 **PASSO 6: INICIAR APLICAÇÃO**

### **6.1 Testar Arranque Manual**
```bash
cd /home/artnshin/idea_project

# Testar servidor
npm run prod:start
```

**Se der erro, verificar:**
- [ ] Variáveis de ambiente (.env)
- [ ] Permissões de arquivos
- [ ] Conectividade com base de dados

### **6.2 Configurar PM2 (Recomendado)**
```bash
# Instalar PM2 globalmente (se não estiver disponível)
npm install -g pm2

# Iniciar com PM2
npm run prod:pm2

# Verificar status
pm2 status

# Ver logs
pm2 logs
```

---

## ✅ **PASSO 7: VERIFICAÇÕES FINAIS**

### **7.1 Testar Isolamento**
1. **Verificar artnshine.pt**: https://artnshine.pt
   - ✅ Deve continuar funcionando normalmente
   
2. **Verificar alitools.pt**: https://alitools.pt
   - ✅ Deve carregar a aplicação IDEA

### **7.2 Testar Funcionalidades**
- [ ] Homepage carrega
- [ ] Navegação funciona
- [ ] API endpoints respondem
- [ ] Base de dados conecta
- [ ] Autenticação funciona

### **7.3 Health Check**
```bash
curl https://alitools.pt/api/health
# Deve retornar status OK
```

---

## 🚨 **PLANO DE EMERGÊNCIA**

### **Se algo correr mal:**

1. **Parar aplicação imediatamente**:
   ```bash
   pm2 stop all
   # ou
   killall node
   ```

2. **Verificar artnshine.pt**:
   - Se não funcionar: contactar suporte dominios.pt
   - Se funcionar: problema isolado

3. **Rollback rápido**:
   - Remover diretório `idea_project`
   - Resetar configurações Node.js

4. **Contactos de emergência**:
   - Suporte dominios.pt: [portal de tickets]
   - Neon Database: dashboard online

---

## 📊 **CHECKLIST FINAL**

### **✅ Pré-Deployment**
- [ ] artnshine.pt funcional
- [ ] Backup local do projeto
- [ ] .env configurado
- [ ] Build testado localmente

### **✅ Durante Deployment**
- [ ] Diretório isolado criado
- [ ] Node.js app configurada
- [ ] Arquivos uploaded
- [ ] Dependências instaladas
- [ ] Build executado
- [ ] Document root configurado
- [ ] .htaccess criado

### **✅ Pós-Deployment**
- [ ] Aplicação iniciada
- [ ] artnshine.pt ainda funcional
- [ ] alitools.pt carrega
- [ ] API funciona
- [ ] Health check OK
- [ ] PM2 configurado
- [ ] Logs acessíveis

---

## 🎯 **COMANDOS ÚTEIS**

```bash
# Status da aplicação
pm2 status
pm2 logs

# Reiniciar aplicação
pm2 restart all

# Parar aplicação
pm2 stop all

# Ver health
curl https://alitools.pt/api/health

# Ver uso de recursos
top
htop

# Ver logs do servidor
tail -f logs/combined.log
```

---

## 💡 **DICAS IMPORTANTES**

1. **Executa uma fase de cada vez**
2. **Verifica isolamento constantemente**
3. **Documenta qualquer problema**
4. **Não tenhas pressa - segurança primeiro**
5. **Testa tudo antes de dar como concluído**

---

**🚀 Boa sorte com o deployment! Segue cada passo cuidadosamente e terás sucesso.** 