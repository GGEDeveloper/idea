# ⚡ CHECKLIST RÁPIDO: DEPLOYMENT ALITOOLS.PT
**Referência Rápida - Baseado na Recuperação Bem-Sucedida do Artnshine.pt**

---

## 🚨 REGRAS DE OURO (NÃO QUEBRAR!)

```
✅ PATH ABSOLUTO: /home/artnshin/alitools_project
❌ NUNCA: /alitools ou /public_html/alitools

✅ TESTAR ARTNSHINE.PT PRIMEIRO: https://artnshine.pt
❌ NUNCA: Fazer alterações sem confirmar que principal funciona

✅ ISOLAMENTO TOTAL: Diretórios completamente separados
❌ NUNCA: Partilhar recursos entre projetos
```

---

## 📋 CHECKLIST PASSO-A-PASSO

### ✅ **FASE 1: PRÉ-VERIFICAÇÃO**
- [ ] `curl -I https://artnshine.pt` → **DEVE RETORNAR 200 OK**
- [ ] `curl -I https://artnshine.pt/admin` → **DEVE FUNCIONAR**
- [ ] `ls -la /home/artnshin/` → **Verificar estrutura atual**

### ✅ **FASE 2: CRIAÇÃO ISOLADA**
- [ ] `mkdir -p /home/artnshin/alitools_project`
- [ ] `cd /home/artnshin/alitools_project`
- [ ] Criar página temporária: `echo "<!DOCTYPE html><html><head><title>AliTools.pt</title></head><body><h1>AliTools.pt - Setup OK</h1></body></html>" > index.html`

### ✅ **FASE 3: CONFIGURAÇÃO CPANEL**
- [ ] **cPanel → Addon Domains**
- [ ] **Localizar alitools.pt**
- [ ] **Document Root: `/home/artnshin/alitools_project`** (PATH ABSOLUTO!)
- [ ] **Guardar alterações**

### ✅ **FASE 4: TESTE DE ISOLAMENTO**
- [ ] `curl -I https://alitools.pt` → **Verificar página temporária**
- [ ] `curl -I https://artnshine.pt` → **CONFIRMAR QUE CONTINUA FUNCIONANDO**
- [ ] **Se artnshine.pt falhar → PARAR E REVERTER IMEDIATAMENTE**

### ✅ **FASE 5: DEPLOYMENT DO PROJETO**
- [ ] Upload/clone do código para `/home/artnshin/alitools_project`
- [ ] Configurar dependências (npm install, etc.)
- [ ] **Teste intermédio:** `curl -I https://artnshine.pt` (durante o processo)

### ✅ **FASE 6: VERIFICAÇÃO FINAL**
- [ ] `curl -I https://alitools.pt` → **Projeto funcionando**
- [ ] `curl -I https://artnshine.pt` → **Principal ainda funcionando**
- [ ] `ps aux | grep node` → **Verificar processos**

---

## 🚨 COMANDOS DE EMERGÊNCIA

### **SE ARTNSHINE.PT PARAR DE FUNCIONAR:**
```bash
# 1. PARAR IMEDIATAMENTE
# cPanel → Stop Node.js App (alitools.pt)

# 2. VERIFICAR RECUPERAÇÃO
curl -I https://artnshine.pt

# 3. SE NECESSÁRIO, REVERTER DOCUMENT ROOT
# cPanel → Addon Domains → alitools.pt → Reverter configuração
```

### **COMANDOS DE VERIFICAÇÃO RÁPIDA:**
```bash
# Verificar ambos os sites
echo "Artnshine: $(curl -s -o /dev/null -w '%{http_code}' https://artnshine.pt)"
echo "Alitools: $(curl -s -o /dev/null -w '%{http_code}' https://alitools.pt)"

# Verificar processos Node.js
ps aux | grep node | grep -v grep
```

---

## 🎯 CONFIGURAÇÕES CORRETAS

### **DOCUMENT ROOTS FINAIS:**
```
artnshine.pt → /public_html ✅
alitools.pt → /home/artnshin/alitools_project ✅
infiniteshine.pt → /home/artnshin/infiniteshine_public ✅
```

### **ESTRUTURA DE DIRETÓRIOS:**
```
/home/artnshin/
├── public_html/              ← artnshine.pt (NÃO TOCAR)
├── alitools_project/          ← alitools.pt (NOVO)
└── infiniteshine_public/      ← infiniteshine.pt (EXISTE)
```

### **NODE.JS APP CONFIG (SE APLICÁVEL):**
```
Node.js Version: [versão desejada]
Application Mode: [development/production]
Application Root: /home/artnshin/alitools_project
Application URL: alitools.pt
Application Startup File: [server.js/app.js/index.js]
```

---

## ⚠️ SINAIS DE PROBLEMAS

### **PARAR IMEDIATAMENTE SE:**
- `https://artnshine.pt` retornar erro 500/404
- `https://artnshine.pt/admin` não carregar
- Processos Node.js conflitantes
- Paths relativos aparecerem no cPanel

### **INDICADORES DE SUCESSO:**
- Ambos os sites retornam 200 OK
- Processos Node.js isolados
- Document Roots com paths absolutos
- Zero interferências entre projetos

---

## 🏆 RESULTADO ESPERADO

```
✅ alitools.pt funcionando independentemente
✅ artnshine.pt continuando 100% funcional
✅ Zero conflitos entre domínios
✅ Isolamento total garantido
```

---

**⚡ TEMPO ESTIMADO: 15-30 minutos**
**🎯 PRIORIDADE: Proteger artnshine.pt a todo custo**
**📞 EM CASO DE DÚVIDA: Parar e reverter antes de causar problemas**

---

**🚀 ESTE CHECKLIST É BASEADO EM EXPERIÊNCIA REAL DE RECUPERAÇÃO BEM-SUCEDIDA** 