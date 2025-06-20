# 📚 LIÇÕES APRENDIDAS: DEPLOYMENT MULTI-DOMÍNIO
**Baseado na Recuperação Bem-Sucedida do Artnshine.pt - 20 Junho 2025**

---

## 🎯 RESUMO EXECUTIVO

### 📊 **CASO DE ESTUDO:**
- **Problema Original:** artnshine.pt redirecionando para alitools.pt
- **Causa Raiz:** Document Roots com paths relativos conflitantes
- **Solução:** Paths absolutos + isolamento total entre domínios  
- **Resultado:** Recuperação 100% bem-sucedida em ~2 horas

---

## ⚠️ ERROS CRÍTICOS A EVITAR

### ❌ **ERRO #1: PATHS RELATIVOS NOS DOCUMENT ROOTS**
```
CONFIGURAÇÃO ERRADA (que causou o problema):
alitools.pt → Document Root: /alitools
infiniteshine.pt → Document Root: /infiniteshine.pt

PROBLEMA: Paths relativos resolvem dentro de /public_html/
RESULTADO: Conflitos e sobreposições entre domínios
```

### ❌ **ERRO #2: USAR /PUBLIC_HTML PARA MÚLTIPLOS PROJETOS**
```
CONFIGURAÇÃO PERIGOSA:
/public_html/artnshine/
/public_html/alitools/
/public_html/infiniteshine/

PROBLEMA: Todos os projetos no mesmo diretório base
RESULTADO: Interferências e conflitos inevitáveis
```

### ❌ **ERRO #3: NÃO TESTAR ISOLAMENTO**
```
DEPLOYMENT SEM VERIFICAÇÃO:
1. Configurar novo domínio
2. Fazer deploy do código
3. Descobrir conflitos DEPOIS

PROBLEMA: Projetos existentes afetados
RESULTADO: Downtime e problemas em produção
```

---

## ✅ SOLUÇÕES COMPROVADAS

### 🎯 **SOLUÇÃO #1: PATHS ABSOLUTOS SEMPRE**
```
CONFIGURAÇÃO CORRETA:
artnshine.pt → /public_html ✅
alitools.pt → /home/artnshin/alitools_project ✅  
infiniteshine.pt → /home/artnshin/infiniteshine_project ✅

VANTAGEM: Isolamento total garantido
RESULTADO: Zero interferências entre projetos
```

### 🎯 **SOLUÇÃO #2: ESTRUTURA ISOLADA POR PROJETO**
```
ORGANIZAÇÃO RECOMENDADA:
/home/artnshin/
├── public_html/              ← artnshine.pt (principal)
├── alitools_project/          ← alitools.pt (isolado)
├── infiniteshine_project/     ← infiniteshine.pt (isolado)
└── [outros_projetos]/         ← futuros projetos

VANTAGEM: Cada projeto tem seu espaço próprio
RESULTADO: Manutenção e deployment independentes
```

### 🎯 **SOLUÇÃO #3: METODOLOGIA DE TESTE PROGRESSIVO**
```
PROCESSO SEGURO DE DEPLOYMENT:
1. Verificar projeto principal funcionando ✅
2. Criar estrutura isolada para novo projeto ✅
3. Configurar Document Root com path absoluto ✅
4. Teste de isolamento (ambos os projetos) ✅
5. Deploy do código do novo projeto ✅
6. Verificação final de ambos os projetos ✅

VANTAGEM: Problemas detectados antes de afetar produção
RESULTADO: Deployment seguro e controlado
```

---

## 🔧 FERRAMENTAS E COMANDOS ESSENCIAIS

### 📋 **COMANDOS DE VERIFICAÇÃO PRÉ-DEPLOYMENT:**
```bash
# Verificar Document Roots atuais
ls -la /home/artnshin/

# Testar projetos existentes
curl -I https://artnshine.pt
curl -I https://artnshine.pt/admin

# Verificar processos Node.js
ps aux | grep node
```

### 📋 **COMANDOS DE VERIFICAÇÃO PÓS-DEPLOYMENT:**
```bash
# Testar ambos os domínios
curl -s -o /dev/null -w "%{http_code}" https://artnshine.pt
curl -s -o /dev/null -w "%{http_code}" https://alitools.pt

# Verificar isolamento de processos
ps aux | grep node | grep -v grep
netstat -tlnp | grep -E "(3000|3001|8080)"
```

### 📋 **COMANDOS DE EMERGÊNCIA:**
```bash
# Se novo projeto causar problemas no principal
# 1. Parar aplicação problemática
# No cPanel → Stop Node.js App

# 2. Verificar recuperação do principal
curl -I https://artnshine.pt

# 3. Reverter Document Root se necessário
# cPanel → Addon Domains → Editar alitools.pt
```

---

## 📊 CHECKLIST DE DEPLOYMENT SEGURO

### ✅ **ANTES DO DEPLOYMENT:**
- [ ] **Projeto principal funcionando 100%** (teste funcional completo)
- [ ] **Document Roots atuais mapeados** (conhecer configuração atual)
- [ ] **Estrutura de diretórios planejada** (paths absolutos definidos)
- [ ] **Plano de rollback preparado** (como reverter se der problemas)

