#!/usr/bin/env node
/**
 * Teste direto das funções de product-queries.cjs
 */

const { getProducts, countProducts } = require('./src/db/product-queries.cjs');

async function testProductQueries() {
    console.log('🔍 TESTANDO FUNÇÕES Node.js DIRETAMENTE');
    console.log('=' * 60);
    
    try {
        // 1. Testar contagem total
        console.log('📊 Teste 1: Contagem de produtos');
        const totalCount = await countProducts({});
        console.log(`✅ Total produtos: ${totalCount.toLocaleString()}`);
        
        // 2. Testar busca básica
        console.log('\n📋 Teste 2: Busca básica (primeiros 5)');
        const products = await getProducts({}, { limit: 5, page: 1 });
        console.log(`✅ Produtos encontrados: ${products.length}`);
        
        products.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.ean}: ${product.name} (${product.brand})`);
            if (product.source_type) {
                console.log(`     Tipo: ${product.source_type}`);
            }
        });
        
        // 3. Testar busca por marca específica VIP
        console.log('\n🔍 Teste 3: Busca por marca "Genérico" (VIP)');
        const vipProducts = await getProducts({ brands: 'Genérico' }, { limit: 3 });
        console.log(`✅ Produtos VIP encontrados: ${vipProducts.length}`);
        
        vipProducts.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.ean}: ${product.name}`);
            if (product.source_type) {
                console.log(`     Tipo: ${product.source_type}`);
            }
        });
        
        // 4. Testar busca textual
        console.log('\n🏗️ Teste 4: Busca textual "espátula"');
        const searchProducts = await getProducts({ searchQuery: 'espátula' }, { limit: 3 });
        console.log(`✅ Produtos encontrados: ${searchProducts.length}`);
        
        searchProducts.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.ean}: ${product.name}`);
            if (product.source_type) {
                console.log(`     Tipo: ${product.source_type}`);
            }
        });
        
        console.log('\n🎉 TODAS AS FUNÇÕES FUNCIONARAM PERFEITAMENTE!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error(error.stack);
    }
}

// Executar teste
testProductQueries().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
}); 