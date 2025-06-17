-- =======================================================================================
-- MIGRATION V5: Correção Definitiva da Hierarquia de Categorias
-- Data: 17 de Janeiro de 2025
-- Descrição: Este script corrige a coluna `parent_id` na tabela `categories` de forma
--            definitiva. Ele recalcula TODOS os `parent_id` baseando-se no `path`,
--            garantindo que a hierarquia fique consistente e sem IDs gerados (GEN_...).
-- =======================================================================================

DO $$
DECLARE
    rec RECORD;
    parent_path TEXT;
    correct_parent_id TEXT;
BEGIN
    RAISE NOTICE 'Iniciando a correção da hierarquia de categorias...';

    -- Loop por todas as categorias que têm um path com separador, indicando que têm um pai.
    FOR rec IN 
        SELECT categoryid, path 
        FROM categories 
        WHERE path LIKE '%\\%'
    LOOP
        -- Calcula o path do pai removendo o último segmento (ex: "A\\B\\C" -> "A\\B")
        parent_path := substring(rec.path from '^(.*)\\');
        
        -- Encontra o categoryid do pai na própria tabela, usando o path do pai.
        SELECT categoryid INTO correct_parent_id 
        FROM categories 
        WHERE path = parent_path 
        LIMIT 1;

        -- Atualiza o parent_id da categoria atual com o ID correto do pai que foi encontrado.
        -- Se não encontrar um pai, o parent_id ficará NULL, tornando-a uma categoria raiz.
        -- Esta operação corrige tanto os IDs "GEN_" como quaisquer outros parent_id's incorretos.
        UPDATE categories
        SET parent_id = correct_parent_id
        WHERE categoryid = rec.categoryid;
        
    END LOOP;
    
    -- Garante que todas as categorias raiz (sem separador no path) têm parent_id = NULL.
    UPDATE categories
    SET parent_id = NULL
    WHERE path NOT LIKE '%\\%';

    RAISE NOTICE 'Correção da hierarquia de categorias concluída com sucesso.';
END $$;

-- ========= VERIFICAÇÃO FINAL =========
-- Esta query não deve retornar nenhuma linha se a correção foi bem-sucedida.
SELECT * FROM categories WHERE parent_id LIKE 'GEN_%';

-- Verificar a consistência para o caso de teste "Brushes"
SELECT 
    c.name as child_name,
    p.name as parent_name
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.categoryid
WHERE c.name = 'Brushes'; 