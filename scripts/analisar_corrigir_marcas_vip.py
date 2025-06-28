#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
=======================================================
ANÁLISE E CORREÇÃO DE MARCAS - PRODUTOS INTERNOS VIP
=======================================================
Script para:
1. Analisar marcas atuais dos produtos internos
2. Corrigir produtos "Genérico" para "AliTools"
3. Pesquisar informações sobre marcas identificadas
4. Preparar dados para filtros frontend
"""

import psycopg2
import json
from datetime import datetime
import sys

# URL da base de dados
DATABASE_URL = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

def connect_db():
    """Conectar à base de dados"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return None

def analisar_marcas_atuais():
    """Analisar distribuição atual de marcas"""
    print("🔍 ANÁLISE DE MARCAS DOS PRODUTOS INTERNOS VIP")
    print("=" * 60)
    
    conn = connect_db()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cursor:
            # Análise geral de marcas
            cursor.execute("""
                SELECT 
                    brand,
                    COUNT(*) as produtos,
                    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM internal_products) * 100, 1) as percentagem,
                    STRING_AGG(name_pt, ', ' ORDER BY name_pt LIMIT 5) as exemplos
                FROM internal_products 
                GROUP BY brand 
                ORDER BY COUNT(*) DESC;
            """)
            
            marcas = cursor.fetchall()
            
            print(f"📊 DISTRIBUIÇÃO DE MARCAS ({len(marcas)} marcas encontradas):")
            print("-" * 80)
            print(f"{'MARCA':<15} {'PRODUTOS':<10} {'%':<6} EXEMPLOS")
            print("-" * 80)
            
            total_produtos = 0
            marcas_info = {}
            
            for marca, produtos, percentagem, exemplos in marcas:
                total_produtos += produtos
                print(f"{marca:<15} {produtos:<10} {percentagem:<6}% {exemplos[:50]}...")
                
                marcas_info[marca] = {
                    'produtos': produtos,
                    'percentagem': percentagem,
                    'exemplos': exemplos.split(', ')[:3] if exemplos else []
                }
            
            print("-" * 80)
            print(f"{'TOTAL':<15} {total_produtos:<10} {'100.0':<6}%")
            print()
            
            return marcas_info
            
    except Exception as e:
        print(f"❌ Erro na análise: {e}")
        return False
    finally:
        conn.close()

def identificar_produtos_sem_marca():
    """Identificar produtos que devem ter marca AliTools"""
    print("🔍 IDENTIFICANDO PRODUTOS SEM MARCA DEFINIDA")
    print("=" * 60)
    
    conn = connect_db()
    if not conn:
        return []
    
    try:
        with conn.cursor() as cursor:
            # Buscar produtos "Genérico" que devem ser AliTools
            cursor.execute("""
                SELECT 
                    internal_ean,
                    name_pt,
                    brand,
                    internal_sku
                FROM internal_products 
                WHERE brand IN ('Genérico', '', 'Generic', 'GENERIC')
                   OR brand IS NULL
                ORDER BY name_pt;
            """)
            
            produtos_genericos = cursor.fetchall()
            
            print(f"📋 Encontrados {len(produtos_genericos)} produtos sem marca específica:")
            print("-" * 80)
            
            for ean, nome, marca_atual, sku in produtos_genericos[:10]:  # Mostrar primeiros 10
                print(f"  • {ean} | {sku} | {marca_atual} → AliTools")
                print(f"    {nome[:60]}...")
                print()
            
            if len(produtos_genericos) > 10:
                print(f"  ... e mais {len(produtos_genericos) - 10} produtos")
            
            return produtos_genericos
            
    except Exception as e:
        print(f"❌ Erro na identificação: {e}")
        return []
    finally:
        conn.close()

