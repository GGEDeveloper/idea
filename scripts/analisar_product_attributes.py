#!/usr/bin/env python3
"""
🔍 ANÁLISE PROFUNDA: PRODUCT_ATTRIBUTES
=====================================

Analisa a tabela product_attributes existente para perceber:
- Quantos registos existem
- Que tipos de atributos estão mapeados
- Se são dados Geko ou internos
- Como podemos mapear atributos VIP

OBJETIVO: Determinar estratégia para implementar atributos dos produtos VIP
"""

import psycopg2
import os
from collections import Counter
import json

def conectar_bd():
    """Conecta à BD usando credenciais Neon"""
    try:
        # URL da BD Neon
        db_url = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
        conn = psycopg2.connect(db_url)
        return conn
    except Exception as e:
        print(f"❌ Erro conexão BD: {e}")
        return None

def analisar_estrutura_tabela(conn):
    """Analisa a estrutura da tabela product_attributes"""
    print("📋 ESTRUTURA DA TABELA product_attributes")
    print("=" * 50)
    
    try:
        with conn.cursor() as cur:
            # Estrutura da tabela
            cur.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'product_attributes'
                ORDER BY ordinal_position;
            """)
            colunas = cur.fetchall()
            
            print("Colunas:")
            for col in colunas:
                print(f"  • {col[0]} ({col[1]}) - Null: {col[2]} - Default: {col[3]}")
            
    except Exception as e:
        print(f"❌ Erro ao analisar estrutura: {e}")

def analisar_dados_existentes(conn):
    """Analisa os dados existentes na tabela"""
    print("\n📊 ANÁLISE DOS DADOS EXISTENTES")
    print("=" * 50)
    
    try:
        with conn.cursor() as cur:
            # Estatísticas gerais
            cur.execute("""
                SELECT 
                    COUNT(*) as total_registos,
                    COUNT(DISTINCT product_ean) as produtos_unicos,
                    COUNT(DISTINCT key) as chaves_unicas
                FROM product_attributes;
            """)
            stats = cur.fetchone()
            print(f"Total de registos: {stats[0]:,}")
            print(f"Produtos únicos: {stats[1]:,}")
            print(f"Chaves de atributos únicas: {stats[2]:,}")
            
            # Tipos de produtos (Geko vs VIP)
            cur.execute("""
                SELECT 
                    CASE 
                        WHEN product_ean LIKE 'INT_%' THEN 'VIP (Interno)'
                        ELSE 'Geko (Externo)'
                    END as tipo_produto,
                    COUNT(*) as registos,
                    COUNT(DISTINCT product_ean) as produtos
                FROM product_attributes
                GROUP BY 
                    CASE 
                        WHEN product_ean LIKE 'INT_%' THEN 'VIP (Interno)'
                        ELSE 'Geko (Externo)'
                    END;
            """)
            tipos = cur.fetchall()
            
            print("\nDistribuição por tipo:")
            for tipo in tipos:
                print(f"  • {tipo[0]}: {tipo[1]:,} registos, {tipo[2]:,} produtos")
                
    except Exception as e:
        print(f"❌ Erro ao analisar dados: {e}")

def analisar_atributos_geko(conn):
    """Analisa os atributos dos produtos Geko existentes"""
    print("\n🔧 ATRIBUTOS DOS PRODUTOS GEKO")
    print("=" * 50)
    
    try:
        with conn.cursor() as cur:
            # Top 20 chaves mais comuns nos produtos Geko
            cur.execute("""
                SELECT 
                    key,
                    COUNT(*) as frequencia,
                    COUNT(DISTINCT product_ean) as produtos_diferentes,
                    STRING_AGG(DISTINCT LEFT(value, 50), ' | ') as exemplos_valores
                FROM product_attributes 
                WHERE product_ean NOT LIKE 'INT_%'
                GROUP BY key
                ORDER BY frequencia DESC
                LIMIT 20;
            """)
            
            atributos_geko = cur.fetchall()
            
            print("Top 20 atributos Geko mais comuns:")
            for attr in atributos_geko:
                print(f"  • '{attr[0]}': {attr[1]} vezes, {attr[2]} produtos")
                print(f"    Exemplos: {attr[3][:100]}...")
                print()
                
    except Exception as e:
        print(f"❌ Erro ao analisar atributos Geko: {e}")

def analisar_atributos_vip(conn):
    """Verifica se já existem atributos VIP"""
    print("\n🎯 ATRIBUTOS DOS PRODUTOS VIP")
    print("=" * 50)
    
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    COUNT(*) as total_vip,
                    COUNT(DISTINCT product_ean) as produtos_vip,
                    COUNT(DISTINCT key) as chaves_vip
                FROM product_attributes 
                WHERE product_ean LIKE 'INT_%';
            """)
            
            stats_vip = cur.fetchone()
            
            if stats_vip[0] == 0:
                print("❌ NÃO EXISTEM ATRIBUTOS PARA PRODUTOS VIP!")
                print("   Todos os 410 produtos VIP estão SEM atributos técnicos.")
                print("   Esta é uma lacuna importante para implementar.")
            else:
                print(f"✅ Existem {stats_vip[0]} atributos VIP")
                print(f"   Cobrindo {stats_vip[1]} produtos de 410 totais")
                
                # Ver quais são os atributos VIP
                cur.execute("""
                    SELECT key, COUNT(*), STRING_AGG(DISTINCT value, ' | ')
                    FROM product_attributes 
                    WHERE product_ean LIKE 'INT_%'
                    GROUP BY key
                    ORDER BY COUNT(*) DESC;
                """)
                
                attrs_vip = cur.fetchall()
                for attr in attrs_vip:
                    print(f"  • {attr[0]}: {attr[1]} vezes")
                    
    except Exception as e:
        print(f"❌ Erro ao analisar atributos VIP: {e}")

