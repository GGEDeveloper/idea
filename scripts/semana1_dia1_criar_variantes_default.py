#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔥 SEMANA 1 - DIA 1: CRIAR VARIANTES DEFAULT
Implementar variantes default para 301 produtos VIP sem variantes

OBJETIVO: Tornar 100% dos produtos VIP funcionais com stock
REGRA RESPEITADA: Script preparado mas requer aprovação do USER antes de executar
"""

import psycopg2
import sys
from datetime import datetime

# Configuração da base de dados
DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

def conectar_bd():
    """Conectar à base de dados"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"❌ Erro ao conectar à BD: {e}")
        sys.exit(1)

def diagnosticar_estado_atual():
    """Diagnosticar estado atual do sistema VIP"""
    conn = conectar_bd()
    cur = conn.cursor()
    
    print("🔍 DIAGNÓSTICO PRÉ-IMPLEMENTAÇÃO")
    print("=" * 50)
    
    # Produtos sem variantes
    cur.execute("""
        SELECT ip.internal_ean, ip.name_pt, ip.brand
        FROM internal_products ip
        LEFT JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean
        WHERE iv.internal_ean IS NULL
        ORDER BY ip.internal_ean
    """)
    produtos_sem_variantes = cur.fetchall()
    
    # Estatísticas
    cur.execute("SELECT COUNT(*) FROM internal_products")
    total_produtos = cur.fetchone()[0]
    
    cur.execute("""
        SELECT COUNT(DISTINCT ip.internal_ean) 
        FROM internal_products ip
        JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean
    """)
    produtos_com_variantes = cur.fetchone()[0]
    
    sem_variantes_count = len(produtos_sem_variantes)
    
    print(f"📊 ESTADO ATUAL:")
    print(f"   • Total produtos VIP: {total_produtos}")
    print(f"   • Produtos COM variantes: {produtos_com_variantes} ({produtos_com_variantes/total_produtos*100:.1f}%)")
    print(f"   • Produtos SEM variantes: {sem_variantes_count} ({sem_variantes_count/total_produtos*100:.1f}%)")
    print()
    
    if sem_variantes_count > 0:
        print(f"🎯 PRODUTOS QUE RECEBERÃO VARIANTES DEFAULT:")
        for i, (ean, nome, marca) in enumerate(produtos_sem_variantes[:10], 1):
            print(f"   {i:2d}. {ean}: {nome[:50]}... ({marca})")
        if sem_variantes_count > 10:
            print(f"   ... e mais {sem_variantes_count - 10} produtos")
    
    conn.close()
    return produtos_sem_variantes

def preparar_script_variantes(produtos_sem_variantes):
    """Preparar o script SQL para criar variantes default"""
    
    sql_script = """
-- ===================================================
-- 🔥 SEMANA 1 - DIA 1: CRIAR VARIANTES DEFAULT
-- Data: """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """
-- Objetivo: Tornar 100% dos produtos VIP funcionais
-- ===================================================

BEGIN;

-- Criar variantes default para produtos sem variantes
INSERT INTO internal_variants (
    internal_variant_id,
    internal_ean,
    variant_name,
    variant_name_pt,
    variant_name_en,
    size_value,
    color_value,
    variant_sku,
    is_active,
    sort_order,
    created_at
)
SELECT 
    ip.internal_ean || '_V001' as internal_variant_id,
    ip.internal_ean,
    'Padrão' as variant_name,
    'Padrão' as variant_name_pt,
    'Default' as variant_name_en,
    NULL as size_value,
    NULL as color_value,
    ip.internal_sku || '_DEF' as variant_sku,
    true as is_active,
    0 as sort_order,
    NOW() as created_at
FROM internal_products ip
WHERE NOT EXISTS (
    SELECT 1 FROM internal_variants iv 
    WHERE iv.internal_ean = ip.internal_ean
);

-- Verificar se todas as variantes foram criadas
DO $$
DECLARE
    produtos_total INTEGER;
    produtos_com_variantes INTEGER;
    variantes_criadas INTEGER;
BEGIN
    SELECT COUNT(*) INTO produtos_total FROM internal_products;
    
    SELECT COUNT(DISTINCT internal_ean) INTO produtos_com_variantes 
    FROM internal_variants;
    
    SELECT COUNT(*) INTO variantes_criadas
    FROM internal_variants 
    WHERE internal_variant_id LIKE '%_V001';
    
    RAISE NOTICE '✅ RESULTADO DA CRIAÇÃO DE VARIANTES:';
    RAISE NOTICE '   • Total produtos VIP: %', produtos_total;
    RAISE NOTICE '   • Produtos com variantes: % (%.1f%%)', 
        produtos_com_variantes, 
        (produtos_com_variantes::FLOAT / produtos_total * 100);
    RAISE NOTICE '   • Variantes default criadas: %', variantes_criadas;
    
    IF produtos_com_variantes = produtos_total THEN
        RAISE NOTICE '🎉 SUCESSO: 100%% dos produtos têm variantes!';
    ELSE
        RAISE EXCEPTION 'ERRO: Ainda há produtos sem variantes!';
    END IF;
END $$;

COMMIT;

-- Verificação final
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    COUNT(*) as total_produtos,
    COUNT(DISTINCT iv.internal_ean) as produtos_com_variantes,
    (COUNT(DISTINCT iv.internal_ean)::FLOAT / COUNT(*) * 100)::NUMERIC(5,1) as percentagem_cobertura
FROM internal_products ip
LEFT JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean;
"""
    
    # Salvar script para revisão
    with open('scripts/sql_criar_variantes_default.sql', 'w', encoding='utf-8') as f:
        f.write(sql_script)
    
    print(f"\n📋 SCRIPT SQL PREPARADO:")
    print(f"   • Arquivo: scripts/sql_criar_variantes_default.sql")
    print(f"   • Variantes a criar: {len(produtos_sem_variantes)}")
    print(f"   • Formato ID: {{EAN}}_V001")
    print(f"   • Nome padrão: 'Padrão' (PT) / 'Default' (EN)")
    
    return sql_script

