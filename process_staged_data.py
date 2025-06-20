import os
import psycopg2
import psycopg2.extras # For execute_values
import json
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from decimal import Decimal, InvalidOperation
from datetime import datetime

BATCH_SIZE = 100  # General batch size for DB operations
# PRICE_LIST_ID_SUPPLIER = 1 # Defined in ensure_supplier_price_list_exists and populate_prices_table

def get_db_connection():
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print(f"[{datetime.now()}] FATAL: DATABASE_URL environment variable not set.")
        exit(1)
    try:
        conn = psycopg2.connect(db_url)
        print(f"[{datetime.now()}] Successfully connected to the database.")
        return conn
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] FATAL: Error connecting to the database: {e}")
        exit(1)

def get_plain_text_from_html(html_content):
    """Extracts plain text from HTML content."""
    if not html_content:
        return None
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        for script_or_style in soup(["script", "style"]):
            script_or_style.decompose()
        text = soup.get_text(separator='\\n', strip=True)
        return text
    except Exception as e:
        print(f"[{datetime.now()}] Warning: Could not parse HTML to plain text: {e}")
        return html_content 

# --- Populate `products` table ---
def populate_products_table(conn, products_data_list):
    if not products_data_list:
        return 0

    data_tuples = []
    for p_data in products_data_list:
        product_xml_root = p_data['product_xml_root']
        ean = p_data['ean']
        geko_product_id = product_xml_root.get('id')
        
        name_element = product_xml_root.find('.//description/name')
        name = name_element.text if name_element is not None and name_element.text else None
        
        short_desc_element = product_xml_root.find('.//description/short_desc')
        short_description_html = short_desc_element.text if short_desc_element is not None and short_desc_element.text else None
        
        long_desc_element = product_xml_root.find('.//description/long_desc')
        long_description_html = long_desc_element.text if long_desc_element is not None and long_desc_element.text else None
        
        producer_element = product_xml_root.find('producer')
        brand = producer_element.get('name') if producer_element is not None else None

        data_tuples.append((
            ean, 
            geko_product_id, 
            name, 
            short_description_html, 
            long_description_html,  
            brand, 
            True # active
        ))

    sql_upsert_products = """
    INSERT INTO products (ean, productid, name, shortdescription, longdescription, brand, active, created_at, updated_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
    ON CONFLICT (ean) DO UPDATE SET
        productid = EXCLUDED.productid, 
        name = EXCLUDED.name,
        shortdescription = EXCLUDED.shortdescription, 
        longdescription = EXCLUDED.longdescription,
        brand = EXCLUDED.brand, 
        active = EXCLUDED.active, 
        updated_at = NOW();
    """
    try:
        with conn.cursor() as cur:
            psycopg2.extras.execute_batch(cur, sql_upsert_products, data_tuples, page_size=len(data_tuples))
        return len(data_tuples)
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] Database batch error during products upsert: {e}")
        conn.rollback()
        return 0
    except Exception as e:
        print(f"[{datetime.now()}] General error during products batch upsert: {e}")
        conn.rollback()
        return 0

