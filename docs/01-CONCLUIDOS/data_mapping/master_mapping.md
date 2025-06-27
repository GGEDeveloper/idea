# Master Data Mapping: Geko XML to IDEA Database

**Data:** 2025-06-15  
**Autor:** Cascade AI & Equipa de Desenvolvimento  
**Versão:** 2.0

> **AVISO:** Este documento é a única fonte de verdade (`source of truth`) para o mapeamento de dados entre o feed XML da Geko e o schema definido em `docs/database_schema.sql` (versão 2.1 ou superior).

---

## Princípios Gerais de Mapeamento

1.  **Chave Primária Universal:** O `ean` do produto é a chave de negócio principal para a tabela `products`. `variantid` (do Geko XML `<size code="...">`) é a chave para `product_variants`.
2.  **Tipos de Dados:** Todos os dados são limpos e convertidos para os tipos corretos (`NUMERIC`, `INTEGER`, `BOOLEAN`, `TEXT`, `JSONB`) durante a importação.
3.  **Integridade Referencial:** A importação e o processamento ETL seguem uma ordem de dependências para satisfazer as `FOREIGN KEY` constraints.
4.  **Fidelidade de Dados:** Descrições HTML são preservadas. Dados brutos do XML são armazenados na tabela de staging `geko_products`.
5.  **Staging:** A tabela `geko_products` serve como staging inicial para os dados brutos do XML.

---

## Mapeamento por Tabela

### 0. Tabela de Staging: `geko_products`

| Coluna           | Tipo de Dados   | Origem XML                                  | Notas de Transformação                                       |
| :--------------- | :-------------- | :------------------------------------------ | :----------------------------------------------------------- |
| `ean`            | `TEXT`          | `<product ean="...">`                       | Chave Primária.                                              |
| `supplier_price` | `NUMERIC(12,4)` | `<product><price net="...">` (nível superior) | Preço de fornecedor principal do produto.                    |
| `stock_quantity` | `INTEGER`       | `<product><sizes><size><stock quantity="..."/>` (do primeiro `<size>` encontrado) | Stock principal/default. Convertido de string (ex: "6,00") para inteiro. |
| `last_sync`      | `TIMESTAMPTZ`   | N/A (Gerado pelo script)                    | Timestamp da última vez que o registo foi atualizado do XML. |
| `raw_data`       | `JSONB`         | Bloco XML completo do `<product>`             | Armazenado como `{"xml_product_data": "string do XML"}`.     |

### 1. Tabela: `products`

| Coluna             | Tipo de Dados   | Origem XML (`geko_products.raw_data`)            | Notas de Transformação                                       |
| :----------------- | :-------------- | :----------------------------------------------- | :----------------------------------------------------------- |
| `ean`              | `TEXT`          | `<product ean="...">`                            | Chave Primária. Mapeamento direto.                           |
| `productid`        | `TEXT`          | `<product id="...">`                             | ID legado do Geko. `UNIQUE`.                                 |
| `name`             | `TEXT`          | `<product><description><name>` (CDATA)          | Conteúdo de texto.                                           |
| `shortdescription` | `TEXT`          | `<product><description><short_desc>` (CDATA)    | Armazena HTML bruto para fidelidade.                         |
| `longdescription`  | `TEXT`          | `<product><description><long_desc>` (CDATA)     | Armazena HTML bruto para fidelidade. Pode conter tabelas, listas. |
| `brand`            | `TEXT`          | `<product><producer name="...">`                 | Nome do fabricante.                                          |
| `active`           | `BOOLEAN`       | (Lógica de Negócio/Default)                      | Default `true`. XML Geko não parece ter flag de ativo a nível de produto. |
| `is_featured`      | `BOOLEAN`       | N/A (Gerido pela Administração)                 | Default `false`. Para destaque na Home Page.                 |
| `created_at`       | `TIMESTAMPTZ`   | N/A (Gerado pelo Sistema)                        | `DEFAULT NOW()`                                              |
| `updated_at`       | `TIMESTAMPTZ`   | N/A (Gerado pelo Sistema com Trigger)            | Auto-atualizado no `UPDATE`.                                 |

### 2. Tabela: `categories`

| Coluna       | Tipo de Dados   | Origem XML (`geko_products.raw_data`) | Notas de Transformação                                                                                                |
| :----------- | :-------------- | :------------------------------------ | :-------------------------------------------------------------------------------------------------------------------- |
| `categoryid` | `TEXT`          | `<product><category id="...">`         | Chave Primária. IDs originais do XML são usados. Para segmentos de path intermédios não presentes no XML como tags `<category>`, um ID é gerado (e.g., "GEN_CAMINHO_NORMALIZADO"). |
| `name`       | `TEXT`          | `<product><category name="...">`       | Nome da categoria do XML. Para categorias inferidas de segmentos de path, o nome é o último segmento do path.        |
| `path`       | `TEXT`          | `<product><category path="...">`       | Caminho completo da hierarquia (e.g., "Nivel1\\Nivel2\\Nivel3").                                                      |
| `parent_id`  | `TEXT`          | N/A (Derivado pelo script)            | FK para `categories.categoryid`. Populado pelo script `process_staged_data.py` analisando o `path`. `NULL` para raízes. |
| `created_at` | `TIMESTAMPTZ`   | N/A (Gerado pelo Sistema)             | `DEFAULT NOW()`                                                                                                       |
| `updated_at` | `TIMESTAMPTZ`   | N/A (Gerado pelo Sistema com Trigger) | Auto-atualizado no `UPDATE`.                                                                                            |

