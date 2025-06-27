const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração da base de dados
const pool = new Pool({
  connectionString: "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

async function validateDatabaseSchema() {
  console.log('🔍 Iniciando validação do database schema...\n');

  try {
    // 1. Obter lista de todas as tabelas
    console.log('📋 1. Verificando tabelas existentes...');
    const tablesQuery = `
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    const tablesResult = await pool.query(tablesQuery);
    
    console.log(`✅ Encontradas ${tablesResult.rows.length} tabelas/views na base de dados\n`);
    
    // Separar tabelas e views
    const tables = tablesResult.rows.filter(row => row.table_type === 'BASE TABLE');
    const views = tablesResult.rows.filter(row => row.table_type === 'VIEW');
    
    console.log(`📊 Tabelas: ${tables.length}`);
    console.log(`👁️  Views: ${views.length}\n`);

    // 2. Verificar estrutura das tabelas principais
    const mainTables = [
      'products', 'product_variants', 'product_categories', 'product_images', 'product_attributes',
      'categories', 'users', 'orders', 'order_items', 'prices', 'price_lists', 
      'geko_products', 'roles', 'permissions', 'role_permissions'
    ];

    console.log('🔧 2. Verificando estrutura das tabelas principais...\n');

    for (const tableName of mainTables) {
      if (tables.find(t => t.table_name === tableName)) {
        console.log(`📋 Tabela: ${tableName}`);
        
        // Obter estrutura da tabela
        const structureQuery = `
          SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position;
        `;
        
        const structureResult = await pool.query(structureQuery, [tableName]);
        
        console.log(`   Colunas: ${structureResult.rows.length}`);
        structureResult.rows.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
          const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
          console.log(`   - ${col.column_name}: ${col.data_type}${maxLength} ${nullable}${defaultVal}`);
        });

        // Obter primary keys
        const pkQuery = `
          SELECT a.attname
          FROM   pg_index i
          JOIN   pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
          WHERE  i.indrelid = $1::regclass AND i.indisprimary;
        `;
        
        const pkResult = await pool.query(pkQuery, [tableName]);
        if (pkResult.rows.length > 0) {
          console.log(`   🔑 Primary Key: ${pkResult.rows.map(r => r.attname).join(', ')}`);
        }

        // Contar registos
        const countQuery = `SELECT COUNT(*) as count FROM ${tableName};`;
        const countResult = await pool.query(countQuery);
        console.log(`   📊 Registos: ${countResult.rows[0].count}\n`);
      } else {
        console.log(`❌ Tabela ${tableName} NÃO ENCONTRADA na base de dados!\n`);
      }
    }

    // 3. Verificar tabelas extras que não estão no schema documentado
    console.log('🆕 3. Tabelas extras encontradas na BD (não documentadas no schema):');
    
    const documentedTables = [
      'roles', 'permissions', 'role_permissions', 'users', 'price_lists', 'categories',
      'products', 'geko_products', 'product_variants', 'product_categories', 'product_images',
      'product_attributes', 'prices', 'orders', 'order_items', 'units', 'producers',
      'pricing_config', 'system_settings', 'content_banners', 'attributes', 'product_sizes',
      'stock_levels'
    ];

    const extraTables = tables.filter(table => !documentedTables.includes(table.table_name));
    
    if (extraTables.length > 0) {
      extraTables.forEach(table => {
        console.log(`   📝 ${table.table_name}`);
      });
    } else {
      console.log('   ✅ Nenhuma tabela extra encontrada');
    }

    // 4. Guardar relatório completo
    const report = {
      timestamp: new Date().toISOString(),
      total_tables: tables.length,
      total_views: views.length,
      tables: tables.map(t => t.table_name),
      views: views.map(v => v.table_name),
      extra_tables: extraTables.map(t => t.table_name),
      documented_tables: documentedTables
    };

    fs.writeFileSync('database_validation_report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Relatório salvo em: database_validation_report.json');

  } catch (error) {
    console.error('❌ Erro durante validação:', error);
  } finally {
    await pool.end();
  }
}

// Executar validação
validateDatabaseSchema(); 