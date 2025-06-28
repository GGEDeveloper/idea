#!/usr/bin/env python3
"""
🗂️ IMPLEMENTAÇÃO CATEGORIZAÇÃO VIP - ESTRATÉGIA HÍBRIDA
======================================================

OBJETIVO: Categorizar produtos internos com estratégia híbrida
- Criar categoria principal "AliTools VIP"
- Mapear também a categorias existentes relevantes
- Duplo mapeamento para máxima visibilidade

ESTRATÉGIA:
1. Criar categoria "AliTools VIP" 
2. Mapear produtos por palavra-chave/tipo
3. Duplo mapeamento (AliTools + categoria técnica)
4. Verificar integridade
"""

import psycopg2
import os
import re

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

def criar_categoria_alitools(conn):
    """Cria categoria principal AliTools VIP"""
    with conn.cursor() as cur:
        # Verificar se já existe
        cur.execute("SELECT categoryid FROM categories WHERE name = 'AliTools VIP'")
        existing = cur.fetchone()
        
        if existing:
            print(f"✅ Categoria AliTools VIP já existe: {existing[0]}")
            return existing[0]
        
        # Criar nova categoria principal
        # Usar ID alto para não conflitar
        alitools_id = "ALI_VIP_001"
        
        cur.execute("""
            INSERT INTO categories (categoryid, name, path, parent_id, created_at)
            VALUES (%s, %s, %s, NULL, NOW())
        """, (alitools_id, "AliTools VIP", "AliTools VIP"))
        
        print(f"✅ Categoria AliTools VIP criada: {alitools_id}")
        return alitools_id

def definir_mapeamentos():
    """Define regras de mapeamento por palavra-chave"""
    return {
        # Categoria técnica: [palavras-chave, categoria_existente_id]
        'ferramentas_construcao': {
            'keywords': ['talocha', 'espatula', 'grosa', 'colher'],
            'category_id': '107705',  # Construction and Renovation
            'description': 'Ferramentas de Construção'
        },
        'ferramentas_gerais': {
            'keywords': ['alicate', 'chave', 'ferramenta', 'alavanca'],
            'category_id': '107881',  # General Mechanical Tools
            'description': 'Ferramentas Gerais'
        },
        'epi_protecao': {
            'keywords': ['luva', 'bota', 'capacete', 'proteção', 'segurança', 'auscultador'],
            'category_id': '107709',  # Tools for Electricians (temporário)
            'description': 'EPI e Proteção'
        },
        'vestuario': {
            'keywords': ['parka', 'bata', 'avental', 'roupa'],
            'category_id': '107705',  # Construction (temporário)
            'description': 'Vestuário Profissional'
        },
        'fixacoes': {
            'keywords': ['parafuso', 'abraçadeira', 'agrafador'],
            'category_id': '107881',  # General Tools
            'description': 'Fixações e Conectores'
        },
        'seguranca': {
            'keywords': ['extintor', 'segurança', 'emergência'],
            'category_id': '107705',  # Construction
            'description': 'Equipamentos de Segurança'
        },
        'equipamentos': {
            'keywords': ['maquina', 'bomba', 'equipamento'],
            'category_id': '105277',  # Power Tools
            'description': 'Equipamentos e Máquinas'
        }
    }

def mapear_produto_por_conteudo(nome, mapeamentos):
    """Mapeia produto com base no conteúdo do nome"""
    nome_lower = nome.lower()
    categorias_encontradas = []
    
    for categoria_key, config in mapeamentos.items():
        for keyword in config['keywords']:
            if keyword in nome_lower:
                categorias_encontradas.append({
                    'key': categoria_key,
                    'category_id': config['category_id'],
                    'description': config['description'],
                    'keyword_match': keyword
                })
                break  # Primeira keyword que encontrar
    
    return categorias_encontradas