def executar_criacao_variantes(sql_script):
    """EXECUTA a criação de variantes (REQUER APROVAÇÃO DO USER)"""
    
    print("\n🚨 ATENÇÃO: OPERAÇÃO DE MODIFICAÇÃO DA BD")
    print("🔒 REGRA: 'NAO FAZER ALTERACOES SEM APROVAÇÃO DO USER'")
    print("\n❓ APROVAÇÃO NECESSÁRIA PARA EXECUTAR:")
    print("   • Criar 301 variantes default")
    print("   • Tornar 100% produtos VIP funcionais")
    print("   • Zero impacto no sistema Geko")
    
    resposta = input("\n✅ CONFIRMA EXECUÇÃO? (sim/NAO): ").strip().lower()
    
    if resposta in ['sim', 's', 'yes', 'y']:
        print("\n🔥 EXECUTANDO CRIAÇÃO DE VARIANTES...")
        
        conn = conectar_bd()
        cur = conn.cursor()
        
        try:
            # Executar o script
            cur.execute(sql_script)
            
            print("✅ VARIANTES CRIADAS COM SUCESSO!")
            conn.commit()
            
            # Verificação final
            cur.execute("""
                SELECT COUNT(*) as total_produtos,
                       COUNT(DISTINCT iv.internal_ean) as produtos_com_variantes
                FROM internal_products ip
                LEFT JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean
            """)
            total, com_variantes = cur.fetchone()
            
            print(f"\n🎯 RESULTADO FINAL:")
            print(f"   • Total produtos: {total}")
            print(f"   • Produtos com variantes: {com_variantes} ({com_variantes/total*100:.1f}%)")
            
            if com_variantes == total:
                print("🎉 MISSÃO CUMPRIDA: 100% produtos têm variantes!")
                return True
            else:
                print("⚠️ Aviso: Ainda há produtos sem variantes")
                return False
                
        except Exception as e:
            print(f"❌ ERRO na execução: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    else:
        print("❌ OPERAÇÃO CANCELADA pelo utilizador")
        print("💡 Script preparado em: scripts/sql_criar_variantes_default.sql")
        return False

def main():
    """Função principal"""
    print("🔥 SEMANA 1 - DIA 1: IMPLEMENTAÇÃO VARIANTES DEFAULT")
    print("=" * 60)
    print("🎯 OBJETIVO: Tornar 301 produtos VIP funcionais com stock")
    print()
    
    # Passo 1: Diagnosticar estado atual
    produtos_sem_variantes = diagnosticar_estado_atual()
    
    if not produtos_sem_variantes:
        print("✅ NADA A FAZER: Todos os produtos já têm variantes!")
        return
    
    # Passo 2: Preparar script
    sql_script = preparar_script_variantes(produtos_sem_variantes)
    
    # Passo 3: Executar (com aprovação)
    sucesso = executar_criacao_variantes(sql_script)
    
    if sucesso:
        print("\n🎉 DIA 1 CONCLUÍDO COM SUCESSO!")
        print("📋 PRÓXIMOS PASSOS:")
        print("   • Dia 2: Popular stock para novas variantes")
        print("   • Dia 3: Testar integração completa")
        print("   • Dia 4-5: Interface admin de preços")
    else:
        print("\n⏸️ DIA 1 PENDENTE - Aguarda aprovação do USER")

if __name__ == "__main__":
    main() 