/**
 * Script de Teste para Sincronização Geko
 * 
 * Testa a sincronização completa da API Geko com PostgreSQL
 * aplicando as regras de negócio.
 */

const GekoSyncService = require('./gekoSyncService.cjs');

async function testGekoSync() {
  console.log('🧪 === TESTE SINCRONIZAÇÃO GEKO ===\n');

  const syncService = new GekoSyncService();

  try {
    // Configurar margem personalizada se desejar
    syncService.setMarginPercentage(30); // 30% padrão

    // Executar sincronização completa
    console.log('🚀 Iniciando sincronização de teste...\n');
    
    const stats = await syncService.syncFromGeko({
      batchSize: 50,           // Lotes menores para teste
      applyPriceMargin: true,  // Aplicar margem nos preços
      updateStock: true        // Atualizar stock
    });

    // Mostrar resultados
    console.log('\n📊 === RESULTADOS DA SINCRONIZAÇÃO ===');
    console.log(`⏱️  Duração total: ${((stats.endTime - stats.startTime) / 1000).toFixed(1)}s`);
    console.log(`📦 Produtos processados: ${stats.totalProducts}`);
    console.log(`🆕 Novos produtos: ${stats.newProducts}`);
    console.log(`🔄 Produtos atualizados: ${stats.updatedProducts}`);
    console.log(`💰 Preços com margem aplicada: ${stats.pricesUpdated}`);
    console.log(`📊 Stock atualizado: ${stats.stockUpdated}`);
    console.log(`❌ Erros: ${stats.errors}`);
    
    const successRate = ((stats.totalProducts - stats.errors) / stats.totalProducts * 100).toFixed(1);
    console.log(`✅ Taxa de sucesso: ${successRate}%`);

    console.log('\n🎉 TESTE DE SINCRONIZAÇÃO CONCLUÍDO COM SUCESSO! 🎉');
    
    console.log('\n📋 Verificações recomendadas:');
    console.log('1. Verificar tabela geko_products no PostgreSQL');
    console.log('2. Confirmar preços com margem na tabela prices');
    console.log('3. Validar stock na tabela product_variants');
    console.log('4. Testar consultas do frontend');

  } catch (error) {
    console.error('\n❌ ERRO NA SINCRONIZAÇÃO:', error.message);
    console.error('\n🔍 Stack trace:');
    console.error(error.stack);
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testGekoSync().then(() => {
    console.log('\n✅ Script de teste finalizado.');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = { testGekoSync }; 