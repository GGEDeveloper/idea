const fs = require('fs');
const path = require('path');

// Ler os resultados da inspeção
function loadInspectionResults() {
  const resultsPath = path.join(__dirname, '../database-schema-inspection.json');
  if (!fs.existsSync(resultsPath)) {
    throw new Error('Database inspection results not found. Run check-database-schema.js first.');
  }
  return JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
}

// Gerar SQL para uma tabela baseado na estrutura real
function generateTableSQL(tableName, tableInfo) {
  let sql = `\n-- Tabela: ${tableName}\n`;
  sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
  
  const columns = tableInfo.columns.map(col => {
    let colDef = `    ${col.column_name} ${col.data_type}`;
    
    // Adicionar tamanho se aplicável
    if (col.character_maximum_length) {
      colDef += `(${col.character_maximum_length})`;
    } else if (col.numeric_precision && col.numeric_scale) {
      colDef += `(${col.numeric_precision},${col.numeric_scale})`;
    }
    
    // NULL/NOT NULL
    if (col.is_nullable === 'NO') {
      colDef += ' NOT NULL';
    }
    
    // Default value
    if (col.column_default) {
      colDef += ` DEFAULT ${col.column_default}`;
    }
    
    return colDef;
  });
  
  sql += columns.join(',\n');
  sql += '\n);\n';
  
  // Comentário sobre a tabela
  const sampleCount = tableInfo.row_count;
  sql += `COMMENT ON TABLE ${tableName} IS 'Tabela com ${sampleCount} registos. Última inspeção: ${new Date().toISOString().split('T')[0]}';\n`;
  
  return sql;
}

// Gerar SQL para constraints
function generateConstraintsSQL(results) {
  let sql = '\n-- ============================================\n';
  sql += '-- CONSTRAINTS E FOREIGN KEYS\n';
  sql += '-- ============================================\n\n';
  
  // Primary Keys
  Object.entries(results.tables).forEach(([tableName, tableInfo]) => {
    const pkConstraints = tableInfo.constraints.filter(c => c.constraint_type === 'PRIMARY KEY');
    pkConstraints.forEach(pk => {
      sql += `ALTER TABLE ${tableName} ADD CONSTRAINT ${pk.constraint_name} PRIMARY KEY (${pk.column_name});\n`;
    });
  });
  
  sql += '\n-- Foreign Keys\n';
  results.foreign_keys.forEach(fk => {
    sql += `ALTER TABLE ${fk.table_name} ADD CONSTRAINT FK_${fk.table_name}_${fk.column_name} `;
    sql += `FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name})`;
    if (fk.delete_rule && fk.delete_rule !== 'NO ACTION') {
      sql += ` ON DELETE ${fk.delete_rule}`;
    }
    sql += ';\n';
  });
  
  return sql;
}

// Gerar SQL para triggers
function generateTriggersSQL(results) {
  let sql = '\n-- ============================================\n';
  sql += '-- TRIGGERS\n';
  sql += '-- ============================================\n\n';
  
  // Função de timestamp (se não existir)
  sql += `-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;\n\n`;
  
  // Triggers individuais
  results.triggers.forEach(trigger => {
    sql += `-- Trigger para ${trigger.table_name}\n`;
    sql += `DROP TRIGGER IF EXISTS ${trigger.trigger_name} ON ${trigger.table_name};\n`;
    sql += `CREATE TRIGGER ${trigger.trigger_name}\n`;
    sql += `    ${trigger.action_timing} ${trigger.event_manipulation} ON ${trigger.table_name}\n`;
    sql += `    FOR EACH ROW\n`;
    sql += `    EXECUTE FUNCTION trigger_set_timestamp();\n\n`;
  });
  
  return sql;
}

// Gerar dados essenciais
function generateEssentialDataSQL(results) {
  let sql = '\n-- ============================================\n';
  sql += '-- DADOS ESSENCIAIS\n';
  sql += '-- ============================================\n\n';
  
  // Roles
  if (results.tables.roles && results.tables.roles.sample_data.length > 0) {
    sql += '-- Roles essenciais\n';
    results.tables.roles.sample_data.forEach(role => {
      sql += `INSERT INTO roles (role_id, role_name, description) VALUES\n`;
      sql += `(${role.role_id}, '${role.role_name}', '${role.description}')\n`;
      sql += `ON CONFLICT (role_id) DO UPDATE SET description = EXCLUDED.description;\n`;
    });
    sql += '\n';
  }
  
  // Permissions
  if (results.tables.permissions && results.tables.permissions.sample_data.length > 0) {
    sql += '-- Permissões essenciais\n';
    results.tables.permissions.sample_data.forEach(perm => {
      sql += `INSERT INTO permissions (permission_id, permission_name, description) VALUES\n`;
      sql += `(${perm.permission_id}, '${perm.permission_name}', '${perm.description}')\n`;
      sql += `ON CONFLICT (permission_id) DO UPDATE SET description = EXCLUDED.description;\n`;
    });
    sql += '\n';
  }
  
  // Price Lists
  if (results.tables.price_lists && results.tables.price_lists.sample_data.length > 0) {
    sql += '-- Price Lists essenciais\n';
    results.tables.price_lists.sample_data.forEach(pl => {
      sql += `INSERT INTO price_lists (price_list_id, name, description) VALUES\n`;
      sql += `(${pl.price_list_id}, '${pl.name}', '${pl.description}')\n`;
      sql += `ON CONFLICT (price_list_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;\n`;
    });
    sql += '\n';
  }
  
  return sql;
}

