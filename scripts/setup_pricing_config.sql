-- Setup default pricing configurations
INSERT INTO pricing_config (config_key, config_value, data_type, description) VALUES
('default_customer_price_list', '4', 'string', 'Lista de preços padrão exibida aos clientes'),
('markup_supplier_price', '0', 'string', 'Markup base aplicado sobre preço de fornecedor (Lista ID: 1)'),
('markup_base_selling_price', '25', 'string', 'Markup base aplicado sobre preço base de venda (Lista ID: 2)'),
('markup_customer_price', '35', 'string', 'Markup base aplicado sobre preço final ao cliente (Lista ID: 4)')
ON CONFLICT (config_key) DO NOTHING;

-- Display current configurations
SELECT config_key, config_value, description FROM pricing_config ORDER BY config_key;
