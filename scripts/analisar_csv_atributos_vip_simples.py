#!/usr/bin/env python3
"""
🔍 ANÁLISE CSV VIP - EXTRAÇÃO DE ATRIBUTOS (VERSÃO SIMPLES)
========================================================

Analisa o CSV catalog_products_LIMPO.csv usando apenas bibliotecas padrão:
- Identifica atributos técnicos extraíveis
- Mapeia para chaves compatíveis com Geko
- Define estratégia de implementação

OBJETIVO: Mapear 410 produtos VIP com atributos técnicos
"""

import csv
import re
from collections import defaultdict, Counter

def analisar_estrutura_csv():
    """Analisa a estrutura do CSV VIP"""
    print("📋 ESTRUTURA DO CSV VIP")
    print("=" * 50)
    
    try:
        # Carregar CSV
        with open('../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # Ler primeira linha para ver colunas
            first_row = next(reader)
            colunas = list(first_row.keys())
            
            # Contar total de linhas
            f.seek(0)
            total_linhas = sum(1 for line in f) - 1  # -1 para header
            
            print(f"Total de linhas: {total_linhas:,}")
            print(f"Total de colunas: {len(colunas)}")
            
            print("\nColunas disponíveis:")
            for i, col in enumerate(colunas):
                print(f"  {i+1:2d}. {col}")
                
            return True, colunas
            
    except Exception as e:
        print(f"❌ Erro ao carregar CSV: {e}")
        return False, []

def analisar_produtos_e_variantes():
    """Analisa produtos base vs variantes"""
    print("\n📦 PRODUTOS BASE VS VARIANTES")
    print("=" * 50)
    
    produtos_base = []
    variantes = []
    
    try:
        with open('../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                if row['fieldType'] == 'Product':
                    produtos_base.append(row)
                elif row['fieldType'] == 'Variant':
                    variantes.append(row)
        
        print(f"Produtos base: {len(produtos_base)}")
        print(f"Variantes: {len(variantes)}")
        print(f"Total: {len(produtos_base) + len(variantes)}")
        
        return produtos_base, variantes
        
    except Exception as e:
        print(f"❌ Erro ao analisar produtos: {e}")
        return [], []

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
        valores_nao_vazios = []
        for produto in produtos_base:
            if produto.get(campo) and produto[campo].strip():
                valores_nao_vazios.append(produto[campo])
        
        print(f"\n{campo}: {len(valores_nao_vazios)}/{len(produtos_base)} produtos")
        
        if len(valores_nao_vazios) > 0:
            # Mostrar alguns exemplos
            for i, ex in enumerate(valores_nao_vazios[:3]):
                if len(ex) > 0:
                    print(f"  • {ex[:100]}...")

def extrair_marcas(produtos_base):
    """Extrai e normaliza marcas"""
    print("\n🏭 ANÁLISE DAS MARCAS")
    print("=" * 50)
    
    marcas = Counter()
    for produto in produtos_base:
        marca = produto.get('brand', '').strip()
        if marca:
            marcas[marca] += 1
    
    print(f"Marcas identificadas: {len(marcas)}")
    
    for marca, count in marcas.most_common(10):
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
    
    for produto in produtos_base:
        # Combinar campos de texto para busca
        texto_completo = ""
        for campo in ['name', 'description']:
            valor = produto.get(campo, '')
            if valor:
                texto_completo += str(valor) + " "
        
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
    
    for produto in produtos_base:
        texto_completo = ""
        for campo in ['name', 'description']:
            valor = produto.get(campo, '')
            if valor:
                texto_completo += str(valor).lower() + " "
        
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
    
    for produto in produtos_base:
        texto_completo = ""
        for campo in ['name', 'description']:
            valor = produto.get(campo, '')
            if valor:
                texto_completo += str(valor) + " "
        
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

def analisar_campos_adicionais(produtos_base):
    """Analisa campos additionalInfo para atributos específicos"""
    print("\n📝 ANÁLISE DOS CAMPOS ADDITIONAL INFO")
    print("=" * 50)
    
    titles_counter = Counter()
    
    for produto in produtos_base:
        for i in range(1, 7):  # additionalInfoTitle1 até additionalInfoTitle6
            title_key = f'additionalInfoTitle{i}'
            desc_key = f'additionalInfoDescription{i}'
            
            title = produto.get(title_key, '').strip()
            description = produto.get(desc_key, '').strip()
            
            if title:
                titles_counter[title] += 1
    
    print("Títulos de informações adicionais mais comuns:")
    for title, count in titles_counter.most_common(15):
        print(f"  • '{title}': {count} produtos")

def sugerir_estrategia_implementacao():
    """Sugere estratégia de implementação baseada na análise"""
    print("\n💡 ESTRATÉGIA DE IMPLEMENTAÇÃO DETALHADA")
    print("=" * 50)
    
    print("""
BASEADO NA ANÁLISE COMPLETA DO CSV:

1. 🎯 **ATRIBUTOS DIRETOS DISPONÍVEIS**
   ✅ Marca: Campo 'brand' (direto)
   ✅ Nome: Campo 'name' (direto)
   ✅ Descrição: Campo 'description' (rich content)

2. 🔍 **ATRIBUTOS EXTRAÍVEIS POR REGEX**
   ✅ Dimensões: mm, cm, polegadas em descriptions
   ✅ Materiais: palavras-chave (aço, plastic, etc.)
   ✅ Certificações: EN, ISO, CE, DIN patterns
   ✅ Medidas complexas: 100x200mm, etc.

3. 📋 **MAPEAMENTO PARA CHAVES GEKO COMPATÍVEIS**
   • brand → 'Marca'
   • material_extraido → 'Material'
   • dimensoes_extraidas → 'Dimensões'
   • certificacoes → 'Certificação'
   • aplicacao_detectada → 'Aplicação'

4. 🔧 **IMPLEMENTAÇÃO TÉCNICA**
   • Script de extração usando regex
   • Inserção em product_attributes
   • FK: internal_ean → product_ean
   • Compatibilidade total com sistema Geko

5. 📊 **RESULTADO ESPERADO**
   • 410 produtos VIP com atributos
   • 3-5 atributos por produto
   • ~1,500 novos registos
   • Informação técnica rica

PRÓXIMO PASSO: Implementar script de extração e inserção.
""")

def main():
    print("🔍 ANÁLISE CSV VIP - EXTRAÇÃO DE ATRIBUTOS (SIMPLES)")
    print("=" * 65)
    
    # Verificar se consegue carregar CSV
    sucesso, colunas = analisar_estrutura_csv()
    if not sucesso:
        return
    
    # Analisar produtos base vs variantes
    produtos_base, variantes = analisar_produtos_e_variantes()
    if not produtos_base:
        return
    
    # Análises detalhadas
    analisar_campos_descricao(produtos_base)
    extrair_marcas(produtos_base)
    extrair_dimensoes_descricoes(produtos_base)
    extrair_materiais_descricoes(produtos_base)
    extrair_certificacoes(produtos_base)
    analisar_campos_adicionais(produtos_base)
    
    # Estratégia final
    sugerir_estrategia_implementacao()
    
    print("\n✅ Análise completa do CSV VIP concluída!")

if __name__ == "__main__":
    main() 