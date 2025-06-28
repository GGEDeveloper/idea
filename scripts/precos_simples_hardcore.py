#!/usr/bin/env python3
"""
🎯 IMPLEMENTAÇÃO ULTRA-SIMPLES DE PREÇOS
======================================

ESTRATÉGIA MINIMAL:
1. Conectar BD
2. Buscar 1 produto teste
3. Encontrar preço no CSV
4. Atualizar 1 produto com sucesso
5. Depois fazer todos
"""

import csv
import os
import psycopg2
from decimal import Decimal

def conectar():
    """Conecta à BD"""
    env_path = '../.env'
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value.strip('"').strip("'")
    
    return psycopg2.connect(os.getenv('DATABASE_URL'))

def carregar_csv():
    """Carrega CSV simples"""
    csv_path = '../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv'
    precos = {}
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('fieldType') == 'Product':
                nome = row.get('name', '').strip()
                preco = row.get('price', '').strip()
                
                if nome and preco:
                    try:
                        precos[nome.lower()] = float(preco)
                    except:
                        pass
    
    return precos

def calcular_custo(preco_final):
    """35% markup: custo = preço ÷ 1.35"""
    return round(preco_final / 1.35, 2)

def testar_um_produto():
    """Testa com 1 produto"""
    print("🧪 TESTE COM 1 PRODUTO:")
    
    conn = conectar()
    cur = conn.cursor()
    precos_csv = carregar_csv()
    
    # Buscar 1 produto
    cur.execute("SELECT internal_ean, name FROM internal_products WHERE is_active = true LIMIT 1")
    ean, nome = cur.fetchone()
    
    print(f"   • Produto: {nome}")
    print(f"   • EAN: {ean}")
    
    # Encontrar preço
    if nome.lower() in precos_csv:
        preco_final = precos_csv[nome.lower()]
        custo_base = calcular_custo(preco_final)
        
        print(f"   • Preço CSV: €{preco_final}")
        print(f"   • Custo base: €{custo_base}")
        
        # Atualizar
        cur.execute("""
            UPDATE internal_products 
            SET base_cost = %s, markup_percentage = 35.0 
            WHERE internal_ean = %s
        """, (custo_base, ean))
        
        conn.commit()
        
        # Verificar
        cur.execute("SELECT base_cost FROM internal_products WHERE internal_ean = %s", (ean,))
        novo_custo = cur.fetchone()[0]
        
        print(f"   ✅ SUCESSO! Custo gravado: €{novo_custo}")
        conn.close()
        return True
        
    else:
        print(f"   ❌ Preço não encontrado")
        conn.close()
        return False

def implementar_todos():
    """Implementa todos os produtos"""
    print("\n🚀 IMPLEMENTANDO TODOS:")
    
    conn = conectar()
    cur = conn.cursor()
    precos_csv = carregar_csv()
    
    print(f"   • Preços CSV: {len(precos_csv)}")
    
    # Buscar todos produtos
    cur.execute("SELECT internal_ean, name FROM internal_products WHERE is_active = true")
    produtos = cur.fetchall()
    
    print(f"   • Produtos BD: {len(produtos)}")
    
    atualizados = 0
    
    for ean, nome in produtos:
        if nome.lower() in precos_csv:
            preco_final = precos_csv[nome.lower()]
            custo_base = calcular_custo(preco_final)
            
            cur.execute("""
                UPDATE internal_products 
                SET base_cost = %s, markup_percentage = 35.0 
                WHERE internal_ean = %s
            """, (custo_base, ean))
            
            atualizados += 1
            
            if atualizados % 50 == 0:
                conn.commit()
                print(f"   ✅ {atualizados} produtos atualizados...")
    
    conn.commit()
    print(f"   🎉 TOTAL: {atualizados} produtos com preços!")
    
    # Verificar resultado
    cur.execute("SELECT COUNT(*) FROM internal_products WHERE base_cost IS NOT NULL")
    verificacao = cur.fetchone()[0]
    
    print(f"   ✅ VERIFICAÇÃO: {verificacao} produtos têm custo base")
    
    conn.close()
    return atualizados

def implementar_pricing():
    """Implementa internal_pricing"""
    print("\n💰 IMPLEMENTANDO PRICING:")
    
    conn = conectar()
    cur = conn.cursor()
    
    # Buscar produtos com custo
    cur.execute("""
        SELECT ip.internal_ean, iv.internal_variant_id, ip.base_cost
        FROM internal_products ip
        JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean
        WHERE ip.base_cost IS NOT NULL AND ip.is_active = true AND iv.is_active = true
    """)
    
    variants = cur.fetchall()
    print(f"   • Variantes com custo: {len(variants)}")
    
    # Buscar listas de preços
    cur.execute("SELECT price_list_id FROM price_lists ORDER BY price_list_id")
    price_lists = [row[0] for row in cur.fetchall()]
    print(f"   • Listas de preços: {len(price_lists)}")
    
    total_precos = 0
    
    for ean, variant_id, custo_base in variants:
        preco_venda = round(custo_base * 1.35, 2)
        
        for price_list_id in price_lists:
            cur.execute("""
                INSERT INTO internal_pricing (
                    internal_variant_id, price_list_id, selling_price,
                    cost_basis, margin_percentage, is_active, created_at
                ) VALUES (%s, %s, %s, %s, 35.0, true, NOW())
                ON CONFLICT (internal_variant_id, price_list_id, effective_from)
                DO UPDATE SET selling_price = EXCLUDED.selling_price
            """, (variant_id, price_list_id, preco_venda, custo_base))
            
            total_precos += 1
            
            if total_precos % 200 == 0:
                conn.commit()
                print(f"   ✅ {total_precos} preços criados...")
    
    conn.commit()
    print(f"   🎉 TOTAL: {total_precos} preços criados!")
    
    # Verificar
    cur.execute("SELECT COUNT(*) FROM internal_pricing WHERE is_active = true")
    verificacao = cur.fetchone()[0]
    print(f"   ✅ VERIFICAÇÃO: {verificacao} preços ativos")
    
    conn.close()
    return total_precos

def main():
    print("🎯 IMPLEMENTAÇÃO ULTRA-SIMPLES DE PREÇOS")
    print("=" * 50)
    
    try:
        # 1. Teste com 1 produto
        if testar_um_produto():
            # 2. Implementar todos
            atualizados = implementar_todos()
            
            if atualizados > 0:
                # 3. Implementar pricing
                precos = implementar_pricing()
                
                if precos > 0:
                    print(f"\n🎉 SUCESSO TOTAL!")
                    print(f"   ✅ {atualizados} produtos com custos")
                    print(f"   ✅ {precos} preços ativos")
                    print(f"   ✅ Sistema VIP operacional!")
                else:
                    print(f"\n⚠️ Custos OK mas pricing falhou")
            else:
                print(f"\n❌ Nenhum produto atualizado")
        else:
            print(f"\n❌ Teste falhou")
            
    except Exception as e:
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 