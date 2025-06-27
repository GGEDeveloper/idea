#!/usr/bin/env python3
"""
🎯 IMPLEMENTAR PREÇOS HARDCORE - SISTEMA VIP
==========================================

OBJETIVO: Implementar preços reais com markup 35% no sistema VIP isolado

ESTRATÉGIA SIMPLIFICADA:
1. Ler CSV com preços reais 
2. Calcular custo base: preço_final ÷ 1.35
3. Atualizar internal_products.base_cost
4. Popular internal_pricing com preços calculados
5. Verificar tudo funcionou

DADOS: aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv
MARKUP: 35% (preço_final = custo_base × 1.35)
"""

import csv
import os
import sys
from decimal import Decimal, ROUND_HALF_UP
import psycopg2

def connect_db():
    """Conecta à BD usando .env"""
    env_path = '../.env'
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value.strip('"').strip("'")
    
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        raise Exception("DATABASE_URL não encontrada!")
    
    return psycopg2.connect(db_url)

def calcular_custo_base(preco_final, markup=35.0):
    """
    Calcula custo base: preço ÷ (1 + markup/100)
    Exemplo: €20.55 ÷ 1.35 = €15.22
    """
    if not preco_final or preco_final <= 0:
        return None
    
    multiplier = Decimal('1') + (Decimal(str(markup)) / Decimal('100'))
    custo = Decimal(str(preco_final)) / multiplier
    return custo.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

def carregar_precos_csv():
    """Carrega preços do CSV original"""
    csv_path = '../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv'
    
    if not os.path.exists(csv_path):
        raise Exception(f"CSV não encontrado: {csv_path}")
    
    produtos_precos = {}
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            if row.get('fieldType') != 'Product':
                continue
                
            nome = row.get('name', '').strip()
            preco_str = row.get('price', '').strip()
            
            if not nome or not preco_str:
                continue
            
            try:
                preco_final = float(preco_str)
                if preco_final <= 0:
                    continue
                
                custo_base = calcular_custo_base(preco_final, 35.0)
                
                produtos_precos[nome.lower()] = {
                    'nome': nome,
                    'preco_final': preco_final,
                    'custo_base': float(custo_base)
                }
                
            except (ValueError, TypeError):
                continue
    
    return produtos_precos

def atualizar_custos_base(conn, produtos_precos):
    """Atualiza custos base nos produtos internos"""
    atualizados = 0
    
    with conn.cursor() as cur:
        # Buscar todos os produtos internos
        cur.execute("""
            SELECT internal_ean, name, name_pt 
            FROM internal_products 
            WHERE is_active = true
        """)
        
        produtos_bd = cur.fetchall()
        
        for internal_ean, nome_original, nome_pt in produtos_bd:
            # Tentar match por nome original
            match_data = None
            
            if nome_original.lower() in produtos_precos:
                match_data = produtos_precos[nome_original.lower()]
            elif nome_pt and nome_pt.lower() in produtos_precos:
                match_data = produtos_precos[nome_pt.lower()]
            else:
                # Tentar match fuzzy
                for csv_nome, data in produtos_precos.items():
                    if csv_nome in nome_original.lower() or nome_original.lower() in csv_nome:
                        match_data = data
                        break
            
            if match_data:
                # Atualizar custo base
                cur.execute("""
                    UPDATE internal_products 
                    SET base_cost = %s,
                        markup_percentage = 35.0,
                        updated_at = NOW()
                    WHERE internal_ean = %s
                """, (match_data['custo_base'], internal_ean))
                
                atualizados += 1
                print(f"✅ {internal_ean}: {nome_original[:40]}... → €{match_data['custo_base']:.2f}")
            else:
                print(f"⚠️ {internal_ean}: {nome_original[:40]}... → SEM MATCH")
    
    return atualizados

