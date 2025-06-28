#!/bin/bash

# ============================================
# SCRIPT: EXECUTAR SETUP DO SISTEMA DE ISOLAMENTO VIP
# ============================================

set -e  # Parar em caso de erro

echo "🏨 Iniciando setup do Sistema de Isolamento VIP..."

# Variáveis de ambiente da BD
export DATABASE_URL="postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# Diretório do projeto
PROJECT_DIR="/home/pixie/idea"
cd "$PROJECT_DIR"

echo "📂 Diretório: $(pwd)"
echo "🔗 Conectando à BD: neondb"

# Executar script de isolamento
echo "🚀 Executando scripts de isolamento..."

echo "  └── Fase 1: Criando tabelas base do isolamento..."
psql "$DATABASE_URL" -f scripts/database/create_isolation_phase1.sql

# Verificar se tabelas foram criadas
echo "🔍 Verificando tabelas criadas..."
TABELAS_CRIADAS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name ~ '^(internal_|supplier_)';")

echo "📊 Tabelas de isolamento criadas: $TABELAS_CRIADAS"

if [ "$TABELAS_CRIADAS" -ge 3 ]; then
    echo "✅ SUCCESS: Sistema de Isolamento VIP criado!"
    echo "📋 Tabelas disponíveis:"
    psql "$DATABASE_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_name ~ '^(internal_|supplier_)' ORDER BY table_name;"
    
    echo ""
    echo "🎯 PRÓXIMO PASSO: Importar dados CSV"
    echo "   - 425 produtos base"
    echo "   - 996 variantes"
    echo "   - Total: 1421 registos"
else
    echo "❌ ERRO: Falha na criação das tabelas"
    exit 1
fi

echo "🏁 Setup do Sistema de Isolamento concluído!" 