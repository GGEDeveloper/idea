#!/usr/bin/env node
/**
 * Teste da função getProductByEan para produtos VIP
 */

const { getProductByEan } = require('./src/db/product-queries.cjs');

async function testSingleProduct() {
    console.log('🔍 TESTANDO FUNÇÃO getProductByEan');
    console.log('=' * 50);
    
    try {
        // 1. Testar produto VIP específico
        console.log('🏷️ Teste 1: Produto VIP específico');
        const vipEan = 'INT_4387AB'; // Abraçadeira que vimos nos testes
        const vipProduct = await getProductByEan(vipEan);
        
        if (vipProduct) {
            console.log(`✅ Produto VIP encontrado: ${vipProduct.ean}`);
            console.log(`   Nome: ${vipProduct.name}`);
            console.log(`   Marca: ${vipProduct.brand}`);
            console.log(`   Tipo: ${vipProduct.source_type}`);
            console.log(`   Preço: ${vipProduct.price || 'N/A'}`);
            console.log(`   Ativo: ${vipProduct.active}`);
        } else {
            console.log('❌ Produto VIP não encontrado');
        }
        
        // 2. Testar produto Geko
        console.log('\n🔧 Teste 2: Produto Geko');
        const gekoEan = '5901477183607'; // Produto Geko que vimos
        const gekoProduct = await getProductByEan(gekoEan);
        
        if (gekoProduct) {
            console.log(`✅ Produto Geko encontrado: ${gekoProduct.ean}`);
            console.log(`   Nome: ${gekoProduct.name}`);
            console.log(`   Marca: ${gekoProduct.brand}`);
            console.log(`   Tipo: ${gekoProduct.source_type}`);
            console.log(`   Preço: ${gekoProduct.price || 'N/A'}`);
        } else {
            console.log('❌ Produto Geko não encontrado');
        }
        
        // 3. Testar produto inexistente
        console.log('\n❓ Teste 3: Produto inexistente');
        const fakeProduct = await getProductByEan('FAKE_123');
        
        if (fakeProduct) {
            console.log('❌ Erro: produto falso foi encontrado');
        } else {
            console.log('✅ Produto inexistente retornou null corretamente');
        }
        
        console.log('\n🎉 FUNÇÃO getProductByEan FUNCIONANDO!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error(error.stack);
    }
}

testSingleProduct().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
}); 