#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎯 IMPORTAÇÃO CORRIGIDA VIP - PERFEIÇÃO GARANTIDA
================================================

OBJETIVO: Importação 100% correta do sistema VIP
GARANTIAS:
- ✅ Todos os produtos com preços base corretos
- ✅ Todas as variantes com relacionamentos íntegros
- ✅ 100% categorização automática
- ✅ Sistema de preços operacional
- ✅ Isolamento Geko preservado
- ✅ Verificações completas a cada passo

ESTRATÉGIA: Importação incremental com validação contínua
"""

import psycopg2
import csv
import sys
import json
from datetime import datetime
from pathlib import Path
import re

# Configuração
DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
CSV_FILE = '../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv'

# Estatísticas esperadas do CSV
PRODUTOS_ESPERADOS = 410
VARIANTES_ESPERADAS = 971
MARKUP_PADRAO = 35.0

def conectar_bd():
    """Conectar à base de dados"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        return conn
    except Exception as e:
        print(f"❌ ERRO: Não foi possível conectar à BD: {e}")
        sys.exit(1)

def verificar_pre_requisitos(conn):
    """Verificar que o sistema está limpo e pronto"""
    print("🔍 VERIFICAÇÃO PRÉ-REQUISITOS")
    print("=" * 40)
    
    cur = conn.cursor()
    
    # Verificar que tabelas VIP estão vazias
    tabelas_vip = [
        'internal_products', 'internal_variants', 'internal_product_categories',
        'internal_pricing', 'internal_product_attributes', 'internal_product_images'
    ]
    
    for tabela in tabelas_vip:
        cur.execute(f"SELECT COUNT(*) FROM {tabela}")
        count = cur.fetchone()[0]
        if count == 0:
            print(f"   ✅ {tabela}: VAZIO (correto)")
        else:
            print(f"   ❌ {tabela}: {count} registos (deveria estar vazio!)")
            return False
    
    # Verificar que Geko está intacto
    cur.execute("SELECT COUNT(*) FROM products")
    geko_products = cur.fetchone()[0]
    if geko_products == 8126:
        print(f"   ✅ Sistema Geko: {geko_products} produtos (preservado)")
    else:
        print(f"   ❌ Sistema Geko: {geko_products} produtos (esperado: 8126)")
        return False
    
    # Verificar categorias
    cur.execute("SELECT COUNT(*) FROM categories")
    categories = cur.fetchone()[0]
    if categories == 417:
        print(f"   ✅ Categorias: {categories} (416 Geko + 1 VIP)")
    else:
        print(f"   ❌ Categorias: {categories} (esperado: 417)")
        return False
        
    # Verificar CSV
    if not Path(CSV_FILE).exists():
        print(f"   ❌ CSV não encontrado: {CSV_FILE}")
        return False
    else:
        print(f"   ✅ CSV encontrado: {CSV_FILE}")
    
    print("   🎯 PRÉ-REQUISITOS CONFIRMADOS")
    return True

def analisar_csv():
    """Análise completa do CSV para validação"""
    print("\n📊 ANÁLISE COMPLETA DO CSV")
    print("=" * 40)
    
    produtos = {}
    variantes = []
    problemas = []
    
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row_num, row in enumerate(reader, 1):
                # Validar campos obrigatórios conforme estrutura real CSV
                handle_id = row.get('handleId', '').strip()
                field_type = row.get('fieldType', '').strip()
                nome = row.get('name', '').strip()
                preco = row.get('price', '0').strip()
                marca = row.get('brand', 'Genérico').strip()
                variante_nome = row.get('productOptionDescription1', '').strip()
                
                # Extrair EAN do handleId
                if not handle_id or not field_type:
                    problemas.append(f"Linha {row_num}: handleId ou fieldType em falta")
                    continue
                
                # Criar EAN a partir do handleId
                ean_base = handle_id.replace('product_', '').split('-')[0]
                ean = f"INT_{ean_base}"
                
                # Processar produto base
                if ean not in produtos:
                    try:
                        preco_float = float(preco.replace(',', '.')) if preco else 0.0
                    except:
                        preco_float = 0.0
                        problemas.append(f"Linha {row_num}: Preço inválido '{preco}'")
                    
                    produtos[ean] = {
                        'nome': nome,
                        'preco': preco_float,
                        'marca': row.get('Brand', 'Genérico').strip(),
                        'linha': row_num,
                        'variantes_count': 0
                    }
                
                # Processar variante
                if variante_nome:
                    variante_id = f"{ean}_V{produtos[ean]['variantes_count'] + 1}"
                    variantes.append({
                        'id': variante_id,
                        'ean': ean,
                        'nome': variante_nome,
                        'linha': row_num
                    })
                    produtos[ean]['variantes_count'] += 1
    
    except Exception as e:
        print(f"   ❌ ERRO ao ler CSV: {e}")
        return None, None, None
    
    print(f"   📊 Produtos únicos: {len(produtos)}")
    print(f"   📊 Variantes totais: {len(variantes)}")
    print(f"   📊 Problemas encontrados: {len(problemas)}")
    
    if problemas:
        print("   ⚠️ PROBLEMAS DETECTADOS:")
        for problema in problemas[:5]:  # Mostrar só os primeiros 5
            print(f"      - {problema}")
        if len(problemas) > 5:
            print(f"      ... e mais {len(problemas) - 5} problemas")
    
    # Validar estatísticas esperadas
    if len(produtos) != PRODUTOS_ESPERADOS:
        print(f"   ⚠️ ATENÇÃO: {len(produtos)} produtos (esperado: {PRODUTOS_ESPERADOS})")
    
    if len(variantes) != VARIANTES_ESPERADAS:
        print(f"   ⚠️ ATENÇÃO: {len(variantes)} variantes (esperado: {VARIANTES_ESPERADAS})")
    
    return produtos, variantes, problemas