// Gerar relatório de discrepâncias
function generateDiscrepancyReport(results) {
  const timestamp = new Date().toLocaleString('pt-PT');
  let report = `# Relatório de Discrepâncias: Schema Documentado vs Real\n\n`;
  report += `**Data:** ${timestamp}\n`;
  report += `**Base de Dados:** ${results.database_info.database_name}\n\n`;
  
  // Tabelas do schema documentado vs real
  const documentedTables = new Set([
    'products', 'geko_products', 'categories', 'product_categories', 
    'product_images', 'product_variants', 'product_attributes', 
    'price_lists', 'prices', 'roles', 'permissions', 'role_permissions', 
    'users', 'orders', 'order_items'
  ]);
  
  const realTables = new Set(Object.keys(results.tables));
  
  // Tabelas extras na base de dados real
  const extraTables = [...realTables].filter(t => !documentedTables.has(t));
  const missingTables = [...documentedTables].filter(t => !realTables.has(t));
  
  report += `## 🆕 Tabelas Extras na Base de Dados Real (${extraTables.length})\n\n`;
  if (extraTables.length > 0) {
    extraTables.forEach(table => {
      const tableInfo = results.tables[table];
      report += `### ${table}\n`;
      report += `- **Registos:** ${tableInfo.row_count}\n`;
      report += `- **Colunas:** ${tableInfo.columns.length}\n`;
      report += `- **Propósito:** `;
      
      // Tentar inferir o propósito baseado no nome
      if (table.includes('banner')) report += 'Gestão de banners/conteúdo\n';
      else if (table.includes('config')) report += 'Configurações do sistema\n';
      else if (table.includes('producer')) report += 'Gestão de fabricantes\n';
      else if (table.includes('stock')) report += 'Gestão de inventário\n';
      else if (table.includes('unit')) report += 'Unidades de medida\n';
      else if (table.includes('setting')) report += 'Configurações gerais\n';
      else report += 'A determinar\n';
      
      report += `- **Status:** ${tableInfo.row_count === 0 ? '⚠️ Vazia' : '✅ Com dados'}\n\n`;
    });
  } else {
    report += `Nenhuma tabela extra encontrada.\n\n`;
  }
  
  report += `## ❌ Tabelas Documentadas mas Ausentes na Base de Dados (${missingTables.length})\n\n`;
  if (missingTables.length > 0) {
    missingTables.forEach(table => {
      report += `- **${table}** - Documentada mas não existe na base de dados\n`;
    });
  } else {
    report += `Nenhuma tabela em falta.\n\n`;
  }
  
  // Análise de colunas extras nas tabelas comuns
  report += `## 🔧 Discrepâncias em Tabelas Existentes\n\n`;
  
  // Verificar users (sabemos que tem colunas extras)
  if (results.tables.users) {
    report += `### users\n`;
    report += `**Colunas extras encontradas:**\n`;
    const userColumns = results.tables.users.columns.map(c => c.column_name);
    const expectedUserColumns = ['user_id', 'clerk_id', 'email', 'first_name', 'last_name', 'company_name', 'role_id', 'created_at', 'updated_at'];
    const extraUserColumns = userColumns.filter(c => !expectedUserColumns.includes(c));
    extraUserColumns.forEach(col => {
      report += `- \`${col}\` - Implementação de autenticação local\n`;
    });
    report += `\n`;
  }
  
  // Verificar geko_products
  if (results.tables.geko_products) {
    report += `### geko_products\n`;
    report += `**Colunas extras encontradas:**\n`;
    const gekoColumns = results.tables.geko_products.columns.map(c => c.column_name);
    const expectedGekoColumns = ['ean', 'supplier_price', 'stock_quantity', 'last_sync', 'raw_data', 'created_at', 'updated_at'];
    const extraGekoColumns = gekoColumns.filter(c => !expectedGekoColumns.includes(c));
    extraGekoColumns.forEach(col => {
      report += `- \`${col}\` - Atributos adicionais da API Geko\n`;
    });
    report += `\n`;
  }
  
  // Problemas identificados
  report += `## ⚠️ Problemas Identificados\n\n`;
  
  // Tabelas sem primary key
  const tablesWithoutPK = Object.entries(results.tables)
    .filter(([_, tableInfo]) => !tableInfo.constraints.some(c => c.constraint_type === 'PRIMARY KEY'))
    .map(([tableName, _]) => tableName);
  
  if (tablesWithoutPK.length > 0) {
    report += `### Tabelas sem Primary Key\n`;
    tablesWithoutPK.forEach(table => {
      report += `- ❌ \`${table}\` - Necessita de primary key para integridade\n`;
    });
    report += `\n`;
  }
  
  // Tabelas vazias
  const emptyTables = Object.entries(results.tables)
    .filter(([_, tableInfo]) => tableInfo.row_count === 0)
    .map(([tableName, _]) => tableName);
  
  if (emptyTables.length > 0) {
    report += `### Tabelas Vazias\n`;
    emptyTables.forEach(table => {
      report += `- ⚠️ \`${table}\` - Sem dados (pode ser normal se não implementada)\n`;
    });
    report += `\n`;
  }
  
  // Recomendações
  report += `## 🎯 Recomendações\n\n`;
  report += `### Imediatas (Alta Prioridade)\n`;
  report += `1. **Adicionar Primary Key à tabela \`stock_levels\`** - Crítico para integridade\n`;
  report += `2. **Atualizar documentação do schema** - Incluir todas as tabelas reais\n`;
  report += `3. **Verificar necessidade das tabelas vazias** - Remover se não utilizadas\n\n`;
  
  report += `### Médio Prazo\n`;
  report += `1. **Documentar propósito das tabelas extras** - Clarificar funcionalidades\n`;
  report += `2. **Implementar backup strategy** - Para tabelas com dados críticos\n`;
  report += `3. **Criar indexes adicionais** - Para performance em tabelas grandes\n\n`;
  
  report += `### Informativas\n`;
  report += `- A migração do Clerk para auth local foi bem-sucedida\n`;
  report += `- Sistema de preços está funcional com ${results.tables.prices.row_count} registos\n`;
  report += `- Dados de produtos estão sincronizados (${results.tables.products.row_count} produtos)\n`;
  
  return report;
}

