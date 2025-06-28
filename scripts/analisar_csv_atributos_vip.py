#!/usr/bin/env python3
"""
🔍 ANÁLISE CSV VIP - EXTRAÇÃO DE ATRIBUTOS
=========================================

Analisa o CSV catalog_products_LIMPO.csv para identificar:
- Que atributos técnicos podemos extrair
- Como mapear para chaves compatíveis com Geko
- Estratégia de implementação

OBJETIVO: Mapear 410 produtos VIP com atributos técnicos
"""

import pandas as pd
import re
from collections import defaultdict, Counter
import json

def analisar_estrutura_csv():
    """Analisa a estrutura do CSV VIP"""
    print("📋 ESTRUTURA DO CSV VIP")
    print("=" * 50)
    
    try:
        # Carregar CSV
        df = pd.read_csv('../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv')
        
        print(f"Total de linhas: {len(df):,}")
        print(f"Total de colunas: {len(df.columns)}")
        
        print("\nColunas disponíveis:")
        for i, col in enumerate(df.columns):
            print(f"  {i+1:2d}. {col}")
            
        return df
        
    except Exception as e:
        print(f"❌ Erro ao carregar CSV: {e}")
        return None

def extrair_produtos_base(df):
    """Identifica produtos base (não variantes)"""
    print("\n📦 PRODUTOS BASE VS VARIANTES")
    print("=" * 50)
    
    produtos_base = df[df['fieldType'] == 'Product'].copy()
    variantes = df[df['fieldType'] == 'Variant'].copy()
    
    print(f"Produtos base: {len(produtos_base)}")
    print(f"Variantes: {len(variantes)}")
    print(f"Total: {len(df)}")
    
    return produtos_base, variantes

def analisar_campos_descricao(produtos_base):
    """Analisa campos de descrição para extrair atributos"""
    print("\n🔍 ANÁLISE DOS CAMPOS DE DESCRIÇÃO")
    print("=" * 50)
    
    # Campos com potencial para atributos
    campos_relevantes = ['description', 'name', 'productOptionName1', 'productOptionDescription1', 
                        'additionalInfoTitle1', 'additionalInfoDescription1', 
                        'additionalInfoTitle2', 'additionalInfoDescription2',
                        'brand']
    
    for campo in campos_relevantes:
        if campo in produtos_base.columns:
            valores_nao_vazios = produtos_base[campo].dropna()
            print(f"\n{campo}: {len(valores_nao_vazios)}/{len(produtos_base)} produtos")
            
            if len(valores_nao_vazios) > 0:
                # Mostrar alguns exemplos
                exemplos = valores_nao_vazios.head(3).tolist()
                for ex in exemplos:
                    if isinstance(ex, str) and len(ex) > 0:
                        print(f"  • {ex[:100]}...")

def extrair_marcas(produtos_base):
    """Extrai e normaliza marcas"""
    print("\n🏭 ANÁLISE DAS MARCAS")
    print("=" * 50)
    
    marcas = produtos_base['brand'].dropna().value_counts()
    print(f"Marcas identificadas: {len(marcas)}")
    
    for marca, count in marcas.head(10).items():
        print(f"  • {marca}: {count} produtos")
    
    return marcas

def extrair_dimensoes_descricoes(produtos_base):
    """Extrai dimensões das descrições usando regex"""
    print("\n📐 EXTRAÇÃO DE DIMENSÕES DAS DESCRIÇÕES")
    print("=" * 50)
    
    # Padrões regex para dimensões
    padroes_dimensoes = {
        'milimetros': r'(\d+(?:\.\d+)?)\s*mm',
        'centimetros': r'(\d+(?:\.\d+)?)\s*cm',
        'metros': r'(\d+(?:\.\d+)?)\s*m(?:\s|$)',
        'polegadas': r'(\d+(?:\.\d+)?)"',
        'medidas_complexas': r'(\d+)x(\d+)(?:x(\d+))?\s*(?:mm|cm)'
    }
    
    dimensoes_encontradas = defaultdict(list)
    
    for index, row in produtos_base.iterrows():
        # Combinar campos de texto para busca
        texto_completo = ""
        for campo in ['name', 'description']:
            if pd.notna(row[campo]):
                texto_completo += str(row[campo]) + " "
        
        # Aplicar padrões regex
        for tipo, padrao in padroes_dimensoes.items():
            matches = re.findall(padrao, texto_completo, re.IGNORECASE)
            if matches:
                dimensoes_encontradas[tipo].extend(matches)
    
    print("Dimensões encontradas:")
    for tipo, valores in dimensoes_encontradas.items():
        print(f"  • {tipo}: {len(valores)} ocorrências")
        if valores:
            exemplos = list(set(valores))[:5]
            print(f"    Exemplos: {exemplos}")

