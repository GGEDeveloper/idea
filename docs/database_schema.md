# Product Catalog Database Schema

This document outlines the proposed database schema for the Geko product catalog, based on analysis of the `geko_full_en_utf8.xml` (IOF 2.6 format) and `info-geko-api-users.txt`.

## Guiding Principles

-   **EAN as Primary Product Identifier**: Products are primarily identified and synchronized using their EAN codes.
-   **Handling Product Variants**: The schema supports products with variants (e.g., different sizes) where each variant can have its own stock information.
-   **Extensibility for Attributes**: Placeholder tables for structured product attributes are included, anticipating future availability of `parameters.xml` or similar data from Geko, as hinted by API filtering capabilities.
-   **Data Integrity**: Foreign keys and unique constraints are used to maintain data integrity.
-   **Timestamping**: Timestamps are included for tracking updates and synchronization.

## Tables

### 1. `Products`

Stores core information about each product group.

| Column Name         | Data Type          | Constraints                                  | Description                                                                 | XML Source                                     |
| ------------------- | ------------------ | -------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------- |
| `ean`               | VARCHAR(255)       | PRIMARY KEY, UNIQUE, NOT NULL                | Main EAN code for the product or product group.                             | `<product ean=\"...\">`                          |
| `geko_product_id`   | VARCHAR(255)       | UNIQUE, NOT NULL                             | Geko's internal product ID.                                                 | `<product id=\"...\">`                           |
| `producer_id`       | VARCHAR(255)       | NULLABLE                                     | Geko's producer ID.                                                         | `<producer id=\"...\">`                          |
| `producer_name`     | VARCHAR(255)       | NULLABLE                                     | Producer name.                                                              | `<producer name=\"...\">`                        |
| `base_name`         | TEXT               | NOT NULL                                     | Base name of the product, common to all variants.                           | `<card>`                                       |
| `short_desc_pol`    | TEXT               | NULLABLE                                     | Short description in Polish.                                                | `<description lang=\"pol\" type=\"short\">`        |
| `long_desc_pol`     | TEXT               | NULLABLE                                     | Long description in Polish, may contain technical specs.                    | `<description lang=\"pol\" type=\"long\">`         |
| `vat_rate`          | DECIMAL(5,2)       | NOT NULL                                     | VAT rate applicable to the product.                                         | `<product vat=\"...\">`                          |
| `unit_code`         | VARCHAR(50)        | NULLABLE                                     | Unit code (e.g., \"szt\").                                                    | `<unit code=\"...\">`                            |
| `unit_name`         | VARCHAR(100)       | NULLABLE                                     | Unit name (e.g., \"sztuka\").                                                 | `<unit name=\"...\">`                            |
| `has_variants`      | BOOLEAN            | NOT NULL, DEFAULT FALSE                      | Flag indicating if the product has variants (derived from presence of `<sizes>`). | Presence of `<sizes>` element                  |
| `geko_updated_at`   | TIMESTAMP          | NULLABLE                                     | Timestamp of last update from Geko XML.                                     | `<product updated_at=\"...\">`                   |
| `created_at`        | TIMESTAMP          | NOT NULL, DEFAULT CURRENT_TIMESTAMP          | Record creation timestamp in local DB.                                      | System Generated                               |
| `updated_at`        | TIMESTAMP          | NOT NULL, DEFAULT CURRENT_TIMESTAMP          | Record last update timestamp in local DB.                                   | System Generated                               |

*Indexes: `ean` (PK), `geko_product_id`*

### 2. `ProductVariants`

Stores information about specific variants of a product (e.g., different sizes, colors). Only populated if `Products.has_variants` is TRUE.

| Column Name             | Data Type    | Constraints                                     | Description                                                                   | XML Source                                      |
| ----------------------- | ------------ | ----------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------- |
| `variant_id`            | INTEGER      | PRIMARY KEY, AUTO_INCREMENT                     | Internal unique ID for the variant.                                           | System Generated                                |
| `product_ean`           | VARCHAR(255) | NOT NULL, FOREIGN KEY (`Products.ean`)          | EAN of the parent product.                                                    | Parent `<product ean=\"...\">`                    |
| `size_code_producer`    | VARCHAR(255) | NULLABLE                                        | Producer's code for the size/variant.                                         | `<size code_producer=\"...\">`                     |
| `size_code`             | VARCHAR(255) | NULLABLE                                        | General code for the size/variant.                                            | `<size code=\"...\">`                             |
| `geko_variant_stock_id` | VARCHAR(255) | NULLABLE                                        | Reference ID from `<size stock_id=\"...\">`, links to a specific stock entry.   | `<size stock_id=\"...\">`                         |
| *Unique Constraint: (`product_ean`, `size_code_producer`, `size_code`)* |              |                                                 | Ensures variant uniqueness within a product.                                  |                                                 |

*Indexes: `variant_id` (PK), `product_ean`, `geko_variant_stock_id`, (`product_ean`, `size_code_producer`, `size_code`)*

### 3. `Categories`

Stores product categories.

| Column Name         | Data Type    | Constraints                   | Description                                   | XML Source                               |
| ------------------- | ------------ | ----------------------------- | --------------------------------------------- | ---------------------------------------- |
| `category_id`       | INTEGER      | PRIMARY KEY, AUTO_INCREMENT   | Internal unique ID for the category.          | System Generated                         |
| `geko_category_id`  | VARCHAR(255) | UNIQUE, NULLABLE              | Geko's category ID.                           | `<category id=\"...\">`                    |
| `name_pol`          | VARCHAR(255) | NOT NULL                      | Category name in Polish.                      | `<category lang=\"pol\">`                  |
| `name_eng`          | VARCHAR(255) | NULLABLE                      | Category name in English (if available).      | `<category lang=\"eng\">`                  |
| `path_pol`          | TEXT         | NULLABLE                      | Full category path in Polish (e.g., \"Elektronika/Audio\"). | `<product category_path=\"...\">`         |
| `parent_category_id`| INTEGER      | NULLABLE, FOREIGN KEY (`Categories.category_id`) | For hierarchical categories.                | Derived if paths are parsable          |


*Indexes: `category_id` (PK), `geko_category_id`, `name_pol`*

### 4. `ProductCategories`

Junction table for the many-to-many relationship between products and categories. A product can belong to multiple categories.

| Column Name   | Data Type    | Constraints                                           | Description                          |
| ------------- | ------------ | ----------------------------------------------------- | ------------------------------------ |
| `product_ean` | VARCHAR(255) | NOT NULL, FOREIGN KEY (`Products.ean`)                | EAN of the product.                  |
| `category_id` | INTEGER      | NOT NULL, FOREIGN KEY (`Categories.category_id`)      | ID of the category.                  |
| *PRIMARY KEY (`product_ean`, `category_id`)* |              |                                                       |                                      |

*Indexes: (`product_ean`, `category_id`) (PK), `product_ean`, `category_id`*

### 5. `Prices`

Stores price information for products. Assumes prices are per-product (EAN), not per-variant, based on XML structure.

| Column Name   | Data Type     | Constraints                               | Description                                      | XML Source                               |
| ------------- | ------------- | ----------------------------------------- | ------------------------------------------------ | ---------------------------------------- |
| `price_id`    | INTEGER       | PRIMARY KEY, AUTO_INCREMENT               | Internal unique ID for the price entry.          | System Generated                         |
| `product_ean` | VARCHAR(255)  | NOT NULL, FOREIGN KEY (`Products.ean`)    | EAN of the product this price applies to.        | Parent `<product ean=\"...\">`             |
| `price_type`  | VARCHAR(50)   | NOT NULL                                  | Type of price (e.g., \"net\", \"gross\", \"suggested\"). | `<price type=\"...\">`                     |
| `net_value`   | DECIMAL(10,2) | NULLABLE                                  | Net price value.                                 | `<price net=\"...\">`                      |
| `gross_value` | DECIMAL(10,2) | NULLABLE                                  | Gross price value.                               | `<price gross=\"...\">`                    |
| `currency`    | VARCHAR(10)   | NOT NULL, DEFAULT 'PLN'                   | Currency code (e.g., PLN).                       | Assumed, or from `<price currency=\"...\">` if present |

*Indexes: `price_id` (PK), `product_ean`*

### 6. `StockEntries`

Stores stock levels for products or product variants.

| Column Name              | Data Type    | Constraints                                      | Description                                                              | XML Source                                                                 |
| ------------------------ | ------------ | ------------------------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `stock_entry_id`         | INTEGER      | PRIMARY KEY, AUTO_INCREMENT                      | Internal unique ID for the stock entry.                                  | System Generated                                                           |
| `geko_stock_id`          | VARCHAR(255) | UNIQUE, NOT NULL                                 | Geko's stock identifier (`id` from `<stock id=\"...\">` or `id_mag` from `<stock id_mag=\"...\">`). | `<stock id=\"...\">` or `<stock id_mag=\"...\">`                               |
| `product_ean`            | VARCHAR(255) | NOT NULL, FOREIGN KEY (`Products.ean`)           | EAN of the parent product.                                               | Parent `<product ean=\"...\">`                                               |
| `variant_id`             | INTEGER      | NULLABLE, FOREIGN KEY (`ProductVariants.variant_id`) | If stock is for a specific variant, else NULL.                           | Link via `ProductVariants.geko_variant_stock_id` = `StockEntries.geko_stock_id` |
| `quantity`               | INTEGER      | NOT NULL                                         | Stock quantity.                                                          | `<stock quantity=\"...\">`                                                   |
| `availability_id_geko`   | VARCHAR(255) | NULLABLE                                         | Geko's availability ID.                                                  | `<stock availability_id=\"...\">`                                            |
| `warehouse_name_geko`    | VARCHAR(255) | NULLABLE                                         | Name/ID of the warehouse if applicable (derived from `geko_stock_id`).   | Derived from context of `id` or `id_mag`                                   |
| `last_synced_at`         | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP              | Timestamp of last sync for this stock entry.                             | System Generated                                                           |

*Indexes: `stock_entry_id` (PK), `geko_stock_id` (UNIQUE), `product_ean`, `variant_id`*

### 7. `ProductImages`

Stores URLs and metadata for product images.

| Column Name         | Data Type     | Constraints                               | Description                               | XML Source                               |
| ------------------- | ------------- | ----------------------------------------- | ----------------------------------------- | ---------------------------------------- |
| `image_id`          | INTEGER       | PRIMARY KEY, AUTO_INCREMENT               | Internal unique ID for the image.         | System Generated                         |
| `product_ean`       | VARCHAR(255)  | NOT NULL, FOREIGN KEY (`Products.ean`)    | EAN of the product this image belongs to. | Parent `<product ean=\"...\">`             |
| `image_url`         | VARCHAR(2048) | NOT NULL                                  | URL of the image.                         | `<image url=\"...\">`                      |
| `image_type`        | VARCHAR(50)   | NULLABLE                                  | Type of image (e.g., \"main\", \"thumbnail\").| `<image type=\"...\">`                     |
| `width`             | INTEGER       | NULLABLE                                  | Image width in pixels.                    | `<image width=\"...\">`                    |
| `height`            | INTEGER       | NULLABLE                                  | Image height in pixels.                   | `<image height=\"...\">`                   |
| `geko_updated_at`   | TIMESTAMP     | NULLABLE                                  | Timestamp of image update from Geko XML.  | `<image updated_at=\"...\">`              |

*Indexes: `image_id` (PK), `product_ean`*

### 8. `Attributes` (Future Use)

For storing definitions of structured product attributes/features, expected from `parameters.xml` or similar.

| Column Name           | Data Type    | Constraints                 | Description                                                        |
| --------------------- | ------------ | --------------------------- | ------------------------------------------------------------------ |
| `attribute_id`        | INTEGER      | PRIMARY KEY, AUTO_INCREMENT | Internal unique ID for the attribute.                              |
| `geko_feature_id`     | VARCHAR(255) | UNIQUE, NULLABLE            | Geko's feature ID (for API filtering).                             |
| `attribute_name`      | VARCHAR(255) | UNIQUE, NOT NULL            | Name of the attribute (e.g., \"Color\", \"RAM\").                      |
| `attribute_desc`      | TEXT         | NULLABLE                    | Description of the attribute.                                      |
| `attribute_type`      | VARCHAR(50)  | NULLABLE                    | Data type of the attribute (e.g., 'TEXT', 'NUMBER', 'BOOLEAN').    |

*Indexes: `attribute_id` (PK), `geko_feature_id`, `attribute_name`*

### 9. `AttributeValues` (Future Use)

Stores predefined values for certain attributes (e.g., list of possible colors).

| Column Name        | Data Type    | Constraints                                  | Description                                                     |
| ------------------ | ------------ | -------------------------------------------- | --------------------------------------------------------------- |
| `value_id`         | INTEGER      | PRIMARY KEY, AUTO_INCREMENT                  | Internal unique ID for the attribute value.                     |
| `attribute_id`     | INTEGER      | NOT NULL, FOREIGN KEY (`Attributes.attribute_id`) | Attribute this value belongs to.                                |
| `geko_value_id`    | VARCHAR(255) | UNIQUE, NULLABLE                             | Geko's ID for this specific attribute value.                    |
| `value_content`    | TEXT         | NOT NULL                                     | The actual value (e.g., \"Red\", \"16GB\").                         |

*Indexes: `value_id` (PK), `attribute_id`, `geko_value_id`*

### 10. `ProductAttributes` (Future Use)

Junction table linking products to their specific attribute values.

| Column Name         | Data Type    | Constraints                                           | Description                                    |
| ------------------- | ------------ | ----------------------------------------------------- | ---------------------------------------------- |
| `product_ean`       | VARCHAR(255) | NOT NULL, FOREIGN KEY (`Products.ean`)                | EAN of the product.                            |
| `attribute_id`      | INTEGER      | NOT NULL, FOREIGN KEY (`Attributes.attribute_id`)     | ID of the attribute.                           |
| `value_id`          | INTEGER      | NULLABLE, FOREIGN KEY (`AttributeValues.value_id`)    | ID of the predefined attribute value (if any). |
| `custom_value_text` | TEXT         | NULLABLE                                              | Custom value if not from predefined list.      |
| *PRIMARY KEY (`product_ean`, `attribute_id`)* |              |                                                       |                                                |

*Indexes: (`product_ean`, `attribute_id`) (PK), `product_ean`, `attribute_id`, `value_id`*

## Notes on Data Extraction and Population

-   **Categories**: The `<product>` element contains `<category id=\"...\" lang=\"pol\">...</category>`. A separate `Categories` table should be populated from unique category entries. The `ProductCategories` junction table will link products to categories.
-   **Units**: Similar to categories, `<unit id=\"...\" name=\"...\">` within `<product>` will populate a `Units` table.
-   **Variants/Sizes**: The `<sizes>` element within `<product>` lists variants. Each `<size>` can have its own `code_producer`, `code`, and `stock_id`. This suggests a `ProductVariants` table linked to `Products` and `StockEntries`.
-   **Stock**: `<stock id=\"...\" quantity=\"...\" availability_id=\"...\">`. The `id` here seems to be the link for `ProductVariants.geko_variant_stock_id`.
-   **Prices**: `<price type=\"...\" net=\"...\" gross=\"...\">` within `<product>`. Assumed to be per product (EAN).
-   **Images**: `<images><image url=\"...\" type=\"...\" width=\"...\" height=\"...\" updated_at=\"...\"></image></images>`.
-   **Descriptions**: `<description lang=\"pol\" type=\"short\">` and `<description lang=\"pol\" type=\"long\">` provide textual descriptions. The long description often contains technical specifications as unstructured text.
-   **Attributes (Future)**: The current XML does not explicitly list structured attributes with IDs as per the IOF 2.6 `parameters.xml` specification. The `Attributes`, `AttributeValues`, and `ProductAttributes` tables are designed for future integration if Geko provides this data, especially considering the API's capability to filter by \"feature ID's\".

## Synchronization Strategy

-   **Products**: Use EAN as the primary key for upserting product data.
-   **Stock/Prices**: Update based on EAN and potentially variant identifiers. Timestamps in the XML (`updated_at`) can help identify changed records.
-   **Incremental Updates**: The API updates files multiple times a day. A robust synchronization process will be needed to fetch and process these updates efficiently.