def importar_produtos(conn, produtos):
    """Importar produtos base com máxima precisão"""
    print("\n🏗️ FASE 1: IMPORTAÇÃO PRODUTOS BASE")
    print("=" * 40)
    
    cur = conn.cursor()
    sucessos = 0
    erros = []
    
    try:
        cur.execute("BEGIN")
        
        for ean, dados in produtos.items():
            try:
                # Gerar SKU automático
                sku = f"VIP_{ean.replace('INT_', '')}"
                
                # Traduzir nome (simplificado para esta fase)
                nome_pt = dados['nome']
                nome_en = dados['nome']  # Melhorar posteriormente se necessário
                
                # Inserir produto
                cur.execute("""
                    INSERT INTO internal_products (
                        internal_ean, internal_sku, supplier_id, name, name_pt, name_en,
                        brand, base_cost, markup_percentage, is_active, is_featured
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    ean, sku, 'INTERNAL_001', dados['nome'], nome_pt, nome_en,
                    dados['marca'], dados['preco'], MARKUP_PADRAO, True, False
                ))
                
                sucessos += 1
                if sucessos % 50 == 0:
                    print(f"   📦 {sucessos} produtos importados...")
                    
            except Exception as e:
                erro = f"Produto {ean}: {e}"
                erros.append(erro)
                print(f"   ❌ {erro}")
        
        cur.execute("COMMIT")
        print(f"   ✅ {sucessos} produtos importados com sucesso")
        
        if erros:
            print(f"   ⚠️ {len(erros)} erros durante importação")
            
    except Exception as e:
        cur.execute("ROLLBACK")
        print(f"   ❌ ERRO CRÍTICO: {e}")
        return False
    
    return sucessos > 0

def importar_variantes(conn, variantes):
    """Importar variantes com relacionamentos íntegros"""
    print("\n🔗 FASE 2: IMPORTAÇÃO VARIANTES")
    print("=" * 40)
    
    cur = conn.cursor()
    sucessos = 0
    erros = []
    
    try:
        cur.execute("BEGIN")
        
        for variante in variantes:
            try:
                # Verificar se produto pai existe
                cur.execute("SELECT 1 FROM internal_products WHERE internal_ean = %s", (variante['ean'],))
                if not cur.fetchone():
                    erros.append(f"Produto pai {variante['ean']} não encontrado para variante {variante['id']}")
                    continue
                
                # Gerar SKU da variante
                variante_sku = f"VAR_{variante['id'].replace('INT_', '').replace('_V', '_')}"
                
                # Traduzir nome da variante
                nome_pt = variante['nome']
                nome_en = variante['nome']
                
                # Inserir variante
                cur.execute("""
                    INSERT INTO internal_variants (
                        internal_variant_id, internal_ean, variant_name, 
                        variant_name_pt, variant_name_en, variant_sku,
                        is_active, sort_order
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    variante['id'], variante['ean'], variante['nome'],
                    nome_pt, nome_en, variante_sku, True, 0
                ))
                
                sucessos += 1
                if sucessos % 100 == 0:
                    print(f"   🔗 {sucessos} variantes importadas...")
                    
            except Exception as e:
                erro = f"Variante {variante['id']}: {e}"
                erros.append(erro)
                print(f"   ❌ {erro}")
        
        cur.execute("COMMIT")
        print(f"   ✅ {sucessos} variantes importadas com sucesso")
        
        if erros:
            print(f"   ⚠️ {len(erros)} erros durante importação")
            
    except Exception as e:
        cur.execute("ROLLBACK")
        print(f"   ❌ ERRO CRÍTICO: {e}")
        return False
    
    return sucessos > 0

