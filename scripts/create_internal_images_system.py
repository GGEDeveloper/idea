#!/usr/bin/env python3
"""
Script para criar sistema de imagens para produtos internos
Diferente do sistema Geko (URLs), usa ficheiros locais
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import logging
import os
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATABASE_URL = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

def create_internal_images_table():
    """Criar tabela específica para imagens de produtos internos"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        
        with conn.cursor() as cursor:
            print("🗄️ Criando tabela para imagens de produtos internos...")
            
            # Criar tabela dedicada para imagens internas
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS internal_product_images (
                    image_id SERIAL PRIMARY KEY,
                    internal_ean TEXT NOT NULL,
                    filename TEXT NOT NULL,
                    original_filename TEXT,
                    file_path TEXT NOT NULL,
                    file_size INTEGER,
                    mime_type TEXT DEFAULT 'image/jpeg',
                    width INTEGER,
                    height INTEGER,
                    alt_text_pt TEXT,
                    alt_text_en TEXT,
                    is_primary BOOLEAN DEFAULT false,
                    display_order INTEGER DEFAULT 0,
                    uploaded_by UUID,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    
                    -- Foreign key para produtos internos
                    CONSTRAINT fk_internal_images_ean 
                        FOREIGN KEY (internal_ean) 
                        REFERENCES internal_products(internal_ean) 
                        ON DELETE CASCADE,
                    
                    -- Garantir apenas uma imagem primária por produto
                    CONSTRAINT unique_primary_per_product 
                        EXCLUDE (internal_ean WITH =) 
                        WHERE (is_primary = true)
                );
            """)
            
            # Criar índices para performance
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_internal_images_ean 
                ON internal_product_images(internal_ean);
                
                CREATE INDEX IF NOT EXISTS idx_internal_images_primary 
                ON internal_product_images(internal_ean, is_primary);
                
                CREATE INDEX IF NOT EXISTS idx_internal_images_order 
                ON internal_product_images(internal_ean, display_order);
            """)
            
            # Trigger para updated_at
            cursor.execute("""
                CREATE OR REPLACE FUNCTION update_internal_images_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = NOW();
                    RETURN NEW;
                END;
                $$ language 'plpgsql';
                
                DROP TRIGGER IF EXISTS trigger_internal_images_updated_at 
                ON internal_product_images;
                
                CREATE TRIGGER trigger_internal_images_updated_at
                    BEFORE UPDATE ON internal_product_images
                    FOR EACH ROW
                    EXECUTE FUNCTION update_internal_images_timestamp();
            """)
            
            print("✅ Tabela 'internal_product_images' criada com sucesso!")
            
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"Erro ao criar tabela de imagens: {e}")
        return False

def create_directory_structure():
    """Criar estrutura de diretórios para armazenar imagens"""
    try:
        print("📁 Criando estrutura de diretórios para imagens...")
        
        # Definir caminhos
        base_path = "../public/images/products/internal"
        paths_to_create = [
            base_path,
            f"{base_path}/originals",
            f"{base_path}/thumbnails", 
            f"{base_path}/medium",
            f"{base_path}/large",
            f"{base_path}/temp"
        ]
        
        for path in paths_to_create:
            os.makedirs(path, exist_ok=True)
            print(f"   📂 {path}")
        
        # Criar arquivo .gitkeep para manter diretórios no Git
        for path in paths_to_create:
            gitkeep_path = os.path.join(path, ".gitkeep")
            with open(gitkeep_path, 'w') as f:
                f.write(f"# Diretório para imagens de produtos internos\n# Criado em: {datetime.now()}\n")
        
        print("✅ Estrutura de diretórios criada!")
        return True
        
    except Exception as e:
        logger.error(f"Erro ao criar diretórios: {e}")
        return False