def sugerir_estrategia_implementacao():
    """Sugere estratégia baseada na análise"""
    print("\n💡 ESTRATÉGIA DE IMPLEMENTAÇÃO")
    print("=" * 50)
    
    print("""
BASEADO NA ANÁLISE ACIMA, A ESTRATÉGIA RECOMENDADA É:

1. 📋 **MAPEAR ATRIBUTOS DO CSV ORIGINAL**
   - Extrair informações técnicas do CSV catalog_products_LIMPO.csv
   - Campos como: material, tamanho, peso, dimensões, certificações

2. 🔄 **NORMALIZAR CHAVES DE ATRIBUTOS**
   - Usar as mesmas chaves que o sistema Geko (para compatibilidade)
   - Criar chaves específicas VIP quando necessário

3. 🎯 **CAMPOS PRIORITÁRIOS PARA VIP**
   - Material/composição
   - Dimensões/tamanho
   - Peso
   - Marca/fabricante
   - Certificações (CE, EN, etc.)
   - Aplicação/uso recomendado

4. 🔧 **IMPLEMENTAÇÃO TÉCNICA**
   - Script para extrair do CSV
   - Inserir na tabela product_attributes existente
   - Manter foreign key para internal_products via internal_ean

PRÓXIMO PASSO: Analisar o CSV para identificar campos disponíveis.
""")

def main():
    print("🔍 ANÁLISE PROFUNDA: PRODUCT_ATTRIBUTES")
    print("=" * 60)
    
    conn = conectar_bd()
    if not conn:
        return
    
    try:
        analisar_estrutura_tabela(conn)
        analisar_dados_existentes(conn)
        analisar_atributos_geko(conn)
        analisar_atributos_vip(conn)
        sugerir_estrategia_implementacao()
        
    finally:
        conn.close()
        print("\n✅ Análise concluída!")

if __name__ == "__main__":
    main() 