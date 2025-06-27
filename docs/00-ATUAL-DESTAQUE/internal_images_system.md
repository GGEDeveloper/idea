# 🖼️ Sistema de Imagens para Produtos Internos

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
**Data**: 2025-06-27 19:57