## Geko XML Structure Analysis (Based on `data/xml_analisys/chunk_1.xml`)

The XML file provided by Geko for product integration follows a structure common for product data feeds. This document outlines the key elements and attributes relevant for parsing and integrating into the `geko_products` database table.

1.  **Root Element**:
    *   The root element of the document is `<offer>`.
    *   It contains metadata attributes such as `file_format`, `version`, and `generated` (timestamp of file generation).
        ```xml
        <?xml version='1.0' encoding='utf-8' standalone='yes' ?>
        <offer file_format="IOF" version="2.6" generated="14.06.2025 13:06:48">
            <!-- ... content ... -->
        </offer>
        ```

2.  **Products Container**:
    *   Immediately inside `<offer>`, there is a `<products>` element.
    *   This element acts as a container for all individual product listings within the feed.
    *   It has attributes indicating the `language` and `currency` for the product data contained.
        ```xml
        <products language="en" currency="EUR">
            <!-- Individual product elements go here -->
        </products>
        ```

3.  **Individual Product Element**:
    *   The **main repeating tag that represents a single product is `<product>`**.
    *   Each `<product>` element is a direct child of the `<products>` container.
    *   It has several attributes, most importantly `EAN`, which serves as the primary business key.
        ```xml
        <product id="24" vat="0" code="C00049" code_on_card="C00049" EAN="5901477140723" code_producer="5901477140723">
            <!-- All other product details are nested within this tag -->
        </product>
        ```

4.  **Key Data Fields within `<product>` (for `geko_products` table population):**

    *   **EAN Code (Primary Key for `geko_products.ean`)**:
        *   **Location**: Directly as an attribute of the `<product>` tag.
        *   **Example**: `EAN="5901477140723"`
        *   **Notes**: This is the European Article Number and is critical for unique product identification and linking with the main `products` table.

    *   **Supplier Price (for `geko_products.supplier_price`)**:
        *   **Location**: Found within a `<price>` tag, which is a direct child of the `<product>` element.
        *   **Attribute to Use**: The `net` attribute of this top-level `<price>` tag.
        *   **Example**: `<price gross="2.18" net="2.18"/>` (Here, `net="2.18"` would be the supplier price).
        *   **Database Column Type**: `NUMERIC(12,4)`. The XML value is a string (e.g., "2.18") and will need to be parsed into a numeric type.
        *   **Note**: There can be other `<price>` tags nested deeper (e.g., within `<sizes><size>`). For the `geko_products` table, which stores the base supplier data, the direct child `<price>` of `<product>` is the most appropriate source.

    *   **Stock Quantity (for `geko_products.stock_quantity`)**:
        *   **Location**: Nested within `<product> -> <sizes> -> <size> -> <stock>`.
        *   **Attribute to Use**: The `quantity` attribute of the `<stock>` tag.
        *   **Example**: `<stock id="1" quantity="0"/>` or `<stock id="1" quantity="6,00"/>`.
        *   **Database Column Type**: `INTEGER`.
        *   **Important Conversion Note**: The XML sometimes uses a comma as a decimal separator for quantity (e.g., "6,00", "40,83", "162,00"). This string must be parsed and converted to an integer (e.g., 6, 40, 162) before database insertion, typically by truncation. Given the `INTEGER` type in the DB, fractional stock from Geko (if any implied by the comma) is treated as whole units after conversion.

    *   **Raw Data (for `geko_products.raw_data JSONB`)**:
        *   **Content**: The entire XML content of one `<product>...</product>` block, including all nested tags and their CDATA content.
        *   **Purpose**: Storing the original XML for a product allows for auditing, reprocessing if parsing logic changes, or accessing other fields not initially mapped to specific columns.
        *   **Storage Format**: The string content of the `<product>` element will be stored in the JSONB field, typically as a value associated with a key, e.g., `{"xml_product_data": "<product>...</product>"}`.

