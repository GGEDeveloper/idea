-- =======================================================================================
-- MIGRATION V6: Normalização de Category IDs e Reconstrução da Hierarquia
-- Data: 17 de Janeiro de 2025
-- Descrição: Este script corrige definitivamente a hierarquia de categorias ao:
--            1. Normalizar todos os categoryid's gerados ('GEN_...') para IDs numéricos.
--            2. Atualizar todas as tabelas que referenciam estes IDs.
--            3. Recalcular TODOS os parent_id's com base no path para garantir 100% de consistência.
-- =======================================================================================

DO $$
DECLARE
    rec RECORD;
    old_id TEXT;
    new_id TEXT;
    next_id INT;
BEGIN
    RAISE NOTICE 'Iniciando a normalização dos IDs de categoria...';

    -- Encontrar o maior ID numérico para começar a gerar novos a partir daí
    SELECT COALESCE(MAX(categoryid::INT), 113000) + 1 INTO next_id
    FROM categories
    WHERE categoryid ~ '^[0-9]+$';

    -- Tabela temporária para mapear IDs antigos para novos IDs
    CREATE TEMP TABLE id_mapping (
        old_id TEXT PRIMARY KEY,
        new_id TEXT NOT NULL
    );

    -- Popular a tabela de mapeamento com novos IDs para os IDs 'GEN_'
    FOR old_id IN 
        SELECT categoryid FROM categories WHERE categoryid LIKE 'GEN_%'
    LOOP
        new_id := next_id::TEXT;
        INSERT INTO id_mapping (old_id, new_id) VALUES (old_id, new_id);
        next_id := next_id + 1;
    END LOOP;
    
    RAISE NOTICE '% IDs de categoria a serem normalizados.', (SELECT COUNT(*) FROM id_mapping);

    -- Passo 1: Atualizar a tabela de junção `product_categories`
    FOR rec IN SELECT * FROM id_mapping
    LOOP
        UPDATE product_categories SET category_id = rec.new_id WHERE category_id = rec.old_id;
    END LOOP;
    RAISE NOTICE 'Tabela `product_categories` atualizada.';

    -- Passo 2: Atualizar a coluna `parent_id` na própria tabela `categories`
    FOR rec IN SELECT * FROM id_mapping
    LOOP
        UPDATE categories SET parent_id = rec.new_id WHERE parent_id = rec.old_id;
    END LOOP;
    RAISE NOTICE 'Coluna `parent_id` na tabela `categories` atualizada.';

    -- Passo 3: Atualizar os IDs primários `categoryid` na tabela `categories`
    FOR rec IN SELECT * FROM id_mapping
    LOOP
        UPDATE categories SET categoryid = rec.new_id WHERE categoryid = rec.old_id;
    END LOOP;
    RAISE NOTICE 'Coluna `categoryid` na tabela `categories` normalizada.';

    -- Passo 4: Recalcular TODA a hierarquia de `parent_id` com base no `path`
    -- Isto garante que, após a normalização dos IDs, a estrutura fica 100% correta.
    FOR rec IN 
        SELECT c1.categoryid, c2.categoryid as correct_parent_id
        FROM categories c1
        LEFT JOIN categories c2 ON c2.path = substring(c1.path from '^(.*)\\')
        WHERE c1.path LIKE '%\\%'
    LOOP
        UPDATE categories
        SET parent_id = rec.correct_parent_id
        WHERE categoryid = rec.categoryid;
    END LOOP;

    -- Garante que todas as categorias raiz (sem separador no path) têm parent_id = NULL.
    UPDATE categories
    SET parent_id = NULL
    WHERE path NOT LIKE '%\\%';
    RAISE NOTICE 'Coluna `parent_id` recalculada para toda a tabela.';

    RAISE NOTICE 'Normalização e reconstrução da hierarquia de categorias concluída com sucesso!';

    -- Limpar tabela temporária
    DROP TABLE id_mapping;

END $$;

-- ========= VERIFICAÇÃO FINAL =========
-- Estas queries não devem retornar nenhuma linha se a correção foi bem-sucedida.
SELECT * FROM categories WHERE categoryid LIKE 'GEN_%';
SELECT * FROM categories WHERE parent_id LIKE 'GEN_%'; 