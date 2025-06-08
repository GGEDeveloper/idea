-- IMPORTAÇÃO DOS CSVs PARA O ESQUEMA GEKO
\copy producers FROM 'data/csv_exports/producers.csv' CSV HEADER;
\copy units FROM 'data/csv_exports/units.csv' CSV HEADER;
\copy categories FROM 'data/csv_exports/categories.csv' CSV HEADER;
\copy products FROM 'data/csv_exports/products.csv' CSV HEADER;
\copy product_categories FROM 'data/csv_exports/product_categories.csv' CSV HEADER;
\copy product_variants FROM 'data/csv_exports/product_variants.csv' CSV HEADER;
\copy stock_levels FROM 'data/csv_exports/stock_levels.csv' CSV HEADER;
\copy prices FROM 'data/csv_exports/prices.csv' CSV HEADER;
\copy product_images FROM 'data/csv_exports/product_images.csv' CSV HEADER;