# --- Populate `categories` and `product_categories` tables (REVISED) ---
def populate_categories_and_links(conn, all_product_data_from_geko):
    print(f"[{datetime.now()}] Starting comprehensive population of 'categories' and 'product_categories'...")
    
    raw_category_data_map = {} 
    all_required_paths = set() 
    product_category_links_to_create = []

    for p_data in all_product_data_from_geko:
        product_ean = p_data['ean']
        product_xml_root = p_data['product_xml_root']
        
        for category_element in product_xml_root.findall('category'): 
            cat_id_from_xml = category_element.get('id')
            cat_name_from_xml = category_element.get('name')
            cat_path_from_xml = category_element.get('path')
            
            if not cat_id_from_xml or not cat_path_from_xml:
                continue

            if cat_path_from_xml not in raw_category_data_map:
                raw_category_data_map[cat_path_from_xml] = {'id': cat_id_from_xml, 'name': cat_name_from_xml, 'path': cat_path_from_xml}
            elif not raw_category_data_map[cat_path_from_xml].get('name') and cat_name_from_xml: 
                 raw_category_data_map[cat_path_from_xml]['name'] = cat_name_from_xml
            
            product_category_links_to_create.append((product_ean, cat_id_from_xml))

            parts = cat_path_from_xml.split('\\')
            current_accumulated_path = ""
            for part_name in parts:
                current_accumulated_path = f"{current_accumulated_path}{part_name}" if not current_accumulated_path else f"{current_accumulated_path}\\{part_name}"
                all_required_paths.add(current_accumulated_path)
    
    final_categories_map = {} 

    for path_str, data in raw_category_data_map.items():
        final_categories_map[path_str] = (data['id'], data['name'], data['path'], None)

    processed_generated_ids = set()
    for path_str in sorted(list(all_required_paths)):
        if path_str not in final_categories_map:
            generated_id_base = "GEN_" + path_str.replace('\\','_').replace(' ', '_').replace('/','_').upper()
            generated_id = generated_id_base[:250] 
            id_suffix = 1
            temp_id_to_check = generated_id
            while temp_id_to_check in processed_generated_ids or any(val_tuple[0] == temp_id_to_check for val_tuple in final_categories_map.values()):
                temp_id_to_check = f"{generated_id[:240]}_{id_suffix}" 
                id_suffix += 1
            generated_id = temp_id_to_check
            processed_generated_ids.add(generated_id)
            
            path_parts = path_str.split('\\')
            inferred_name = path_parts[-1] if path_parts else path_str
            final_categories_map[path_str] = (generated_id, inferred_name, path_str, None)
    
    category_tuples_for_db = list(final_categories_map.values())

    unique_category_tuples_for_db = []
    seen_cat_ids_for_insert = set()
    for tpl in category_tuples_for_db:
        if tpl[0] not in seen_cat_ids_for_insert:
            unique_category_tuples_for_db.append(tpl)
            seen_cat_ids_for_insert.add(tpl[0])
    
    categories_upserted_count = 0
    if unique_category_tuples_for_db:
        sql_upsert_categories = """
        INSERT INTO categories (categoryid, name, "path", parent_id, created_at, updated_at)
        VALUES (%s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT (categoryid) DO UPDATE SET 
            name = COALESCE(EXCLUDED.name, categories.name), 
            "path" = EXCLUDED."path", 
            updated_at = NOW()
        WHERE categories.name IS DISTINCT FROM EXCLUDED.name 
              OR categories."path" IS DISTINCT FROM EXCLUDED."path"
              OR (categories.name IS NULL AND EXCLUDED.name IS NOT NULL);
        """ 
        try:
            with conn.cursor() as cur:
                psycopg2.extras.execute_batch(cur, sql_upsert_categories, unique_category_tuples_for_db, page_size=BATCH_SIZE)
            categories_upserted_count = len(unique_category_tuples_for_db) 
            conn.commit()
            print(f"[{datetime.now()}] Categories batch processed. Attempted to upsert {categories_upserted_count} categories (includes inferred parents). ")
        except psycopg2.Error as e:
            print(f"[{datetime.now()}] Database batch error during categories upsert: {e}")
            conn.rollback()
        except Exception as e:
            print(f"[{datetime.now()}] General error during categories upsert: {e}")
            conn.rollback()
    else:
        print(f"[{datetime.now()}] No categories (including inferred) found to process.")

    links_added = 0
    if product_category_links_to_create:
        unique_links = sorted(list(set(product_category_links_to_create)))
        sql_insert_links = """
        INSERT INTO product_categories (product_ean, category_id)
        VALUES (%s, %s)
        ON CONFLICT (product_ean, category_id) DO NOTHING;
        """
        try:
            with conn.cursor() as cur:
                psycopg2.extras.execute_batch(cur, sql_insert_links, unique_links, page_size=BATCH_SIZE)
            links_added = len(unique_links) 
            conn.commit()
            print(f"[{datetime.now()}] Product-category links batch processed. Attempted to insert/ignore {links_added} links.")
        except psycopg2.Error as e:
            print(f"[{datetime.now()}] Database batch error during product_categories insert: {e}")
            conn.rollback()
        except Exception as e:
            print(f"[{datetime.now()}] General error during product_categories insert: {e}")
            conn.rollback()
    else:
        print(f"[{datetime.now()}] No product-category links found to process.")
    return categories_upserted_count, links_added

