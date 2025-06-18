# 📋 **FASE 1: PREPARAÇÃO PARA DEPLOYMENT**
## **Checklist Completo e Setup do Ambiente**

---

## ⏱️ **DURAÇÃO ESTIMADA: 30-45 minutos**
## 🎯 **OBJETIVO: Preparar ambiente local e validar compatibilidade**

---

## 📝 **CHECKLIST PRÉ-DEPLOYMENT (30 ITENS)**

### **🔍 1. VERIFICAÇÃO DO AMBIENTE LOCAL**
```bash
# Verificar versões
- [ ] Node.js version >= 18.0.0
- [ ] npm version >= 8.0.0
- [ ] Git configurado com SSH keys
- [ ] Acesso SSH ao domínios.pt
- [ ] cPanel login funcionando

# Comandos de verificação:
node --version     # Deve ser >= 18.0.0
npm --version      # Deve ser >= 8.0.0
git --version      # Qualquer versão recente
ssh-keygen -t rsa  # Se não tiver SSH key
```

### **🗃️ 2. BACKUP COMPLETO DO PROJETO**
```bash
# Criar backup do estado atual
cp -r ~/idea ~/idea-backup-$(date +%Y%m%d_%H%M%S)

# Backup do banco de dados (se local)
# pg_dump mydatabase > backup_$(date +%Y%m%d_%H%M%S).sql

# Commit de segurança
git add .
git commit -m "backup: Pre-deployment snapshot $(date)"
git push origin master

# Verificações:
- [ ] Backup local criado: ~/idea-backup-*
- [ ] Código committed no Git
- [ ] Push para remote bem-sucedido
```

### **🔧 3. DEPENDÊNCIAS E COMPATIBILIDADE**
```bash
# Testar compatibilidade Node 18
npm ci --production
npm run build

# Verificar se build é bem-sucedido
- [ ] npm install completa sem erros críticos
- [ ] npm run build gera pasta dist/
- [ ] Arquivos em dist/ estão corretos
- [ ] server.cjs inicia sem erros

# Testar servidor local
npm start &
sleep 5
curl http://localhost:3000/api/health
pkill -f "node server.cjs"

# Verificações:
- [ ] Servidor inicia sem erros
- [ ] API health check responde
- [ ] Frontend carrega corretamente
```

### **📊 4. ANÁLISE DO PROJETO ATUAL**
```bash
# Tamanho dos arquivos
du -sh dist/        # Frontend compilado
du -sh node_modules/ # Dependências
du -sh src/         # Código fonte

# Dependências críticas
grep -E "react|express|vite" package.json

# Verificações de tamanho:
- [ ] dist/ < 50MB (ideal < 20MB)
- [ ] package.json tem dependências corretas
- [ ] Sem dependências de desenvolvimento em production
```

### **🔐 5. CREDENCIAIS E ACESSOS**
```bash
# Verificar credenciais do domínios.pt
- [ ] Username: artnshin
- [ ] Hostname: alitools.pt
- [ ] SSH access: testado
- [ ] cPanel access: confirmado
- [ ] Passwords seguros e documentados

# Testar SSH
ssh artnshin@alitools.pt "echo 'SSH OK'"

# Variables de ambiente
- [ ] .env local está correto
- [ ] Database credentials funcionam
- [ ] API keys estão válidas
```

---

## 🛠️ **SCRIPTS DE PREPARAÇÃO**

### **prepare-deployment.sh**
```bash
#!/bin/bash
# prepare-deployment.sh - Script de preparação completa

echo "🚀 Iniciando preparação para deployment..."

# 1. Verificar pré-requisitos
echo "📋 Verificando pré-requisitos..."

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js versão $NODE_VERSION < $REQUIRED_VERSION"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION OK"

# 2. Backup atual
echo "💾 Criando backup..."
BACKUP_DIR="../idea-backup-$(date +%Y%m%d_%H%M%S)"
cp -r . "$BACKUP_DIR"
echo "✅ Backup criado: $BACKUP_DIR"

# 3. Limpeza e instalação
echo "🧹 Limpando e reinstalando..."
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 4. Build de teste
echo "🏗️ Testando build..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build falhou - pasta dist/ não criada"
    exit 1
fi

echo "✅ Build OK - $(du -sh dist/ | cut -f1) gerados"

# 5. Teste do servidor
echo "🧪 Testando servidor..."
npm start &
SERVER_PID=$!
sleep 10

# Health check
if curl -f http://localhost:3000/api/health &>/dev/null; then
    echo "✅ Servidor OK"
else
    echo "❌ Servidor não responde"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

kill $SERVER_PID 2>/dev/null

# 6. Verificar SSH para domínios.pt
echo "🔐 Testando SSH..."
if ssh -o ConnectTimeout=10 artnshin@alitools.pt "echo 'SSH OK'" &>/dev/null; then
    echo "✅ SSH para domínios.pt OK"
else
    echo "❌ SSH falhou - verificar credenciais"
    exit 1
fi

# 7. Commit de segurança
echo "💾 Commit de segurança..."
git add .
git commit -m "prep: Ready for deployment $(date)" || true
git push origin master

echo ""
echo "🎉 PREPARAÇÃO CONCLUÍDA COM SUCESSO!"
echo ""
echo "📊 Resumo:"
echo "   - Build size: $(du -sh dist/ | cut -f1)"
echo "   - Dependencies: $(npm list --depth=0 | wc -l) packages"
echo "   - Backup: $BACKUP_DIR"
echo ""
echo "🚀 Próximo passo: FASE 2 - Configuração do Servidor"
```

