#!/bin/bash

# Script para corrigir autenticação admin
# Adiciona credentials: 'include' em todas as chamadas fetch das páginas admin

echo "🔧 Corrigindo autenticação admin..."

# Array das páginas admin que precisam de correção
admin_pages=(
  "app/admin/page.tsx"
  "app/admin/roles/page.tsx"
  "app/admin/pricing/page.tsx"
  "app/admin/permissions/page.tsx"
  "app/admin/settings/page.tsx"
  "app/admin/users/page.tsx"
  "app/admin/products/page.tsx"
  "app/admin/orders/page.tsx"
  "app/admin/carrinhos/page.tsx"
  "app/admin/content/page.tsx"
  "app/admin/reports/page.tsx"
)

# Função para adicionar credentials a fetch() sem config object
fix_simple_fetch() {
  local file="$1"
  echo "  🔨 Corrigindo fetch simples em $file"
  
  # fetch('/api/admin/something') -> fetch('/api/admin/something', { credentials: 'include' })
  sed -i "s|fetch('/api/admin/\([^']*\)')|fetch('/api/admin/\1', { credentials: 'include' })|g" "$file"
}

# Função para adicionar credentials a fetch() com config object existente
fix_config_fetch() {
  local file="$1"
  echo "  🔨 Corrigindo fetch com config em $file"
  
  # Buscar linhas com fetch('/api/admin/...', {
  grep -n "fetch('/api/admin/" "$file" | grep "{" | while read line_info; do
    line_num=$(echo "$line_info" | cut -d: -f1)
    
    # Verificar se já tem credentials
    if ! grep -A 10 "fetch('/api/admin/" "$file" | head -10 | grep -q "credentials:"; then
      # Adicionar credentials na linha seguinte após {
      sed -i "${line_num}a\\        credentials: 'include'," "$file"
    fi
  done
}

# Corrigir cada página admin
for page in "${admin_pages[@]}"; do
  if [ -f "$page" ]; then
    echo "📝 Processando: $page"
    
    # Fazer backup
    cp "$page" "${page}.backup"
    
    # Aplicar correções
    fix_simple_fetch "$page"
    fix_config_fetch "$page"
    
    echo "  ✅ Concluído: $page"
  else
    echo "  ⚠️  Não encontrado: $page"
  fi
done

echo ""
echo "🎯 Correções específicas importantes:"

# Correção específica para dashboard (linha 52)
if [ -f "app/admin/page.tsx" ]; then
  echo "  🔧 Corrigindo dashboard admin..."
  sed -i "s|const response = await fetch('/api/admin/reports?type=dashboard', {|const response = await fetch('/api/admin/reports?type=dashboard', {|g" "app/admin/page.tsx"
  sed -i "/fetch('\/api\/admin\/reports?type=dashboard', {/,/})/{
    /headers:/d
    /Authorization:/d
    /Bearer/d
    s|{|{ credentials: 'include' }|
  }" "app/admin/page.tsx"
fi

echo ""
echo "✅ Correção completa!"
echo "📋 Resumo:"
echo "   - Adicionado 'credentials: include' em todas as chamadas fetch"
echo "   - Removido sistema de autorização obsoleto (Bearer tokens)"
echo "   - Agora as páginas admin enviarão cookies JWT corretamente"
echo ""
echo "🚀 Teste agora fazendo login como admin e acedendo às páginas:"
echo "   - /admin/roles"
echo "   - /admin/pricing" 
echo "   - /admin/permissions"
echo "   - /admin/settings"
echo ""
echo "💡 Se ainda houver problemas, verifique:"
echo "   1. Se o login admin está a funcionar (/login)"
echo "   2. Se o cookie 'idea_session_token' está presente no browser"
echo "   3. Se as APIs admin estão a responder (dev tools > Network)" 