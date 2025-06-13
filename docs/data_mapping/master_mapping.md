# Master Data Mapping: Geko XML to IDEA Database

**Data:** 2025-06-13  
**Autor:** Cascade AI  
**Versão:** 1.0

> **AVISO:** Este documento substitui todos os ficheiros `map_*.md` anteriores e é a única fonte de verdade (`source of truth`) para o mapeamento de dados entre o `geko_full_en_utf8.xml` e o schema definido em `docs/database_schema.sql`.

---

## Princípios Gerais de Mapeamento

1.  **Chave Primária Universal:** O `ean` do produto é a chave de negócio principal, usada para todas as relações.
2.  **Tipos de Dados:** Todos os dados são limpos e convertidos para os tipos corretos (`NUMERIC`, `INTEGER`, `BOOLEAN`) durante a importação.
3.  **Integridade Referencial:** A importação deve respeitar a ordem de dependência para satisfazer as `FOREIGN KEY` constraints.

---

## Mapeamento por Tabela

### 1. Tabela: `products`

| Coluna | Tipo de Dados | Origem XML | Notas de Transformação |
| :--- | :--- | :--- | :--- |
| `ean` | `TEXT` | `<product ean="...">` | Chave Primária. Mapeamento direto. |
| `productid` | `TEXT` | `<product id="...">` | ID legado. Mapeamento direto. Deve ser `UNIQUE`. |
| `name` | `TEXT` | `<card lang="...">` | Extrair conteúdo do CDATA. Usar o idioma principal. |
| `shortdescription`| `TEXT` | `<description type="short">` | Extrair conteúdo do CDATA. |
| `longdescription` | `TEXT` | `<description type="long">` | Extrair conteúdo do CDATA. Pode conter HTML. |
| `brand` | `TEXT` | `<producer name="...">` | Mapeamento direto do nome do produtor. |
| `active` | `BOOLEAN` | `<product active="...">` | Converter "1" para `true`, "0" para `false`. |

### 2. Tabela: `categories` e `product_categories`

-   **`categories`:**
    -   `categoryid`: `<category id="...">`
    -   `name`: Conteúdo da tag `<category>`
    -   `path`: `<category path="...">`
    -   `parent_id`: Derivado do `path` ou da estrutura hierárquica.
-   **`product_categories` (Tabela de Junção):**
    -   `product_ean`: O `ean` do produto em questão.
    -   `category_id`: O `categoryid` da categoria associada.

### 3. Tabela: `product_images`

| Coluna | Tipo de Dados | Origem XML | Notas de Transformação |
| :--- | :--- | :--- | :--- |
| `imageid` | `SERIAL` | N/A | Gerado automaticamente. |
| `ean` | `TEXT` | `<product ean="...">` (Pai) | Chave estrangeira para `products`. |
| `url` | `TEXT` | `<image url="...">` | Mapeamento direto. |
| `alt` | `TEXT` | N/A | Gerar texto alternativo a partir do `products.name`. |
| `is_primary` | `BOOLEAN` | `<image main="1">` | `true` se `main="1"`, ou para a primeira imagem por ordem se não especificado. |

### 4. Tabela: `product_variants`

| Coluna | Tipo de Dados | Origem XML | Notas de Transformação |
| :--- | :--- | :--- | :--- |
| `variantid` | `TEXT` | `<size code="...">` | Chave primária da variante. |
| `ean` | `TEXT` | `<product ean="...">` (Pai) | Chave estrangeira para `products`. |
| `name` | `TEXT` | Conteúdo da tag `<size>` | Ex: "XL", "42", "100ml". |
| `stockquantity` | `INTEGER` | `<stock quantity="...">` | Quantidade obtida da tag `<stock>` correspondente, ligada via `stock_id`. |

### 5. Tabela: `product_attributes`

-   **`product_ean`**: O `ean` do produto em questão.
-   **`key`**: `<attribute name="...">`
-   **`value`**: Conteúdo da tag `<attribute>`

### 6. Tabelas: `price_lists` e `prices`

-   **`price_lists`:**
    -   Esta tabela não é populada a partir do XML. Deve ser pré-populada (`seeded`) com as listas de preços do negócio (ex: 'Preço Base', 'Preço Revenda').
-   **`prices`:**
    | Coluna | Tipo de Dados | Origem XML | Notas de Transformação |
    | :--- | :--- | :--- | :--- |
    | `product_ean` | `TEXT` | `<product ean="...">` (Pai) | Chave estrangeira para `products`. |
    | `price_list_id` | `INTEGER` | N/A | Chave estrangeira para `price_lists`. O script de importação decide a que lista o preço pertence. |
    | `price` | `NUMERIC` | `<price gross="...">` | Converter para `NUMERIC`. O script associa o valor à lista de preços correta. |