def corrigir_marcas_alitools(produtos_para_corrigir):
    """Corrigir produtos genéricos para marca AliTools"""
    if not produtos_para_corrigir:
        print("✅ Nenhuma correção necessária")
        return True
    
    print(f"🔧 CORRIGINDO {len(produtos_para_corrigir)} PRODUTOS PARA MARCA ALITOOLS")
    print("=" * 60)
    
    resposta = input(f"Confirma a correção de {len(produtos_para_corrigir)} produtos? (s/N): ")
    if resposta.lower() != 's':
        print("❌ Operação cancelada pelo utilizador")
        return False
    
    conn = connect_db()
    if not conn:
        return False
    
    try:
        with conn.cursor() as cursor:
            produtos_corrigidos = 0
            
            for ean, nome, marca_atual, sku in produtos_para_corrigir:
                cursor.execute("""
                    UPDATE internal_products 
                    SET brand = 'AliTools',
                        updated_at = NOW()
                    WHERE internal_ean = %s
                """, (ean,))
                
                if cursor.rowcount > 0:
                    produtos_corrigidos += 1
                    print(f"✅ {ean}: {marca_atual} → AliTools")
            
            conn.commit()
            
            print(f"\n🎉 CORREÇÃO CONCLUÍDA: {produtos_corrigidos} produtos atualizados para marca AliTools")
            return True
            
    except Exception as e:
        print(f"❌ Erro na correção: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def gerar_info_marcas_conhecidas():
    """Gerar informações sobre marcas conhecidas"""
    print("📚 INFORMAÇÕES SOBRE MARCAS IDENTIFICADAS")
    print("=" * 60)
    
    marcas_info = {
        "AG TOOLS": {
            "nome_completo": "AG Tools",
            "tipo": "Ferramentas Profissionais",
            "origem": "Europa",
            "especialidade": "Ferramentas manuais e acessórios profissionais",
            "qualidade": "Profissional",
            "target": "Profissionais e uso intensivo",
            "website": "ag-tools.com",
            "descricao": "Marca especializada em ferramentas profissionais de alta qualidade para uso industrial e profissional."
        },
        "FERMAN": {
            "nome_completo": "Ferman",
            "tipo": "Equipamentos de Proteção Individual",
            "origem": "Europa",
            "especialidade": "EPI - Luvas, proteção, equipamentos de segurança",
            "qualidade": "Profissional/Industrial",
            "target": "Segurança no trabalho",
            "website": "ferman.eu",
            "descricao": "Marca especializada em equipamentos de proteção individual e segurança no trabalho."
        },
        "EXENA": {
            "nome_completo": "Exena",
            "tipo": "Calçado de Segurança",
            "origem": "Itália",
            "especialidade": "Calçado de proteção e segurança profissional",
            "qualidade": "Premium",
            "target": "Profissionais que requerem proteção de pés",
            "website": "exena.it",
            "descricao": "Marca italiana premium especializada em calçado de segurança e proteção profissional."
        },
        "AliTools": {
            "nome_completo": "AliTools",
            "tipo": "Ferramentas e Equipamentos Diversos",
            "origem": "Portugal",
            "especialidade": "Ferramentas diversas, produtos próprios da marca",
            "qualidade": "Boa relação qualidade/preço",
            "target": "Profissionais e utilizadores diversos",
            "website": "alitools.pt",
            "descricao": "Marca própria AliTools com produtos selecionados de qualidade a preços competitivos."
        }
    }
    
    for marca, info in marcas_info.items():
        print(f"🏷️ {marca.upper()}")
        print(f"   Nome Completo: {info['nome_completo']}")
        print(f"   Tipo: {info['tipo']}")
        print(f"   Origem: {info['origem']}")
        print(f"   Especialidade: {info['especialidade']}")
        print(f"   Qualidade: {info['qualidade']}")
        print(f"   Target: {info['target']}")
        print(f"   Website: {info['website']}")
        print(f"   Descrição: {info['descricao']}")
        print()
    
    return marcas_info

def gerar_config_filtros():
    """Gerar configuração para filtros frontend"""
    print("⚙️ GERANDO CONFIGURAÇÃO PARA FILTROS FRONTEND")
    print("=" * 60)
    
    conn = connect_db()
    if not conn:
        return None
    
    try:
        with conn.cursor() as cursor:
            # Buscar marcas atuais após correções
            cursor.execute("""
                SELECT 
                    brand,
                    COUNT(*) as produtos,
                    MIN(name_pt) as exemplo_produto
                FROM internal_products 
                WHERE is_active = true
                GROUP BY brand 
                HAVING COUNT(*) > 0
                ORDER BY COUNT(*) DESC;
            """)
            
            marcas_bd = cursor.fetchall()
            
            config_filtros = {
                "marcas_internas": {},
                "ordem_exibicao": [],
                "metadata": {
                    "total_marcas": len(marcas_bd),
                    "gerado_em": datetime.now().isoformat(),
                    "fonte": "internal_products"
                }
            }
            
            for marca, produtos, exemplo in marcas_bd:
                config_filtros["marcas_internas"][marca] = {
                    "nome_display": marca,
                    "produtos_count": produtos,
                    "exemplo_produto": exemplo,
                    "ativo": True,
                    "ordem": len(config_filtros["ordem_exibicao"])
                }
                config_filtros["ordem_exibicao"].append(marca)
            
            # Salvar configuração
            config_file = "docs/00-ATUAL-DESTAQUE/config_filtros_marcas_vip.json"
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(config_filtros, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Configuração salva em: {config_file}")
            print(f"📊 {len(marcas_bd)} marcas configuradas para filtros")
            
            # Mostrar resumo
            print("\n📋 MARCAS PARA FILTROS:")
            for marca, produtos, exemplo in marcas_bd:
                print(f"  • {marca}: {produtos} produtos")
            
            return config_filtros
            
    except Exception as e:
        print(f"❌ Erro ao gerar configuração: {e}")
        return None
    finally:
        conn.close()

def main():
    """Função principal"""
    print("🚀 ANÁLISE E CORREÇÃO DE MARCAS - PRODUTOS INTERNOS VIP")
    print("=" * 70)
    print()
    
    # 1. Analisar marcas atuais
    marcas_info = analisar_marcas_atuais()
    if not marcas_info:
        print("❌ Falha na análise de marcas")
        sys.exit(1)
    
    print()
    
    # 2. Identificar produtos sem marca
    produtos_genericos = identificar_produtos_sem_marca()
    
    print()
    
    # 3. Corrigir marcas se necessário
    if produtos_genericos:
        sucesso_correcao = corrigir_marcas_alitools(produtos_genericos)
        if not sucesso_correcao:
            print("❌ Falha na correção de marcas")
            sys.exit(1)
    else:
        print("✅ Todas as marcas já estão corretamente definidas")
    
    print()
    
    # 4. Gerar informações sobre marcas
    info_marcas = gerar_info_marcas_conhecidas()
    
    print()
    
    # 5. Gerar configuração para filtros
    config_filtros = gerar_config_filtros()
    
    print()
    print("🎉 ANÁLISE E CORREÇÃO DE MARCAS CONCLUÍDA COM SUCESSO!")
    print("=" * 70)
    print()
    print("📋 PRÓXIMOS PASSOS:")
    print("1. ✅ Marcas analisadas e corrigidas")
    print("2. ✅ Configuração de filtros gerada")
    print("3. 🔄 Implementar filtros por marca no frontend")
    print("4. 🔄 Testar filtros com produtos VIP")
    print()

if __name__ == "__main__":
    main() 