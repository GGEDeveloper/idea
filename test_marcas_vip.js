#!/usr/bin/env node
/**
 * Teste específico das marcas VIP na API de pricing
 */

const { Pool } = require('pg');

const DATABASE_URL = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";

async function testMarcasVIP() {
    console.log('🔍 TESTANDO MARCAS VIP NA API DE PRICING');
    console.log('=' * 50);
    
    const pool = new Pool({ connectionString: DATABASE_URL });
    
    try {
        // 1. Testar marcas diretamente da tabela internal_products
        console.log('📋 Teste 1: Marcas VIP diretas de internal_products');
        const vipBrandsQuery = `
            SELECT DISTINCT brand, COUNT(*) as produtos
            FROM internal_products 
            WHERE brand IS NOT NULL AND brand != '' AND is_active = true
            GROUP BY brand
            ORDER BY COUNT(*) DESC;
        `;
        
        const vipBrands = await pool.query(vipBrandsQuery);
        console.log(`✅ Marcas VIP encontradas: ${vipBrands.rows.length}`);
        vipBrands.rows.forEach(row => {
            console.log(`   • ${row.brand}: ${row.produtos} produtos`);
        });
        
        // 2. Testar query unificada corrigida
        console.log('\n📋 Teste 2: Query unificada corrigida');
        const unifiedBrandsQuery = `
            SELECT DISTINCT brand 
            FROM (
                -- Marcas Geko
                SELECT DISTINCT brand 
                FROM products 
                WHERE brand IS NOT NULL AND brand != '' AND active = true
                
                UNION ALL
                
                -- Marcas VIP
                SELECT DISTINCT brand 
                FROM internal_products 
                WHERE brand IS NOT NULL AND brand != '' AND is_active = true
            ) combined_brands
            ORDER BY brand;
        `;
        
        const unifiedBrands = await pool.query(unifiedBrandsQuery);
        console.log(`✅ Total marcas unificadas: ${unifiedBrands.rows.length}`);
        
        const gekoOnlyBrands = ['GEKO', 'HEIDMANN', 'Heidmann', 'John Gardener', 'KELTIN', 'TE', 'TV'];
        const vipOnlyBrands = unifiedBrands.rows.filter(row => 
            !gekoOnlyBrands.includes(row.brand)
        );
        
        console.log(`📊 Marcas VIP na query unificada: ${vipOnlyBrands.length}`);
        vipOnlyBrands.forEach(row => {
            console.log(`   🟣 ${row.brand} (VIP)`);
        });
        
        // 3. Verificar se Genérico está presente
        const genericoBrand = unifiedBrands.rows.find(row => row.brand === 'Genérico');
        if (genericoBrand) {
            console.log('\n✅ Marca "Genérico" encontrada na query unificada!');
        } else {
            console.log('\n❌ Marca "Genérico" NÃO encontrada na query unificada!');
        }
        
        console.log('\n🎯 RESULTADO:');
        if (vipOnlyBrands.length > 0) {
            console.log('✅ CORREÇÃO FUNCIONOU! Marcas VIP agora aparecem na API');
        } else {
            console.log('❌ CORREÇÃO NÃO FUNCIONOU! Marcas VIP ainda não aparecem');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao testar marcas VIP:', error);
        return false;
    } finally {
        await pool.end();
    }
}

testMarcasVIP().then(success => {
    console.log(success ? '\n✅ TESTE CONCLUÍDO!' : '\n❌ TESTE FALHOU!');
    process.exit(success ? 0 : 1);
}).catch(err => {
    console.error('💥 Erro crítico:', err);
    process.exit(1);
}); 