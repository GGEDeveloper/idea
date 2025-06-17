-- =======================================================================================
-- Nova Função SQL para Buscar Subcategorias
-- Data: 17 de Janeiro de 2025
-- Descrição: Cria a função `get_descendant_categories` para buscar todos os IDs 
--            de subcategorias de uma categoria mãe.
-- =======================================================================================

CREATE OR REPLACE FUNCTION get_descendant_categories(root_category_id TEXT)
RETURNS TABLE (categoryid TEXT) AS $$
BEGIN
  RETURN QUERY
    SELECT c.categoryid
    FROM categories c
    WHERE c.path LIKE (SELECT path FROM categories WHERE categoryid = root_category_id) || '%';
END;
$$ LANGUAGE plpgsql;

-- Exemplo de uso (opcional, para testes):
-- SELECT * FROM get_descendant_categories('105266'); -- ID de uma categoria mãe 