# --- Update `categories.parent_id` for hierarchy ---
def update_category_parent_ids(conn):
    print(f"[{datetime.now()}] Starting update of 'categories.parent_id' for hierarchy...")
    
    MAX_HIERARCHY_DEPTH = 10 
    total_updated_in_all_passes = 0

    for depth_level in range(MAX_HIERARCHY_DEPTH):
        print(f"[{datetime.now()}] Hierarchy resolution pass {depth_level + 1}...")
        categories_to_update_tuples = []
        
        path_to_id_map = {}
        categories_needing_parent_update = []

        try:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute('SELECT categoryid, "path", parent_id FROM categories WHERE "path" IS NOT NULL;')
                all_categories_data = cur.fetchall()
            
            if not all_categories_data:
                print(f"[{datetime.now()}] No categories found to process for parent ID updates.")
                break 

            for cat_row in all_categories_data:
                path_to_id_map[cat_row['path']] = cat_row['categoryid']
                if cat_row['parent_id'] is None and '\\' in cat_row['path']:
                    categories_needing_parent_update.append(cat_row)
            
            if not categories_needing_parent_update and depth_level > 0: 
                print(f"[{datetime.now()}] No categories found needing parent_id update in pass {depth_level + 1}. Hierarchy may be stable.")
                break
            
            made_updates_in_this_pass = False
            for cat_row in categories_needing_parent_update: 
                current_category_id = cat_row['categoryid']
                current_path = cat_row['path']
                path_parts = current_path.split('\\') 
                
                if len(path_parts) > 1: 
                    parent_path_parts = path_parts[:-1]
                    parent_path_str = '\\'.join(parent_path_parts)
                    parent_id_from_map = path_to_id_map.get(parent_path_str)
                    
                    if parent_id_from_map:
                        if not any(t[1] == current_category_id and t[0] == parent_id_from_map for t in categories_to_update_tuples):
                            categories_to_update_tuples.append((parent_id_from_map, current_category_id, parent_id_from_map))
                            made_updates_in_this_pass = True 
            
        except psycopg2.Error as e:
            print(f"[{datetime.now()}] Database error during category data fetching (Pass {depth_level + 1}): {e}")
            break 
        except Exception as e:
            print(f"[{datetime.now()}] General error during category data fetching (Pass {depth_level + 1}): {e}")
            break

        updated_this_pass_count = 0
        if categories_to_update_tuples:
            sql_update_parent_id = """
            UPDATE categories SET parent_id = %s WHERE categoryid = %s AND (parent_id IS NULL OR parent_id IS DISTINCT FROM %s);
            """ 
            try:
                with conn.cursor() as cur_update:
                    psycopg2.extras.execute_batch(cur_update, sql_update_parent_id, categories_to_update_tuples, page_size=BATCH_SIZE)
                updated_this_pass_count = len(categories_to_update_tuples)
                conn.commit()
                total_updated_in_all_passes += updated_this_pass_count
                print(f"[{datetime.now()}] Pass {depth_level + 1}: Category parent_id updates. Attempted to update {updated_this_pass_count} categories.")
            except psycopg2.Error as e:
                print(f"[{datetime.now()}] Pass {depth_level + 1}: Database batch error during parent_id update: {e}")
                conn.rollback()
                break 
            except Exception as e:
                print(f"[{datetime.now()}] Pass {depth_level + 1}: General error during parent_id update: {e}")
                conn.rollback()
                break 
        else:
            print(f"[{datetime.now()}] Pass {depth_level + 1}: No category parent_id updates to perform in this pass.")
        
        if not made_updates_in_this_pass and depth_level > 0: 
            print(f"[{datetime.now()}] Hierarchy resolution stabilized after {depth_level + 1} passes (no new parent links found). ")
            break
        if not categories_needing_parent_update and not categories_to_update_tuples: 
            print(f"[{datetime.now()}] All categories are root or already have parents. Pass {depth_level + 1}.")
            if depth_level > 0: break 
            
    print(f"[{datetime.now()}] Finished update of 'categories.parent_id'. Total attempted updates across passes: {total_updated_in_all_passes}.")
    return total_updated_in_all_passes

