# 🚀 DEPLOYMENT SEGURO: ALITOOLS.PT
**Baseado nas Lições Aprendidas da Recuperação do Artnshine.pt**

## 📋 INFORMAÇÕES DO PROJETO
- **Servidor**: dominios.pt (CloudLinux/cPanel)
- **Domínios Existentes**: artnshine.pt (PRINCIPAL - NÃO TOCAR), infiniteshine.pt
- **Novo Projeto**: alitools.pt
- **Objetivo**: Setup isolado sem interferir com artnshine.pt

---

## 🎯 LIÇÕES CRÍTICAS APRENDIDAS

### ⚠️ **ERROS A EVITAR (baseados na recuperação do artnshine.pt):**
```
❌ NUNCA usar paths relativos nos Document Roots
❌ NUNCA usar /public_html para projetos secundários  
❌ NUNCA sobrepor diretórios entre domínios
❌ NUNCA fazer deploy sem isolamento total
```

### ✅ **REGRAS DE OURO PARA DEPLOYMENT SEGURO:**
```
✅ SEMPRE usar paths absolutos completos
✅ SEMPRE criar diretórios isolados para cada projeto
✅ SEMPRE verificar isolamento antes do deployment
✅ SEMPRE testar sem afetar projetos existentes
```

---

## 🔧 PASSO 1: PREPARAÇÃO PRÉ-DEPLOYMENT

### 1.1 🔍 VERIFICAR CONFIGURAÇÃO ATUAL
**Comando a executar:**
```bash
# Verificar status atual dos domínios
ls -la /home/artnshin/
```
**Resultado:**
```
[COLAR RESULTADO AQUI]
```

**Verificar Document Roots atuais no cPanel:**
```
Domain                    Document Root                     Status
artnshine.pt             /public_html                      ✅ NÃO TOCAR
alitools.pt              [VERIFICAR CONFIGURAÇÃO ATUAL]   🔍 ANALISAR
infiniteshine.pt         [VERIFICAR CONFIGURAÇÃO ATUAL]   🔍 ANALISAR
```

### 1.2 ✅ CONFIRMAR ARTNSHINE.PT FUNCIONAL
**Teste de segurança:**
- URL: `https://artnshine.pt` → **DEVE FUNCIONAR**
- URL: `https://artnshine.pt/admin` → **DEVE FUNCIONAR**

**Status:**
```
[CONFIRMAR QUE ARTNSHINE.PT ESTÁ 100% FUNCIONAL ANTES DE CONTINUAR]
```

---

## 🏗️ PASSO 2: CRIAÇÃO DE ESTRUTURA ISOLADA

### 2.1 📁 CRIAR DIRETÓRIO ISOLADO PARA ALITOOLS
**Comando a executar:**
```bash
# Criar estrutura completamente isolada
mkdir -p /home/artnshin/alitools_project
cd /home/artnshin/alitools_project

# Verificar criação
pwd
ls -la
```
**Resultado:**
```
[COLAR RESULTADO AQUI]
```

### 2.2 🔧 CONFIGURAR DOCUMENT ROOT NO CPANEL
**⚠️ CRÍTICO - Usar PATH ABSOLUTO:**

**No cPanel → Addon Domains:**
1. Localizar `alitools.pt`
2. **Editar Document Root**
3. **Alterar para:** `/home/artnshin/alitools_project`
4. **Guardar alterações**

**✅ Configuração correta:**
```
Domain: alitools.pt
Document Root: /home/artnshin/alitools_project
```

**❌ NUNCA usar:**
```
❌ /alitools
❌ /public_html/alitools  
❌ alitools_project (sem path completo)
```

---

## 🚀 PASSO 3: SETUP INICIAL DO PROJETO

### 3.1 📋 PREPARAR ESTRUTURA BÁSICA
**Comando a executar:**
```bash
cd /home/artnshin/alitools_project

# Criar estrutura básica
mkdir -p {public,src,config,docs}
echo "<!DOCTYPE html>
<html>
<head>
    <title>AliTools.pt - Em Desenvolvimento</title>
    <meta charset='utf-8'>
</head>
<body>
    <h1>AliTools.pt</h1>
    <p>Projeto em desenvolvimento</p>
    <p>Status: Setup inicial concluído</p>
</body>
</html>" > index.html

# Verificar estrutura
ls -la
```
**Resultado:**
```
[COLAR RESULTADO AQUI]
```

