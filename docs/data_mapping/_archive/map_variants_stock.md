# Data Mapping: ProductVariants and StockEntries Tables

This document details the mapping of data from the Geko XML feed (`geko_full_en_utf8.xml`) to the `ProductVariants` and `StockEntries` tables. These tables handle product variations (like sizes) and their respective stock levels.

The table `ProductVariants` corresponds to `product_sizes` in earlier schema drafts/memory.
The table `StockEntries` corresponds to `stock_levels` in earlier schema drafts/memory.

## Table: `ProductVariants`

This table stores individual variants of a product, typically sizes.

| Column Name             | Data Type    | XML Source Element/Attribute                                  | Transformation Notes                                                                                                                               |
|-------------------------|--------------|---------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `internal_variant_id`   | SERIAL       | N/A (System Generated)                                        | Auto-incrementing primary key.                                                                                                                     |
| `product_ean`           | VARCHAR(255) | Parent `<product ean="...">`                                   | Foreign key referencing `Products(ean)`. This links the variant back to its base product.                                                          |
| `geko_size_code`        | VARCHAR(255) | `<size code="...">` (within `<sizes>`)                        | The `code` attribute of the `<size>` element. Unique with `product_ean`.                                                                          |
| `producer_size_code`    | VARCHAR(255) | `<size code_producer="...">` (within `<sizes>`)               | The `code_producer` attribute of the `<size>` element. Producer's code for the size/variant.                                                      |
| `name`                  | VARCHAR(255) | Content of `<size ...>Size Name</size>` (within `<sizes>`)    | The text content of the `<size>` element, e.g., "XL", "42", "100ml".                                   |
| `geko_stock_id`         | VARCHAR(255) | `<size stock_id="...">` (within `<sizes>`)                    | The `stock_id` attribute of the `<size>` element. Links this variant/size to its corresponding `<stock>` entry.                                    |
| `created_at`            | TIMESTAMP    | N/A (System Generated)                                        | Set to `CURRENT_TIMESTAMP` upon initial insertion.                                                                                                 |
| `updated_at`            | TIMESTAMP    | N/A (System Generated)                                        | Set to `CURRENT_TIMESTAMP` upon insertion and update.                                                                                              |

**Unique Constraint:** (`product_ean`, `geko_size_code`)

## Table: `StockEntries`

This table stores stock level information, typically for each product variant, but can also be for products without variants.

| Column Name             | Data Type    | XML Source Element/Attribute                                | Transformation Notes                                                                                                                               |
|-------------------------|--------------|-------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `internal_stock_id`     | SERIAL       | N/A (System Generated)                                      | Auto-incrementing primary key.                                                                                                                     |
| `geko_stock_id`         | VARCHAR(255) | `<stock id="...">` or `<size stock_id="...">`            | Links to either a variant or a product without variants. Must match the `stock_id` in the variant or the product.                                 |
| `product_variant_id`    | INTEGER      | Linked to `internal_variant_id` in `ProductVariants`         | Foreign key. Null if the stock is for a product without variants.                                                                                  |
| `product_ean`           | VARCHAR(255) | Parent `<product ean="...">`                               | FK to `Products(ean)`. Required for products without variants.                                                                                    |
| `quantity`              | INTEGER      | `<stock quantity="...">`                                   | Direct mapping.                                                                                                                                    |
| `availability_id`       | INTEGER      | `<stock availability_id="...">`                            | Direct mapping. If more info is needed, a lookup table for availability types may be required in the future.                                       |
| `created_at`            | TIMESTAMP    | N/A (System Generated)                                      | Set to `CURRENT_TIMESTAMP` upon initial insertion.                                                                                                 |
| `updated_at`            | TIMESTAMP    | N/A (System Generated)                                      | Set to `CURRENT_TIMESTAMP` upon insertion and update.                                                                                              |

**Notes:**
- For each `<product>`, variants are defined in `<sizes>`, and each `<size>` has a `stock_id` linking to a `<stock>` entry.
- For products without variants, stock is linked directly via the product's EAN.
- The script must ensure that all referenced variants/products exist before inserting stock entries.
- If the XML supports multiple stock locations/types, the schema may need to be extended.
