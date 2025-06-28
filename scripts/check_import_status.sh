#!/bin/bash

# Script para verificar status da importação
export DATABASE_URL="postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

echo "🔍 Verificando status da importação dos produtos VIP..."

echo "📊 Contando produtos importados:"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as produtos_importados FROM internal_products;"

echo "📊 Contando variantes importadas:"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as variantes_importadas FROM internal_variants;"

echo "📋 Últimos 5 produtos criados:"
psql "$DATABASE_URL" -c "SELECT internal_ean, name_pt, brand FROM internal_products ORDER BY created_at DESC LIMIT 5;"

echo "✅ Status verificado!" 