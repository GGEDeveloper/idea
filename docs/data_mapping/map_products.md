# Data Mapping: Products Table

This document details the mapping of data from the Geko XML feed (`geko_full_en_utf8.xml`) to the `Products` table in the database, as defined in `docs/database_schema.md`.

## Table: `Products`

| Column Name         | Data Type    | XML Source Element/Attribute                                  | Transformation Notes                                                                                                                               |
|---------------------|--------------|---------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `ean`               | VARCHAR(255) | `<product ean="...">`                                         | Direct mapping. Ensure uniqueness. This is the primary key.                                                                                        |
| `geko_product_id`   | VARCHAR(255) | `<product id="...">`                                          | Direct mapping. Ensure uniqueness.                                                                                                                 |
| `producer_id`       | VARCHAR(255) | `<producer id="...">`                                         | Direct mapping.                                                                                                                                    |
| `producer_name`     | VARCHAR(255) | `<producer name="...">`                                       | Direct mapping.                                                                                                                                    |
| `base_name`         | TEXT         | `<card lang="pol">` (CDATA content)                           | Extract text content from CDATA. Consider potential HTML entities or other cleanup if necessary. This field should represent the main product name. | 
| `short_desc_pol`    | TEXT         | `<description lang="pol" type="short">` (CDATA content)       | Extract text content from CDATA.                                                                                                                   |
| `long_desc_pol`     | TEXT         | `<description lang="pol" type="long">` (CDATA content)        | Extract text content from CDATA. This often contains detailed technical specifications as unstructured text.                                       |
| `vat_rate`          | DECIMAL(5,2) | `<product vat="...">`                                         | Convert string value (e.g., "23.00") to a decimal/numeric type. Handle potential conversion errors.                                                |
| `unit_code`         | VARCHAR(50)  | `<unit code="...">`                                           | Direct mapping. This refers to the code of the unit.                                                                                               |
| `unit_name`         | VARCHAR(100) | `<unit name="...">`                                           | Direct mapping. This is the descriptive name of the unit.                                                                                          |
| `has_variants`      | BOOLEAN      | Presence of `<sizes>` element within the `<product>` element. | Logic: If `<product>` contains a `<sizes>` child element, set to `TRUE`; otherwise, `FALSE`.                                                       |
| `geko_updated_at`   | TIMESTAMP    | `<product updated_at="...">`                                  | Parse the string (e.g., "YYYY-MM-DD HH:MM:SS") and convert to a standard TIMESTAMP format for the database. Handle potential parsing errors.       |
| `created_at`        | TIMESTAMP    | N/A (System Generated)                                        | Set to `CURRENT_TIMESTAMP` upon initial insertion of the record.                                                                                   |
| `updated_at`        | TIMESTAMP    | N/A (System Generated)                                        | Set to `CURRENT_TIMESTAMP` upon initial insertion and updated whenever the record is modified during synchronization.                              |

**Notes on `Products` Table Mapping:**

*   **Primary Key:** `ean` is the natural key from the XML and will serve as the primary key in the database.
*   **Uniqueness:** `geko_product_id` should also be unique.
*   **Descriptions:** The `short_desc_pol` and `long_desc_pol` fields are expected to be in Polish and may contain HTML or other markup within their CDATA sections. The import script should consider whether to strip markup or store it as is. For now, assume raw extraction.
*   **Units:** The `unit_code` and `unit_name` are denormalized here for direct access. A separate `Units` table might be considered if units have more associated data or if strict normalization is required, but the current schema in `database_schema.md` includes these directly in `Products`.
*   **Categories:** The link to categories is handled via the `ProductCategories` junction table, not directly in `Products` (as per `database_schema.md`).
*   **Prices & Stock:** These are in separate tables (`Prices`, `StockEntries`) linked back to `Products` (or `ProductVariants`).
