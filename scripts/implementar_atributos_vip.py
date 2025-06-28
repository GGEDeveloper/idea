#!/usr/bin/env python3
"""
🏷️ IMPLEMENTAÇÃO DE ATRIBUTOS VIP
================================

Extrai atributos técnicos do CSV e insere na tabela product_attributes
para compatibilidade total com o sistema Geko.

RESULTADO ESPERADO: 410 produtos VIP com 3-5 atributos cada (~1,500 registos)
"""

import csv
import re
import psycopg2
from collections import defaultdict

def conectar_bd():
    """Conecta à BD usando credenciais Neon"""
    try:
        db_url = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
        conn = psycopg2.connect(db_url)
        return conn
    except Exception as e:
        print(f"❌ Erro conexão BD: {e}")
        return None

class ExtratorAtributos:
    """Classe para extrair atributos dos produtos VIP"""
    
    def __init__(self):
        # Padrões de materiais
        self.materiais_comum = {
            'aço': ['aço', 'steel', 'aco'],
            'inox': ['inox', 'inoxidável', 'stainless'],
            'alumínio': ['alumínio', 'aluminum', 'aluminio'],
            'plástico': ['plástico', 'plastic', 'plastico'],
            'borracha': ['borracha', 'rubber'],
            'madeira': ['madeira', 'wood'],
            'ferro': ['ferro', 'iron'],
            'nylon': ['nylon'],
            'abs': ['abs'],
            'pvc': ['pvc'],
            'carbono': ['carbono', 'carbon'],
            'titanio': ['titanio', 'titanium'],
            'hss': ['hss']
        }
        
        # Padrões de certificações
        self.padroes_cert = [
            r'EN\s*\d+', r'ISO\s*\d+', r'CE\b', r'DIN\s*\d+',
            r'ANSI\s*\w+', r'S\d+P?', r'IP\d+', r'EN ISO\s*\d+'
        ]
        
        # Padrões de dimensões
        self.padroes_dimensoes = {
            'mm': r'(\d+(?:\.\d+)?)\s*mm',
            'cm': r'(\d+(?:\.\d+)?)\s*cm',
            'polegadas': r'(\d+(?:\.\d+)?)\s*"',
            'metros': r'(\d+(?:\.\d+)?)\s*m(?:\s|$|[^m])',
            'complexas': r'(\d+)\s*x\s*(\d+)(?:\s*x\s*(\d+))?\s*(?:mm|cm)'
        }
    
    def extrair_marca(self, produto):
        """Extrai marca do produto"""
        marca = produto.get('brand', '').strip()
        if marca and marca not in ['', 'N/A']:
            return [('Marca', marca)]
        return []
    
    def extrair_material(self, produto):
        """Extrai material das descrições"""
        texto_completo = ""
        for campo in ['name', 'description']:
            valor = produto.get(campo, '')
            if valor:
                texto_completo += str(valor).lower() + " "
        
        materiais_encontrados = []
        for material_nome, padroes in self.materiais_comum.items():
            for padrao in padroes:
                if padrao.lower() in texto_completo:
                    materiais_encontrados.append(('Material', material_nome.title()))
                    break  # Só um por tipo de material
        
        return materiais_encontrados[:2]  # Máximo 2 materiais
    
    def extrair_dimensoes(self, produto):
        """Extrai dimensões das descrições"""
        texto_completo = ""
        for campo in ['name', 'description', 'productOptionDescription1']:
            valor = produto.get(campo, '')
            if valor:
                texto_completo += str(valor) + " "
        
        dimensoes_encontradas = []
        
        # Dimensões principais
        for tipo, padrao in self.padroes_dimensoes.items():
            matches = re.findall(padrao, texto_completo, re.IGNORECASE)
            if matches:
                if tipo == 'complexas':
                    # Medidas complexas (ex: 100x200x50mm)
                    for match in matches[:2]:  # Máximo 2
                        if isinstance(match, tuple):
                            if match[2]:  # 3D
                                dimensao = f"{match[0]}x{match[1]}x{match[2]}"
                            else:  # 2D
                                dimensao = f"{match[0]}x{match[1]}"
                            dimensoes_encontradas.append(('Dimensões', dimensao))
                else:
                    # Dimensões simples
                    for match in matches[:1]:  # Só a primeira de cada tipo
                        unidade = 'mm' if tipo == 'mm' else 'cm' if tipo == 'cm' else '"' if tipo == 'polegadas' else 'm'
                        dimensoes_encontradas.append((f'Dimensão_{tipo}', f"{match}{unidade}"))
        
        return dimensoes_encontradas[:3]  # Máximo 3 dimensões
    
    def extrair_certificacoes(self, produto):
        """Extrai certificações e normas"""
        texto_completo = ""
        for campo in ['name', 'description']:
            valor = produto.get(campo, '')
            if valor:
                texto_completo += str(valor) + " "
        
        certificacoes_encontradas = []
        for padrao in self.padroes_cert:
            matches = re.findall(padrao, texto_completo, re.IGNORECASE)
            for match in matches:
                cert_clean = match.upper().strip()
                if cert_clean not in [cert[1] for cert in certificacoes_encontradas]:
                    certificacoes_encontradas.append(('Certificação', cert_clean))
        
        return certificacoes_encontradas[:3]  # Máximo 3 certificações
    
    def extrair_aplicacao(self, produto):
        """Extrai aplicação/uso do produto baseado na categoria"""
        categoria = produto.get('geko_category_name', '')
        if categoria:
            # Simplificar categoria para aplicação
            aplicacoes_mapeadas = {
                'Protective Clothing': 'Proteção Individual',
                'Work Gloves': 'Proteção das Mãos', 
                'Trowels and Spatulas': 'Construção e Acabamentos',
                'Cutting Discs': 'Corte e Desbaste',
                'General Tools': 'Uso Geral',
                'Cables and Extensions': 'Instalações Elétricas'
            }
            
            for categoria_key, aplicacao in aplicacoes_mapeadas.items():
                if categoria_key.lower() in categoria.lower():
                    return [('Aplicação', aplicacao)]
        
        return []
    
    def extrair_todos_atributos(self, produto):
        """Extrai todos os atributos de um produto"""
        atributos = []
        
        # Extrair cada tipo de atributo
        atributos.extend(self.extrair_marca(produto))
        atributos.extend(self.extrair_material(produto))
        atributos.extend(self.extrair_dimensoes(produto))
        atributos.extend(self.extrair_certificacoes(produto))
        atributos.extend(self.extrair_aplicacao(produto))
        
        return atributos

