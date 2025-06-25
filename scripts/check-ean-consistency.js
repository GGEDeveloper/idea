const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const client = new Client({
  connectionString: 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkEANConsistency() {
  try {
    console.log('🔍 Conectando à base de dados para análise EAN...');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    const analysis = {
      timestamp: new Date().toISOString(),
      ean_usage: {},
      consistency_issues: [],
      recommendations: [],
      migration_complexity: {}
    };

    // 1. Análise de EANs únicos na base principal
    console.log('📊 Analisando EANs únicos em products...');
    const uniqueEANs = await client.query(`
      SELECT COUNT(DISTINCT ean) as unique_eans,
             COUNT(ean) as total_eans,
             COUNT(CASE WHEN ean IS NULL THEN 1 END) as null_eans
      FROM products
    `);
    
    analysis.ean_usage.products = {
      unique_eans: parseInt(uniqueEANs.rows[0].unique_eans),
      total_eans: parseInt(uniqueEANs.rows[0].total_eans),
      null_eans: parseInt(uniqueEANs.rows[0].null_eans),
      has_duplicates: uniqueEANs.rows[0].unique_eans !== uniqueEANs.rows[0].total_eans
    };

    // 2. Verificar consistência entre products e geko_products
    console.log('🔄 Verificando consistência products ↔ geko_products...');
    const productGekoConsistency = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE ean NOT IN (SELECT ean FROM geko_products WHERE ean IS NOT NULL)) as products_without_geko,
        (SELECT COUNT(*) FROM geko_products WHERE ean NOT IN (SELECT ean FROM products WHERE ean IS NOT NULL)) as geko_without_products,
        (SELECT COUNT(*) FROM products p INNER JOIN geko_products g ON p.ean = g.ean) as matching_products
    `);
    
    analysis.ean_usage.products_geko_sync = productGekoConsistency.rows[0];

    // 3. Analisar product_variants e sua relação com EAN
    console.log('🔍 Analisando product_variants vs EAN...');
    const variantsAnalysis = await client.query(`
      SELECT 
        COUNT(*) as total_variants,
        COUNT(DISTINCT ean) as unique_eans_in_variants,
        COUNT(DISTINCT variantid) as unique_variant_ids,
        COUNT(CASE WHEN ean IS NULL THEN 1 END) as variants_without_ean
      FROM product_variants
    `);
    
    const avgVariantsQuery = await client.query(`
      SELECT AVG(variants_per_ean::numeric) as avg_variants_per_ean
      FROM (
        SELECT ean, COUNT(*) as variants_per_ean
        FROM product_variants 
        WHERE ean IS NOT NULL
        GROUP BY ean
      ) variant_counts
    `);
    
    analysis.ean_usage.product_variants = {
      total_variants: parseInt(variantsAnalysis.rows[0].total_variants),
      unique_eans: parseInt(variantsAnalysis.rows[0].unique_eans_in_variants),
      unique_variant_ids: parseInt(variantsAnalysis.rows[0].unique_variant_ids),
      variants_without_ean: parseInt(variantsAnalysis.rows[0].variants_without_ean),
      avg_variants_per_ean: parseFloat(avgVariantsQuery.rows[0].avg_variants_per_ean || 0)
    };

    // 4. Verificar duplicação em product_variants.variantid
    console.log('🔍 Verificando duplicações em variantid...');
    const variantIdDuplicates = await client.query(`
      SELECT variantid, COUNT(*) as count
      FROM product_variants
      GROUP BY variantid
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `);
    
    analysis.ean_usage.variant_id_duplicates = variantIdDuplicates.rows;

    // 5. Analisar stock_levels (problema crítico)
    console.log('⚠️ Analisando problemas em stock_levels...');
    const stockLevelsAnalysis = await client.query(`
      SELECT 
        COUNT(*) as total_stock_entries,
        COUNT(DISTINCT geko_variant_stock_id) as unique_geko_ids,
        COUNT(CASE WHEN geko_variant_stock_id IS NULL THEN 1 END) as null_geko_ids
      FROM stock_levels
    `);

    const stockLevelsDuplicates = await client.query(`
      SELECT geko_variant_stock_id, COUNT(*) as count
      FROM stock_levels
      WHERE geko_variant_stock_id IS NOT NULL
      GROUP BY geko_variant_stock_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `);
    
    analysis.ean_usage.stock_levels = {
      total_entries: parseInt(stockLevelsAnalysis.rows[0].total_stock_entries),
      unique_geko_ids: parseInt(stockLevelsAnalysis.rows[0].unique_geko_ids),
      null_geko_ids: parseInt(stockLevelsAnalysis.rows[0].null_geko_ids),
      has_duplicates: stockLevelsDuplicates.rows.length > 0,
      duplicate_examples: stockLevelsDuplicates.rows
    };

    // 6. Verificar relacionamento entre stock_levels e product_variants
    console.log('🔗 Verificando relação stock_levels ↔ product_variants...');
    const stockVariantRelation = await client.query(`
      SELECT 
        COUNT(DISTINCT sl.geko_variant_stock_id) as stock_entries,
        COUNT(DISTINCT pv.variantid) as variant_entries,
        COUNT(DISTINCT pv.ean) as products_with_variants
      FROM stock_levels sl
      FULL OUTER JOIN product_variants pv ON sl.geko_variant_stock_id = pv.variantid
    `);
    
    analysis.ean_usage.stock_variant_relation = stockVariantRelation.rows[0];

    // 7. Analisar prices e sua estrutura atual
    console.log('💰 Analisando estrutura de prices...');
    const pricesAnalysis = await client.query(`
      SELECT 
        COUNT(*) as total_prices,
        COUNT(DISTINCT variantid) as unique_variant_ids_in_prices,
        COUNT(DISTINCT price_list_id) as unique_price_lists,
        COUNT(CASE WHEN variantid NOT IN (SELECT variantid FROM product_variants WHERE variantid IS NOT NULL) THEN 1 END) as orphan_prices
      FROM prices
    `);
    
    analysis.ean_usage.prices = {
      total_prices: parseInt(pricesAnalysis.rows[0].total_prices),
      unique_variant_ids: parseInt(pricesAnalysis.rows[0].unique_variant_ids_in_prices),
      unique_price_lists: parseInt(pricesAnalysis.rows[0].unique_price_lists),
      orphan_prices: parseInt(pricesAnalysis.rows[0].orphan_prices)
    };

    // 8. Analisar product_images
    console.log('🖼️ Analisando product_images...');
    const imagesAnalysis = await client.query(`
      SELECT 
        COUNT(*) as total_images,
        COUNT(DISTINCT ean) as unique_eans_with_images
      FROM product_images
    `);
    
    const imagesStatsQuery = await client.query(`
      SELECT 
        AVG(images_per_ean::numeric) as avg_images_per_ean,
        MAX(images_per_ean) as max_images_per_ean
      FROM (
        SELECT ean, COUNT(*) as images_per_ean
        FROM product_images 
        WHERE ean IS NOT NULL
        GROUP BY ean
      ) image_counts
    `);
    
    analysis.ean_usage.product_images = {
      total_images: parseInt(imagesAnalysis.rows[0].total_images),
      unique_eans: parseInt(imagesAnalysis.rows[0].unique_eans_with_images),
      avg_images_per_ean: parseFloat(imagesStatsQuery.rows[0].avg_images_per_ean || 0),
      max_images_per_ean: parseInt(imagesStatsQuery.rows[0].max_images_per_ean || 0)
    };

    // 9. Identificar problemas de consistência
    console.log('🚨 Identificando problemas de consistência...');
    
    // Problemas críticos
    if (analysis.ean_usage.stock_levels.has_duplicates) {
      analysis.consistency_issues.push({
        severity: 'CRITICAL',
        table: 'stock_levels',
        issue: 'Duplicated geko_variant_stock_id values without PRIMARY KEY',
        impact: 'Data integrity violation, possible inconsistent stock data',
        count: analysis.ean_usage.stock_levels.duplicate_examples.length
      });
    }

    if (analysis.ean_usage.prices.orphan_prices > 0) {
      analysis.consistency_issues.push({
        severity: 'HIGH',
        table: 'prices',
        issue: 'Prices referencing non-existent variantid',
        impact: 'Orphaned price data, potential application errors',
        count: analysis.ean_usage.prices.orphan_prices
      });
    }

    if (analysis.ean_usage.products_geko_sync.products_without_geko > 0) {
      analysis.consistency_issues.push({
        severity: 'MEDIUM',
        table: 'products/geko_products',
        issue: 'Products without corresponding Geko data',
        impact: 'Incomplete product information for synchronization',
        count: analysis.ean_usage.products_geko_sync.products_without_geko
      });
    }

    // 10. Calcular complexidade de migração
    console.log('📊 Calculando complexidade de migração...');
    
    analysis.migration_complexity = {
      product_variants: {
        affected_records: analysis.ean_usage.product_variants.total_variants,
        requires_data_mapping: true,
        complexity: 'HIGH',
        reason: 'Need to generate variant_code from existing variantid'
      },
      prices: {
        affected_records: analysis.ean_usage.prices.total_prices,
        requires_data_mapping: true,
        complexity: 'HIGH',
        reason: 'Depends on product_variants migration first'
      },
      stock_levels: {
        affected_records: analysis.ean_usage.stock_levels.total_entries,
        requires_data_mapping: true,
        complexity: 'CRITICAL',
        reason: 'No primary key + needs EAN mapping + duplicates to resolve'
      },
      product_images: {
        affected_records: analysis.ean_usage.product_images.total_images,
        requires_data_mapping: true,
        complexity: 'MEDIUM',
        reason: 'Need to generate image_order from existing data'
      },
      product_attributes: {
        affected_records: 4240, // From previous analysis
        requires_data_mapping: false,
        complexity: 'LOW',
        reason: 'Straightforward column rename and PK change'
      }
    };

    // 11. Gerar recomendações específicas
    analysis.recommendations = [
      {
        priority: 'CRITICAL',
        action: 'Fix stock_levels PRIMARY KEY',
        description: 'Add PRIMARY KEY and resolve duplicates before any other migration',
        estimated_effort: '1-2 days',
        risk: 'HIGH - Data loss possible if not handled carefully'
      },
      {
        priority: 'HIGH',
        action: 'Migrate product_variants to EAN-based structure',
        description: 'Create new table structure with (ean, variant_code) as PK',
        estimated_effort: '3-5 days',
        risk: 'MEDIUM - Requires code changes in APIs'
      },
      {
        priority: 'HIGH',
        action: 'Update prices table structure',
        description: 'Migrate after product_variants to use EAN+variant_code references',
        estimated_effort: '2-3 days',
        risk: 'MEDIUM - Dependent on product_variants migration'
      },
      {
        priority: 'MEDIUM',
        action: 'Restructure product_images',
        description: 'Change to EAN+image_order composite primary key',
        estimated_effort: '1-2 days',
        risk: 'LOW - Mainly affects admin interface'
      },
      {
        priority: 'LOW',
        action: 'Update product_attributes',
        description: 'Change to EAN+attribute_key composite primary key',
        estimated_effort: '1 day',
        risk: 'LOW - Simple structure change'
      }
    ];

    // 12. Guardar análise
    const outputFile = path.join(__dirname, '../docs/EAN_CONSISTENCY_ANALYSIS.json');
    fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));

    // 13. Gerar relatório markdown
    const reportContent = generateMarkdownReport(analysis);
    const reportFile = path.join(__dirname, '../docs/EAN_CONSISTENCY_REPORT.md');
    fs.writeFileSync(reportFile, reportContent);

    console.log('\n✅ Análise EAN concluída!');
    console.log(`📄 Dados detalhados: ${outputFile}`);
    console.log(`📋 Relatório: ${reportFile}`);

    // 14. Sumário na consola
    console.log('\n📊 SUMÁRIO DA ANÁLISE EAN:');
    console.log(`- Produtos únicos: ${analysis.ean_usage.products.unique_eans}`);
    console.log(`- Variantes: ${analysis.ean_usage.product_variants.total_variants}`);
    console.log(`- Média variantes/produto: ${analysis.ean_usage.product_variants.avg_variants_per_ean.toFixed(2)}`);
    console.log(`- Problemas críticos: ${analysis.consistency_issues.filter(i => i.severity === 'CRITICAL').length}`);
    console.log(`- Problemas totais: ${analysis.consistency_issues.length}`);

    return analysis;

  } catch (error) {
    console.error('❌ Erro durante análise EAN:', error);
    throw error;
  } finally {
    await client.end();
  }
}

function generateMarkdownReport(analysis) {
  const timestamp = new Date().toLocaleString('pt-PT');
  
  let report = `# Relatório de Consistência EAN - Base de Dados\n\n`;
  report += `**Data:** ${timestamp}\n`;
  report += `**Tipo:** Análise de consistência baseada em EAN\n\n`;

  // Sumário executivo
  report += `## 📊 Sumário Executivo\n\n`;
  report += `| Métrica | Valor |\n`;
  report += `|---------|-------|\n`;
  report += `| Produtos únicos (EAN) | ${analysis.ean_usage.products.unique_eans} |\n`;
  report += `| Total de variantes | ${analysis.ean_usage.product_variants.total_variants} |\n`;
  report += `| Média variantes/produto | ${analysis.ean_usage.product_variants.avg_variants_per_ean.toFixed(2)} |\n`;
  report += `| Imagens de produtos | ${analysis.ean_usage.product_images.total_images} |\n`;
  report += `| Preços cadastrados | ${analysis.ean_usage.prices.total_prices} |\n`;
  report += `| Problemas críticos | ${analysis.consistency_issues.filter(i => i.severity === 'CRITICAL').length} |\n\n`;

  // Problemas identificados
  report += `## 🚨 Problemas Identificados\n\n`;
  if (analysis.consistency_issues.length > 0) {
    analysis.consistency_issues.forEach(issue => {
      const emoji = issue.severity === 'CRITICAL' ? '🔴' : issue.severity === 'HIGH' ? '🟠' : '🟡';
      report += `### ${emoji} ${issue.severity}: ${issue.table}\n`;
      report += `- **Problema:** ${issue.issue}\n`;
      report += `- **Impacto:** ${issue.impact}\n`;
      report += `- **Registos afetados:** ${issue.count}\n\n`;
    });
  } else {
    report += `✅ Nenhum problema crítico de consistência identificado.\n\n`;
  }

  // Complexidade de migração
  report += `## 📈 Complexidade de Migração\n\n`;
  Object.entries(analysis.migration_complexity).forEach(([table, info]) => {
    const complexityEmoji = info.complexity === 'CRITICAL' ? '🔴' : 
                           info.complexity === 'HIGH' ? '🟠' : 
                           info.complexity === 'MEDIUM' ? '🟡' : '🟢';
    report += `### ${complexityEmoji} ${table}\n`;
    report += `- **Registos afetados:** ${info.affected_records.toLocaleString('pt-PT')}\n`;
    report += `- **Complexidade:** ${info.complexity}\n`;
    report += `- **Razão:** ${info.reason}\n`;
    report += `- **Requer mapeamento:** ${info.requires_data_mapping ? 'Sim' : 'Não'}\n\n`;
  });

  // Recomendações
  report += `## 🎯 Recomendações Prioritárias\n\n`;
  analysis.recommendations.forEach((rec, index) => {
    const priorityEmoji = rec.priority === 'CRITICAL' ? '🚨' : 
                         rec.priority === 'HIGH' ? '⭐' : 
                         rec.priority === 'MEDIUM' ? '🔧' : '📝';
    report += `### ${index + 1}. ${priorityEmoji} ${rec.action}\n`;
    report += `- **Descrição:** ${rec.description}\n`;
    report += `- **Esforço estimado:** ${rec.estimated_effort}\n`;
    report += `- **Risco:** ${rec.risk}\n\n`;
  });

  // Dados detalhados
  report += `## 📋 Análise Detalhada\n\n`;
  
  report += `### Products ↔ Geko Sync\n`;
  report += `- Produtos sem dados Geko: ${analysis.ean_usage.products_geko_sync.products_without_geko}\n`;
  report += `- Dados Geko sem produtos: ${analysis.ean_usage.products_geko_sync.geko_without_products}\n`;
  report += `- Produtos sincronizados: ${analysis.ean_usage.products_geko_sync.matching_products}\n\n`;

  if (analysis.ean_usage.stock_levels.duplicate_examples.length > 0) {
    report += `### Stock Levels - Exemplos de Duplicação\n`;
    analysis.ean_usage.stock_levels.duplicate_examples.forEach(dup => {
      report += `- \`${dup.geko_variant_stock_id}\`: ${dup.count} ocorrências\n`;
    });
    report += `\n`;
  }

  report += `### Estatísticas por Tabela\n`;
  report += `- **product_variants:** ${analysis.ean_usage.product_variants.total_variants} registos, ${analysis.ean_usage.product_variants.variants_without_ean} sem EAN\n`;
  report += `- **product_images:** ${analysis.ean_usage.product_images.total_images} imagens, máximo ${analysis.ean_usage.product_images.max_images_per_ean} por produto\n`;
  report += `- **prices:** ${analysis.ean_usage.prices.total_prices} preços, ${analysis.ean_usage.prices.orphan_prices} órfãos\n`;
  report += `- **stock_levels:** ${analysis.ean_usage.stock_levels.total_entries} entradas, ${analysis.ean_usage.stock_levels.unique_geko_ids} IDs únicos\n\n`;

  return report;
}

// Executar se chamado diretamente
if (require.main === module) {
  checkEANConsistency()
    .then(() => {
      console.log('\n🎉 Análise de consistência EAN concluída com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Falha na análise:', error);
      process.exit(1);
    });
}

module.exports = { checkEANConsistency }; 