def create_image_helper_functions():
    """Criar funções auxiliares para gestão de imagens"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        
        with conn.cursor() as cursor:
            print("⚙️ Criando funções auxiliares para imagens...")
            
            # Função para obter imagem primária de um produto
            cursor.execute("""
                CREATE OR REPLACE FUNCTION get_internal_product_primary_image(product_ean TEXT)
                RETURNS TABLE (
                    image_id INTEGER,
                    filename TEXT,
                    file_path TEXT,
                    alt_text_pt TEXT,
                    alt_text_en TEXT,
                    width INTEGER,
                    height INTEGER
                ) AS $$
                BEGIN
                    RETURN QUERY
                    SELECT 
                        ipi.image_id,
                        ipi.filename,
                        ipi.file_path,
                        ipi.alt_text_pt,
                        ipi.alt_text_en,
                        ipi.width,
                        ipi.height
                    FROM internal_product_images ipi
                    WHERE ipi.internal_ean = product_ean 
                    AND ipi.is_primary = true
                    LIMIT 1;
                END;
                $$ LANGUAGE plpgsql;
            """)
            
            # Função para obter todas as imagens de um produto
            cursor.execute("""
                CREATE OR REPLACE FUNCTION get_internal_product_all_images(product_ean TEXT)
                RETURNS TABLE (
                    image_id INTEGER,
                    filename TEXT,
                    file_path TEXT,
                    alt_text_pt TEXT,
                    alt_text_en TEXT,
                    is_primary BOOLEAN,
                    display_order INTEGER,
                    width INTEGER,
                    height INTEGER
                ) AS $$
                BEGIN
                    RETURN QUERY
                    SELECT 
                        ipi.image_id,
                        ipi.filename,
                        ipi.file_path,
                        ipi.alt_text_pt,
                        ipi.alt_text_en,
                        ipi.is_primary,
                        ipi.display_order,
                        ipi.width,
                        ipi.height
                    FROM internal_product_images ipi
                    WHERE ipi.internal_ean = product_ean 
                    ORDER BY ipi.is_primary DESC, ipi.display_order ASC;
                END;
                $$ LANGUAGE plpgsql;
            """)
            
            # View unificada para imagens (Geko + Internos)
            cursor.execute("""
                CREATE OR REPLACE VIEW unified_product_images AS
                -- Imagens Geko (URLs externas)
                SELECT 
                    pi.imageid as image_id,
                    pi.ean as product_ean,
                    'geko' as image_source,
                    pi.url as image_url,
                    NULL as file_path,
                    pi.alt as alt_text,
                    pi.alt as alt_text_pt,
                    pi.alt as alt_text_en,
                    pi.is_primary,
                    0 as display_order,
                    NULL as width,
                    NULL as height,
                    'external' as storage_type
                FROM product_images pi
                WHERE pi.ean NOT LIKE 'INT_%'
                
                UNION ALL
                
                -- Imagens Internas (ficheiros locais)
                SELECT 
                    ipi.image_id,
                    ipi.internal_ean as product_ean,
                    'internal' as image_source,
                    CONCAT('/images/products/internal/', ipi.filename) as image_url,
                    ipi.file_path,
                    COALESCE(ipi.alt_text_pt, ipi.alt_text_en) as alt_text,
                    ipi.alt_text_pt,
                    ipi.alt_text_en,
                    ipi.is_primary,
                    ipi.display_order,
                    ipi.width,
                    ipi.height,
                    'local' as storage_type
                FROM internal_product_images ipi;
            """)
            
            print("✅ Funções auxiliares criadas!")
            
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"Erro ao criar funções: {e}")
        return False

def create_placeholder_images():
    """Criar registros de imagens placeholder para produtos sem imagem"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        
        with conn.cursor() as cursor:
            print("🖼️ Criando placeholders para produtos sem imagem...")
            
            # Obter produtos internos sem imagem
            cursor.execute("""
                SELECT ip.internal_ean, ip.name_pt, ip.brand
                FROM internal_products ip
                LEFT JOIN internal_product_images ipi ON ip.internal_ean = ipi.internal_ean
                WHERE ipi.internal_ean IS NULL
                ORDER BY ip.brand, ip.name_pt
                LIMIT 10
            """)
            
            products_without_images = cursor.fetchall()
            
            print(f"   📊 Encontrados {len(products_without_images)} produtos sem imagem")
            
            for product in products_without_images:
                ean, name, brand = product
                
                # Criar placeholder baseado na marca
                placeholder_filename = f"placeholder_{brand.lower().replace(' ', '_')}.jpg"
                alt_text_pt = f"Imagem de {name}"
                alt_text_en = f"Image of {name}"
                
                cursor.execute("""
                    INSERT INTO internal_product_images (
                        internal_ean, filename, file_path, alt_text_pt, alt_text_en,
                        is_primary, display_order, mime_type
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                """, (
                    ean, placeholder_filename, f"placeholders/{placeholder_filename}",
                    alt_text_pt, alt_text_en, True, 0, 'image/jpeg'
                ))
                
                print(f"   📷 Placeholder criado para: {name[:50]}...")
            
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"Erro ao criar placeholders: {e}")
        return False