# --- Populate `product_images` table ---
def populate_product_images(conn, all_product_data_from_geko):
    print(f"[{datetime.now()}] Starting population of 'product_images'...")
    image_data_tuples = []
    images_processed_count = 0

    for p_data in all_product_data_from_geko:
        product_ean = p_data['ean']
        product_xml_root = p_data['product_xml_root']
        
        product_name_element = product_xml_root.find('.//description/name')
        default_alt_text = product_name_element.text if product_name_element is not None and product_name_element.text else f"Image for {product_ean}"

        images_container = product_xml_root.find('images/large')
        if images_container is not None:
            is_first_image = True
            for image_element in images_container.findall('image'):
                img_url = image_element.get('url')
                if img_url:
                    image_data_tuples.append((
                        product_ean,
                        img_url,
                        default_alt_text, 
                        is_first_image    
                    ))
                    is_first_image = False 
                    images_processed_count +=1
    
    images_inserted_count = 0
    if image_data_tuples:
        sql_insert_images = """
        INSERT INTO product_images (ean, "url", alt, is_primary)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (ean, "url") DO UPDATE SET 
            alt = EXCLUDED.alt, 
            is_primary = EXCLUDED.is_primary; 
        """
        try:
            with conn.cursor() as cur:
                psycopg2.extras.execute_batch(cur, sql_insert_images, image_data_tuples, page_size=BATCH_SIZE)
            images_inserted_count = len(image_data_tuples) 
            conn.commit()
            print(f"[{datetime.now()}] Product images batch processed. Attempted to upsert {images_inserted_count} images.")
        except psycopg2.Error as e:
            print(f"[{datetime.now()}] Database batch error during product_images upsert: {e}")
            conn.rollback()
        except Exception as e:
            print(f"[{datetime.now()}] General error during product_images batch upsert: {e}")
            conn.rollback()
    else:
        print(f"[{datetime.now()}] No images found to process.")
    return images_processed_count

