#!/usr/bin/env node
/**
 * Teste simples da API de pricing unificada
 */

console.log('🔍 TESTE SIMPLES DA API DE PRICING UNIFICADA');
console.log('=' * 50);

console.log('✅ Configuração esperada:');
console.log('   - API modificada para incluir produtos VIP');
console.log('   - Query unificada com unified_product_catalog');
console.log('   - Produtos VIP com variantid VIP_*');
console.log('   - Filtros incluem source (geko/internal)');
console.log('   - Estatísticas mostram breakdown Geko + VIP');

console.log('\n📋 URLs de teste:');
console.log('   - /api/admin/pricing/products (todos)');
console.log('   - /api/admin/pricing/products?source=internal (só VIP)');
console.log('   - /api/admin/pricing/products?source=geko (só Geko)'); 
console.log('   - /api/admin/pricing/products?brand=Genérico (marca VIP)');

console.log('\n🎯 Campos esperados na resposta:');
console.log('   - products[].source_type (geko|internal)');
console.log('   - products[].variantid (VIP_* para internos)');
console.log('   - filters.sources: [{id:"geko"}, {id:"internal"}]');
console.log('   - stats.gekoProducts, stats.vipProducts');

console.log('\n🚀 Pronto para teste manual!');
console.log('🌐 Acesse: http://localhost:3000/admin/pricing');

console.log('\n✅ TESTE PREPARADO COM SUCESSO!'); 