-- =======================================================================================
-- MIGRATION V4: Correção da Hierarquia de Categorias
-- Data: 17 de Janeiro de 2025
-- Descrição: Este script corrige a coluna `parent_id` na tabela `categories`.
--            Ele recalcula o `parent_id` de cada categoria baseando-se no seu `path`,
--            garantindo que a hierarquia fique consistente e sem IDs gerados (GEN_...).
-- =======================================================================================

-- Passo 1: Adicionar logs para vermos o estado antes da correção (Opcional)
SELECT 
    name, 
    path, 
    parent_id 
FROM categories 
WHERE parent_id LIKE 'GEN_%' OR parent_id IS NULL AND path LIKE '%\\%';

-- Passo 2: Corrigir a coluna parent_id
-- Este bloco de código vai:
-- 1. Iterar por cada categoria que tem um pai (ou seja, o path contém '\').
-- 2. Calcular o path do pai removendo o último segmento do path atual.
-- 3. Encontrar o categoryid do pai na própria tabela.
-- 4. Atualizar o parent_id da categoria atual com o ID correto do pai.
DO $$
DECLARE
    rec RECORD;
    parent_path TEXT;
    correct_parent_id TEXT;
BEGIN
    FOR rec IN 
        SELECT categoryid, path 
        FROM categories 
        WHERE path LIKE '%\\%'
    LOOP
        -- Extrai o path do pai (tudo antes do último '\')
        parent_path := substring(rec.path from '^(.*)\\');
        
        -- Encontra o categoryid do pai
        SELECT categoryid INTO correct_parent_id 
        FROM categories 
        WHERE path = parent_path 
        LIMIT 1;

        -- Se encontrou um pai válido, atualiza o parent_id
        IF correct_parent_id IS NOT NULL THEN
            UPDATE categories
            SET parent_id = correct_parent_id
            WHERE categoryid = rec.categoryid;
        ELSE
            -- Se não encontrou um pai, define como NULL (categoria raiz)
            -- Isto pode acontecer se o path pai não corresponder a nenhuma categoria existente
            UPDATE categories
            SET parent_id = NULL
            WHERE categoryid = rec.categoryid;
        END IF;
    END LOOP;
END $$;

-- Passo 3: Adicionar logs para verificar o estado após a correção (Opcional)
-- Esta query não deve retornar resultados se a correção foi bem-sucedida.
SELECT 
    name, 
    path, 
    parent_id 
FROM categories 
WHERE parent_id LIKE 'GEN_%';

-- Passo 4: Verificar a consistência da árvore (Opcional)
SELECT 
    c.name as child_name,
    c.path as child_path,
    p.name as parent_name,
    p.path as parent_path
FROM categories c
JOIN categories p ON c.parent_id = p.categoryid
WHERE c.parent_id IS NOT NULL
LIMIT 20;

RAISE NOTICE 'Correção da hierarquia de categorias concluída.'; 