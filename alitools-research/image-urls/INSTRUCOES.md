# 🖼️ URLs DE IMAGENS - INSTRUÇÕES

## 🎯 **OBJETIVO**
Recolher URLs diretos das imagens dos produtos para download automático.

## 📝 **COMO FAZER**

### 1. **Numa página de produto:**
   - Clica direito numa imagem do produto
   - Seleciona **"Copy image address"** ou **"Copiar endereço da imagem"**
   - Cola o URL aqui

### 2. **Formatos de URL esperados:**
   - `https://static.wixstatic.com/media/...`
   - `https://...wix.com/...`

## 📋 **FORMATO SUGERIDO**

Cria um ficheiro `lista-imagens.txt` com este formato:

```
PRODUTO: Fato de chuva reflector
URL_PRODUTO: https://www.alimamedetools.com/product-page/fato-de-chuva-reflector
IMAGEM_1: https://static.wixstatic.com/media/abc123_image1.jpg
IMAGEM_2: https://static.wixstatic.com/media/abc123_image2.jpg
IMAGEM_3: https://static.wixstatic.com/media/abc123_image3.jpg

PRODUTO: [Nome do próximo produto]
URL_PRODUTO: [URL da página]
IMAGEM_1: [URL da imagem 1]
IMAGEM_2: [URL da imagem 2]
```

## 💡 **DICAS**

### **Várias imagens por produto:**
- Muitos produtos têm galeria com 2-5 imagens
- Copia URLs de **TODAS** as imagens que encontrares

### **Qualidade das imagens:**
- Procura pelas imagens maiores/principais
- Ignora ícones pequenos ou logos

### **Se não conseguires copiar:**
- Abre F12 → Elements tab
- Procura elementos `<img>`
- Copia o valor do atributo `src`

## ✅ **META: URLs de todas as imagens dos produtos encontrados** 