### 3.2 🔍 TESTE DE ISOLAMENTO
**Teste crítico de segurança:**
1. **Acessar:** `https://alitools.pt`
2. **Verificar:** Página temporária carrega
3. **Confirmar:** `https://artnshine.pt` continua funcionando

**Resultados:**
```
alitools.pt: [ANOTAR RESULTADO]
artnshine.pt: [CONFIRMAR QUE CONTINUA FUNCIONANDO]
```

---

## 🔧 PASSO 4: CONFIGURAÇÃO NODE.JS (SE NECESSÁRIO)

### 4.1 ⚠️ REGRAS PARA NODE.JS APPS
**Se o alitools.pt for uma aplicação Node.js:**

**✅ Configuração correta no cPanel:**
```
Node.js Version: [VERSÃO DESEJADA]
Application Mode: [development/production]
Application Root: /home/artnshin/alitools_project
Application URL: alitools.pt
Application Startup File: [server.js/app.js/index.js]
```

**🔍 Verificações obrigatórias:**
```bash
# Verificar que não conflita com artnshine.pt
ps aux | grep node
netstat -tlnp | grep -E "(3000|3001|8080)"
```

### 4.2 🎯 ISOLAMENTO DE PORTAS
**Configuração de portas:**
- **artnshine.pt:** Porta gerida pelo Passenger (NÃO TOCAR)
- **alitools.pt:** Usar porta diferente ou deixar Passenger gerir automaticamente

**Verificação:**
```bash
# Confirmar que artnshine.pt continua funcionando
curl -I https://artnshine.pt
```

---

## 🔄 PASSO 5: DEPLOYMENT DO CÓDIGO

### 5.1 📦 SETUP DO REPOSITÓRIO GIT
**Comando a executar:**
```bash
cd /home/artnshin/alitools_project

# Inicializar repositório git (se necessário)
git init
git remote add origin [URL_DO_REPOSITORIO_ALITOOLS]

# OU clonar repositório existente
# git clone [URL_DO_REPOSITORIO_ALITOOLS] .
```

### 5.2 🔧 INSTALAÇÃO DE DEPENDÊNCIAS
**Se for projeto Node.js:**
```bash
# Ativar ambiente virtual específico (se necessário)
# source [PATH_AMBIENTE_VIRTUAL_ALITOOLS]

# Instalar dependências
npm install

# Verificar instalação
npm list --depth=0
```

**Se for projeto PHP/outro:**
```bash
# Seguir procedimentos específicos da tecnologia
# Garantir que não interfere com artnshine.pt
```

---

## ✅ PASSO 6: VERIFICAÇÃO FINAL DE SEGURANÇA

### 6.1 🔍 CHECKLIST DE ISOLAMENTO
**Verificações obrigatórias:**

- [ ] **Document Root isolado:** `/home/artnshin/alitools_project` ✅
- [ ] **Sem sobreposição:** Não usa `/public_html` ou subpastas do artnshine.pt ✅
- [ ] **Path absoluto:** Sem paths relativos no cPanel ✅
- [ ] **Artnshine.pt funcional:** `https://artnshine.pt` continua a funcionar ✅
- [ ] **Alitools.pt acessível:** `https://alitools.pt` carrega corretamente ✅

### 6.2 🧪 TESTES FUNCIONAIS
**Teste de ambos os domínios:**
```bash
# Teste artnshine.pt (DEVE CONTINUAR FUNCIONANDO)
curl -I https://artnshine.pt
curl -I https://artnshine.pt/admin

# Teste alitools.pt (NOVO PROJETO)
curl -I https://alitools.pt
```

**Resultados:**
```
artnshine.pt: [STATUS - DEVE SER 200 OK]
artnshine.pt/admin: [STATUS - DEVE SER 200 OK]  
alitools.pt: [STATUS - NOVO PROJETO]
```

---

## 🚀 PASSO 7: GO-LIVE DO ALITOOLS.PT

### 7.1 🎯 DEPLOYMENT FINAL
**Se aplicação Node.js:**
1. **No cPanel - Setup Node.js App**
2. **Localizar aplicação alitools.pt**
3. **Clicar em "Start App"**
4. **Verificar status: Running**

**Se aplicação estática/PHP:**
1. **Upload dos arquivos finais**
2. **Configurar permissões se necessário**
3. **Teste final da aplicação**

