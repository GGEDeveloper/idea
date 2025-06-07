# Data Mapping: Prices Table

This document details the mapping of data from the Geko XML feed (`geko_full_en_utf8.xml`) to the `Prices` table in the database, as defined in `docs/database_schema.md`.

## Table: `Prices`

| Column Name             | Data Type    | XML Source Element/Attribute                                | Transformation Notes                                                                                                                               |
|-------------------------|--------------|-------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `internal_price_id`     | SERIAL       | N/A (System Generated)                                      | Auto-incrementing primary key.                                                                                                                     |
| `product_ean`           | VARCHAR(255) | Parent `<product ean="...">`                               | Foreign key referencing `Products(ean)`.                                                                                                           |
| `type`                  | VARCHAR(50)  | `<price type="...">`                                       | The `type` attribute of the `<price>` element (e.g., "net", "gross").                                                                          |
| `net`                   | DECIMAL(10,2)| `<price net="...">`                                        | The `net` attribute of the `<price>` element.                                                                                                      |
| `gross`                 | DECIMAL(10,2)| `<price gross="...">`                                      | The `gross` attribute of the `<price>` element.                                                                                                    |
| `currency`              | VARCHAR(10)  | `<price currency="...">`                                   | The `currency` attribute, if present. Optional.                                                                                                    |
| `created_at`            | TIMESTAMP    | N/A (System Generated)                                      | Set to `CURRENT_TIMESTAMP` upon initial insertion.                                                                                                 |
| `updated_at`            | TIMESTAMP    | N/A (System Generated)                                      | Set to `CURRENT_TIMESTAMP` upon insertion and update.                                                                                              |

**Notes:**
- Each `<product>` can have multiple `<price>` elements (with different types or currencies).
- The `type` field distinguishes between net/gross/other price types.
- If the XML structure changes or new price types are added, the schema and mapping may need adjustment.
- The script must ensure all referenced products exist before inserting prices.
