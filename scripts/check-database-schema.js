const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration from env-doc.txt
const client = new Client({
  connectionString: 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function inspectDatabase() {
  try {
    console.log('🔍 Conectando à base de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    const results = {
      timestamp: new Date().toISOString(),
      database_info: {},
      tables: {},
      foreign_keys: [],
      indexes: [],
      triggers: [],
      sequences: [],
      data_samples: {}
    };

    // 1. Informações gerais da base de dados
    console.log('📊 Extraindo informações gerais...');
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as postgresql_version
    `);
    results.database_info = dbInfo.rows[0];

    // 2. Lista de todas as tabelas
    console.log('📋 Listando tabelas...');
    const tables = await client.query(`
      SELECT 
        schemaname,
        tablename,
        tableowner,
        tablespace,
        hasindexes,
        hasrules,
        hastriggers,
        rowsecurity
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log(`📦 Encontradas ${tables.rows.length} tabelas: ${tables.rows.map(t => t.tablename).join(', ')}\n`);

    // 3. Detalhes de cada tabela
    for (const table of tables.rows) {
      const tableName = table.tablename;
      console.log(`🔍 Analisando tabela: ${tableName}`);

      // Colunas da tabela
      const columns = await client.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          numeric_precision,
          numeric_scale,
          is_nullable,
          column_default,
          udt_name,
          ordinal_position
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      // Constraints da tabela
      const constraints = await client.query(`
        SELECT 
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.update_rule,
          rc.delete_rule
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        LEFT JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        ORDER BY tc.constraint_type, kcu.ordinal_position
      `, [tableName]);

      // Índices da tabela
      const indexes = await client.query(`
        SELECT 
          i.relname as index_name,
          ix.indisunique as is_unique,
          ix.indisprimary as is_primary,
          array_agg(a.attname ORDER BY c.ordinality) as columns
        FROM pg_class t
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN unnest(ix.indkey) WITH ORDINALITY AS c(colnum, ordinality) ON true
        JOIN pg_attribute a ON t.oid = a.attrelid AND a.attnum = c.colnum
        WHERE t.relkind = 'r'
        AND t.relname = $1
        GROUP BY i.relname, ix.indisunique, ix.indisprimary
        ORDER BY i.relname
      `, [tableName]);

      // Contagem de registos
      const count = await client.query(`SELECT COUNT(*) as total FROM "${tableName}"`);
      
      // Sample de dados (primeiros 3 registos)
      let sampleData = [];
      try {
        const sample = await client.query(`SELECT * FROM "${tableName}" LIMIT 3`);
        sampleData = sample.rows;
      } catch (error) {
        console.log(`⚠️  Erro ao obter sample de dados para ${tableName}: ${error.message}`);
      }

      results.tables[tableName] = {
        ...table,
        columns: columns.rows,
        constraints: constraints.rows,
        indexes: indexes.rows,
        row_count: parseInt(count.rows[0].total),
        sample_data: sampleData
      };
    }

    // 4. Foreign Keys globais
    console.log('\n🔗 Extraindo foreign keys...');
    const foreignKeys = await client.query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);
    results.foreign_keys = foreignKeys.rows;

    // 5. Triggers
    console.log('⚡ Extraindo triggers...');
    const triggers = await client.query(`
      SELECT 
        event_object_table as table_name,
        trigger_name,
        event_manipulation,
        action_timing,
        action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);
    results.triggers = triggers.rows;

    // 6. Sequences
    console.log('🔢 Extraindo sequences...');
    const sequences = await client.query(`
      SELECT 
        sequence_name,
        data_type,
        start_value,
        minimum_value,
        maximum_value,
        increment,
        cycle_option
      FROM information_schema.sequences
      WHERE sequence_schema = 'public'
      ORDER BY sequence_name
    `);
    results.sequences = sequences.rows;

    // 7. Extensões instaladas
    console.log('🔌 Verificando extensões...');
    const extensions = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      ORDER BY extname
    `);
    results.extensions = extensions.rows;

    // 8. Funções personalizadas
    console.log('⚙️ Verificando funções personalizadas...');
    const functions = await client.query(`
      SELECT 
        routine_name,
        routine_type,
        data_type as return_type,
        routine_definition
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      ORDER BY routine_name
    `);
    results.functions = functions.rows;

    // Guardar resultados
    const outputFile = path.join(__dirname, '../database-schema-inspection.json');
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

    // Criar relatório resumido
    const reportFile = path.join(__dirname, '../database-schema-report.md');
    const report = generateReport(results);
    fs.writeFileSync(reportFile, report);

    console.log('\n✅ Inspeção concluída!');
    console.log(`📄 Resultados detalhados: ${outputFile}`);
    console.log(`📋 Relatório resumido: ${reportFile}`);

    return results;

  } catch (error) {
    console.error('❌ Erro durante a inspeção:', error);
    throw error;
  } finally {
    await client.end();
  }
}

function generateReport(results) {
  const timestamp = new Date().toLocaleString('pt-PT');
  
  let report = `# Relatório de Inspeção da Base de Dados\n\n`;
  report += `**Data:** ${timestamp}\n`;
  report += `**Base de Dados:** ${results.database_info.database_name}\n`;
  report += `**Utilizador:** ${results.database_info.current_user}\n`;
  report += `**Versão PostgreSQL:** ${results.database_info.postgresql_version}\n\n`;

  // Resumo das tabelas
  report += `## 📊 Resumo das Tabelas\n\n`;
  report += `| Tabela | Colunas | Registos | Constraints | Índices |\n`;
  report += `|--------|---------|----------|-------------|----------|\n`;
  
  Object.entries(results.tables).forEach(([tableName, tableInfo]) => {
    report += `| ${tableName} | ${tableInfo.columns.length} | ${tableInfo.row_count} | ${tableInfo.constraints.length} | ${tableInfo.indexes.length} |\n`;
  });

  report += `\n## 🔗 Foreign Keys (${results.foreign_keys.length})\n\n`;
  results.foreign_keys.forEach(fk => {
    report += `- \`${fk.table_name}.${fk.column_name}\` → \`${fk.foreign_table_name}.${fk.foreign_column_name}\` (${fk.delete_rule})\n`;
  });

  report += `\n## ⚡ Triggers (${results.triggers.length})\n\n`;
  results.triggers.forEach(trigger => {
    report += `- \`${trigger.table_name}\`: ${trigger.trigger_name} (${trigger.event_manipulation} ${trigger.action_timing})\n`;
  });

  if (results.functions && results.functions.length > 0) {
    report += `\n## ⚙️ Funções Personalizadas (${results.functions.length})\n\n`;
    results.functions.forEach(func => {
      report += `- \`${func.routine_name}()\` → ${func.return_type}\n`;
    });
  }

  report += `\n## 🔌 Extensões Instaladas\n\n`;
  results.extensions.forEach(ext => {
    report += `- ${ext.extname} (v${ext.extversion})\n`;
  });

  // Detalhes das tabelas
  report += `\n## 📋 Detalhes das Tabelas\n\n`;
  Object.entries(results.tables).forEach(([tableName, tableInfo]) => {
    report += `### ${tableName} (${tableInfo.row_count} registos)\n\n`;
    
    report += `| Coluna | Tipo | Null | Default | Constraints |\n`;
    report += `|--------|------|------|---------|-------------|\n`;
    
    tableInfo.columns.forEach(col => {
      const constraints = tableInfo.constraints
        .filter(c => c.column_name === col.column_name)
        .map(c => c.constraint_type)
        .join(', ');
      
      const type = col.character_maximum_length ? 
        `${col.data_type}(${col.character_maximum_length})` : 
        col.data_type;
      
      report += `| ${col.column_name} | ${type} | ${col.is_nullable} | ${col.column_default || ''} | ${constraints} |\n`;
    });
    
    if (tableInfo.sample_data.length > 0) {
      report += `\n**Sample Data:**\n\`\`\`json\n${JSON.stringify(tableInfo.sample_data, null, 2)}\n\`\`\`\n\n`;
    }
  });

  // Análise de problemas potenciais
  report += `\n## ⚠️ Análise de Problemas Potenciais\n\n`;
  
  const emptyTables = Object.entries(results.tables)
    .filter(([_, tableInfo]) => tableInfo.row_count === 0)
    .map(([tableName, _]) => tableName);
  
  if (emptyTables.length > 0) {
    report += `### Tabelas Vazias\n`;
    emptyTables.forEach(table => {
      report += `- ⚠️ \`${table}\` está vazia\n`;
    });
    report += `\n`;
  }

  // Verificar tabelas sem primary key
  const tablesWithoutPK = Object.entries(results.tables)
    .filter(([_, tableInfo]) => !tableInfo.constraints.some(c => c.constraint_type === 'PRIMARY KEY'))
    .map(([tableName, _]) => tableName);
  
  if (tablesWithoutPK.length > 0) {
    report += `### Tabelas sem Primary Key\n`;
    tablesWithoutPK.forEach(table => {
      report += `- ❌ \`${table}\` não tem primary key\n`;
    });
    report += `\n`;
  }

  return report;
}

// Executar a inspeção
if (require.main === module) {
  inspectDatabase()
    .then(() => {
      console.log('\n🎉 Inspeção da base de dados concluída com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Falha na inspeção:', error);
      process.exit(1);
    });
}

module.exports = { inspectDatabase }; 