# Instruções para Resolver Problemas no Domínios.pt

## ⚠️ **PROBLEMA ESPECÍFICO: Node v18.20.7 vs Dependências que Requerem Node >=20**

Seu servidor domínios.pt tem Node 18, mas algumas dependências requerem Node 20+:
- `react-router-dom@7.6.2` requer Node >=20.0.0
- `react@19.1.0` tem melhor compatibilidade com Node 20+
- `vite@6.3.5` funciona melhor com Node 20+

## 🚀 **SOLUÇÃO AUTOMATIZADA (RECOMENDADA)**

Execute este script que resolve automaticamente TODOS os problemas:

```bash
# No terminal do cPanel/SSH
bash fix_dominios_node18.sh
```

O script faz:
- ✅ Backup de arquivos importantes
- ✅ Resolve conflito do Git
- ✅ Substitui package.json por versão compatível Node 18
- ✅ Instala dependências compatíveis
- ✅ Compila aplicação
- ✅ Cria arquivo .env
- ✅ Testa funcionamento

## 📋 **SOLUÇÃO MANUAL (SE PREFERIR)**

### 1. Resolver Conflito do Git (app.js)

No cPanel File Manager do domínios.pt:

1. **Acesse a pasta do projeto** (`public_html/idea` ou onde está o projeto)

2. **Verifique se existe o arquivo app.js:**
   - Se existe e não é necessário, delete-o
   - Se contém código importante, faça backup renomeando para `app.js.backup`

3. **No Terminal do cPanel ou via SSH:**
   ```bash
   cd public_html/idea  # ou caminho do seu projeto
   
   # Opção 1: Remover o arquivo conflitante
   rm app.js
   
   # OU Opção 2: Fazer backup do arquivo
   mv app.js app.js.backup
   
   # Agora tente o update novamente
   git pull origin master
   ```

### 2. Resolver Incompatibilidade de Versões

```bash
# Fazer backup do package.json atual
cp package.json package.json.original

# Usar versão compatível com Node 18
cp package.dominios.json package.json

# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force

# Instalar sem scripts automáticos (evita postinstall)
npm install --ignore-scripts
```

### 3. Preparar e Testar a Aplicação

```bash
# IMPORTANTE: Compilar o frontend para produção
npm run build

# Iniciar a aplicação (backend + frontend compilado)
npm start
```

### ℹ️ **Como funciona o `npm start`:**
- **NÃO** inicia frontend e backend separadamente
- **SIM** inicia apenas o servidor Node.js (`server.cjs`)
- **O servidor Node.js serve:**
  - 🔥 API do backend (rotas `/api/*`)
  - 📱 Frontend compilado (pasta `dist/`)
  - 🌐 SPA routing (todas as rotas vão para `index.html`)

### 4. Criar Arquivo .env no Domínios.pt

Baseado no docs/env-doc.txt, crie o arquivo .env com estas variáveis:

```bash
# No terminal do cPanel ou via File Manager
nano .env
```

**Conteúdo do .env para produção:**

```env
# --- Banco de Dados PostgreSQL (Neo) ---
DATABASE_URL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc.eu-west-2.aws.neon.tech/neondb?sslmode=require
PGHOST=ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech
PGHOST_UNPOOLED=ep-shiny-bush-abjh1ibc.eu-west-2.aws.neon.tech
PGUSER=neondb_owner
PGDATABASE=neondb
PGPASSWORD=npg_aMgk1osmjh7X
POSTGRES_URL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc.eu-west-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech
POSTGRES_PASSWORD=npg_aMgk1osmjh7X
POSTGRES_DATABASE=neondb
POSTGRES_URL_NO_SSL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc.eu-west-2.aws.neon.tech/neondb
POSTGRES_PRISMA_URL=postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require

# --- Geko API ---
GEKO_API_KEY=4bceff60-32d7-4635-b5e8-ca51353a6e0e
GEKO_API_XML_URL_EN_UTF8=https://b2b.geko.pl/en/xmlapi/20/3/utf8/4bceff60-32d7-4635-b5e8-ca51353a6e0e

# --- Autenticação Local ---
JWT_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2

# --- Ambiente de Produção ---
NODE_ENV=production
PORT=3000

# --- Configurações de Segurança e Logging ---
LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=90

# --- Internacionalização ---
NEXT_PUBLIC_DEFAULT_LOCALE=pt
NEXT_PUBLIC_SUPPORTED_LOCALES=pt,en
```

### 5. Verificar Permissões

```bash
# Definir permissões corretas para o .env
chmod 600 .env

# Verificar se o arquivo foi criado corretamente
ls -la .env
cat .env
```

## 📊 **Principais Mudanças para Node 18:**

- **React**: 19.1.0 → 18.3.1
- **React DOM**: 19.1.0 → 18.3.1
- **React Router DOM**: 7.6.2 → 6.28.0
- **Vite**: 6.3.5 → 5.4.10
- **Vitest**: 3.2.2 → 2.1.8
- **Removido**: Script `postinstall` automático

## 🔍 **Comandos de Verificação:**

```bash
# Ver status do Git
git status

# Ver arquivos não rastreados
git ls-files --others --exclude-standard

# Verificar se aplicação funciona
curl http://localhost:3000/api/health

# Ver logs
tail -f nohup.out

# Ver histórico de commits
git log --oneline -5
```

## ⚠️ Notas Importantes:

1. **Backup**: Sempre faça backup antes de deletar arquivos
2. **Segurança**: O arquivo .env contém credenciais sensíveis - nunca commite no Git
3. **Permissões**: O .env deve ter permissões 600 (apenas proprietário pode ler/escrever)
4. **Compatibilidade**: Versões ajustadas para funcionar com Node 18.20.7
5. **Teste**: Após resolver, teste se a aplicação funciona corretamente

## 🔄 **Se precisar voltar ao package.json original:**

```bash
cp package.json.original package.json
npm install --ignore-scripts
npm run build
```

## Se o problema persistir:

```bash
# Reset mais agressivo (CUIDADO - perda de alterações locais)
git reset --hard HEAD
git clean -fd
git pull origin master
``` 