# --- Populate `product_variants` table ---
def populate_product_variants(conn, all_product_data_from_geko):
    print(f"[{datetime.now()}] Starting population of 'product_variants'...")
    variant_data_tuples = []
    variants_processed_count = 0

    for p_data in all_product_data_from_geko:
        product_ean = p_data['ean']
        product_xml_root = p_data['product_xml_root']
        
        product_name_element = product_xml_root.find('.//description/name')
        base_product_name = product_name_element.text if product_name_element is not None and product_name_element.text else product_ean

        sizes_container = product_xml_root.find('sizes')
        if sizes_container is not None:
            for size_element in sizes_container.findall('size'):
                variant_code = size_element.get('code')
                if not variant_code:
                    print(f"[{datetime.now()}] Warning: Found a <size> element without a 'code' attribute for EAN {product_ean}. Skipping this variant.")
                    continue

                variant_name = f"{base_product_name} - {variant_code}" 

                stock_quantity = 0 
                stock_element = size_element.find('stock')
                if stock_element is not None:
                    quantity_str = stock_element.get('quantity')
                    if quantity_str:
                        try:
                            stock_quantity = int(float(quantity_str.replace(',', '.')))
                        except ValueError:
                            print(f"[{datetime.now()}] Warning: Could not parse stock quantity '{quantity_str}' for variant {variant_code} (EAN {product_ean}). Using 0.")
                
                variant_supplier_price = None
                price_in_size_element = size_element.find('price')
                if price_in_size_element is not None:
                    price_str = price_in_size_element.get('net')
                    if price_str:
                        try:
                            variant_supplier_price = Decimal(price_str)
                        except InvalidOperation:
                            print(f"[{datetime.now()}] Warning: Could not parse variant supplier price '{price_str}' for variant {variant_code} (EAN {product_ean}). Using NULL.")
                
                variant_data_tuples.append((
                    variant_code,    
                    product_ean,     
                    variant_name,    
                    stock_quantity,
                    variant_supplier_price 
                ))
                variants_processed_count += 1
    
    variants_upserted_count = 0
    if variant_data_tuples:
        sql_upsert_variants = """
        INSERT INTO product_variants (variantid, ean, name, stockquantity, supplier_price)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (variantid) DO UPDATE SET
            ean = EXCLUDED.ean,
            name = EXCLUDED.name,
            stockquantity = EXCLUDED.stockquantity,
            supplier_price = EXCLUDED.supplier_price; 
        """
        try:
            with conn.cursor() as cur:
                psycopg2.extras.execute_batch(cur, sql_upsert_variants, variant_data_tuples, page_size=BATCH_SIZE)
            variants_upserted_count = len(variant_data_tuples) 
            conn.commit()
            print(f"[{datetime.now()}] Product variants batch processed. Attempted to upsert {variants_upserted_count} variants.")
        except psycopg2.Error as e:
            print(f"[{datetime.now()}] Database batch error during product_variants upsert: {e}")
            conn.rollback()
        except Exception as e:
            print(f"[{datetime.now()}] General error during product_variants batch upsert: {e}")
            conn.rollback()
    else:
        print(f"[{datetime.now()}] No variants (sizes) found to process.")
    return variants_processed_count