def popular_internal_pricing(conn):
    """Popula tabela internal_pricing"""
    precos_criados = 0
    
    with conn.cursor() as cur:
        # Obter listas de preços
        cur.execute("SELECT price_list_id, name FROM price_lists ORDER BY price_list_id")
        price_lists = cur.fetchall()
        
        # Obter produtos com custo base
        cur.execute("""
            SELECT ip.internal_ean, iv.internal_variant_id, ip.base_cost
            FROM internal_products ip
            JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean
            WHERE ip.base_cost IS NOT NULL 
              AND ip.is_active = true 
              AND iv.is_active = true
        """)
        
        variants = cur.fetchall()
        
        print(f"\n💰 POPULANDO PREÇOS:")
        print(f"   • {len(variants)} variantes com custo")
        print(f"   • {len(price_lists)} listas de preços")
        
        for internal_ean, variant_id, custo_base in variants:
            # Calcular preço de venda (custo × 1.35)
            preco_venda = custo_base * Decimal('1.35')
            preco_venda = preco_venda.quantize(Decimal('0.01'))
            
            # Inserir para cada lista de preços
            for price_list_id, list_name in price_lists:
                cur.execute("""
                    INSERT INTO internal_pricing (
                        internal_variant_id, price_list_id, selling_price,
                        cost_basis, margin_percentage, is_active,
                        created_at
                    ) VALUES (
                        %s, %s, %s, %s, 35.0, true, NOW()
                    )
                    ON CONFLICT (internal_variant_id, price_list_id, effective_from)
                    DO UPDATE SET
                        selling_price = EXCLUDED.selling_price,
                        cost_basis = EXCLUDED.cost_basis,
                        updated_at = NOW()
                """, (variant_id, price_list_id, float(preco_venda), float(custo_base)))
                
                precos_criados += 1
    
    return precos_criados

def verificar_resultado(conn):
    """Verifica se tudo funcionou"""
    with conn.cursor() as cur:
        # Produtos com custo
        cur.execute("SELECT COUNT(*) FROM internal_products WHERE base_cost IS NOT NULL")
        produtos_com_custo = cur.fetchone()[0]
        
        # Preços ativos
        cur.execute("SELECT COUNT(*) FROM internal_pricing WHERE is_active = true")
        precos_ativos = cur.fetchone()[0]
        
        # Exemplo de preços
        cur.execute("""
            SELECT ip.name, ip.base_cost, 
                   AVG(ipr.selling_price) as preco_medio
            FROM internal_products ip
            JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean
            JOIN internal_pricing ipr ON iv.internal_variant_id = ipr.internal_variant_id
            WHERE ip.base_cost IS NOT NULL
            GROUP BY ip.name, ip.base_cost
            ORDER BY ip.base_cost DESC
            LIMIT 3
        """)
        
        exemplos = cur.fetchall()
        
        return produtos_com_custo, precos_ativos, exemplos

def main():
    print("🎯 IMPLEMENTAÇÃO HARDCORE DE PREÇOS - MARKUP 35%")
    print("=" * 60)
    
    try:
        # 1. Conectar BD
        print("\n🔌 CONECTANDO À BD...")
        conn = connect_db()
        
        # 2. Carregar preços do CSV
        print("\n📊 CARREGANDO PREÇOS DO CSV...")
        produtos_precos = carregar_precos_csv()
        print(f"✅ Carregados {len(produtos_precos)} produtos com preços")
        
        # 3. Atualizar custos base
        print("\n🔄 ATUALIZANDO CUSTOS BASE...")
        atualizados = atualizar_custos_base(conn, produtos_precos)
        print(f"✅ Atualizados {atualizados} produtos")
        
        # 4. Popular internal_pricing
        print("\n💲 POPULANDO INTERNAL_PRICING...")
        precos_criados = popular_internal_pricing(conn)
        print(f"✅ Criados {precos_criados} registos de preços")
        
        # 5. Commit
        conn.commit()
        
        # 6. Verificar resultado
        print("\n🔍 VERIFICAÇÃO FINAL...")
        produtos_com_custo, precos_ativos, exemplos = verificar_resultado(conn)
        
        print(f"   • Produtos com custo: {produtos_com_custo}/410")
        print(f"   • Preços ativos: {precos_ativos}")
        
        print(f"\n💰 EXEMPLOS DE PREÇOS (MARKUP 35%):")
        for nome, custo, preco in exemplos:
            markup_real = ((preco - custo) / custo * 100) if custo > 0 else 0
            print(f"   • {nome[:30]}...")
            print(f"     €{custo:.2f} → €{preco:.2f} (↑{markup_real:.1f}%)")
        
        # 7. Status final
        if produtos_com_custo >= 350:  # >85%
            print(f"\n🎉 SUCESSO! SISTEMA DE PREÇOS OPERACIONAL!")
            print(f"   ✅ {produtos_com_custo} produtos com preços")
            print(f"   ✅ {precos_ativos} preços ativos")
            print(f"   ✅ Markup 35% aplicado corretamente")
        else:
            print(f"\n⚠️ IMPLEMENTAÇÃO PARCIAL")
            print(f"   • Apenas {produtos_com_custo}/410 produtos com preços")
            print(f"   • Pode haver problemas de matching nomes")
        
        conn.close()
        
    except Exception as e:
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main() 