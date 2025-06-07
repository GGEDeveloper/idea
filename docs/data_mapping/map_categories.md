# Data Mapping: Categories Table

This document details the mapping of data from the Geko XML feed (`geko_full_en_utf8.xml`) to the `Categories` table in the database, as defined in `docs/database_schema.md`.

## Table: `Categories`

| Column Name             | Data Type    | XML Source Element/Attribute                                      | Transformation Notes                                                                                                                                                                                                                            |
|-------------------------|--------------|-------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `internal_category_id`  | SERIAL       | N/A (System Generated)                                            | Auto-incrementing primary key.                                                                                                                                                                                                                  |
| `geko_category_id`      | VARCHAR(255) | `<category id="...">` (within `<product>` or a global `<categories>` section) | Direct mapping from the `id` attribute. This should be unique. This ID is used to link products via the `ProductCategories` table.                                                                                                   |
| `name`                  | VARCHAR(255) | `<category ...>Category Name</category>` (content of the element) or `<name>` sub-element if categories are structured hierarchically. | Extract text content. The `lang` attribute (e.g., `lang="pol"`) should be noted; the schema currently assumes one name field. If multi-language support for category names is needed, the schema would require adjustment. For now, assume Polish name. |
| `parent_geko_category_id` | VARCHAR(255) | Implied by nesting in a global `<categories>` section, or potentially from the `geko_category_id` format itself (e.g., "1.1" has parent "1"). | This requires careful parsing of the XML. If a global hierarchical category structure exists (e.g., `<categories><category id="1"><name>P1</name><category id="1.1"><name>C1</name></category></category></categories>`), the parent ID is derived from the structure. If categories are only listed per product without hierarchy, this might be NULL or require external mapping. The import script will need logic to resolve parent IDs. Foreign key to `Categories(geko_category_id)`. |
| `created_at`            | TIMESTAMP    | N/A (System Generated)                                            | Set to `CURRENT_TIMESTAMP` upon initial insertion.                                                                                                                                                                                              |
| `updated_at`            | TIMESTAMP    | N/A (System Generated)                                            | Set to `CURRENT_TIMESTAMP` upon insertion and update.                                                                                                                                                                                           |

**Notes on `Categories` Table Mapping:**

*   **Source of Categories:** Categories can appear directly within each `<product>` element. The IOF 2.6 standard also allows for a global `<categories>` section which can define a hierarchy. The import script must be prepared to handle both:
    1.  Extract unique categories from all `<product><category ...></category></product>` tags.
    2.  If a global `<categories>` section exists, parse it to build the hierarchy and potentially discover categories not directly associated with any product yet.
*   **Uniqueness:** `geko_category_id` must be unique. The import script should collect all unique categories encountered in the XML.
*   **Hierarchy (`parent_geko_category_id`):**
    *   If a global hierarchical section is present, the parent-child relationships are derived from the XML structure.
    *   If category IDs themselves encode hierarchy (e.g., "10", "10-01", "10-01-A"), logic can be built to parse this.
    *   If categories are only found flatly within products, `parent_geko_category_id` will likely be `NULL` for these entries unless an external mapping or convention is provided.
*   **Language:** The XML specifies `lang` for category names. The current schema has a single `name` field. If multiple languages are required, the `Categories` table (and `ProductCategories` if names are overridden per product) would need schema changes (e.g., a separate `CategoryTranslations` table). For now, we assume the primary language (e.g., Polish) is stored.
*   **Synchronization:** When synchronizing, new categories should be added. Updates to category names or hierarchy should also be handled.
