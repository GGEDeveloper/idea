# Data Mapping: Units Table

This document details the mapping of data from the Geko XML feed (`geko_full_en_utf8.xml`) to a potential `Units` table in the database. While the current `database_schema.md` might denormalize unit information directly into the `Products` table, this mapping considers a separate `Units` table for clarity and future extensibility, as hinted by potential future `units.xml` or if stricter normalization is desired.

## Table: `Units`

| Column Name       | Data Type    | XML Source Element/Attribute          | Transformation Notes                                                                                                                                                                                             |
|-------------------|--------------|---------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `internal_unit_id`| SERIAL       | N/A (System Generated)                | Auto-incrementing primary key.                                                                                                                                                                                   |
| `geko_unit_id`    | VARCHAR(50)  | `<unit code="...">` (within `<product>`) | This would be the `code` attribute of the `<unit>` element. This should be unique if units are managed centrally. This ID would be referenced by `Products.unit_geko_id` if a foreign key relationship is used. | 
| `name`            | VARCHAR(100) | `<unit name="...">` (within `<product>`) | This would be the `name` attribute of the `<unit>` element.                                                                                                                                                      |
| `created_at`      | TIMESTAMP    | N/A (System Generated)                | Set to `CURRENT_TIMESTAMP` upon initial insertion.                                                                                                                                                               |
| `updated_at`      | TIMESTAMP    | N/A (System Generated)                | Set to `CURRENT_TIMESTAMP` upon insertion and update.                                                                                                                                                            |

**Notes on `Units` Table Mapping:**

*   **Source of Units:** Unit information (`code` and `name`) is found within the `<unit>` element, which is a child of each `<product>` element in the XML.
*   **Uniqueness:** If a separate `Units` table is implemented, the `geko_unit_id` (derived from `<unit code="...">`) should be unique. The import script would need to collect all unique unit codes and names from the XML.
*   **Current Schema vs. Separate Table:**
    *   **Current `database_schema.md` (denormalized in `Products`):** The columns `Products.unit_code` and `Products.unit_name` would be directly populated from `<unit code="...">` and `<unit name="...">` for each product.
    *   **Separate `Units` Table (this mapping):** The import script would first populate the `Units` table with unique units found in the XML. Then, the `Products` table would have a foreign key (e.g., `unit_internal_id` or `unit_geko_id`) referencing this `Units` table. The memory `[f58181ab-1fc2-4514-ac6a-d3e31011f0ad]` suggests a `units` table with `internal_unit_id (PK), geko_unit_id (UNIQUE), name`. This mapping aligns with that.
*   **Future `units.xml`:** If a dedicated `units.xml` file becomes available, it would likely be the primary source for populating/synchronizing the `Units` table.
*   **Synchronization:** New units encountered in product data would be added to the `Units` table. Updates to unit names (if they can change for a given code) would also need handling.