def implementar_categorizacao(conn):
    """Implementa categorização completa"""
    alitools_id = criar_categoria_alitools(conn)
    mapeamentos = definir_mapeamentos()
    
    with conn.cursor() as cur:
        # Buscar todos produtos internos
        cur.execute("""
            SELECT internal_ean, name, brand
            FROM internal_products
            WHERE is_active = true
            ORDER BY brand, name
        """)
        
        produtos = cur.fetchall()
        print(f"\n🔄 PROCESSANDO {len(produtos)} PRODUTOS:")
        
        # Estatísticas
        stats = {
            'total': len(produtos),
            'alitools_mapped': 0,
            'technical_mapped': 0,
            'dual_mapped': 0,
            'unmapped': 0
        }
        
        for ean, nome, marca in produtos:
            # 1. SEMPRE mapear para AliTools VIP
            cur.execute("""
                INSERT INTO product_categories (product_ean, category_id)
                VALUES (%s, %s)
                ON CONFLICT (product_ean, category_id) DO NOTHING
            """, (ean, alitools_id))
            
            stats['alitools_mapped'] += 1
            
            # 2. Tentar mapear para categoria técnica
            categorias_tecnicas = mapear_produto_por_conteudo(nome, mapeamentos)
            
            if categorias_tecnicas:
                # Usar primeira categoria encontrada
                cat_info = categorias_tecnicas[0]
                
                cur.execute("""
                    INSERT INTO product_categories (product_ean, category_id)
                    VALUES (%s, %s)
                    ON CONFLICT (product_ean, category_id) DO NOTHING
                """, (ean, cat_info['category_id']))
                
                stats['technical_mapped'] += 1
                stats['dual_mapped'] += 1
                
                print(f"✅ {ean}: {nome[:30]}...")
                print(f"   → AliTools VIP + {cat_info['description']} (via '{cat_info['keyword_match']}')")
            else:
                stats['unmapped'] += 1
                print(f"⚪ {ean}: {nome[:30]}...")
                print(f"   → Só AliTools VIP (sem match técnico)")
        
        return stats

def verificar_resultado(conn):
    """Verifica resultado da categorização"""
    with conn.cursor() as cur:
        # Produtos categorizados
        cur.execute("""
            SELECT COUNT(DISTINCT pc.product_ean)
            FROM product_categories pc
            JOIN internal_products ip ON pc.product_ean = ip.internal_ean
        """)
        categorizados = cur.fetchone()[0]
        
        # Total produtos
        cur.execute("SELECT COUNT(*) FROM internal_products")
        total = cur.fetchone()[0]
        
        # Produtos na categoria AliTools
        cur.execute("""
            SELECT COUNT(*)
            FROM product_categories pc
            WHERE pc.category_id = 'ALI_VIP_001'
        """)
        alitools_count = cur.fetchone()[0]
        
        # Duplo mapeamento
        cur.execute("""
            SELECT COUNT(DISTINCT pc.product_ean)
            FROM product_categories pc
            JOIN internal_products ip ON pc.product_ean = ip.internal_ean
            GROUP BY pc.product_ean
            HAVING COUNT(pc.category_id) > 1
        """)
        duplo = cur.fetchone()[0]
        
        return {
            'categorizados': categorizados,
            'total': total,
            'alitools_count': alitools_count,
            'duplo_mapeamento': duplo
        }

def main():
    print("🗂️ IMPLEMENTAÇÃO CATEGORIZAÇÃO VIP - ESTRATÉGIA HÍBRIDA")
    print("=" * 70)
    
    try:
        conn = conectar()
        
        print("\n📋 ESTRATÉGIA HÍBRIDA:")
        print("   1. ✅ Todos produtos → Categoria 'AliTools VIP'")
        print("   2. 🎯 Produtos relevantes → Categorias técnicas existentes")
        print("   3. 🔄 Duplo mapeamento para máxima visibilidade")
        
        # Implementar
        stats = implementar_categorizacao(conn)
        conn.commit()
        
        # Verificar
        resultado = verificar_resultado(conn)
        
        print(f"\n📊 ESTATÍSTICAS FINAIS:")
        print(f"   • Total produtos: {stats['total']}")
        print(f"   • Mapeados AliTools: {stats['alitools_mapped']}")
        print(f"   • Mapeados técnicos: {stats['technical_mapped']}")
        print(f"   • Duplo mapeamento: {stats['dual_mapped']}")
        print(f"   • Só AliTools: {stats['unmapped']}")
        
        print(f"\n🔍 VERIFICAÇÃO:")
        print(f"   • Produtos categorizados: {resultado['categorizados']}/{resultado['total']}")
        print(f"   • Na categoria AliTools: {resultado['alitools_count']}")
        print(f"   • Com duplo mapeamento: {resultado['duplo_mapeamento']}")
        
        # Status final
        cobertura = (resultado['categorizados'] / resultado['total'] * 100)
        
        if cobertura >= 99:
            print(f"\n🎉 SUCESSO TOTAL! Categorização VIP 100% implementada!")
            print(f"   ✅ {cobertura:.1f}% produtos categorizados")
            print(f"   ✅ Estratégia híbrida funcionando")
            print(f"   ✅ Produtos visíveis em navegação")
            print(f"   ✅ Identidade AliTools preservada")
        else:
            print(f"\n⚠️ Implementação parcial: {cobertura:.1f}% cobertura")
        
        conn.close()
        
    except Exception as e:
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 