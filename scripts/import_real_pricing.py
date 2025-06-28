#!/usr/bin/env python3
"""
🎯 IMPORT REAL PRICING - SISTEMA VIP PRODUTOS INTERNOS
===================================================

Importa preços REAIS do CSV original para o sistema VIP isolado.

ESTRATÉGIA:
- Usa preços finais do CSV como suggested_retail_price
- Calcula custo base: preço_final ÷ 1.35 (markup 35%)
- Popula internal_pricing para listas de preços existentes

DADOS FONTE: aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv
"""

import csv
import os
import sys
from decimal import Decimal, ROUND_HALF_UP
import psycopg2

def load_environment():
    """Carrega variáveis de ambiente"""
    # Tentar carregar do .env manualmente
    env_path = '../.env'
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value.strip('"').strip("'")
    
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("❌ DATABASE_URL não encontrada no .env!")
        print("💡 Tentando conexão padrão local...")
        db_url = "postgresql://localhost:5432/alitools"
    
    return db_url

def connect_database(db_url):
    """Conecta à base de dados"""
    try:
        conn = psycopg2.connect(db_url)
        return conn
    except Exception as e:
        print(f"❌ Erro ao conectar BD: {e}")
        sys.exit(1)

def calculate_base_cost(final_price, markup_percentage=35.0):
    """
    Calcula custo base a partir do preço final
    
    Fórmula: custo_base = preço_final ÷ (1 + markup/100)
    Exemplo: €20.55 ÷ 1.35 = €15.22
    """
    if not final_price or final_price <= 0:
        return None
    
    markup_multiplier = Decimal('1') + (Decimal(str(markup_percentage)) / Decimal('100'))
    base_cost = Decimal(str(final_price)) / markup_multiplier
    
    # Arredondar para 4 casas decimais
    return base_cost.quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP)

def load_csv_products():
    """Carrega produtos do CSV original com preços"""
    csv_path = '../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv'
    
    if not os.path.exists(csv_path):
        print(f"❌ CSV não encontrado: {csv_path}")
        sys.exit(1)
    
    products = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            # Apenas produtos (não variantes)
            if row.get('fieldType') != 'Product':
                continue
                
            # Verificar se tem preço
            price_str = row.get('price', '').strip()
            if not price_str:
                continue
            
            try:
                final_price = float(price_str)
                if final_price <= 0:
                    continue
                    
                base_cost = calculate_base_cost(final_price, 35.0)
                
                product_data = {
                    'name': row.get('name', '').strip(),
                    'description': row.get('description', '').strip(),
                    'brand': row.get('brand', '').strip() or 'Genérico',
                    'collection': row.get('collection', '').strip(),
                    'final_price': final_price,
                    'base_cost': float(base_cost) if base_cost else None,
                    'geko_category_id': row.get('geko_category_id', '').strip(),
                    'handleId': row.get('handleId', '').strip()
                }
                
                products.append(product_data)
                
            except (ValueError, TypeError) as e:
                print(f"⚠️ Erro ao processar preço '{price_str}': {e}")
                continue
    
    return products

def get_price_lists(conn):
    """Obtém listas de preços disponíveis"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT price_list_id, name 
            FROM price_lists 
            ORDER BY price_list_id
        """)
        return cur.fetchall()

def update_internal_products_costs(conn, csv_products):
    """Atualiza custos base nos produtos internos"""
    updated_count = 0
    
    with conn.cursor() as cur:
        for product in csv_products:
            if not product['base_cost']:
                continue
                
            # Procurar produto interno por nome (matching fuzzy)
            cur.execute("""
                SELECT internal_ean, name 
                FROM internal_products 
                WHERE LOWER(name) = LOWER(%s)
                   OR LOWER(name_pt) = LOWER(%s)
                LIMIT 1
            """, (product['name'], product['name']))
            
            result = cur.fetchone()
            
            if result:
                internal_ean, db_name = result
                
                # Atualizar custo base e markup
                cur.execute("""
                    UPDATE internal_products 
                    SET base_cost = %s,
                        markup_percentage = 35.0,
                        updated_at = NOW()
                    WHERE internal_ean = %s
                """, (product['base_cost'], internal_ean))
                
                updated_count += 1
                print(f"✅ {internal_ean}: {db_name[:50]}... → €{product['base_cost']:.2f} → €{product['final_price']:.2f}")
            else:
                print(f"⚠️ Produto não encontrado na BD: {product['name'][:50]}...")
    
    return updated_count

