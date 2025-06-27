# Data Mapping: ProductCategories Table

This document details the mapping of data from the Geko XML feed (`geko_full_en_utf8.xml`) to the `ProductCategories` junction table in the database. This table links products to their respective categories.

## Table: `ProductCategories`

| Column Name             | Data Type    | XML Source Element/Attribute                                                                 | Transformation Notes                                                                                                                                                                                                                                                                                                                                                        |
|-------------------------|--------------|----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `product_ean`           | VARCHAR(255) | `<product ean="...">` (The EAN of the product to which the category is being linked)         | This is a foreign key referencing `Products(ean)`. For each `<category>` element found within a `<product>` element in the XML, a record will be created in this table linking the product's EAN to the category's Geko ID.                                                                                                                                               |
| `geko_category_id`      | VARCHAR(255) | `<category id="...">` (The ID of the category, found within a `<product>` element)           | This is a foreign key referencing `Categories(geko_category_id)`. The import script must ensure that the category (identified by this `geko_category_id`) already exists in the `Categories` table before attempting to create this link. If the category does not exist, it should be created in the `Categories` table first (or as part of a batch process for new categories). |
| `is_primary`            | BOOLEAN      | Potentially an attribute on `<category>` like `is_primary="true"`, or by order (e.g., the first category listed). | The IOF 2.6 XML does not explicitly define a "primary" category for a product within the `<product>` block. If such a concept is needed, a convention must be established (e.g., the first category listed for a product is primary, or an external mapping). For now, assume `FALSE` or `NULL` if not explicitly determinable. Default to `FALSE`.                               | 
| `created_at`            | TIMESTAMP    | N/A (System Generated)                                                                       | Set to `CURRENT_TIMESTAMP` upon initial insertion.                                                                                                                                                                                                                                                                                                                          |

**Notes on `ProductCategories` Table Mapping:**

*   **Source:** For every `<product>` in the XML, iterate through its child `<category>` elements. Each such `<category>` element signifies a link between that product and the category specified by `<category id="...">`.
*   **Composite Primary Key:** The combination of `product_ean` and `geko_category_id` should form the primary key for this table, ensuring that a product is not linked to the same category multiple times.
*   **Data Integrity:**
    *   The `product_ean` must exist in the `Products` table.
    *   The `geko_category_id` must exist in the `Categories` table. The import script needs to handle the order of operations or pre-populate all unique categories first.
*   **Multiple Categories:** A single product can belong to multiple categories. The XML structure `<product>...<category id="A"></category><category id="B"></category>...</product>` implies the product is in category A and category B.
*   **Synchronization:**
    *   During a full import, all links are created.
    *   During synchronization, if a product's categories change (categories added or removed in the XML for that product), the `ProductCategories` table must be updated accordingly. This might involve deleting old links and inserting new ones for a given `product_ean`.