def generate_images_documentation():
    """Gerar documentação do sistema de imagens"""
    try:
        print("📝 Gerando documentação do sistema de imagens...")
        
        doc_content = """# 🖼️ Sistema de Imagens para Produtos Internos

## Diferenças do Sistema Geko

### Produtos Geko (Existente)
- ✅ **Armazenamento**: URLs externas da API Geko
- ✅ **Gestão**: Automática via sync da API
- ✅ **Tabela**: `product_images` 
- ✅ **Formato**: URL direta (ex: https://b2b.geko.pl/zasoby/import/...)

### Produtos Internos (Novo)
- 🆕 **Armazenamento**: Ficheiros locais em `/public/images/products/internal/`
- 🆕 **Gestão**: Manual via interface admin
- 🆕 **Tabela**: `internal_product_images`
- 🆕 **Formato**: Caminho relativo (ex: `/images/products/internal/filename.jpg`)

## Estrutura de Ficheiros

```
public/
└── images/
    └── products/
        └── internal/
            ├── originals/     # Imagens originais
            ├── thumbnails/    # 150x150px  
            ├── medium/        # 400x400px
            ├── large/         # 800x800px
            ├── temp/          # Upload temporário
            └── placeholders/  # Imagens padrão por marca
```

## Funcionalidades Implementadas

### 1. Tabela Dedicada
- 🔑 **Primary Key**: `image_id` (SERIAL)
- 🔗 **Foreign Key**: `internal_ean` → `internal_products`
- 📏 **Metadados**: width, height, file_size, mime_type
- 🌍 **Multi-idioma**: alt_text_pt, alt_text_en
- 🏆 **Prioridade**: is_primary, display_order

### 2. Funções Auxiliares
- `get_internal_product_primary_image(ean)` - Imagem principal
- `get_internal_product_all_images(ean)` - Todas as imagens
- `unified_product_images` - View que combina Geko + Internos

### 3. Constraints de Segurança
- ✅ **Uma imagem primária por produto**
- ✅ **Cascade delete** quando produto é removido
- ✅ **Índices** para performance

## Próximos Passos

### 1. Interface Admin (CRÍTICO)
- 📤 Upload de imagens
- ✂️ Redimensionamento automático
- 🗂️ Gestão de múltiplas imagens por produto
- 🔄 Conversão de formatos

### 2. Placeholders por Marca
- 🏭 AG TOOLS: Ferramenta genérica
- 🛡️ FERMAN: Equipamento de proteção
- 👟 EXENA: Calçado de segurança  
- 📦 Genérico: Produto padrão

### 3. API de Imagens
- 🔍 Endpoint para buscar imagens
- 📱 Diferentes tamanhos (thumbnail, medium, large)
- ⚡ Cache e otimização

### 4. Integração Frontend
- 🖼️ Componente unificado de imagem
- 🔄 Fallback para placeholders
- 📱 Lazy loading

## Comandos Úteis

```sql
-- Ver produtos sem imagem
SELECT ip.internal_ean, ip.name_pt 
FROM internal_products ip 
LEFT JOIN internal_product_images ipi ON ip.internal_ean = ipi.internal_ean 
WHERE ipi.internal_ean IS NULL;

-- Ver todas as imagens unificadas
SELECT * FROM unified_product_images WHERE product_ean LIKE 'INT_%';

-- Obter imagem primária de um produto
SELECT * FROM get_internal_product_primary_image('INT_ABC123');
```

---
**Status**: ✅ Estrutura criada, pronto para implementação da interface
**Data**: """ + datetime.now().strftime('%Y-%m-%d %H:%M')
        
        with open("../docs/internal_images_system.md", "w", encoding="utf-8") as f:
            f.write(doc_content)
        
        print("✅ Documentação criada em: docs/internal_images_system.md")
        return True
        
    except Exception as e:
        logger.error(f"Erro ao gerar documentação: {e}")
        return False

def main():
    """Função principal para configurar sistema de imagens"""
    print("🚀 CONFIGURANDO SISTEMA DE IMAGENS PARA PRODUTOS INTERNOS")
    print("=" * 80)
    
    success_steps = []
    
    # 1. Criar tabela
    if create_internal_images_table():
        success_steps.append("✅ Tabela de imagens criada")
    else:
        print("❌ Falha ao criar tabela")
        return False
    
    # 2. Criar diretórios  
    if create_directory_structure():
        success_steps.append("✅ Estrutura de diretórios criada")
    else:
        print("❌ Falha ao criar diretórios")
        return False
    
    # 3. Criar funções auxiliares
    if create_image_helper_functions():
        success_steps.append("✅ Funções auxiliares criadas")
    else:
        print("❌ Falha ao criar funções")
        return False
    
    # 4. Criar placeholders
    if create_placeholder_images():
        success_steps.append("✅ Placeholders criados")
    else:
        print("❌ Falha ao criar placeholders")
        return False
    
    # 5. Gerar documentação
    if generate_images_documentation():
        success_steps.append("✅ Documentação gerada")
    else:
        print("❌ Falha ao gerar documentação")
        return False
    
    print("\n🎉 SISTEMA DE IMAGENS CONFIGURADO COM SUCESSO!")
    print("=" * 80)
    
    for step in success_steps:
        print(f"   {step}")
    
    print(f"\n🎯 DIFERENÇAS CHAVE:")
    print(f"   • Geko: URLs externas automáticas")
    print(f"   • Internos: Ficheiros locais manuais")
    print(f"   • View unificada para interface transparente")
    
    print(f"\n📁 DIRETÓRIOS CRIADOS:")
    print(f"   public/images/products/internal/")
    print(f"   ├── originals/")
    print(f"   ├── thumbnails/")
    print(f"   ├── medium/")
    print(f"   ├── large/")
    print(f"   └── placeholders/")
    
    print(f"\n🔧 PRÓXIMO PASSO CRÍTICO:")
    print(f"   Implementar interface admin para upload de imagens!")
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 