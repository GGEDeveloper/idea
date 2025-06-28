#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔥 INVESTIGAÇÃO HARDCORE DO CSV - ANÁLISE CIENTÍFICA COMPLETA
============================================================

OBJETIVO: Entender 100% da estrutura real do CSV antes de qualquer importação
ABORDAGEM: Análise sistemática, científica e exaustiva
GARANTIA: Zero suposições, só dados reais e verificados
"""

import csv
import json
from collections import defaultdict, Counter
from pathlib import Path

CSV_FILE = '../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv'

def analisar_estrutura_csv():
    """Análise hardcore da estrutura do CSV"""
    print("🔥 INVESTIGAÇÃO HARDCORE: ESTRUTURA CSV")
    print("=" * 60)
    
    if not Path(CSV_FILE).exists():
        print(f"❌ CSV não encontrado: {CSV_FILE}")
        return None
    
    with open(CSV_FILE, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        # Analisar cabeçalhos
        campos = reader.fieldnames
        print(f"📋 CAMPOS DISPONÍVEIS ({len(campos)} total):")
        for i, campo in enumerate(campos, 1):
            print(f"   {i:2d}. {campo}")
        
        return campos, reader

def analisar_tipos_linha():
    """Analisar tipos de linha no CSV"""
    print("\n🔍 ANÁLISE: TIPOS DE LINHA")
    print("=" * 40)
    
    tipos_linha = Counter()
    exemplos_por_tipo = defaultdict(list)
    
    with open(CSV_FILE, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row_num, row in enumerate(reader, 1):
            field_type = (row.get('fieldType') or '').strip()
            tipos_linha[field_type] += 1
            
            # Guardar exemplos (máximo 3 por tipo)
            if len(exemplos_por_tipo[field_type]) < 3:
                exemplos_por_tipo[field_type].append({
                    'linha': row_num,
                    'handleId': (row.get('handleId') or '')[:50],
                    'name': (row.get('name') or '')[:30],
                    'price': (row.get('price') or ''),
                    'brand': (row.get('brand') or '')
                })
    
    print("📊 DISTRIBUIÇÃO POR TIPO:")
    for tipo, count in tipos_linha.most_common():
        print(f"   {tipo or 'VAZIO'}: {count} linhas")
        
        print("   📝 EXEMPLOS:")
        for exemplo in exemplos_por_tipo[tipo]:
            print(f"      L{exemplo['linha']}: {exemplo['handleId']} | {exemplo['name']} | €{exemplo['price']} | {exemplo['brand']}")
        print()

def analisar_produtos_vs_variantes():
    """Análise específica de produtos vs variantes"""
    print("\n🏗️ ANÁLISE: PRODUTOS VS VARIANTES")
    print("=" * 40)
    
    produtos = {}
    variantes = []
    produtos_com_variantes = defaultdict(list)
    
    with open(CSV_FILE, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row_num, row in enumerate(reader, 1):
            handle_id = row.get('handleId', '').strip()
            field_type = row.get('fieldType', '').strip()
            name = row.get('name', '').strip()
            price = row.get('price', '').strip()
            brand = row.get('brand', '').strip()
            
            if field_type == 'Product':
                # Produto principal
                produtos[handle_id] = {
                    'linha': row_num,
                    'name': name,
                    'price': price,
                    'brand': brand,
                    'handle_id': handle_id
                }
            elif field_type == 'Variant':
                # Variante
                variante_info = {
                    'linha': row_num,
                    'handle_id': handle_id,
                    'parent_product': handle_id,
                    'option1': row.get('productOptionDescription1', ''),
                    'price': price
                }
                variantes.append(variante_info)
                produtos_com_variantes[handle_id].append(variante_info)
    
    print(f"📦 PRODUTOS PRINCIPAIS: {len(produtos)}")
    print(f"🔗 VARIANTES TOTAIS: {len(variantes)}")
    print(f"🏷️ PRODUTOS COM VARIANTES: {len(produtos_com_variantes)}")
    
    # Estatísticas de variantes por produto
    variantes_stats = [len(vars) for vars in produtos_com_variantes.values()]
    if variantes_stats:
        print(f"📊 VARIANTES POR PRODUTO: min={min(variantes_stats)}, max={max(variantes_stats)}, média={sum(variantes_stats)/len(variantes_stats):.1f}")
    
    # Exemplos de produtos com mais variantes
    print("\n📋 TOP 5 PRODUTOS COM MAIS VARIANTES:")
    top_produtos = sorted(produtos_com_variantes.items(), key=lambda x: len(x[1]), reverse=True)[:5]
    for handle_id, vars in top_produtos:
        produto = produtos.get(handle_id, {})
        print(f"   {produto.get('name', 'NOME VAZIO')[:40]}: {len(vars)} variantes")
        for i, var in enumerate(vars[:3], 1):  # Mostrar só 3 primeiras
            print(f"      {i}. {var['option1'][:30]} (€{var['price']})")
        if len(vars) > 3:
            print(f"      ... e mais {len(vars) - 3} variantes")
        print()
    
    return produtos, variantes, produtos_com_variantes

def analisar_precos_marcas():
    """Análise detalhada de preços e marcas"""
    print("\n💰 ANÁLISE: PREÇOS E MARCAS")
    print("=" * 40)
    
    precos_produtos = []
    precos_variantes = []
    marcas = Counter()
    produtos_sem_preco = 0
    variantes_sem_preco = 0
    
    with open(CSV_FILE, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            field_type = row.get('fieldType', '').strip()
            price_str = row.get('price', '').strip()
            brand = row.get('brand', '').strip()
            name = row.get('name', '').strip()
            
            # Analisar preços
            if price_str:
                try:
                    price = float(price_str.replace(',', '.'))
                    if field_type == 'Product':
                        precos_produtos.append(price)
                    elif field_type == 'Variant':
                        precos_variantes.append(price)
                except:
                    pass
            else:
                if field_type == 'Product':
                    produtos_sem_preco += 1
                elif field_type == 'Variant':
                    variantes_sem_preco += 1
            
            # Analisar marcas
            if brand and field_type == 'Product':
                marcas[brand] += 1
    
    # Estatísticas de preços
    if precos_produtos:
        print(f"💶 PREÇOS PRODUTOS: {len(precos_produtos)} com preço")
        print(f"   Min: €{min(precos_produtos):.2f}")
        print(f"   Max: €{max(precos_produtos):.2f}")
        print(f"   Média: €{sum(precos_produtos)/len(precos_produtos):.2f}")
    print(f"   Sem preço: {produtos_sem_preco}")
    
    if precos_variantes:
        print(f"\n🔗 PREÇOS VARIANTES: {len(precos_variantes)} com preço")
        print(f"   Min: €{min(precos_variantes):.2f}")
        print(f"   Max: €{max(precos_variantes):.2f}")
        print(f"   Média: €{sum(precos_variantes)/len(precos_variantes):.2f}")
    print(f"   Sem preço: {variantes_sem_preco}")
    
    # Top marcas
    print(f"\n🏭 TOP 10 MARCAS:")
    for marca, count in marcas.most_common(10):
        print(f"   {marca or 'SEM MARCA'}: {count} produtos")

def analisar_categorias():
    """Análise das categorias Geko no CSV"""
    print("\n🏷️ ANÁLISE: CATEGORIAS GEKO")
    print("=" * 40)
    
    categorias = Counter()
    categoria_paths = Counter()
    
    with open(CSV_FILE, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            if row.get('fieldType', '').strip() == 'Product':
                cat_id = row.get('geko_category_id', '').strip()
                cat_name = row.get('geko_category_name', '').strip()
                cat_path = row.get('geko_category_path', '').strip()
                
                if cat_id:
                    categorias[f"{cat_id} - {cat_name}"] += 1
                if cat_path:
                    categoria_paths[cat_path] += 1
    
    print(f"📊 CATEGORIAS IDENTIFICADAS: {len(categorias)}")
    for categoria, count in categorias.most_common(10):
        print(f"   {categoria}: {count} produtos")
    
    print(f"\n📁 PATHS MAIS COMUNS:")
    for path, count in categoria_paths.most_common(5):
        print(f"   {path}: {count} produtos")

def gerar_mapeamento_ean():
    """Gerar mapeamento de EANs baseado na análise"""
    print("\n🔗 ANÁLISE: GERAÇÃO DE EANs")
    print("=" * 40)
    
    ean_mapping = {}
    duplicados = Counter()
    
    with open(CSV_FILE, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row_num, row in enumerate(reader, 1):
            handle_id = row.get('handleId', '').strip()
            field_type = row.get('fieldType', '').strip()
            
            if field_type == 'Product' and handle_id:
                # Extrair parte única do handleId
                if handle_id.startswith('product_'):
                    id_part = handle_id.replace('product_', '')
                    # Usar os primeiros 8 caracteres como base
                    ean_base = id_part.split('-')[0][:8]
                    ean = f"INT_{ean_base.upper()}"
                    
                    if ean in ean_mapping:
                        duplicados[ean] += 1
                    else:
                        ean_mapping[ean] = {
                            'handle_id': handle_id,
                            'linha': row_num,
                            'name': row.get('name', '')[:30]
                        }
    
    print(f"📋 EANs ÚNICOS GERADOS: {len(ean_mapping)}")
    if duplicados:
        print(f"⚠️ EANs DUPLICADOS: {len(duplicados)}")
        for ean, count in duplicados.most_common(5):
            print(f"   {ean}: {count} duplicados")
    
    # Mostrar exemplos
    print("\n📝 EXEMPLOS EANs GERADOS:")
    for i, (ean, info) in enumerate(list(ean_mapping.items())[:5], 1):
        print(f"   {i}. {ean} ← {info['handle_id']} | {info['name']}")
    
    return ean_mapping

def salvar_relatorio(dados):
    """Salvar relatório completo da investigação"""
    print("\n💾 SALVANDO RELATÓRIO COMPLETO")
    print("=" * 40)
    
    relatorio = {
        'timestamp': str(datetime.now()),
        'csv_file': CSV_FILE,
        'dados': dados
    }
    
    with open('relatorio_investigacao_csv.json', 'w', encoding='utf-8') as f:
        json.dump(relatorio, f, indent=2, ensure_ascii=False)
    
    print("   ✅ Relatório salvo: relatorio_investigacao_csv.json")

def main():
    """Investigação hardcore completa"""
    print("🔥 INVESTIGAÇÃO HARDCORE DO CSV - MODO CIENTÍFICO")
    print("=" * 70)
    print("🎯 OBJETIVO: Entender 100% da estrutura antes da importação")
    print("🛡️ GARANTIA: Zero suposições, só dados verificados")
    
    # Análise 1: Estrutura geral
    campos, reader = analisar_estrutura_csv()
    if not campos:
        return
    
    # Análise 2: Tipos de linha
    analisar_tipos_linha()
    
    # Análise 3: Produtos vs Variantes
    produtos, variantes, produtos_com_variantes = analisar_produtos_vs_variantes()
    
    # Análise 4: Preços e marcas
    analisar_precos_marcas()
    
    # Análise 5: Categorias
    analisar_categorias()
    
    # Análise 6: EANs
    ean_mapping = gerar_mapeamento_ean()
    
    # Resumo final
    print("\n🏆 RESUMO FINAL DA INVESTIGAÇÃO")
    print("=" * 50)
    print(f"📦 Produtos únicos: {len(produtos)}")
    print(f"🔗 Variantes totais: {len(variantes)}")
    print(f"🏷️ EANs únicos: {len(ean_mapping)}")
    print(f"📊 Campos CSV: {len(campos)}")
    
    dados_resumo = {
        'produtos': len(produtos),
        'variantes': len(variantes),
        'eans_unicos': len(ean_mapping),
        'campos_csv': len(campos),
        'produtos_com_variantes': len(produtos_com_variantes)
    }
    
    print("\n🎯 SISTEMA PRONTO PARA IMPORTAÇÃO HARDCORE!")
    return dados_resumo

if __name__ == "__main__":
    from datetime import datetime
    main() 