def extrair_materiais_descricoes(produtos_base):
    """Extrai materiais das descrições"""
    print("\n🔧 EXTRAÇÃO DE MATERIAIS DAS DESCRIÇÕES")
    print("=" * 50)
    
    # Padrões de materiais comuns
    materiais_comuns = [
        'aço', 'steel', 'inox', 'alumínio', 'aluminum', 'ferro', 'iron',
        'plástico', 'plastic', 'borracha', 'rubber', 'pvc', 'abs',
        'carbono', 'carbon', 'titanio', 'titanium', 'hss',
        'madeira', 'wood', 'couro', 'leather', 'tecido', 'fabric',
        'poliéster', 'polyester', 'nylon', 'silicone'
    ]
    
    materiais_encontrados = defaultdict(int)
    produtos_com_material = 0
    
    for index, row in produtos_base.iterrows():
        texto_completo = ""
        for campo in ['name', 'description']:
            if pd.notna(row[campo]):
                texto_completo += str(row[campo]).lower() + " "
        
        material_encontrado = False
        for material in materiais_comuns:
            if material.lower() in texto_completo:
                materiais_encontrados[material] += 1
                material_encontrado = True
        
        if material_encontrado:
            produtos_com_material += 1
    
    print(f"Produtos com material identificado: {produtos_com_material}/{len(produtos_base)}")
    print("\nMateriais mais comuns:")
    for material, count in sorted(materiais_encontrados.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  • {material}: {count} produtos")

def extrair_certificacoes(produtos_base):
    """Extrai certificações e normas"""
    print("\n📜 EXTRAÇÃO DE CERTIFICAÇÕES")
    print("=" * 50)
    
    # Padrões de certificações
    padroes_cert = [
        r'EN\s*\d+', r'ISO\s*\d+', r'CE\b', r'DIN\s*\d+',
        r'ANSI\s*\w+', r'S\d+P?', r'IP\d+', r'EN ISO\s*\d+'
    ]
    
    certificacoes_encontradas = defaultdict(int)
    produtos_com_cert = 0
    
    for index, row in produtos_base.iterrows():
        texto_completo = ""
        for campo in ['name', 'description']:
            if pd.notna(row[campo]):
                texto_completo += str(row[campo]) + " "
        
        cert_encontrada = False
        for padrao in padroes_cert:
            matches = re.findall(padrao, texto_completo, re.IGNORECASE)
            for match in matches:
                certificacoes_encontradas[match.upper()] += 1
                cert_encontrada = True
        
        if cert_encontrada:
            produtos_com_cert += 1
    
    print(f"Produtos com certificações: {produtos_com_cert}/{len(produtos_base)}")
    print("\nCertificações mais comuns:")
    for cert, count in sorted(certificacoes_encontradas.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  • {cert}: {count} produtos")

def mapear_para_chaves_geko():
    """Sugere mapeamento para chaves compatíveis com Geko"""
    print("\n🔄 MAPEAMENTO PARA CHAVES GEKO")
    print("=" * 50)
    
    mapeamento = {
        'Material': ['material_extraido', 'composicao'],
        'Dimensões': ['comprimento', 'largura', 'altura', 'diametro'],
        'Peso': ['peso_kg', 'peso_gramas'],
        'Certificações': ['certificacao_en', 'certificacao_iso', 'certificacao_ce'],
        'Aplicação': ['uso_recomendado', 'aplicacao'],
        'Marca': ['brand'],
        'Modelo': ['modelo', 'codigo_produto'],
        'Acabamento': ['acabamento_superficie', 'cor'],
        'Resistência': ['resistencia_temperatura', 'resistencia_impacto']
    }
    
    print("Mapeamento recomendado:")
    for categoria, atributos in mapeamento.items():
        print(f"\n{categoria}:")
        for attr in atributos:
            print(f"  • {attr}")

def sugerir_estrategia_implementacao():
    """Sugere estratégia de implementação"""
    print("\n💡 ESTRATÉGIA DE IMPLEMENTAÇÃO")
    print("=" * 50)
    
    print("""
BASEADO NA ANÁLISE DO CSV, ESTRATÉGIA RECOMENDADA:

1. 🔍 **EXTRAÇÃO AUTOMÁTICA**
   ✅ Marca: Campo 'brand' direto
   ✅ Material: Regex em descriptions  
   ✅ Dimensões: Regex para mm, cm, polegadas
   ✅ Certificações: Regex para EN, ISO, CE, DIN

2. 🎯 **ATRIBUTOS PRIORITÁRIOS**
   • brand → 'Marca'
   • material_detectado → 'Material' 
   • dimensoes → 'Dimensões'
   • certificacoes → 'Certificação'
   • aplicacao → 'Aplicação'

3. 🔧 **IMPLEMENTAÇÃO TÉCNICA**
   • Script Python para processar CSV
   • Extrair via regex e palavras-chave
   • Inserir em product_attributes
   • Mapear internal_ean → product_ean

4. 📊 **RESULTADO ESPERADO**
   • 410 produtos com 3-5 atributos cada
   • ~1,500-2,000 novos registos
   • Compatibilidade total com sistema Geko

PRÓXIMO: Implementar script de extração e inserção.
""")

def main():
    print("🔍 ANÁLISE CSV VIP - EXTRAÇÃO DE ATRIBUTOS")
    print("=" * 60)
    
    # Carregar e analisar CSV
    df = analisar_estrutura_csv()
    if df is None:
        return
    
    # Separar produtos base de variantes
    produtos_base, variantes = extrair_produtos_base(df)
    
    # Análises detalhadas
    analisar_campos_descricao(produtos_base)
    extrair_marcas(produtos_base)
    extrair_dimensoes_descricoes(produtos_base)
    extrair_materiais_descricoes(produtos_base)
    extrair_certificacoes(produtos_base)
    
    # Estratégia
    mapear_para_chaves_geko()
    sugerir_estrategia_implementacao()

if __name__ == "__main__":
    main() 