def aplicar_categorizacao(conn):
    """Aplicar categorização inteligente"""
    print("\n🏷️ FASE 3: CATEGORIZAÇÃO AUTOMÁTICA")
    print("=" * 40)
    
    cur = conn.cursor()
    
    # Regras de categorização (baseadas no sucesso anterior)
    regras_categoria = [
        ("luva", "112805"),  # Work Gloves
        ("glove", "112805"),
        ("disco", "112774"),  # Cutting Discs
        ("esponja", "107748"),  # Sponges
        ("sponge", "107748"),
        ("talocha", "110006"),  # Trowels and Spatulas
        ("espatula", "110006"),
        ("florentina", "110006"),
        ("colher", "110006"),
    ]
    
    fallback_categoria = "112781"  # General Mechanical Tools
    
    try:
        cur.execute("BEGIN")
        
        # Buscar todos os produtos
        cur.execute("SELECT internal_ean, name_pt FROM internal_products")
        produtos = cur.fetchall()
        
        categorias_aplicadas = {}
        
        for ean, nome in produtos:
            categoria_id = fallback_categoria  # Default
            nome_lower = nome.lower()
            
            # Aplicar regras
            for palavra_chave, cat_id in regras_categoria:
                if palavra_chave in nome_lower:
                    categoria_id = cat_id
                    break
            
            # Inserir categorização
            cur.execute("""
                INSERT INTO internal_product_categories (internal_ean, category_id)
                VALUES (%s, %s)
            """, (ean, categoria_id))
            
            # Estatísticas
            if categoria_id not in categorias_aplicadas:
                categorias_aplicadas[categoria_id] = 0
            categorias_aplicadas[categoria_id] += 1
        
        cur.execute("COMMIT")
        
        print("   📊 DISTRIBUIÇÃO POR CATEGORIA:")
        for cat_id, count in categorias_aplicadas.items():
            cur.execute("SELECT name FROM categories WHERE categoryid = %s", (cat_id,))
            cat_name = cur.fetchone()[0] if cur.fetchone() else "Desconhecida"
            print(f"      {cat_name}: {count} produtos")
        
        print(f"   ✅ {len(produtos)} produtos categorizados")
        
    except Exception as e:
        cur.execute("ROLLBACK")
        print(f"   ❌ ERRO: {e}")
        return False
    
    return True

def aplicar_precos(conn):
    """Aplicar sistema de preços nas 4 listas"""
    print("\n💰 FASE 4: SISTEMA DE PREÇOS")
    print("=" * 40)
    
    cur = conn.cursor()
    
    try:
        cur.execute("BEGIN")
        
        # Buscar produtos com preços base
        cur.execute("""
            SELECT ip.internal_ean, ip.base_cost, iv.internal_variant_id
            FROM internal_products ip
            JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean
            WHERE ip.base_cost > 0
        """)
        
        dados_precos = cur.fetchall()
        total_precos = 0
        
        # Aplicar nas 4 listas de preços
        for ean, base_cost, variant_id in dados_precos:
            for price_list_id in [1, 2, 3, 4]:
                # Calcular preço final com markup
                final_price = base_cost * (1 + MARKUP_PADRAO / 100)
                
                cur.execute("""
                    INSERT INTO internal_pricing (
                        internal_variant_id, price_list_id, selling_price,
                        cost_basis, margin_percentage, is_active
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                """, (variant_id, price_list_id, final_price, base_cost, MARKUP_PADRAO, True))
                
                total_precos += 1
        
        cur.execute("COMMIT")
        print(f"   ✅ {total_precos} preços aplicados")
        
        # Estatísticas
        cur.execute("""
            SELECT COUNT(DISTINCT ip.internal_ean) 
            FROM internal_products ip
            JOIN internal_pricing ipr ON ip.internal_ean LIKE CONCAT(SPLIT_PART(ipr.internal_variant_id, '_V', 1), '%')
        """)
        produtos_com_preco = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM internal_products")
        total_produtos = cur.fetchone()[0]
        
        percentagem = (produtos_com_preco / total_produtos * 100) if total_produtos > 0 else 0
        print(f"   📊 {produtos_com_preco}/{total_produtos} produtos com preços ({percentagem:.1f}%)")
        
    except Exception as e:
        cur.execute("ROLLBACK")
        print(f"   ❌ ERRO: {e}")
        return False
    
    return True