### **validate-compatibility.sh**
```bash
#!/bin/bash
# validate-compatibility.sh - Validação específica Node 18

echo "🔍 Validando compatibilidade Node 18..."

# Usar package.json compatível se Node 18
if [ "$(node --version | cut -d. -f1 | sed 's/v//')" -eq "18" ]; then
    echo "📦 Aplicando package.json compatível Node 18..."
    
    if [ -f "package.dominios.json" ]; then
        cp package.json package.json.original
        cp package.dominios.json package.json
        echo "✅ package.json compatível aplicado"
    else
        echo "⚠️  package.dominios.json não encontrado"
    fi
fi

# Reinstalar com versões compatíveis
npm ci --production

# Teste específico Vite
echo "🧪 Testando Vite build..."
npx vite build

# Verificar output
if [ -d "dist" ] && [ "$(ls -A dist/)" ]; then
    echo "✅ Build Vite OK"
    ls -la dist/
else
    echo "❌ Build Vite falhou"
    exit 1
fi

echo "✅ Compatibilidade Node 18 validada"
```

---

## 📊 **CHECKLIST DE VALIDAÇÃO FINAL**

### **Estado do Código**
- [ ] Todos os ficheiros committed
- [ ] Branch master atualizada  
- [ ] Package.json tem versões corretas
- [ ] .env está no .gitignore
- [ ] Sem códigos de debug/console.log

### **Build e Testes**
- [ ] `npm install` completa sem erros
- [ ] `npm run build` gera dist/ corretamente
- [ ] `npm start` inicia servidor sem erros
- [ ] Health check API responde
- [ ] Frontend abre no browser

### **Compatibilidade**
- [ ] Node 18 compatibilidade verificada
- [ ] Dependências compatíveis instaladas
- [ ] Build funciona com Vite < 6.0
- [ ] React 18.x funcionando

### **Infraestrutura**
- [ ] SSH para domínios.pt funcionando
- [ ] cPanel acessível
- [ ] Credenciais organizadas
- [ ] Backup criado e testado

### **Documentação**
- [ ] .env.example atualizado
- [ ] README com instruções
- [ ] Variáveis de ambiente documentadas
- [ ] Scripts de deploy preparados

---

## 🚨 **RESOLUÇÃO DE PROBLEMAS COMUNS**

### **Problema: Node version incompatível**
```bash
# Solução: Usar nvm ou package.json compatível
nvm install 18
nvm use 18
# OU
cp package.dominios.json package.json
```

### **Problema: Build falha**
```bash
# Diagnóstico
npm run build -- --debug
# Limpeza completa
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### **Problema: SSH não funciona**
```bash
# Testar conexão
ssh -v artnshin@alitools.pt
# Gerar nova key se necessário
ssh-keygen -t rsa -b 4096
ssh-copy-id artnshin@alitools.pt
```

---

## ✅ **CRITÉRIOS DE CONCLUSÃO DA FASE 1**

Só avançar para Fase 2 quando TODOS estes itens estão ✅:

1. ✅ Script `prepare-deployment.sh` executa sem erros
2. ✅ Build gera dist/ com < 50MB
3. ✅ Servidor local responde em localhost:3000
4. ✅ SSH para domínios.pt funcionando
5. ✅ Backup criado e código committed
6. ✅ Compatibilidade Node 18 validada

**🎯 Tempo total desta fase: 30-45 minutos**

**▶️ [PRÓXIMA FASE: Configuração do Servidor](./fase2-configuracao-servidor.md)** 