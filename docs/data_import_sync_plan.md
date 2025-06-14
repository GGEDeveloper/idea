# Data Import and Synchronization Plan (v2.0)

**Data:** 2025-06-13  
**Autor:** Cascade AI  
**Status:** Ativo

> **AVISO:** Este documento substitui a versão anterior e está alinhado com o schema de base de dados definido em `docs/database_schema.sql` (versão 2.1 ou superior) e com o `docs/data_mapping/master_mapping.md`.

---

## 1. Objetivo e Estratégia

O objetivo é popular e sincronizar a base de dados do projeto IDEA com o feed XML da Geko de forma eficiente, robusta e segura, respeitando a integridade referencial imposta pelas `FOREIGN KEY` constraints.

**Estratégia:** Um processo de importação em lote (`bulk import`) que segue uma ordem estrita de dependências, com validação e limpeza de dados em cada etapa.

---

## 2. Ordem de Importação (Respeitando Foreign Keys)

A importação **DEVE** seguir esta ordem para evitar erros de integridade referencial:

1.  **`price_lists` (Seed):** Esta tabela não vem do XML. Deve ser populada manualmente ou por um script de *seed* com as listas de preços do negócio (ex: 'Base', 'Revenda').
2.  **`categories`:** Importar todas as categorias primeiro, pois são referenciadas pelos produtos.
3.  **`products`:** Importar os dados base dos produtos.
4.  **`product_categories`:** Com produtos e categorias na base de dados, criar as associações.
5.  **`product_images`:** Associar imagens aos produtos existentes.
6.  **`product_variants`:** Importar as variantes (que contêm o stock) e associá-las aos produtos.
7.  **`product_attributes`:** Importar os atributos técnicos e associá-los aos produtos.
8.  **`prices`:** Finalmente, com produtos e listas de preços disponíveis, importar os preços e associá-los a ambos.

---

## 3. Pipeline do Script de Importação (Python)

O processo será orquestrado por um script principal em Python (`run_import.py`) que chama módulos especializados para cada tabela.

### 3.1. Estrutura de Scripts Sugerida

```
/scripts/import/
|-- run_import.py           # Orquestrador principal
|-- /parsers/
|   |-- parse_xml.py        # Lógica de parsing do XML (lxml.iterparse)
|-- /importers/
|   |-- import_categories.py
|   |-- import_products.py
|   |-- import_variants.py
|   |-- import_prices.py
|   |-- ... (etc.)
|-- /database/
|   |-- db_connector.py     # Gestão da conexão com a BD (psycopg2)
|   |-- queries.py          # Funções para INSERT em lote (batch)
|-- /utils/
|   |-- logger.py           # Configuração do logging
|   |-- data_cleaner.py     # Funções para limpar e validar dados
|-- requirements.txt
```

### 3.2. Lógica do Orquestrador (`run_import.py`)

```python
# Pseudocódigo

# 1. Limpar tabelas (opcional, para importação total)
truncate_tables_in_order()

# 2. Seed da tabela price_lists
seed_price_lists()

# 3. Extrair dados do XML
raw_categories = parse_xml('categories')
raw_products = parse_xml('products')
# ... etc

# 4. Limpar e Validar Dados
clean_categories = clean(raw_categories)
clean_products = clean(raw_products)
# ... etc

# 5. Importar para a BD na ordem correta
import_to_db('categories', clean_categories)
import_to_db('products', clean_products)
import_to_db('product_categories', ...)
# ... e assim por diante
```

---

## 4. Estratégia de Sincronização Incremental

Para atualizações futuras, em vez de uma importação total, o script usará uma lógica de `UPSERT`.

-   **Identificação:** Usar o `ean` do produto como chave de conflito.
-   **Lógica:**
    -   `INSERT ... ON CONFLICT (ean) DO UPDATE SET ...` para a tabela `products`.
    -   Para tabelas relacionadas (imagens, variantes, preços), a estratégia será `DELETE` todos os registos antigos para um determinado `ean` e `INSERT` os novos. Isto simplifica a lógica e evita inconsistências, ao custo de uma pequena sobrecarga na escrita.
-   **Remoções:** Produtos que existem na BD mas não no novo XML devem ser marcados como `active = false` na tabela `products`.

---

## 5. Logging e Gestão de Erros

-   **Logging Detalhado:** Todas as etapas (parsing, limpeza, inserção) devem ser registadas num ficheiro de log (`import.log`).
-   **Erros de Validação:** Dados que falhem a validação (ex: um preço que não é um número) devem ser registados num ficheiro de erros (`import_errors.csv`) com o `ean` do produto e o motivo do erro, sem parar a importação dos dados válidos.
-   **Erros de BD:** Erros de integridade (que não deveriam ocorrer se a ordem for respeitada) devem parar a transação atual, fazer `rollback` e registar um erro fatal.
