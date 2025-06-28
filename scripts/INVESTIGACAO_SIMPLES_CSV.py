#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔥 INVESTIGAÇÃO HARDCORE SIMPLES - CSV
======================================
Análise robusta e prática do CSV
"""

import csv
from collections import Counter, defaultdict
import json

CSV_FILE = '../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv'

def safe_get(row, key, default=''):
    """Getter seguro para valores do CSV"""
    value = row.get(key)
    return str(value).strip() if value is not None else default

def investigar_csv():
    """Investigação prática e robusta"""
    print("🔥 INVESTIGAÇÃO HARDCORE - ANÁLISE PRÁTICA")
    print("=" * 60)
    
    produtos_unicos = {}
    variantes = []
    marcas = Counter()
    categorias = Counter()
    precos_produtos = []
    precos_variantes = []
    
    total_linhas = 0
    linhas_product = 0
    linhas_variant = 0
    
    with open(CSV_FILE, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        print(f"📋 CAMPOS CSV: {len(reader.fieldnames)}")
        
        for row_num, row in enumerate(reader, 1):
            total_linhas += 1
            
            # Extrair dados com segurança
            handle_id = safe_get(row, 'handleId')
            field_type = safe_get(row, 'fieldType')
            name = safe_get(row, 'name')
            price_str = safe_get(row, 'price')
            brand = safe_get(row, 'brand')
            category_id = safe_get(row, 'geko_category_id')
            category_name = safe_get(row, 'geko_category_name')
            option1 = safe_get(row, 'productOptionDescription1')
            
            # Processar preço
            price = 0.0
            if price_str:
                try:
                    price = float(price_str.replace(',', '.'))
                except:
                    price = 0.0
            
            if field_type == 'Product':
                linhas_product += 1
                
                # Gerar EAN único
                if handle_id.startswith('product_'):
                    ean_base = handle_id.replace('product_', '').split('-')[0][:8]
                    ean = f"INT_{ean_base.upper()}"
                    
                    produtos_unicos[ean] = {
                        'handle_id': handle_id,
                        'name': name,
                        'price': price,
                        'brand': brand,
                        'category_id': category_id,
                        'category_name': category_name,
                        'linha': row_num
                    }
                    
                    if brand:
                        marcas[brand] += 1
                    if category_name:
                        categorias[category_name] += 1
                    if price > 0:
                        precos_produtos.append(price)
                        
            elif field_type == 'Variant':
                linhas_variant += 1
                
                if handle_id.startswith('product_'):
                    ean_base = handle_id.replace('product_', '').split('-')[0][:8]
                    parent_ean = f"INT_{ean_base.upper()}"
                    variant_id = f"{parent_ean}_V{len([v for v in variantes if v['parent_ean'] == parent_ean]) + 1}"
                    
                    variantes.append({
                        'variant_id': variant_id,
                        'parent_ean': parent_ean,
                        'option1': option1,
                        'price': price,
                        'linha': row_num
                    })
                    
                    if price > 0:
                        precos_variantes.append(price)
    
    # Relatório
    print(f"\n📊 ESTATÍSTICAS GERAIS:")
    print(f"   Total de linhas: {total_linhas}")
    print(f"   Linhas 'Product': {linhas_product}")
    print(f"   Linhas 'Variant': {linhas_variant}")
    print(f"   Produtos únicos: {len(produtos_unicos)}")
    print(f"   Variantes totais: {len(variantes)}")
    
    print(f"\n💰 PREÇOS:")
    if precos_produtos:
        print(f"   Produtos com preço: {len(precos_produtos)}")
        print(f"   Faixa: €{min(precos_produtos):.2f} - €{max(precos_produtos):.2f}")
        print(f"   Média: €{sum(precos_produtos)/len(precos_produtos):.2f}")
    
    if precos_variantes:
        print(f"   Variantes com preço: {len(precos_variantes)}")
        print(f"   Faixa: €{min(precos_variantes):.2f} - €{max(precos_variantes):.2f}")
        print(f"   Média: €{sum(precos_variantes)/len(precos_variantes):.2f}")
    
    print(f"\n🏭 TOP 5 MARCAS:")
    for marca, count in marcas.most_common(5):
        print(f"   {marca}: {count} produtos")
    
    print(f"\n🏷️ TOP 5 CATEGORIAS:")
    for categoria, count in categorias.most_common(5):
        print(f"   {categoria}: {count} produtos")
    
    # Análise de variantes por produto
    variantes_por_produto = defaultdict(int)
    for var in variantes:
        variantes_por_produto[var['parent_ean']] += 1
    
    if variantes_por_produto:
        counts = list(variantes_por_produto.values())
        print(f"\n🔗 VARIANTES POR PRODUTO:")
        print(f"   Produtos com variantes: {len(variantes_por_produto)}")
        print(f"   Max variantes: {max(counts)}")
        print(f"   Média variantes: {sum(counts)/len(counts):.1f}")
    
    # Exemplos
    print(f"\n📝 EXEMPLOS DE PRODUTOS:")
    for i, (ean, produto) in enumerate(list(produtos_unicos.items())[:5], 1):
        print(f"   {i}. {ean}")
        print(f"      Nome: {produto['name'][:50]}")
        print(f"      Preço: €{produto['price']}")
        print(f"      Marca: {produto['brand']}")
        print(f"      Categoria: {produto['category_name']}")
        
        # Variantes deste produto
        vars_produto = [v for v in variantes if v['parent_ean'] == ean]
        if vars_produto:
            print(f"      Variantes ({len(vars_produto)}):")
            for var in vars_produto[:3]:
                print(f"         - {var['option1']} (€{var['price']})")
        print()
    
    return {
        'produtos': produtos_unicos,
        'variantes': variantes,
        'stats': {
            'total_produtos': len(produtos_unicos),
            'total_variantes': len(variantes),
            'marcas': dict(marcas.most_common()),
            'categorias': dict(categorias.most_common())
        }
    }

def gerar_estrategia_importacao(dados):
    """Gerar estratégia de importação baseada na análise"""
    print(f"\n🎯 ESTRATÉGIA DE IMPORTAÇÃO RECOMENDADA")
    print("=" * 50)
    
    produtos = dados['produtos']
    variantes = dados['variantes']
    stats = dados['stats']
    
    # Determinar problemas
    produtos_sem_preco = len([p for p in produtos.values() if p['price'] == 0])
    variantes_sem_preco = len([v for v in variantes if v['price'] == 0])
    produtos_sem_marca = len([p for p in produtos.values() if not p['brand']])
    
    print(f"📊 ANÁLISE DE QUALIDADE:")
    print(f"   ✅ Produtos válidos: {len(produtos)}")
    print(f"   ✅ Variantes válidas: {len(variantes)}")
    print(f"   ⚠️ Produtos sem preço: {produtos_sem_preco}")
    print(f"   ⚠️ Variantes sem preço: {variantes_sem_preco}")
    print(f"   ⚠️ Produtos sem marca: {produtos_sem_marca}")
    
    print(f"\n🔧 ESTRATÉGIA RECOMENDADA:")
    print(f"   1. Importar {len(produtos)} produtos base")
    print(f"   2. Importar {len(variantes)} variantes")
    print(f"   3. Aplicar preços base nos produtos (usar preço produto principal)")
    print(f"   4. Calcular preços finais com markup 35%")
    print(f"   5. Categorizar automaticamente")
    print(f"   6. Sistema ficará 100% operacional")
    
    return True

if __name__ == "__main__":
    try:
        dados = investigar_csv()
        gerar_estrategia_importacao(dados)
        
        print(f"\n🏆 INVESTIGAÇÃO CONCLUÍDA COM SUCESSO!")
        print(f"🚀 Sistema pronto para importação hardcore!")
        
    except Exception as e:
        print(f"❌ ERRO: {e}")
        import traceback
        traceback.print_exc() 