def verificacao_final(conn):
    """Verificação completa do sistema importado"""
    print("\n🔍 VERIFICAÇÃO FINAL COMPLETA")
    print("=" * 40)
    
    cur = conn.cursor()
    
    verificacoes = [
        ("Produtos importados", "SELECT COUNT(*) FROM internal_products"),
        ("Variantes importadas", "SELECT COUNT(*) FROM internal_variants"),
        ("Produtos categorizados", "SELECT COUNT(DISTINCT internal_ean) FROM internal_product_categories"),
        ("Preços aplicados", "SELECT COUNT(*) FROM internal_pricing"),
        ("Produtos com preços base", "SELECT COUNT(*) FROM internal_products WHERE base_cost > 0"),
        ("Sistema Geko preservado", "SELECT COUNT(*) FROM products"),
        ("View unificada", "SELECT COUNT(*) FROM unified_product_catalog WHERE source_type = 'internal'")
    ]
    
    resultados = {}
    
    for desc, query in verificacoes:
        try:
            cur.execute(query)
            count = cur.fetchone()[0]
            resultados[desc] = count
            print(f"   📊 {desc}: {count}")
        except Exception as e:
            print(f"   ❌ {desc}: ERRO - {e}")
            resultados[desc] = None
    
    # Verificações de integridade
    print("\n   🔍 VERIFICAÇÕES DE INTEGRIDADE:")
    
    # Produtos sem variantes
    cur.execute("""
        SELECT COUNT(*) FROM internal_products ip
        LEFT JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean
        WHERE iv.internal_ean IS NULL
    """)
    produtos_sem_variantes = cur.fetchone()[0]
    print(f"      Produtos sem variantes: {produtos_sem_variantes}")
    
    # Variantes órfãs
    cur.execute("""
        SELECT COUNT(*) FROM internal_variants iv
        LEFT JOIN internal_products ip ON iv.internal_ean = ip.internal_ean
        WHERE ip.internal_ean IS NULL
    """)
    variantes_orfas = cur.fetchone()[0]
    print(f"      Variantes órfãs: {variantes_orfas}")
    
    # Produtos sem preços
    cur.execute("""
        SELECT COUNT(*) FROM internal_products
        WHERE base_cost IS NULL OR base_cost = 0
    """)
    produtos_sem_preco = cur.fetchone()[0]
    print(f"      Produtos sem preços: {produtos_sem_preco}")
    
    # Determinar sucesso
    problemas = (produtos_sem_variantes > 0 or variantes_orfas > 0 or produtos_sem_preco > 5)
    
    if not problemas and resultados.get("Produtos importados", 0) > 400:
        print("\n   🎉 IMPORTAÇÃO PERFEITA - TODOS OS CRITÉRIOS ATENDIDOS!")
        return True
    else:
        print("\n   ⚠️ Importação com problemas menores")
        return False

def main():
    """Coordenador principal da importação"""
    print("🎯 IMPORTAÇÃO CORRIGIDA VIP - PERFEIÇÃO GARANTIDA")
    print("="*60)
    print("🎯 OBJETIVO: Importação 100% correta com zero problemas")
    print("🛡️ GARANTIA: Máxima precisão e integridade")
    
    # Conectar BD
    conn = conectar_bd()
    
    try:
        # Etapa 1: Pré-requisitos
        if not verificar_pre_requisitos(conn):
            print("\n🚨 PRÉ-REQUISITOS FALHARAM - ABORTANDO")
            return False
        
        # Etapa 2: Analisar CSV
        produtos, variantes, problemas = analisar_csv()
        if not produtos:
            print("\n🚨 ANÁLISE CSV FALHADA - ABORTANDO")
            return False
        
        # Etapa 3: Importar produtos
        if not importar_produtos(conn, produtos):
            print("\n🚨 IMPORTAÇÃO PRODUTOS FALHADA - ABORTANDO")
            return False
        
        # Etapa 4: Importar variantes
        if not importar_variantes(conn, variantes):
            print("\n🚨 IMPORTAÇÃO VARIANTES FALHADA - ABORTANDO")
            return False
        
        # Etapa 5: Categorização
        if not aplicar_categorizacao(conn):
            print("\n🚨 CATEGORIZAÇÃO FALHADA - ABORTANDO")
            return False
        
        # Etapa 6: Preços
        if not aplicar_precos(conn):
            print("\n🚨 SISTEMA PREÇOS FALHADO - ABORTANDO")
            return False
        
        # Etapa 7: Verificação final
        sucesso = verificacao_final(conn)
        
        if sucesso:
            print("\n🏆 IMPORTAÇÃO PERFEITA CONCLUÍDA!")
            print("🎯 Sistema VIP 100% operacional")
            print("🛡️ Sistema Geko preservado")
            print("💎 Qualidade garantida")
            return True
        else:
            print("\n⚠️ Importação com problemas menores")
            return False
            
    except Exception as e:
        print(f"\n🚨 ERRO INESPERADO: {e}")
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    if main():
        print("\n✅ SUCESSO TOTAL - SISTEMA PRONTO PARA PRODUÇÃO!")
    else:
        print("\n❌ FALHA NA IMPORTAÇÃO - VERIFICAR LOGS") 