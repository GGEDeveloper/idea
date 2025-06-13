/**
 * Teste pequeno da sincronização Geko - apenas alguns produtos
 */

const GekoSyncService = require('./gekoSyncService.cjs');
const GekoApiClient = require('./gekoApiClient.cjs');
const GekoDataParser = require('./gekoDataParser.cjs');
const pool = require('../../../db/index.cjs');

async function testSmallSync() {
  console.log('🧪 === TESTE PEQUENO SINCRONIZAÇÃO ===\n');

  const client = new GekoApiClient();
  const parser = new GekoDataParser();
  const syncService = new GekoSyncService();

  try {
    // 1. Buscar dados da API
    console.log('📥 Buscando dados da API...');
    const xmlData = await client.fetchProductsXml({ stream: true });
    const parsedXml = await client.parseXmlToObject(xmlData);
    const allProducts = parser.processGekoXml(parsedXml);
    
    // 2. Pegar apenas os primeiros 3 produtos para teste
    const testProducts = allProducts.slice(0, 3);
    console.log(`📦 Testando com ${testProducts.length} produtos:`);
    testProducts.forEach((p, i) => {
      console.log(`  ${i+1}. ${p.ean} - ${p.name} - €${p.supplierPrice || 'N/A'}`);
    });

    // 3. Sincronizar manualmente
    console.log('\n💾 Iniciando sincronização...');
    const dbClient = await pool.connect();
    
    try {
      await dbClient.query('BEGIN');
      
      for (const product of testProducts) {
        console.log(`\n🔄 Sincronizando ${product.ean}...`);
        
        try {
          // Usar método interno do sync service
          await syncService._syncSingleProduct(dbClient, product, {
            applyPriceMargin: true,
            updateStock: true
          });
          console.log(`✅ ${product.ean} sincronizado com sucesso`);
        } catch (error) {
          console.error(`❌ Erro em ${product.ean}:`, error.message);
          // Continuar com próximo produto em caso de erro
        }
      }
      
      await dbClient.query('COMMIT');
      console.log('\n🎉 Teste de sincronização concluído!');
      
    } catch (error) {
      await dbClient.query('ROLLBACK');
      throw error;
    } finally {
      dbClient.release();
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testSmallSync().then(() => {
    console.log('\n✅ Teste finalizado.');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = { testSmallSync }; 