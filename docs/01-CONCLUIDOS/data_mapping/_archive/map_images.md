# Data Mapping: ProductImages Table

This document details the mapping of data from the Geko XML feed (`geko_full_en_utf8.xml`) to the `ProductImages` table in the database, as defined in `docs/database_schema.md`.

## Table: `ProductImages`

| Column Name             | Data Type    | XML Source Element/Attribute                                | Transformation Notes                                                                                                                               |
|-------------------------|--------------|-------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `internal_image_id`     | SERIAL       | N/A (System Generated)                                      | Auto-incrementing primary key.                                                                                                                     |
| `product_ean`           | VARCHAR(255) | Parent `<product ean="...">`                               | Foreign key referencing `Products(ean)`.                                                                                                           |
| `url`                   | TEXT         | `<image url="...">`                                        | The `url` attribute of the `<image>` element.                                                                                                      |
| `type`                  | VARCHAR(50)  | `<image type="...">`                                       | The `type` attribute (e.g., "main", "thumbnail"). Optional.                                                                                    |
| `width`                 | INTEGER      | `<image width="...">`                                      | The `width` attribute, if present. Optional.                                                                                                       |
| `height`                | INTEGER      | `<image height="...">`                                     | The `height` attribute, if present. Optional.                                                                                                      |
| `is_main`               | BOOLEAN      | Logic: type=="main" or first image per product             | Set to `TRUE` if the image is the main image (by type or by convention).                                                                           |
| `sort_order`            | INTEGER      | Order within `<images>`                                     | The order in which the image appears within the `<images>` block. First image is 1, second is 2, etc.                                              |
| `updated_at`            | TIMESTAMP    | `<image updated_at="...">`                                 | The `updated_at` attribute, if present. Otherwise, set to `CURRENT_TIMESTAMP` on insert/update.                                                    |
| `created_at`            | TIMESTAMP    | N/A (System Generated)                                      | Set to `CURRENT_TIMESTAMP` upon initial insertion.                                                                                                 |

**Notes:**
- Each `<product>` can have multiple `<image>` elements within `<images>`.
- The `is_main` flag is set based on the `type` attribute or the first image if no explicit main is given.
- The script must ensure all referenced products exist before inserting images.
- Additional metadata or image processing (e.g., thumbnail generation) may be handled outside the import process.
