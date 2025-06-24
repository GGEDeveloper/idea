-- =======================================================================================
-- Migração V8: Remover permissão 'view_stock' do role 'customer'
-- Data: 2025-01-XX
-- Descrição: Clientes não devem ver informações de stock - apenas admins
-- =======================================================================================

-- Remove a associação da permissão 'view_stock' do role 'customer'
DELETE FROM role_permissions 
WHERE role_id = (SELECT role_id FROM roles WHERE role_name = 'customer')
  AND permission_id = (SELECT permission_id FROM permissions WHERE permission_name = 'view_stock');

-- Confirmar que apenas admin mantém a permissão view_stock
-- (Esta query é apenas informativa, não executa ação)
-- SELECT r.role_name, p.permission_name 
-- FROM role_permissions rp 
-- JOIN roles r ON r.role_id = rp.role_id 
-- JOIN permissions p ON p.permission_id = rp.permission_id 
-- WHERE p.permission_name = 'view_stock';

COMMENT ON TABLE role_permissions IS 'Associa permissões a roles. Clientes NÃO têm permissão view_stock desde V8.'; 