5.  **Detailed Analysis of Description Fields (`<long_desc>`, `<short_desc>`, nested `<description>`)**:
    *   All three description fields are direct children of the `<product><description>` container element.
    *   **Content-Type**: They primarily contain HTML markup enclosed within `<![CDATA[...]]>` blocks.
    *   **HTML Richness**: The HTML can be quite comprehensive and includes:
        *   Standard text formatting: Paragraphs (`<p>`), bold (`<strong>`), line breaks (`<br/>`).
        *   Headings: `<h4>`, `<h3>` are commonly used for sections like "Charakterystyka produktu" (Product Characteristics), "Specyfikacja techniczna" (Technical Specifications), "Key Product Features," "Suggested Uses," etc.
        *   Lists: Unordered lists (`<ul>`) with list items (`<li>`) are frequent, especially for product features or advantages.
        *   Tables: HTML tables (`<table>`, `<tbody>`, `<tr>`, `<td>`) are used to structure detailed technical data, often listing multiple sub-products/variants with their specific attributes (e.g., product codes, dimensions, material types, package quantities).
        *   Embedded Media:
            *   Images: `<img src="..." />` tags are used to embed product-related images directly within the descriptive text.
            *   Videos: `<iframe>` tags (e.g., for YouTube videos) can also be present, providing multimedia content.
    *   **Language Attribute**: The `<long_desc>` and `<short_desc>` tags usually have an `xml:lang="en"` attribute indicating the language of the content.
    *   **Purpose**: These fields provide rich, often formatted, marketing and technical information about the product. Parsing this HTML for specific details would require a dedicated HTML parsing strategy if individual attributes from within these descriptions are needed for separate database fields in the future. For the `geko_products` table, storing the raw CDATA content (which includes all this HTML) within the `raw_data` JSONB field is the primary approach to preserve this information.

6.  **Other Potentially Useful Fields within `<product>` (Reiteration and Additions):**
    *   `id`: Geko's internal product identifier (e.g., `id="24"`).
    *   `<producer name="..." id="..."/>`: Information about the product manufacturer/supplier (e.g., "GEKO", "Tvardy"). The `id` attribute for producer is often empty.
    *   `<category id="..." name="..." path="..."/>`: Primary category information. There's also a `<category_idosell path="..." />` which seems to be a supplementary categorization, possibly for a specific e-commerce platform (IdoSell).
    *   `<unit id="..." name="..." moq="..."/>`: Unit of measure (e.g., "kpl.", "pcs", "op.zb.") and Minimum Order Quantity (MOQ).
    *   `<card url="..."/>`: URL to the product page on the Geko B2B platform.
    *   `<delivery>`: Can contain an expected delivery/availability date (e.g., `<delivery>15.07.2025</delivery>`) or be empty. The exact semantics of this date would require clarification if it were to be used programmatically.
    *   `<srp gross="" net=""/>`: Suggested Retail Price. Often empty in the observed data, but its presence is noted.
    *   `<sizes>` block:
        *   Contains one or more `<size>` elements. Each `<size>` has its own `code` (often mirroring the main product code or a variant code), `weight`, and `grossWeight` attributes.
        *   Each `<size>` element is the container for the definitive `<stock>` and specific `<price>` for that particular size/variant of the product. For products without explicit variants, there's typically one `<size>` element.
    *   `<images>` block:
        *   `<large>`: Contains one or more `<image url="..."/>` tags, providing URLs for potentially multiple product images.
        *   Other sizes like `<medium>` or `<small>` might exist in the full schema but were not explicitly detailed in the chunks reviewed beyond `<large>`.

## Summary for Parsing and Data Integration:

*   **Core Data for `geko_products`**: The extraction logic for EAN, supplier price (`net` from top-level `<price>`), and stock quantity (from `<sizes><size><stock>`) remains robust based on the initial analysis and is confirmed by the deeper review.
*   **Raw Data Preservation**: The `raw_data` field in `geko_products` (storing the entire `<product>...</product>` XML as a JSON string) is crucial for capturing all details, especially the rich HTML descriptions and any other less frequently used tags/attributes.
*   **HTML Description Handling**: If specific details from within the HTML descriptions (e.g., individual technical specs from tables or lists) are required for other tables or for structured display, a secondary HTML parsing step would be necessary on the content of the `raw_data` field. The current database populating script (`populate_geko_products.py`) does not perform this HTML parsing; it only stores the raw XML string.
*   **Stock Quantity Conversion**: The conversion of stock quantities (e.g., "6,00") to integers by replacing the comma and truncating is appropriate for an `INTEGER` database column, assuming fractional stock units are not a business requirement to be stored with precision.

This comprehensive analysis should provide a solid foundation for understanding the Geko XML feed. 