# --- Populate `product_attributes` table ---
def populate_product_attributes(conn, all_product_data_from_geko):
    print(f"[{datetime.now()}] Starting population of 'product_attributes' (HTML parsing)..." )
    attribute_data_tuples = []
    attributes_processed_count = 0

    for p_data in all_product_data_from_geko:
        product_ean = p_data['ean']
        product_xml_root = p_data['product_xml_root']
        
        html_content_parts = []
        for desc_tag_name in ['long_desc', 'short_desc', 'description']:
            desc_element = product_xml_root.find(f'.//description/{desc_tag_name}')
            if desc_element is not None and desc_element.text:
                html_content_parts.append(desc_element.text)
        
        if not html_content_parts:
            continue

        full_html_content = "\n".join(html_content_parts)
        soup = BeautifulSoup(full_html_content, 'html.parser')

        spec_headings_texts = [
            "Specyfikacja techniczna:", "Dane techniczne:", "Technical Specifications:",
            "Technical data:", "Charakterystyka produktu:", "Product features:"
        ]
        
        headings = soup.find_all(['h4', 'h3', 'h2', 'strong'])

        for heading in headings:
            heading_text_cleaned = get_plain_text_from_html(str(heading)).strip().lower()
            is_spec_heading = any(spec_head.lower() in heading_text_cleaned for spec_head in spec_headings_texts)

            if is_spec_heading:
                current_element = heading.find_next_sibling()
                while current_element:
                    if current_element.name == 'p':
                        p_text = get_plain_text_from_html(str(current_element))
                        if ':' in p_text:
                            parts = p_text.split(':', 1)
                            key = parts[0].strip()
                            value = parts[1].strip()
                            if key and value and len(key) < 255 and len(value) < 1000: 
                                attribute_data_tuples.append((product_ean, key, value))
                                attributes_processed_count += 1
                    elif current_element.name in ['h4', 'h3', 'h2', 'div', 'table', 'ul']: 
                        break 
                    current_element = current_element.find_next_sibling()
        
        for table in soup.find_all('table'):
            for row in table.find_all('tr'):
                cells = row.find_all('td')
                if len(cells) == 2:
                    key = get_plain_text_from_html(str(cells[0]))
                    value = get_plain_text_from_html(str(cells[1]))
                    if key and value and len(key) < 255 and len(value) < 1000: 
                        if key.lower() not in ['kod produktu', 'code', 'kod']:
                             attribute_data_tuples.append((product_ean, key, value))
                             attributes_processed_count += 1

    final_attributes_to_insert = []
    seen_ean_key_pairs = set()
    for attr_tuple in attribute_data_tuples:
        ean_key = (attr_tuple[0], attr_tuple[1]) 
        if ean_key not in seen_ean_key_pairs:
            final_attributes_to_insert.append(attr_tuple)
            seen_ean_key_pairs.add(ean_key)
    
    attributes_upserted_count = 0
    if final_attributes_to_insert:
        sql_upsert_attributes = """
        INSERT INTO product_attributes (product_ean, "key", "value", created_at, updated_at)
        VALUES (%s, %s, %s, NOW(), NOW())
        ON CONFLICT (product_ean, "key") DO UPDATE SET
            "value" = EXCLUDED."value",
            updated_at = NOW(); 
        """
        try:
            with conn.cursor() as cur:
                psycopg2.extras.execute_batch(cur, sql_upsert_attributes, final_attributes_to_insert, page_size=BATCH_SIZE)
            attributes_upserted_count = len(final_attributes_to_insert) 
            conn.commit()
            print(f"[{datetime.now()}] Product attributes batch processed. Attempted to upsert {attributes_upserted_count} attributes.")
        except psycopg2.Error as e:
            print(f"[{datetime.now()}] Database batch error during product_attributes upsert: {e}")
            conn.rollback()
        except Exception as e:
            print(f"[{datetime.now()}] General error during product_attributes batch upsert: {e}")
            conn.rollback()
    else:
        print(f"[{datetime.now()}] No attributes extracted from HTML to process.")
    return attributes_processed_count

