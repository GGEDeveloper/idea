require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testDatabaseConnection() {
  console.log('🔍 ANÁLISE PROFUNDA - Verificando dados reais vs mock...\n');

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');

    // Check products count
    const productsResult = await client.query('SELECT COUNT(*) as count FROM products');
    const productsCount = parseInt(productsResult.rows[0].count);
    console.log(`📊 Total de produtos na base de dados: ${productsCount}`);

    // Check if we have Geko data
    const gekoResult = await client.query('SELECT COUNT(*) as count FROM geko_products');
    const gekoCount = parseInt(gekoResult.rows[0].count);
    console.log(`🔗 Total de dados Geko sincronizados: ${gekoCount}`);

    // Check recent products
    const recentResult = await client.query(`
      SELECT name, brand, ean, created_at 
      FROM products 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.log(`\n📋 Últimos 5 produtos adicionados:`);
    recentResult.rows.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.brand}) - EAN: ${product.ean}`);
    });

    // Check categories
    const categoriesResult = await client.query('SELECT COUNT(*) as count FROM categories');
    const categoriesCount = parseInt(categoriesResult.rows[0].count);
    console.log(`\n🏷️  Total de categorias: ${categoriesCount}`);

    // Check brands
    const brandsResult = await client.query(`
      SELECT DISTINCT brand, COUNT(*) as products_count 
      FROM products 
      WHERE brand IS NOT NULL AND brand != '' 
      GROUP BY brand 
      ORDER BY products_count DESC 
      LIMIT 10
    `);
    console.log(`\n🏪 Top 10 marcas com mais produtos:`);
    brandsResult.rows.forEach((brand, index) => {
      console.log(`   ${index + 1}. ${brand.brand}: ${brand.products_count} produtos`);
    });

    // Check if products have prices
    const pricesResult = await client.query(`
      SELECT COUNT(DISTINCT pv.ean) as products_with_prices
      FROM product_variants pv
      JOIN prices pr ON pv.variantid = pr.variantid
    `);
    const productsWithPrices = parseInt(pricesResult.rows[0].products_with_prices);
    console.log(`\n💰 Produtos com preços configurados: ${productsWithPrices}`);

    // Check if data seems to be mock or real
    const mockIndicators = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE name ILIKE '%teste%' OR name ILIKE '%test%' OR name ILIKE '%mock%') as potential_mock,
        COUNT(*) as total
      FROM products
    `);
    const mockCount = parseInt(mockIndicators.rows[0].potential_mock);
    const totalCount = parseInt(mockIndicators.rows[0].total);

    console.log(`\n🎯 ANÁLISE DE AUTENTICIDADE DOS DADOS:`);
    console.log(`   - Produtos potencialmente mock/teste: ${mockCount}`);
    console.log(`   - Total de produtos: ${totalCount}`);
    console.log(`   - Percentagem de dados reais: ${((totalCount - mockCount) / totalCount * 100).toFixed(1)}%`);

    if (productsCount > 100 && gekoCount > 0 && mockCount < (totalCount * 0.1)) {
      console.log(`\n✅ CONCLUSÃO: Aplicação está usando DADOS REAIS da Geko API!`);
      console.log(`   ✓ Base de dados bem populada (${productsCount} produtos)`);
      console.log(`   ✓ Integração Geko ativa (${gekoCount} registos)`);
      console.log(`   ✓ Dados autênticos (baixa % de mock/teste)`);
    } else if (productsCount > 0) {
      console.log(`\n⚠️  ATENÇÃO: Dados parciais ou possivelmente mock`);
      console.log(`   - Poucos produtos (${productsCount}) ou dados Geko em falta`);
      console.log(`   - Pode ser necessário executar importação completa`);
    } else {
      console.log(`\n❌ PROBLEMA: Base de dados vazia - dados mock ou não importados`);
      console.log(`   - Execute o script de importação Geko primeiro`);
    }

    client.release();

  } catch (error) {
    console.error('❌ Erro ao conectar à base de dados:', error.message);
    
    if (error.message.includes('CONNECTION')) {
      console.log('\n💡 Verifique:');
      console.log('   - DATABASE_URL está configurado corretamente?');
      console.log('   - Base de dados PostgreSQL está acessível?');
      console.log('   - Credenciais estão corretas?');
    }
  } finally {
    await pool.end();
  }
}

// Execute the test
testDatabaseConnection().catch(console.error); 