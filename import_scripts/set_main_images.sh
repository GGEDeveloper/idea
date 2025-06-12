#!/bin/bash
# filepath: /home/pixiewsl/CascadeProjects/final/idea-bak/scripts/set_main_images.sh

export PGPASSWORD='npg_aMgk1osmjh7X'

psql -h ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech \
     -U neondb_owner \
     -d neondb \
     -c "
UPDATE product_images
SET is_main = true
WHERE (ean, sort_order) IN (
  SELECT ean, MIN(sort_order)
  FROM product_images
  GROUP BY ean
);
"

unset PGPASSWORD
echo "Imagens principais atualizadas com sucesso."