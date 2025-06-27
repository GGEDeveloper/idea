# 📦 Sistema de Importação de Fornecedores

Este sistema permite importar produtos, stocks e preços de fornecedores externos (não-Geko) para o e-commerce B2B.

## 📂 Estrutura de Pastas

```
imports/
├── suppliers/                  # Dados por fornecedor
│   ├── supplier-1/            # Fornecedor específico
│   │   ├── products/          # Ficheiros de produtos
│   │   ├── stocks/            # Ficheiros de stock
│   │   ├── prices/            # Ficheiros de preços
│   │   ├── images/            # Imagens de produtos
│   │   └── categories/        # Categorias específicas
│   ├── supplier-2/
│   └── supplier-3/
├── templates/                  # Templates e documentação
│   ├── csv/                   # Templates CSV
│   ├── xml/                   # Templates XML
│   └── json/                  # Templates JSON
├── scripts/                   # Scripts de processamento
│   ├── import/                # Scripts de importação
│   ├── validation/            # Scripts de validação
│   └── transform/             # Scripts de transformação
├── logs/                      # Logs de operações
│   ├── import/                # Logs de importação
│   ├── error/                 # Logs de erros
│   └── success/               # Logs de sucesso
├── processed/                 # Ficheiros processados
│   ├── archive/               # Arquivo de ficheiros antigos
│   └── backup/                # Backup de ficheiros
└── temp/                      # Ficheiros temporários
```

## 🔧 Tipos de Importação Suportados

### 1. Produtos
- **Formato:** CSV, XML, JSON, Excel
- **Campos obrigatórios:** EAN, Nome, Descrição, Marca
- **Campos opcionais:** Categoria, Atributos, Imagens

### 2. Stocks
- **Formato:** CSV, XML, JSON
- **Campos obrigatórios:** EAN, Quantidade
- **Campos opcionais:** Localização, Data de atualização

### 3. Preços
- **Formato:** CSV, XML, JSON
- **Campos obrigatórios:** EAN, Preço de fornecedor
- **Campos opcionais:** Desconto, Preço promocional, Validade

### 4. Imagens
- **Formato:** URLs ou ficheiros locais
- **Tipos suportados:** JPG, PNG, WebP
- **Tamanhos:** Múltiplas resoluções automáticas

## 📋 Templates Disponíveis

Consulte a pasta `templates/` para modelos específicos:

- `templates/csv/` - Templates em formato CSV
- `templates/xml/` - Templates em formato XML  
- `templates/json/` - Templates em formato JSON

## 🚀 Como Usar

1. **Preparar dados:** Organize os ficheiros na pasta do fornecedor correspondente
2. **Validar formato:** Use os scripts de validação em `scripts/validation/`
3. **Executar importação:** Use os scripts em `scripts/import/`
4. **Verificar logs:** Consulte `logs/` para resultados da operação

## ⚠️ Importante

- **Backup automático:** Todos os ficheiros são guardados em `processed/backup/`
- **Validação obrigatória:** Dados são validados antes da importação
- **Logs detalhados:** Todas as operações são registadas
- **Rollback:** Possível reverter importações se necessário

## 🔗 Integração com Base de Dados

As importações integram-se com as seguintes tabelas:
- `products` - Produtos principais
- `product_variants` - Variantes e preços
- `product_categories` - Categorias
- `product_images` - Imagens
- `product_attributes` - Atributos específicos
- `stock_levels` - Níveis de stock

## 📞 Suporte

Para questões sobre importação de fornecedores específicos, consulte a documentação na pasta do fornecedor ou contacte o administrador do sistema. 