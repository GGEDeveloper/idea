#!/bin/bash
# filepath: /home/pixiewsl/CascadeProjects/final/idea-bak/scripts/diagnostic_export.sh

export PGPASSWORD='npg_aMgk1osmjh7X'

# Exporta todos os EANs dos produtos
psql -h ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech \
     -U neondb_owner \
     -d neondb \
     -c "\COPY (SELECT productid, ean FROM products) TO 'products_eans.csv' WITH CSV HEADER;"

# Exporta todas as imagens de produtos
psql -h ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech \
     -U neondb_owner \
     -d neondb \
     -c "\COPY (SELECT ean, url, is_main, sort_order FROM product_images) TO 'product_images.csv' WITH CSV HEADER;"

# Exporta o mapeamento produto->imagem principal
psql -h ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech \
     -U neondb_owner \
     -d neondb \
     -c "\COPY (
         SELECT p.productid, p.ean, (
           SELECT url FROM product_images i
           WHERE i.ean = p.ean
           ORDER BY is_main DESC, sort_order ASC
           LIMIT 1
         ) AS main_image_url
         FROM products p
         LIMIT 1000
     ) TO 'products_with_main_image.csv' WITH CSV HEADER;"

unset PGPASSWORD

echo "Exportação concluída. Envie os ficheiros CSV gerados para análise."