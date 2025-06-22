# 🚀 DEPLOYMENT ALITOOLS.PT (PROJETO IDEA) - PORTA 3001

## ⚠️ **PROBLEMA RESOLVIDO: CONFLITO DE PORTAS**

### 🔥 **SITUAÇÃO:**
- **artnshine.pt** já usa **PORTA 3000**
- **alitools.pt (projeto IDEA)** agora usa **PORTA 3001**
- **Isolamento total** entre projetos garantido

---

## 🎯 **CONFIGURAÇÃO CORRIGIDA**

### 1. **Server.cjs configurado para porta 3001:**
```javascript
const PORT = process.env.PORT || 3001;  // ← PORTA 3001 para evitar conflito
```

### 2. **.htaccess configurado para proxy à porta 3001:**
```apache
# Proxy all /api/* requests to Node.js na porta 3001
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]
```

### 3. **Environment Variables necessárias:**
```bash
PORT=3001  # ← OBRIGATÓRIO para especificar porta
NODE_ENV=production
JWT_SECRET=[sua_chave_secreta_64_chars]
DATABASE_URL=[neon_postgres_url]
# ... outras variáveis do env-doc.txt
```

---

## 📋 **PASSOS DE DEPLOYMENT ATUALIZADOS**

### 1. **No cPanel - Configurar Node.js App:**
```
Application Root: /home/artnshin/alitools.pt
Entry Point: server.cjs
Node.js Version: 18.20.7 (máxima disponível)
Environment Variables:
  PORT=3001                     ← CRÍTICO!
  NODE_ENV=production
  JWT_SECRET=[sua_chave]
  DATABASE_URL=[neon_url]
```

### 2. **Cópia dos ficheiros para o servidor:**
```bash
# Via Git já foi feito, mas certificar que inclui:
- server.cjs (porta 3001)
- .htaccess (proxy para 3001)
- package.json
- src/
- dist/ (após build)
```

### 3. **No terminal SSH do servidor:**
```bash
cd /home/artnshin/alitools.pt

# IMPORTANTE: Definir PORT=3001 antes de instalar
export PORT=3001

# Tentar instalar as dependências
npm install

# Se falhar por causa do vite, instalar separadamente:
npm install vite --save-dev

# Ou criar build local e fazer upload do dist/
```

---

## 🧪 **TESTES DE VERIFICAÇÃO**

### 1. **Verificar portas em uso:**
```bash
# No servidor, verificar que não há conflito
netstat -tlnp | grep -E "(3000|3001)"

# Resultado esperado:
# 3000: artnshine.pt (NÃO TOCAR)
# 3001: alitools.pt (novo projeto)
```

### 2. **Teste do Node.js app:**
```bash
# No servidor
curl http://localhost:3001/api/health
# Esperado: {"status":"ok"...}
```

### 3. **Teste do proxy público:**
```bash
# Externo
curl http://alitools.pt/api/health
# Esperado: {"status":"ok"...}
```

---

## 🔧 **RESOLUÇÃO DE PROBLEMAS ESPECÍFICOS**

### **Problema: npm install falha com vite**
```bash
# Solução 1: Instalar vite separadamente
npm install vite --save-dev

# Solução 2: Build local e upload
# No seu computador:
npm run build
# Upload da pasta dist/ para o servidor
```

### **Problema: Node version incompatible**
```bash
# Downgrade do React Router se necessário
npm install react-router-dom@6.28.0

# Ou usar Node.js v20 se disponível via:
# cPanel → Node.js Selector → Choose version
```

### **Problema: Port 3001 em uso**
```bash
# Verificar se porto está livre
lsof -i :3001

# Se ocupado, usar porta alternativa (3002, 3003...)
# Atualizar server.cjs e .htaccess correspondentemente
```

---

## ✅ **CHECKLIST FINAL**

### **Configuração:**
- [ ] server.cjs configurado para PORT=3001 ✅
- [ ] .htaccess criado com proxy para :3001 ✅
- [ ] Environment variable PORT=3001 definida ✅
- [ ] Sem conflito com artnshine.pt ✅

### **Deployment:**
- [ ] Git repository clonado ✅
- [ ] Node.js app criada no cPanel ✅
- [ ] Dependencies instaladas (ou dist/ carregado) ⏳
- [ ] App iniciada e funcionando ⏳

### **Testes:**
- [ ] localhost:3001/api/health responde ⏳
- [ ] alitools.pt/api/health responde ⏳
- [ ] Frontend carrega em alitools.pt ⏳
- [ ] artnshine.pt continua funcionando ✅

---

## 🎯 **PRÓXIMOS PASSOS**

1. **No servidor**, definir `export PORT=3001`
2. **Tentar novamente** `npm install` ou `npm install vite --save-dev`
3. **Se falhar**, fazer build local e upload da pasta `dist/`
4. **Iniciar a app** no cPanel
5. **Testar** todas as URLs

---

## 🚨 **NOTAS IMPORTANTES**

- **PORTA 3001** é específica para este projeto
- **artnshine.pt permanece na 3000** sem alterações
- **Isolamento total** garantido entre projetos
- **Se 3001 não funcionar**, usar 3002, 3003, etc.

**🔥 Esta configuração resolve o conflito de portas e permite deployment seguro!** 