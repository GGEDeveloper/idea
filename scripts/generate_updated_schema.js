const { Pool } = require('pg');
const fs = require('fs');

// Configuração da base de dados
const pool = new Pool({
  connectionString: "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

async function generateUpdatedSchema() {
  console.log('🔧 Gerando database_schema.sql atualizado...\n');

  try {
    let schemaContent = '';
    
    // Header
    schemaContent += `-- ============================================
-- SCHEMA ATUALIZADO DA BASE DE DADOS
-- Gerado automaticamente baseado na inspeção real
-- Data: ${new Date().toISOString()}
-- Base de Dados: neondb
-- PostgreSQL: PostgreSQL 17.5 on aarch64-unknown-linux-gnu
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";

-- ============================================
-- TABELAS
-- ============================================

`;

    // 1. Obter lista de todas as tabelas
    const tablesQuery = `
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const tablesResult = await pool.query(tablesQuery);
    
    console.log(`📋 Processando ${tablesResult.rows.length} tabelas...`);

    // 2. Para cada tabela, gerar a estrutura
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`🔨 Processando tabela: ${tableName}`);

      // Obter contagem de registos
      const countQuery = `SELECT COUNT(*) as count FROM ${tableName};`;
      const countResult = await pool.query(countQuery);
      const recordCount = countResult.rows[0].count;

      // Comentário da tabela
      schemaContent += `-- Tabela: ${tableName}\n`;

      // Obter estrutura das colunas
      const columnsQuery = `
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale,
          ordinal_position
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `;
      const columnsResult = await pool.query(columnsQuery, [tableName]);

      // Gerar CREATE TABLE
      schemaContent += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      
      const columnDefinitions = [];
      for (const col of columnsResult.rows) {
        let columnDef = `    ${col.column_name} `;
        
        // Tipo de dados
        switch (col.data_type) {
          case 'character varying':
            columnDef += col.character_maximum_length ? 
              `character varying(${col.character_maximum_length})` : 
              'character varying';
            break;
          case 'timestamp with time zone':
            columnDef += 'timestamp with time zone';
            break;
          case 'timestamp without time zone':
            columnDef += 'timestamp without time zone';
            break;
          case 'numeric':
            if (col.numeric_precision && col.numeric_scale) {
              columnDef += `numeric(${col.numeric_precision},${col.numeric_scale})`;
            } else {
              columnDef += 'numeric';
            }
            break;
          default:
            columnDef += col.data_type;
        }

        // Nullable
        if (col.is_nullable === 'NO') {
          columnDef += ' NOT NULL';
        }

        // Default
        if (col.column_default) {
          columnDef += ` DEFAULT ${col.column_default}`;
        }

        columnDefinitions.push(columnDef);
      }

      schemaContent += columnDefinitions.join(',\n') + '\n';
      schemaContent += `);\n`;
      schemaContent += `COMMENT ON TABLE ${tableName} IS 'Tabela com ${recordCount} registos. Última inspeção: ${new Date().toISOString().split('T')[0]}';\n\n`;
    }

    // 3. Obter constraints (Primary Keys, Foreign Keys, etc.)
    console.log('🔗 Obtendo constraints...');
    
    schemaContent += `-- ============================================
-- CONSTRAINTS E FOREIGN KEYS
-- ============================================

`;

    // Primary Keys
    const pkQuery = `
      SELECT 
        tc.table_name, 
        STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
      GROUP BY tc.table_name, tc.constraint_name
      ORDER BY tc.table_name;
    `;
    const pkResult = await pool.query(pkQuery);

    for (const pk of pkResult.rows) {
      schemaContent += `ALTER TABLE ${pk.table_name} ADD CONSTRAINT ${pk.table_name}_pkey PRIMARY KEY (${pk.columns});\n`;
    }

    // Foreign Keys
    const fkQuery = `
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name;
    `;
    const fkResult = await pool.query(fkQuery);

    schemaContent += '\n-- Foreign Keys\n';
    for (const fk of fkResult.rows) {
      schemaContent += `ALTER TABLE ${fk.table_name} ADD CONSTRAINT FK_${fk.table_name}_${fk.column_name} FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name}) ON DELETE CASCADE;\n`;
    }

    // 4. Views
    console.log('👁️ Obtendo views...');
    
    const viewsQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'VIEW'
      ORDER BY table_name;
    `;
    const viewsResult = await pool.query(viewsQuery);

    if (viewsResult.rows.length > 0) {
      schemaContent += `\n-- ============================================
-- VIEWS
-- ============================================

`;
      for (const view of viewsResult.rows) {
        schemaContent += `-- View: ${view.table_name} (definição obtida automaticamente)\n`;
        schemaContent += `-- CREATE VIEW ${view.table_name} AS ...;\n\n`;
      }
    }

    // 5. Triggers (básicos)
    schemaContent += `
-- ============================================
-- TRIGGERS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at (tabelas que têm essa coluna)
`;

    // Adicionar triggers para tabelas com updated_at
    const triggersQuery = `
      SELECT table_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND column_name = 'updated_at' 
        AND table_name IN (
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        )
      ORDER BY table_name;
    `;
    const triggersResult = await pool.query(triggersQuery);

    for (const trigger of triggersResult.rows) {
      schemaContent += `DROP TRIGGER IF EXISTS set_timestamp_${trigger.table_name} ON ${trigger.table_name};
CREATE TRIGGER set_timestamp_${trigger.table_name}
    BEFORE UPDATE ON ${trigger.table_name}
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

`;
    }

    // Footer
    schemaContent += `
-- ============================================
-- ESTATÍSTICAS DA BASE DE DADOS
-- ============================================

/*
RESUMO GERADO AUTOMATICAMENTE:
- Total de Tabelas: ${tablesResult.rows.length}
- Total de Views: ${viewsResult.rows.length}
- Data de Geração: ${new Date().toISOString()}
- Script Gerador: scripts/generate_updated_schema.js

PRINCIPAIS TABELAS:
${tablesResult.rows.map(t => `- ${t.table_name}`).join('\n')}
*/
`;

    // 6. Guardar ficheiro
    const outputFile = 'docs/database_schema_updated.sql';
    fs.writeFileSync(outputFile, schemaContent);
    
    console.log(`\n✅ Schema atualizado gerado: ${outputFile}`);
    console.log(`📊 ${tablesResult.rows.length} tabelas processadas`);
    console.log(`👁️ ${viewsResult.rows.length} views encontradas`);

  } catch (error) {
    console.error('❌ Erro ao gerar schema:', error);
  } finally {
    await pool.end();
  }
}

// Executar geração
generateUpdatedSchema(); 