### 3. Tabela: `product_categories` (Tabela de Junção)

| Coluna        | Tipo de Dados | Origem XML (`geko_products.raw_data`) | Notas                                                              |
| :------------ | :------------ | :------------------------------------ | :----------------------------------------------------------------- |
| `product_ean` | `TEXT`        | `<product ean="...">`                   | FK para `products.ean`.                                            |
| `category_id` | `TEXT`        | `<product><category id="...">`         | FK para `categories.categoryid`. Usa o ID original da tag category. |
| *PK*          |               | (`product_ean`, `category_id`)        |                                                                    |

### 4. Tabela: `product_images`

| Coluna       | Tipo de Dados | Origem XML (`geko_products.raw_data`)            | Notas de Transformação                                                    |
| :----------- | :------------ | :----------------------------------------------- | :------------------------------------------------------------------------ |
| `imageid`    | `SERIAL`      | N/A                                              | Gerado automaticamente.                                                   |
| `ean`        | `TEXT`        | `<product ean="...">` (Pai)                      | FK para `products.ean`.                                                   |
| `url`        | `TEXT`        | `<product><images><large><image url="..." />`      | Mapeamento direto.                                                        |
| `alt`        | `TEXT`        | N/A                                              | Gerado a partir do `products.name` se não disponível no XML.            |
| `is_primary` | `BOOLEAN`     | Lógica do script                                 | `true` para a primeira imagem encontrada para um produto, `false` para as outras. |
| *UNIQUE*     |               | (`ean`, `url`)                                   |                                                                           |

### 5. Tabela: `product_variants`

| Coluna           | Tipo de Dados   | Origem XML (`geko_products.raw_data`)                   | Notas de Transformação                                                                 |
| :--------------- | :-------------- | :------------------------------------------------------ | :------------------------------------------------------------------------------------- |
| `variantid`      | `TEXT`          | `<product><sizes><size code="...">`                      | Chave Primária. Código da variante/tamanho.                                            |
| `ean`            | `TEXT`          | `<product ean="...">` (Pai)                             | FK para `products.ean`.                                                                |
| `name`           | `TEXT`          | Gerado pelo script                                      | Concatenado: `products.name` + " - " + `variantid`.                                   |
| `stockquantity`  | `INTEGER`       | `<product><sizes><size><stock quantity="..."/>`        | Convertido de string (ex: "6,00") para inteiro.                                        |
| `supplier_price` | `NUMERIC(12,4)` | `<product><sizes><size><price net="..."/>`             | Preço de fornecedor específico da variante.                                            |
| `is_on_sale`     | `BOOLEAN`       | N/A (Gerido pela Administração)                          | Default `false`. Para indicar promoções a nível de variante.                           |

### 6. Tabela: `product_attributes`

| Coluna          | Tipo de Dados   | Origem XML (`geko_products.raw_data`)                   | Notas de Transformação                                                                                             |
| :-------------- | :-------------- | :------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------- |
| `attributeid`   | `SERIAL`        | N/A                                                     | Gerado automaticamente.                                                                                            |
| `product_ean`   | `TEXT`          | `<product ean="...">`                                   | FK para `products.ean`.                                                                                            |
| `key`           | `TEXT`          | Parsed do HTML nas descrições (e.g., tabelas, `p:strong`) | Nome do atributo (ex: "Cor", "Material").                                                                        |
| `value`         | `TEXT`          | Parsed do HTML nas descrições                           | Valor do atributo (ex: "Azul", "Aço").                                                                             |
| `created_at`    | `TIMESTAMPTZ`   | N/A (Gerado pelo Sistema)                               | `DEFAULT NOW()`                                                                                                    |
| `updated_at`    | `TIMESTAMPTZ`   | N/A (Gerado pelo Sistema com Trigger)                   | Auto-atualizado no `UPDATE`.                                                                                       |
| *UNIQUE*        |                 | (`product_ean`, `key`)                                  |                                                                                                                    |

### 7. Tabelas: `price_lists` e `prices`

*   **`price_lists`:**
    *   Populada via script (`apply_schema_updates.py` ou seed) com entradas como:
        *   ID 1: "Supplier Price" ('Custo de fornecedor (base da variante)')
        *   ID 2: "Base Selling Price" ('Preço de venda base (+25% markup sobre custo fornecedor da variante)')
        *   ID 3: "Promotional Price" ('Preço promocional temporário (a ser definido manualmente)')
*   **`prices`:**
    | Coluna          | Tipo de Dados   | Fonte de Dados                                        | Notas de Transformação                                                                                                            |
    | :-------------- | :-------------- | :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
    | `priceid`       | `SERIAL`        | N/A                                                   | Gerado automaticamente.                                                                                                           |
    | `variantid`     | `TEXT`          | `product_variants.variantid`                          | FK para `product_variants.variantid`.                                                                                             |
    | `price_list_id` | `INTEGER`       | ID da tabela `price_lists`                            | FK para `price_lists.price_list_id`.                                                                                              |
    | `price`         | `NUMERIC(12,4)` | - `product_variants.supplier_price` (para Price List 1)<br>- Calculado (`supplier_price` * 1.25) (para Price List 2) | Valor do preço para a variante naquela lista de preços. Preços promocionais (Lista 3) são geridos manualmente/externamente. |
    | *UNIQUE*        |                 | (`variantid`, `price_list_id`)                        |                                                                                                                                   |

---