### 7.2 ✅ VERIFICAÇÃO PÓS-DEPLOYMENT
**Testes finais:**
```bash
# Verificar processos (se Node.js)
ps aux | grep node

# Verificar portas em uso  
netstat -tlnp | grep -E "(3000|3001|8080)"

# Teste final de ambos os sites
curl -s -o /dev/null -w "%{http_code}" https://artnshine.pt
curl -s -o /dev/null -w "%{http_code}" https://alitools.pt
```

---

## 📊 MONITORIZAÇÃO CONTÍNUA

### 🔍 COMANDOS DE VERIFICAÇÃO REGULAR
**Para garantir que ambos os projetos funcionam sem conflitos:**

```bash
# Verificação diária recomendada
echo "=== VERIFICAÇÃO DE DOMÍNIOS ==="
echo "artnshine.pt: $(curl -s -o /dev/null -w '%{http_code}' https://artnshine.pt)"
echo "alitools.pt: $(curl -s -o /dev/null -w '%{http_code}' https://alitools.pt)"

echo "=== VERIFICAÇÃO DE PROCESSOS ==="
ps aux | grep node | grep -v grep

echo "=== VERIFICAÇÃO DE DOCUMENT ROOTS ==="
ls -la /home/artnshin/public_html/
ls -la /home/artnshin/alitools_project/
```

---

## 🚨 RESOLUÇÃO DE PROBLEMAS

### ❌ SE ALITOOLS.PT NÃO CARREGAR:
1. **Verificar Document Root no cPanel**
2. **Confirmar path absoluto:** `/home/artnshin/alitools_project`
3. **Verificar permissões:** `chmod 755 /home/artnshin/alitools_project`
4. **Verificar arquivo index:** `ls -la /home/artnshin/alitools_project/index.html`

### ❌ SE ARTNSHINE.PT PARAR DE FUNCIONAR:
1. **PARAR IMEDIATAMENTE o deployment do alitools.pt**
2. **Verificar se houve sobreposição de paths**
3. **Reverter configurações do alitools.pt**
4. **Restart aplicação artnshine.pt no cPanel**

### 🔧 COMANDOS DE EMERGÊNCIA:
```bash
# Parar alitools.pt se causar problemas
# No cPanel - Stop Node.js App para alitools.pt

# Verificar que artnshine.pt voltou
curl -I https://artnshine.pt

# Reconfigurar Document Root do alitools.pt se necessário
```

---

## 📝 CHECKLIST FINAL DE DEPLOYMENT

### ✅ PRÉ-DEPLOYMENT:
- [ ] artnshine.pt funcionando 100% ✅
- [ ] Document Roots verificados ✅
- [ ] Estrutura isolada criada ✅

### ✅ DURANTE DEPLOYMENT:
- [ ] Path absoluto configurado no cPanel ✅
- [ ] Teste de isolamento realizado ✅  
- [ ] Ambos os domínios funcionando ✅

### ✅ PÓS-DEPLOYMENT:
- [ ] Verificação de processos ✅
- [ ] Teste funcional completo ✅
- [ ] Monitorização configurada ✅

---

## 🎯 RESUMO EXECUTIVO

### 🔑 PONTOS-CHAVE PARA SUCESSO:
1. **ISOLAMENTO TOTAL:** Cada projeto no seu diretório
2. **PATHS ABSOLUTOS:** Sempre usar paths completos no cPanel
3. **TESTE CONTÍNUO:** Verificar que artnshine.pt continua funcionando
4. **METODOLOGIA:** Seguir cada passo sequencialmente

### 🏆 RESULTADO ESPERADO:
```
✅ alitools.pt: Funcionando independentemente
✅ artnshine.pt: Continuando 100% funcional  
✅ Isolamento: Total entre projetos
✅ Futuro: Sem conflitos entre domínios
```

### 📞 CONTACTO EM CASO DE PROBLEMAS:
- **Prioridade 1:** Garantir que artnshine.pt continua funcionando
- **Prioridade 2:** Resolver problemas do alitools.pt sem afetar o principal
- **Estratégia:** Reverter alterações se necessário para proteger artnshine.pt

---

**🚀 BOA SORTE COM O DEPLOYMENT DO ALITOOLS.PT!**
**🛡️ LEMBRA-TE: PROTEGER O ARTNSHINE.PT É PRIORIDADE MÁXIMA!** 