# --- Populate `prices` table (REVISED for variant-specific pricing) ---
def populate_prices_table(conn): 
    print(f"[{datetime.now()}] Starting population of 'prices' table (variant-specific)...")
    
    PRICE_LIST_ID_SUPPLIER = 1
    PRICE_LIST_ID_BASE_SELLING = 2 

    variant_prices_to_upsert = []
    processed_variants_count = 0
    
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("SELECT variantid, supplier_price FROM product_variants WHERE supplier_price IS NOT NULL;")
            variants_with_prices = cur.fetchall()

            if not variants_with_prices:
                print(f"[{datetime.now()}] No variants with supplier prices found in product_variants table to process for 'prices' table.")
                return 0 

            print(f"[{datetime.now()}] Processing {len(variants_with_prices)} variants from product_variants for price calculation.")
            processed_variants_count = len(variants_with_prices)

            for variant_row in variants_with_prices:
                variant_id = variant_row['variantid']
                variant_supplier_price = variant_row['supplier_price']

                variant_prices_to_upsert.append((variant_id, PRICE_LIST_ID_SUPPLIER, variant_supplier_price))

                if variant_supplier_price is not None: 
                    # Usar função SQL para calcular preço de venda com margem configurável
                    variant_prices_to_upsert.append((variant_id, PRICE_LIST_ID_BASE_SELLING, None))  # Será calculado pela função SQL
            
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] Database error fetching from product_variants for price calculation: {e}")
        return 0 
    except Exception as e:
        print(f"[{datetime.now()}] General error during variant data fetching for price calculation: {e}")
        return 0

    price_entries_upserted = 0
    if variant_prices_to_upsert:
        # Separar preços de fornecedor dos que precisam de cálculo
        supplier_prices = []
        variants_for_selling_price = []
        
        for variant_id, price_list_id, price in variant_prices_to_upsert:
            if price_list_id == PRICE_LIST_ID_SUPPLIER:
                supplier_prices.append((variant_id, price_list_id, price))
            elif price_list_id == PRICE_LIST_ID_BASE_SELLING and price is None:
                variants_for_selling_price.append(variant_id)
        
        print(f"[{datetime.now()}] Processing {len(supplier_prices)} supplier prices and {len(variants_for_selling_price)} calculated selling prices.")

        try:
            with conn.cursor() as cur:
                # Inserir preços de fornecedor
                if supplier_prices:
                    sql_upsert_supplier_prices = """
                    INSERT INTO prices (variantid, price_list_id, price)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (variantid, price_list_id) DO UPDATE SET
                        price = EXCLUDED.price; 
                    """
                    psycopg2.extras.execute_batch(cur, sql_upsert_supplier_prices, supplier_prices, page_size=BATCH_SIZE)
                    print(f"[{datetime.now()}] Inserted {len(supplier_prices)} supplier prices.")
                
                # Calcular e inserir preços de venda usando a função SQL
                if variants_for_selling_price:
                    placeholders = ','.join(['%s'] * len(variants_for_selling_price))
                    sql_calc_selling_prices = f"""
                    INSERT INTO prices (variantid, price_list_id, price)
                    SELECT 
                        pv.variantid, 
                        %s, 
                        calculate_selling_price(pv.supplier_price)
                    FROM product_variants pv
                    WHERE pv.variantid IN ({placeholders})
                      AND pv.supplier_price IS NOT NULL
                      AND pv.supplier_price > 0
                    ON CONFLICT (variantid, price_list_id) DO UPDATE SET 
                        price = calculate_selling_price((
                            SELECT supplier_price 
                            FROM product_variants 
                            WHERE variantid = EXCLUDED.variantid
                        ));
                    """
                    cur.execute(sql_calc_selling_prices, [PRICE_LIST_ID_BASE_SELLING] + variants_for_selling_price)
                    selling_prices_count = cur.rowcount
                    print(f"[{datetime.now()}] Calculated and inserted {selling_prices_count} selling prices using configurable margin.")
                
                price_entries_upserted = len(supplier_prices) + (selling_prices_count if variants_for_selling_price else 0)
            
            conn.commit() 
            print(f"[{datetime.now()}] Prices batch processed. Total entries: {price_entries_upserted}")
        except psycopg2.Error as e: 
            print(f"[{datetime.now()}] Database batch error during prices upsert: {e}")
            conn.rollback()
            price_entries_upserted = 0
        except Exception as e: 
            print(f"[{datetime.now()}] General error during prices batch upsert: {e}")
            conn.rollback()
            price_entries_upserted = 0
    else:
        print(f"[{datetime.now()}] No variant prices prepared to upsert.")
    return price_entries_upserted 


def ensure_supplier_price_list_exists(conn):
    PRICE_LIST_ID_SUPPLIER = 1
    PRICE_LIST_ID_BASE_SELLING = 2
    PRICE_LIST_ID_PROMOTIONAL = 3

    price_lists_to_ensure = [
        (PRICE_LIST_ID_SUPPLIER, 'Supplier Price', 'Custo de fornecedor (base da variante)'),
        (PRICE_LIST_ID_BASE_SELLING, 'Base Selling Price', 'Preço de venda base (+25% markup sobre custo fornecedor da variante)'),
        (PRICE_LIST_ID_PROMOTIONAL, 'Promotional Price', 'Preço promocional temporário (a ser definido manualmente)')
    ]

    try:
        with conn.cursor() as cur:
            for pl_id, name, desc in price_lists_to_ensure:
                cur.execute("""
                    INSERT INTO price_lists (price_list_id, name, description) 
                    VALUES (%s, %s, %s) 
                    ON CONFLICT (price_list_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        description = EXCLUDED.description;
                """, (pl_id, name, desc))
                print(f"[{datetime.now()}] Price list '{name}' (ID: {pl_id}) ensured.")
            conn.commit()
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] Error ensuring price lists: {e}")
        conn.rollback()

