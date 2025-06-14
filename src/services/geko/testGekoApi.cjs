/**
 * Script de Teste para API Geko
 * 
 * Testa a conectividade e parsing básico da API Geko XML
 * sem fazer modificações na base de dados.
 */

const GekoApiClient = require('./gekoApiClient.cjs');
const GekoDataParser = require('./gekoDataParser.cjs');

async function testGekoApi() {
  console.log('🧪 === TESTE DA API GEKO ===\n');

  const client = new GekoApiClient();
  const parser = new GekoDataParser();

  try {
    // Teste 1: Conectividade
    console.log('1️⃣ Testando conectividade...');
    const isConnected = await client.testConnection();
    
    if (!isConnected) {
      console.error('❌ Falha na conectividade. Abortando testes.');
      return;
    }

    // Teste 2: Buscar amostra pequena do XML
    console.log('\n2️⃣ Buscando amostra do XML...');
    const xmlData = await client.fetchProductsXml({
      stream: true,  // Usa stream para resposta mais rápida
      endpoint: 'utf8'
    });

    console.log(`✅ XML recebido: ${xmlData.length} caracteres`);

    // Teste 3: Parse do XML
    console.log('\n3️⃣ Fazendo parse do XML...');
    const parsedXml = await client.parseXmlToObject(xmlData);
    
    console.log('✅ Parse XML concluído');
    console.log('📋 Estrutura do XML:', Object.keys(parsedXml));
    
    // Debug: mostrar estrutura mais detalhada
    if (parsedXml.offer) {
      console.log('📋 Estrutura de offer:', Object.keys(parsedXml.offer));
      if (parsedXml.offer.products) {
        console.log('📋 Tipo de products:', typeof parsedXml.offer.products);
        if (typeof parsedXml.offer.products === 'object' && !Array.isArray(parsedXml.offer.products)) {
          console.log('📋 Chaves de products:', Object.keys(parsedXml.offer.products));
        } else if (Array.isArray(parsedXml.offer.products)) {
          console.log('📋 Products é array com', parsedXml.offer.products.length, 'itens');
        }
      }
    }

    // Teste 4: Extrair produtos
    console.log('\n4️⃣ Processando produtos...');
    const products = parser.processGekoXml(parsedXml);
    
    console.log(`✅ Produtos processados: ${products.length}`);

    // Teste 5: Mostrar amostras
    if (products.length > 0) {
      console.log('\n5️⃣ Amostras de produtos:');
      console.log('=====================');
      
      // Mostrar primeiros 3 produtos como exemplo
      const samples = products.slice(0, 3);
      samples.forEach((product, index) => {
        console.log(`\n📦 Produto ${index + 1}:`);
        console.log(`  EAN: ${product.ean}`);
        console.log(`  Nome: ${product.name}`);
        console.log(`  Marca: ${product.brand || 'N/A'}`);
        console.log(`  Preço Fornecedor: €${product.supplierPrice || 'N/A'}`);
        console.log(`  Stock Geko: ${product.stockQuantity}`);
        console.log(`  Categoria: ${product.category || 'N/A'}`);
      });
    }

    // Teste 6: Estatísticas finais
    console.log('\n6️⃣ Estatísticas finais:');
    console.log('======================');
    const stats = parser.getStats();
    console.log(`Total encontrados: ${stats.totalProducts}`);
    console.log(`Válidos: ${stats.successfulParses}`);
    console.log(`Com EAN: ${stats.totalProducts - stats.missingEAN}`);
    console.log(`Com preço: ${stats.totalProducts - stats.missingPrice}`);
    console.log(`Com stock: ${stats.totalProducts - stats.missingStock}`);

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO! 🎉');
    console.log('\n📋 Próximos passos:');
    console.log('- Implementar sincronização com PostgreSQL');
    console.log('- Aplicar regras de margem nos preços');
    console.log('- Configurar cache/sincronização automática');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔍 Stack trace:');
    console.error(error.stack);
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testGekoApi().then(() => {
    console.log('\n✅ Script de teste finalizado.');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = { testGekoApi }; 