def populate_internal_pricing(conn, price_lists):
    """Popula tabela internal_pricing com preços calculados"""
    pricing_count = 0
    
    with conn.cursor() as cur:
        # Obter produtos internos com custo base
        cur.execute("""
            SELECT ip.internal_ean, iv.internal_variant_id, ip.base_cost, ip.markup_percentage
            FROM internal_products ip
            JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean
            WHERE ip.base_cost IS NOT NULL 
              AND ip.is_active = true 
              AND iv.is_active = true
        """)
        
        variants_with_cost = cur.fetchall()
        
        for internal_ean, variant_id, base_cost, markup_pct in variants_with_cost:
            # Calcular preço de venda
            markup_multiplier = 1 + (markup_pct / 100)
            selling_price = base_cost * markup_multiplier
            
            # Inserir preço para cada lista de preços
            for price_list_id, price_list_name in price_lists:
                cur.execute("""
                    INSERT INTO internal_pricing (
                        internal_variant_id, price_list_id, selling_price, 
                        cost_basis, margin_percentage, is_active,
                        created_by, created_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, true,
                        (SELECT user_id FROM users WHERE role = 'admin' LIMIT 1),
                        NOW()
                    )
                    ON CONFLICT (internal_variant_id, price_list_id, effective_from) 
                    DO UPDATE SET
                        selling_price = EXCLUDED.selling_price,
                        cost_basis = EXCLUDED.cost_basis,
                        margin_percentage = EXCLUDED.margin_percentage,
                        updated_at = NOW()
                """, (variant_id, price_list_id, selling_price, base_cost, markup_pct))
                
                pricing_count += 1
    
    return pricing_count

def main():
    print("🎯 IMPORTAÇÃO DE PREÇOS REAIS - MARKUP 35%")
    print("=" * 60)
    
    # 1. Preparação
    db_url = load_environment()
    conn = connect_database(db_url)
    
    try:
        # 2. Carregar dados do CSV
        print("\n📊 CARREGANDO DADOS DO CSV...")
        csv_products = load_csv_products()
        print(f"✅ Carregados {len(csv_products)} produtos com preços")
        
        # 3. Verificar listas de preços
        print("\n💰 VERIFICANDO LISTAS DE PREÇOS...")
        price_lists = get_price_lists(conn)
        print(f"✅ Encontradas {len(price_lists)} listas de preços:")
        for price_list_id, name in price_lists:
            print(f"   • {price_list_id}: {name}")
        
        # 4. Atualizar custos base
        print("\n🔄 ATUALIZANDO CUSTOS BASE (35% markup)...")
        updated_count = update_internal_products_costs(conn, csv_products)
        print(f"✅ Atualizados {updated_count} produtos com custos base")
        
        # 5. Popular tabela de preços
        print("\n💲 POPULANDO INTERNAL_PRICING...")
        pricing_count = populate_internal_pricing(conn, price_lists)
        print(f"✅ Criados {pricing_count} registos de preços")
        
        # 6. Commit das alterações
        conn.commit()
        print(f"\n🎉 SUCESSO! SISTEMA DE PREÇOS ATIVO!")
        print(f"   • Produtos com preços: {updated_count}")
        print(f"   • Registos de pricing: {pricing_count}")
        print(f"   • Markup aplicado: 35%")
        
        # 7. Verificação final
        print(f"\n🔍 VERIFICAÇÃO FINAL...")
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM internal_products WHERE base_cost IS NOT NULL")
            products_with_cost = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM internal_pricing WHERE is_active = true")
            active_prices = cur.fetchone()[0]
            
            print(f"✅ Produtos com custo: {products_with_cost}/410")
            print(f"✅ Preços ativos: {active_prices}")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
        
    finally:
        conn.close()

if __name__ == "__main__":
    main() 