def main():
    print(f"[{datetime.now()}] --- Starting ETL Process from geko_products to Main Catalog ---")
    conn = get_db_connection()
    ensure_supplier_price_list_exists(conn)

    all_product_data_from_geko = []
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("SELECT ean, raw_data FROM geko_products;") 
            print(f"[{datetime.now()}] Fetching data from geko_products...")
            fetched_rows = 0
            for row in cur:
                try:
                    raw_xml_string = row['raw_data']['xml_product_data']
                    product_xml_root = ET.fromstring(raw_xml_string)
                    all_product_data_from_geko.append({
                        'ean': row['ean'],
                        'product_xml_root': product_xml_root
                    })
                    fetched_rows +=1
                except ET.ParseError as e_xml:
                    print(f"[{datetime.now()}] Warning: Could not parse XML for EAN {row['ean']}: {e_xml}. Skipping.")
                except (KeyError, TypeError) as e_json: 
                    print(f"[{datetime.now()}] Warning: raw_data for EAN {row['ean']} not in expected JSON format or is null: {e_json}. Skipping.")
            print(f"[{datetime.now()}] Fetched {fetched_rows} products from geko_products for processing.")
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] Database error fetching from geko_products: {e}")
        if conn: conn.close()
        return
    if not all_product_data_from_geko:
        print(f"[{datetime.now()}] No data found in geko_products to process.")
        if conn: conn.close()
        return

    print(f"[{datetime.now()}] Populating 'products' table...")
    products_batch = []
    products_processed_count = 0
    total_products_upserted = 0
    for i, p_data in enumerate(all_product_data_from_geko):
        products_batch.append(p_data)
        if len(products_batch) >= BATCH_SIZE or i == len(all_product_data_from_geko) - 1:
            upserted_in_batch = populate_products_table(conn, products_batch)
            if upserted_in_batch > 0:
                conn.commit()
                total_products_upserted += upserted_in_batch
                print(f"[{datetime.now()}] Products batch committed. {upserted_in_batch} products upserted/updated.")
            products_processed_count += len(products_batch)
            products_batch = []
    print(f"[{datetime.now()}] 'products' table population complete. Processed: {products_processed_count}, Upserted: {total_products_upserted}")

    categories_attempted, links_attempted = populate_categories_and_links(conn, all_product_data_from_geko)
    print(f"[{datetime.now()}] Categories processing attempted for {categories_attempted} unique categories (includes inferred parents). ")
    print(f"[{datetime.now()}] Product-category links processing attempted for {links_attempted} links.")

    parent_ids_updated = update_category_parent_ids(conn)
    print(f"[{datetime.now()}] Category parent_id update process: {parent_ids_updated} actual parent links established/verified.")
    
    images_processed = populate_product_images(conn, all_product_data_from_geko)
    print(f"[{datetime.now()}] Product images processed from XML: {images_processed}")

    variants_processed = populate_product_variants(conn, all_product_data_from_geko)
    print(f"[{datetime.now()}] Product variants processed from XML: {variants_processed}")

    attributes_processed = populate_product_attributes(conn, all_product_data_from_geko)
    print(f"[{datetime.now()}] Product attributes processed from HTML: {attributes_processed}")

    price_entries_processed = populate_prices_table(conn) 
    print(f"[{datetime.now()}] Variant price entries processed: {price_entries_processed}")

    if conn:
        conn.close()
        print(f"[{datetime.now()}] Database connection closed.")
    print(f"[{datetime.now()}] --- ETL Process Finished ---")

if __name__ == "__main__":
    main() 