### ✅ **DURANTE O DEPLOYMENT:**
- [ ] **Path absoluto configurado** no cPanel (nunca usar relativos)
- [ ] **Teste de isolamento realizado** (ambos os projetos funcionando)
- [ ] **Monitorização ativa** do projeto principal durante o processo
- [ ] **Verificação contínua** de que não há interferências

### ✅ **APÓS O DEPLOYMENT:**
- [ ] **Teste funcional de ambos os projetos** (URLs principais e admin)
- [ ] **Verificação de processos** (sem conflitos de portas/recursos)
- [ ] **Monitorização configurada** (alertas para problemas futuros)
- [ ] **Documentação atualizada** (configuração final documentada)

---

## 🏆 MELHORES PRÁTICAS COMPROVADAS

### 🎯 **ORGANIZAÇÃO DE PROJETOS:**
1. **Um diretório por projeto** - isolamento total
2. **Nomenclatura consistente** - `/home/artnshin/[projeto]_project/`
3. **Paths absolutos sempre** - nunca usar paths relativos no cPanel
4. **Documentação atualizada** - configuração de cada projeto documentada

### 🎯 **PROCESSO DE DEPLOYMENT:**
1. **Teste do existente primeiro** - garantir que o principal funciona
2. **Criação isolada** - novo projeto em diretório próprio
3. **Teste progressivo** - verificar isolamento antes do deploy final
4. **Monitorização contínua** - alertas para problemas durante e após

### 🎯 **GESTÃO DE CONFLITOS:**
1. **Prioridade clara** - projeto principal sempre protegido
2. **Rollback rápido** - capacidade de reverter alterações rapidamente
3. **Isolamento de recursos** - portas, processos, diretórios separados
4. **Comunicação clara** - todos sabem qual projeto tem prioridade

---

## 🚨 SINAIS DE ALERTA

### ⚠️ **INDICADORES DE PROBLEMAS IMINENTES:**
```
❌ Document Root começa com / mas sem path completo
❌ Novo projeto usando subpasta de projeto existente
❌ Paths relativos no cPanel (ex: /alitools vs /home/artnshin/alitools_project)
❌ Teste de novo projeto sem verificar se principal continua funcionando
❌ Múltiplos projetos usando a mesma porta/recurso
```

### 🔍 **VERIFICAÇÕES OBRIGATÓRIAS:**
```bash
# SEMPRE executar após qualquer mudança
curl -I https://artnshine.pt  # ← DEVE SEMPRE FUNCIONAR
curl -I https://novo-projeto.pt  # ← Testar novo projeto

# NUNCA fazer deployment se o comando acima falhar para artnshine.pt
```

---

## 📈 MÉTRICAS DE SUCESSO

### 🎯 **KPIs DE DEPLOYMENT SEGURO:**
- **Uptime do projeto principal:** 100% (zero interrupções)
- **Tempo de deployment:** < 30 minutos (com testes)
- **Rollback time:** < 5 minutos (se necessário)
- **Conflitos pós-deployment:** Zero

### 📊 **INDICADORES DE QUALIDADE:**
- **Isolamento verificado:** ✅ Ambos os projetos funcionando independentemente
- **Performance mantida:** ✅ Projeto principal com mesma velocidade
- **Monitorização ativa:** ✅ Alertas configurados para ambos os projetos
- **Documentação completa:** ✅ Configuração e processo documentados

---

## 🎓 CONCLUSÕES E RECOMENDAÇÕES

### 🏆 **LIÇÕES MAIS IMPORTANTES:**
1. **Isolamento é fundamental** - Cada projeto no seu próprio espaço
2. **Paths absolutos salvam tempo** - Evitam 90% dos problemas de conflito
3. **Teste progressivo funciona** - Detecta problemas antes de afetar produção
4. **Metodologia sistemática** - Processo estruturado é mais rápido que tentativas aleatórias

### 🚀 **APLICAÇÃO FUTURA:**
- **Usar este documento** como checklist para todos os deployments futuros
- **Adaptar o processo** para diferentes tipos de projetos (Node.js, PHP, estático)
- **Manter documentação atualizada** com novas lições aprendidas
- **Treinar equipe** nos procedimentos seguros de deployment

### 🎯 **PRÓXIMOS PASSOS:**
1. **Aplicar no alitools.pt** - usar este conhecimento no próximo deployment
2. **Criar templates** - standardizar configurações para futuros projetos
3. **Automatizar verificações** - scripts para testar isolamento automaticamente
4. **Expandir para infiniteshine.pt** - quando chegar a altura do desenvolvimento

---

**📚 ESTA DOCUMENTAÇÃO É O RESULTADO DE EXPERIÊNCIA REAL E DEVE SER SEGUIDA RIGOROSAMENTE PARA EVITAR REPETIÇÃO DE PROBLEMAS.**

**🎯 OBJETIVO: ZERO CONFLITOS ENTRE DOMÍNIOS + DEPLOYMENTS SEGUROS E EFICIENTES** 