def carregar_produtos_vip():
    """Carrega produtos VIP do CSV"""
    print("📂 CARREGANDO PRODUTOS VIP DO CSV")
    print("=" * 50)
    
    produtos_vip = []
    try:
        with open('../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                if row['fieldType'] == 'Product':
                    produtos_vip.append(row)
        
        print(f"✅ Carregados {len(produtos_vip)} produtos VIP")
        return produtos_vip
        
    except Exception as e:
        print(f"❌ Erro ao carregar CSV: {e}")
        return []

def mapear_handleid_para_ean(conn):
    """Mapeia handleId do CSV para internal_ean da BD"""
    print("\n🔗 MAPEANDO HANDLEID → INTERNAL_EAN")
    print("=" * 50)
    
    try:
        with conn.cursor() as cur:
            # Buscar o mapeamento na tabela internal_products
            cur.execute("""
                SELECT internal_ean, name
                FROM internal_products 
                ORDER BY internal_ean;
            """)
            
            produtos_bd = cur.fetchall()
            print(f"✅ Encontrados {len(produtos_bd)} produtos na BD")
            
            # Criar mapeamento simples por ordem (assumindo que a importação foi sequencial)
            mapeamento = {}
            for i, (internal_ean, nome) in enumerate(produtos_bd):
                # Usar índice para mapear (pode ser refinado se necessário)
                mapeamento[i] = internal_ean
            
            return mapeamento
            
    except Exception as e:
        print(f"❌ Erro ao mapear: {e}")
        return {}

def extrair_e_inserir_atributos(conn, produtos_vip, mapeamento):
    """Extrai atributos e insere na BD"""
    print("\n🏷️ EXTRAINDO E INSERINDO ATRIBUTOS")
    print("=" * 50)
    
    extrator = ExtratorAtributos()
    atributos_inseridos = 0
    produtos_processados = 0
    
    try:
        with conn.cursor() as cur:
            for i, produto in enumerate(produtos_vip):
                # Mapear para internal_ean
                internal_ean = mapeamento.get(i)
                if not internal_ean:
                    continue
                
                # Extrair atributos
                atributos = extrator.extrair_todos_atributos(produto)
                
                if atributos:
                    for chave, valor in atributos:
                        try:
                            # Inserir atributo
                            cur.execute("""
                                INSERT INTO product_attributes (product_ean, key, value, created_at, updated_at)
                                VALUES (%s, %s, %s, NOW(), NOW())
                                ON CONFLICT (product_ean, key) DO UPDATE SET
                                    value = EXCLUDED.value,
                                    updated_at = NOW();
                            """, (internal_ean, chave, valor))
                            
                            atributos_inseridos += 1
                            
                        except Exception as e:
                            print(f"⚠️ Erro ao inserir atributo {chave}={valor} para {internal_ean}: {e}")
                
                produtos_processados += 1
                
                # Commit a cada 50 produtos
                if produtos_processados % 50 == 0:
                    conn.commit()
                    print(f"  → Processados {produtos_processados}/{len(produtos_vip)} produtos...")
            
            # Commit final
            conn.commit()
            
            print(f"\n✅ CONCLUÍDO!")
            print(f"   • Produtos processados: {produtos_processados}")
            print(f"   • Atributos inseridos: {atributos_inseridos}")
            print(f"   • Média atributos/produto: {atributos_inseridos/max(produtos_processados,1):.1f}")
            
    except Exception as e:
        print(f"❌ Erro durante inserção: {e}")
        conn.rollback()

def verificar_resultado(conn):
    """Verifica o resultado da inserção"""
    print("\n📊 VERIFICANDO RESULTADO")
    print("=" * 50)
    
    try:
        with conn.cursor() as cur:
            # Estatísticas gerais
            cur.execute("""
                SELECT 
                    COUNT(*) as total_atributos_vip,
                    COUNT(DISTINCT product_ean) as produtos_com_atributos,
                    COUNT(DISTINCT key) as tipos_atributos
                FROM product_attributes 
                WHERE product_ean LIKE 'INT_%';
            """)
            
            stats = cur.fetchone()
            print(f"Total atributos VIP: {stats[0]:,}")
            print(f"Produtos com atributos: {stats[1]:,}/410")
            print(f"Tipos de atributos: {stats[2]:,}")
            
            # Top atributos
            cur.execute("""
                SELECT key, COUNT(*) as freq
                FROM product_attributes 
                WHERE product_ean LIKE 'INT_%'
                GROUP BY key
                ORDER BY freq DESC
                LIMIT 10;
            """)
            
            top_attrs = cur.fetchall()
            print("\nTop atributos inseridos:")
            for attr, freq in top_attrs:
                print(f"  • {attr}: {freq} produtos")
                
    except Exception as e:
        print(f"❌ Erro ao verificar: {e}")

def main():
    print("🏷️ IMPLEMENTAÇÃO DE ATRIBUTOS VIP")
    print("=" * 60)
    
    # Conectar BD
    conn = conectar_bd()
    if not conn:
        return
    
    try:
        # Carregar produtos do CSV
        produtos_vip = carregar_produtos_vip()
        if not produtos_vip:
            return
        
        # Mapear handleId para internal_ean
        mapeamento = mapear_handleid_para_ean(conn)
        if not mapeamento:
            return
        
        # Extrair e inserir atributos
        extrair_e_inserir_atributos(conn, produtos_vip, mapeamento)
        
        # Verificar resultado
        verificar_resultado(conn)
        
        print("\n🎉 IMPLEMENTAÇÃO DE ATRIBUTOS VIP CONCLUÍDA!")
        
    finally:
        conn.close()

if __name__ == "__main__":
    main() 