// Função principal
function generateUpdatedSchema() {
  console.log('📖 Carregando resultados da inspeção...');
  const results = loadInspectionResults();
  
  console.log('🏗️ Gerando schema SQL atualizado...');
  
  let sql = `-- ============================================\n`;
  sql += `-- SCHEMA ATUALIZADO DA BASE DE DADOS\n`;
  sql += `-- Gerado automaticamente baseado na inspeção real\n`;
  sql += `-- Data: ${new Date().toISOString()}\n`;
  sql += `-- Base de Dados: ${results.database_info.database_name}\n`;
  sql += `-- PostgreSQL: ${results.database_info.postgresql_version}\n`;
  sql += `-- ============================================\n\n`;
  
  // Extensões
  sql += `-- Extensões necessárias\n`;
  results.extensions.forEach(ext => {
    sql += `CREATE EXTENSION IF NOT EXISTS "${ext.extname}";\n`;
  });
  sql += '\n';
  
  // Tabelas ordenadas por dependências
  const orderedTables = [
    'roles', 'permissions', 'role_permissions', 'users',
    'price_lists', 'categories', 'products', 'geko_products',
    'product_variants', 'product_categories', 'product_images', 
    'product_attributes', 'prices', 'orders', 'order_items',
    'units', 'producers', 'pricing_config', 'system_settings',
    'content_banners', 'attributes', 'product_sizes', 'stock_levels'
  ];
  
  // Gerar SQL para cada tabela
  sql += '-- ============================================\n';
  sql += '-- TABELAS\n';
  sql += '-- ============================================\n';
  
  orderedTables.forEach(tableName => {
    if (results.tables[tableName]) {
      sql += generateTableSQL(tableName, results.tables[tableName]);
    }
  });
  
  // Constraints e Foreign Keys
  sql += generateConstraintsSQL(results);
  
  // Triggers
  sql += generateTriggersSQL(results);
  
  // Dados essenciais
  sql += generateEssentialDataSQL(results);
  
  // Guardar schema atualizado
  const schemaFile = path.join(__dirname, '../docs/database-schema-real.sql');
  fs.writeFileSync(schemaFile, sql);
  
  // Gerar relatório de discrepâncias
  console.log('📋 Gerando relatório de discrepâncias...');
  const discrepancyReport = generateDiscrepancyReport(results);
  const discrepancyFile = path.join(__dirname, '../docs/SCHEMA_DISCREPANCY_REPORT.md');
  fs.writeFileSync(discrepancyFile, discrepancyReport);
  
  console.log('\n✅ Geração concluída!');
  console.log(`📄 Schema atualizado: ${schemaFile}`);
  console.log(`📋 Relatório de discrepâncias: ${discrepancyFile}`);
  
  // Sumário rápido
  console.log('\n📊 Sumário:');
  console.log(`- Total de tabelas: ${Object.keys(results.tables).length}`);
  console.log(`- Tabelas com dados: ${Object.values(results.tables).filter(t => t.row_count > 0).length}`);
  console.log(`- Foreign keys: ${results.foreign_keys.length}`);
  console.log(`- Triggers: ${results.triggers.length}`);
  
  const totalRecords = Object.values(results.tables).reduce((sum, table) => sum + table.row_count, 0);
  console.log(`- Total de registos: ${totalRecords.toLocaleString('pt-PT')}`);
}

// Executar se chamado diretamente
if (require.main === module) {
  try {
    generateUpdatedSchema();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

module.exports = { generateUpdatedSchema }; 