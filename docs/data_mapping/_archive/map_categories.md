# Mapeamento de Dados: Tabela de Categorias

Este documento detalha o mapeamento de dados do feed XML do Geko (`geko_full_en_utf8.xml`) para a tabela `categories` no banco de dados, conforme definido em `docs/database_schema.md`, e como esses dados são utilizados no frontend.

## Tabela: `categories`

| Nome da Coluna          | Tipo de Dados | Origem do Dado (XML)                                             | Notas de Transformação                                                                                                                                                                                                                          |
|-------------------------|---------------|------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `id_categories`         | SERIAL        | N/A (Gerado pelo Sistema)                                        | Chave primária auto-incremental.                                                                                                                                                                                                               |
| `geko_category_id`      | VARCHAR(255)  | `<category id="...">` (dentro de `<product>` ou seção global)    | Mapeamento direto do atributo `id`. Deve ser único. Usado para vincular produtos através da tabela `product_categories`.                                                         |
| `name`                  | VARCHAR(255)  | Conteúdo da tag `<category>` ou sub-tag `<name>`                 | Texto do conteúdo. Atributo `lang` (ex: `lang="en"`) é considerado. O esquema atual assume um único campo de nome.                                                              |
| `path`                  | VARCHAR(255)  | Estrutura hierárquica no XML                                     | Caminho completo da categoria na hierarquia (ex: "Pai > Filho > Neto").                                                                                                        |
| `parent_geko_category_id` | VARCHAR(255) | Hierarquia no XML ou formato do ID (ex: "1.1" tem pai "1")     | Derivado da estrutura hierárquica no XML. Pode ser NULL para categorias raiz. Chave estrangeira para `categories(geko_category_id)`.                                               |
| `created_at`            | TIMESTAMP     | N/A (Gerado pelo Sistema)                                        | Definido como `CURRENT_TIMESTAMP` na inserção inicial.                                                                                                                           |
| `updated_at`            | TIMESTAMP     | N/A (Gerado pelo Sistema)                                        | Atualizado para `CURRENT_TIMESTAMP` na inserção e atualização.                                                                                                                  |

## Uso no Frontend

### Endpoint da API

O frontend consome as categorias através do endpoint `/api/products/categories`, que retorna:

```json
[
  {
    "id": "107712",
    "name": "Garden",
    "path": "Garden",
    "parent_id": null,
    "product_count": 501,
    "icon": "hammer",
    "description": "Produtos na categoria Garden"
  },
  ...
]
```

### Mapeamento de Ícones

O frontend mapeia automaticamente ícones para cada categoria com base no nome:

- **Garden/Outdoor:** `fa-leaf`
- **Tools/Ferramentas:** `fa-tools`
- **Construction/Construção:** `fa-hammer`
- **Workshop/Oficina:** `fa-wrench`
- **Service/Manutenção:** `fa-tools`
- **Electric/Elétrico:** `fa-bolt`
- **Plumbing/Encanamento:** `fa-faucet`
- **Painting/Pintura:** `fa-paint-roller`
- **Safety/Segurança:** `fa-shield-alt`
- **Automotive/Automóvel:** `fa-car`

### Cores Dinâmicas

As cores de fundo são geradas dinamicamente com base no hash do nome da categoria, garantindo consistência entre carregamentos.

## Notas de Implementação

* **Fonte das Categorias:** Podem aparecer diretamente em cada elemento `<product>` ou em uma seção global `<categories>`.
* **Unicidade:** `geko_category_id` deve ser único em toda a tabela.
* **Hierarquia:** A relação pai-filho é mantida através de `parent_geko_category_id`.
* **Idioma:** Atualmente suporta apenas um idioma por categoria.
* **Sincronização:** As categorias são sincronizadas durante a importação inicial dos produtos.

## Consultas SQL Úteis

### Contar produtos por categoria

```sql
SELECT 
  c.geko_category_id as id,
  c.name,
  COUNT(pc.ean) as product_count
FROM categories c
LEFT JOIN product_categories pc ON c.geko_category_id = pc.geko_category_id
GROUP BY c.geko_category_id, c.name
ORDER BY product_count DESC;
```

### Buscar categorias principais (sem pai)

```sql
SELECT * FROM categories 
WHERE parent_geko_category_id IS NULL
ORDER BY name;
```

### Buscar subcategorias de uma categoria específica

```sql
SELECT * FROM categories 
WHERE parent_geko_category_id = 'ID_DA_CATEGORIA_PAI' 
ORDER BY name;
``` synchronizing, new categories should be added. Updates to category names or hierarchy should also be handled.
