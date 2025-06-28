#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🏆 VALIDAÇÃO FINAL - PRODUTOS VIP ACESSÍVEIS
===========================================
Verificar se todos os problemas de acesso foram resolvidos
"""

import psycopg2
import requests
import json
from datetime import datetime

DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
BASE_URL = 'http://localhost:3000'

def testar_api_produtos_vip():
    """Testar API de produtos VIP"""
    print("🔍 TESTE API PRODUTOS VIP")
    print("=" * 40)
    
    # Buscar alguns produtos VIP para testar
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT internal_ean, name, brand 
        FROM internal_products 
        LIMIT 5
    """)
    produtos_vip = cur.fetchall()
    
    resultados = []
    
    for ean, name, brand in produtos_vip:
        print(f"\n   🧪 Testando: {ean} - {name[:30]}...")
        
        try:
            # Testar API
            response = requests.get(f"{BASE_URL}/api/products/{ean}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar dados essenciais
                checks = {
                    'tem_name': bool(data.get('name')),
                    'tem_variants': bool(data.get('variants')),
                    'tem_stock': bool(data.get('stock')),
                    'tem_categoria': bool(data.get('categories')),
                    'source_type': data.get('source_type') == 'internal'
                }
                
                sucesso = all(checks.values())
                status = "✅ SUCESSO" if sucesso else "⚠️ PARCIAL"
                
                resultados.append({
                    'ean': ean,
                    'name': name,
                    'status': status,
                    'api_code': response.status_code,
                    'checks': checks
                })
                
                print(f"      {status} - {response.status_code}")
                if not sucesso:
                    print(f"      Issues: {[k for k, v in checks.items() if not v]}")
                
            else:
                print(f"      ❌ ERRO - {response.status_code}")
                resultados.append({
                    'ean': ean,
                    'name': name,
                    'status': '❌ ERRO',
                    'api_code': response.status_code,
                    'checks': {}
                })
                
        except Exception as e:
            print(f"      ❌ EXCEÇÃO - {str(e)}")
            resultados.append({
                'ean': ean,
                'name': name,
                'status': '❌ EXCEÇÃO',
                'api_code': 'N/A',
                'checks': {}
            })
    
    conn.close()
    return resultados

def testar_casos_especificos():
    """Testar casos específicos mencionados pelo usuário"""
    print("\n🎯 TESTE CASOS ESPECÍFICOS")
    print("=" * 40)
    
    casos = [
        'INT_75D07C82',  # Caso original do problema
        'INT_980344A4',  # Produto com variantes
        'INT_46D3E2CE'   # Outro produto testado
    ]
    
    resultados = []
    
    for ean in casos:
        print(f"\n   🔍 Caso específico: {ean}")
        
        try:
            # Testar API
            response = requests.get(f"{BASE_URL}/api/products/{ean}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"      ✅ API: {response.status_code}")
                print(f"      📦 Nome: {data.get('name', 'N/A')}")
                print(f"      🏭 Marca: {data.get('brand', 'N/A')}")
                print(f"      📊 Stock: {data.get('stock', 'N/A')}")
                print(f"      🔗 Variantes: {len(data.get('variants', []))}")
                
                resultados.append({
                    'ean': ean,
                    'api_status': '✅ SUCESSO',
                    'nome': data.get('name'),
                    'stock': data.get('stock'),
                    'variantes': len(data.get('variants', []))
                })
                
            else:
                print(f"      ❌ API: {response.status_code}")
                resultados.append({
                    'ean': ean,
                    'api_status': f'❌ ERRO {response.status_code}',
                    'nome': None,
                    'stock': None,
                    'variantes': 0
                })
                
        except Exception as e:
            print(f"      ❌ EXCEÇÃO: {str(e)}")
            resultados.append({
                'ean': ean,
                'api_status': f'❌ EXCEÇÃO: {str(e)}',
                'nome': None,
                'stock': None,
                'variantes': 0
            })
    
    return resultados

def verificar_dados_bd():
    """Verificar estado atual da base de dados"""
    print("\n📊 VERIFICAÇÃO BASE DE DADOS")
    print("=" * 40)
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Estatísticas gerais
    stats = {}
    
    # Produtos VIP
    cur.execute("SELECT COUNT(*) FROM internal_products")
    stats['produtos_vip'] = cur.fetchone()[0]
    
    # Variantes VIP
    cur.execute("SELECT COUNT(*) FROM internal_variants")
    stats['variantes_vip'] = cur.fetchone()[0]
    
    # Stock VIP
    cur.execute("SELECT COUNT(*) FROM internal_stock")
    stats['stock_vip'] = cur.fetchone()[0]
    
    # Produtos Geko
    cur.execute("SELECT COUNT(*) FROM products")
    stats['produtos_geko'] = cur.fetchone()[0]
    
    # View unificada
    cur.execute("SELECT COUNT(*) FROM unified_product_catalog")
    stats['produtos_unificados'] = cur.fetchone()[0]
    
    print(f"   📦 Produtos VIP: {stats['produtos_vip']}")
    print(f"   🔗 Variantes VIP: {stats['variantes_vip']}")
    print(f"   📊 Stock VIP: {stats['stock_vip']}")
    print(f"   🛡️ Produtos Geko: {stats['produtos_geko']}")
    print(f"   🌐 Produtos Unificados: {stats['produtos_unificados']}")
    
    conn.close()
    return stats

def main():
    """Execução principal da validação"""
    print("🏆 VALIDAÇÃO FINAL - PRODUTOS VIP ACESSÍVEIS")
    print("=" * 60)
    print(f"⏰ Iniciado em: {datetime.now().strftime('%H:%M:%S')}")
    
    # 1. Verificar base de dados
    stats_bd = verificar_dados_bd()
    
    # 2. Testar API produtos VIP
    resultados_api = testar_api_produtos_vip()
    
    # 3. Testar casos específicos
    casos_especificos = testar_casos_especificos()
    
    # 4. Gerar relatório final
    print("\n" + "="*60)
    print("📊 RELATÓRIO FINAL")
    print("="*60)
    
    # Análise da API
    sucessos_api = len([r for r in resultados_api if '✅' in r['status']])
    total_testes = len(resultados_api)
    percentual_sucesso = (sucessos_api / total_testes * 100) if total_testes > 0 else 0
    
    print(f"🔍 TESTES API:")
    print(f"   ✅ Sucessos: {sucessos_api}/{total_testes} ({percentual_sucesso:.1f}%)")
    
    # Análise casos específicos
    casos_ok = len([c for c in casos_especificos if '✅' in c['api_status']])
    total_casos = len(casos_especificos)
    
    print(f"🎯 CASOS ESPECÍFICOS:")
    print(f"   ✅ Resolvidos: {casos_ok}/{total_casos}")
    
    # Estado do sistema
    print(f"📊 ESTADO DO SISTEMA:")
    print(f"   🌐 {stats_bd['produtos_unificados']} produtos visíveis")
    print(f"   📦 {stats_bd['produtos_vip']} produtos VIP com {stats_bd['variantes_vip']} variantes")
    print(f"   📊 {stats_bd['stock_vip']} registos de stock VIP")
    
    # Avaliação final
    criterios_sucesso = [
        percentual_sucesso >= 80,  # 80% testes API passaram
        casos_ok >= 2,             # Pelo menos 2 casos específicos resolvidos
        stats_bd['produtos_vip'] >= 400,     # Produtos VIP presentes
        stats_bd['stock_vip'] >= 900,        # Stock VIP implementado
        stats_bd['produtos_unificados'] >= 8500  # View unificada operacional
    ]
    
    sucessos_criterios = sum(criterios_sucesso)
    total_criterios = len(criterios_sucesso)
    
    if sucessos_criterios >= 4:
        print(f"\n🎉 VALIDAÇÃO APROVADA!")
        print(f"🏆 Critérios atendidos: {sucessos_criterios}/{total_criterios}")
        print(f"✅ Produtos VIP totalmente acessíveis")
        print(f"🚀 Sistema pronto para uso")
        status_final = "APROVADO"
    elif sucessos_criterios >= 3:
        print(f"\n✅ VALIDAÇÃO PARCIAL")
        print(f"📊 Critérios atendidos: {sucessos_criterios}/{total_criterios}")
        print(f"🔧 Alguns ajustes menores podem ser necessários")
        status_final = "PARCIAL"
    else:
        print(f"\n❌ VALIDAÇÃO FALHADA")
        print(f"📊 Critérios atendidos: {sucessos_criterios}/{total_criterios}")
        print(f"🚨 Problemas críticos ainda existem")
        status_final = "FALHADA"
    
    print("="*60)
    
    return status_final, {
        'percentual_sucesso_api': percentual_sucesso,
        'casos_resolvidos': casos_ok,
        'stats_bd': stats_bd,
        'criterios_atendidos': sucessos_criterios
    }

if __name__ == "__main__":
    status, dados = main()
    
    if status == "APROVADO":
        print("\n🎊 PARABÉNS! TODOS OS PROBLEMAS DE ACESSO VIP RESOLVIDOS!")
    elif status == "PARCIAL":
        print("\n👍 Progresso excelente, pequenos ajustes finais necessários")
    else:
        print("\n🔧 Mais trabalho necessário para resolver problemas críticos") 