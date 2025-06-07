# Data Import and Synchronization Plan

This document outlines the strategy and plan for importing product data from the Geko XML feed into the project's database, and for keeping this data synchronized.

## 1. Objective and Scope

-   **Objective**: To accurately and efficiently populate the product catalog database with data from the `geko_full_en_utf8.xml` file and maintain synchronization with subsequent updates to this file.
-   **Scope**: All relevant product information including core details, categories, units, variants (sizes), prices, stock levels, and images as defined in the `docs/database_schema.md`.

## 2. Data Sources and Target

-   **Data Source**: `geko_full_en_utf8.xml` (IOF 2.6 format).
-   **Target Database**: PostgreSQL (assumed, to be confirmed) database, with the schema defined in `docs/database_schema.md`.

## 3. Tools and Technologies Suggested

-   **Programming Language**: Python 3.x
-   **XML Parsing**: `lxml` library (preferred for performance and features) or `xml.etree.ElementTree`.
-   **Database Interaction**: SQLAlchemy (for ORM capabilities and database-agnostic code) or `psycopg2` (for direct PostgreSQL interaction).
-   **Dependency Management**: `pip` with a `requirements.txt` file.

## 4. Detailed Data Mapping (XML to Tables)

Given the complexity and volume of data, the detailed XML-to-table mappings are provided in separate documents within the `docs/data_mapping/` directory. This modular approach enhances clarity and manageability.

Refer to the following documents for specific mappings:

-   [`docs/data_mapping/map_products.md`](./data_mapping/map_products.md): Mapping for the `Products` table.
-   [`docs/data_mapping/map_categories.md`](./data_mapping/map_categories.md): Mapping for the `Categories` table.
-   [`docs/data_mapping/map_units.md`](./data_mapping/map_units.md): Mapping for the `Units` table (if units are to be stored separately and referenced, otherwise integrated into products).
-   [`docs/data_mapping/map_variants_stock.md`](./data_mapping/map_variants_stock.md): Mapping for `ProductVariants` and `StockEntries` tables.
-   [`docs/data_mapping/map_prices.md`](./data_mapping/map_prices.md): Mapping for the `Prices` table.
-   [`docs/data_mapping/map_images.md`](./data_mapping/map_images.md): Mapping for the `ProductImages` table.
-   [`docs/data_mapping/map_product_categories.md`](./data_mapping/map_product_categories.md): Mapping for the `ProductCategories` junction table.

*(These documents will be created and detailed progressively.)*

## 5. Initial Import Strategy (Full Load)

### 5.1. Order of Table Population
To respect foreign key dependencies and maximize efficiency, the recommended order is:
1. `Categories` (reference data)
2. `Units` (reference data)
3. `Products` (references `Categories` and `Units`)
4. `ProductVariants` (if variants exist)
5. `StockEntries` (references variants or products)
6. `Prices` (references products)
7. `ProductImages` (references products)
8. `ProductCategories` (junction table)

### 5.2. Efficient XML Parsing
- Use `lxml.iterparse` for streaming XML parsing (memory efficient for large files).
- Validate and normalize data before DB insertion (e.g., trims, type conversion, uniqueness checks).
- Log parsing steps and errors.

### 5.3. Batch Inserts and Transaction Handling
- Use transactions for each batch of inserts (e.g., 500–1000 records per transaction).
- Use `executemany` (psycopg2) or `bulk_save_objects` (SQLAlchemy) for batch operations.
- For very large volumes, consider using PostgreSQL `COPY` for bulk loading.
- Rollback batch on critical errors; log details for review.

### 5.4. Error Handling
- Capture and log parsing, validation, and integrity errors (FK, uniqueness).
- Write error details to `LOG_ERROS.md` with timestamps and context.

### 5.5. Example Import Pipeline (Pseudocode)
```python
for table in [Categories, Units, Products, ProductVariants, StockEntries, Prices, ProductImages, ProductCategories]:
    with db.transaction():
        for batch in parse_xml_for_table(table, batch_size=1000):
            try:
                db.bulk_insert(table, batch)
            except Exception as e:
                log_error(e, batch)
                db.rollback()
```

### 5.6. Directory Structure for Scripts
```
import_scripts/
  ├── __init__.py
  ├── parse_xml.py
  ├── import_categories.py
  ├── import_units.py
  ├── import_products.py
  ├── import_variants.py
  ├── import_stock.py
  ├── import_prices.py
  ├── import_images.py
  ├── import_product_categories.py
  └── utils.py
requirements.txt
```

### 5.7. Logging & Reporting
- Log all critical operations: batch start/end, errors, import stats.
- Separate logs for errors (`LOG_ERROS.md`), prompts/decisions (`LOG_PROMPTS.md`), technical actions (`LOG_CODE.md`).
- Generate summary report after each import (products imported, updated, errors, etc).

## 6. Incremental Synchronization Strategy

### 6.1. Synchronization Frequency
- Schedule regular syncs (e.g., via cron, or triggered by new XML availability).
- Frequency depends on business needs and update frequency of Geko feed.

### 6.2. Identifying New, Updated, or Removed Records
- Use `ean` and `updated_at` from XML to detect new or changed products.
- For removals: compare current DB EANs with EANs in latest XML; mark as inactive or delete as per business logic.

### 6.3. Upsert Logic
- Use PostgreSQL `INSERT ... ON CONFLICT ... DO UPDATE` for upserts (supported by Neon).
- Apply upsert for products, variants, prices, stock, images, categories.
- Update related tables (e.g., if product changes, update its prices, stock, images, categories).

### 6.4. Data Integrity & Performance
- Ensure all FK relationships are respected on update.
- Use batch upserts for efficiency.
- Maintain indexes on keys and timestamps for fast lookup.

### 6.5. Error Handling & Logging
- Log all sync operations, especially conflicts and errors.
- Write detailed error reports to `LOG_ERROS.md`.

### 6.6. Testing & Validation
- Unit tests for upsert logic and XML parsing.
- Integration tests for DB sync.
- Post-sync validation: record counts, FK integrity, sample data checks.

### 6.7. Example Upsert Pipeline (Pseudocode)
```python
for product in parse_xml_products():
    db.upsert_product(product)
    db.upsert_related(product.prices, table='Prices')
    db.upsert_related(product.variants, table='ProductVariants')
    db.upsert_related(product.stock, table='StockEntries')
    db.upsert_related(product.images, table='ProductImages')
    db.upsert_related(product.categories, table='ProductCategories')
```

## 7. Error Handling and Logging

*(Strategy for managing errors during import/sync and for logging activities. To be detailed further.)*

-   Logging to `LOG_CODE.md` and `LOG_ERROS.md`.
-   Error reporting and resolution strategy.

## 8. Testing Strategy

*(Approach for testing the import and synchronization scripts. To be detailed further.)*

-   Unit tests for parsing/transformation functions.
-   Integration tests for database operations.
-   Data validation post-import/sync.
