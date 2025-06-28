# 📄 HTML SAMPLES - INSTRUÇÕES

## 🎯 **OBJETIVO**
Recolher código HTML das imagens para entender a estrutura técnica.

## 📝 **COMO FAZER**

### 1. **Abre Developer Tools:**
   - Pressiona `F12` ou clica direito → "Inspect"
   - Vai ao tab **"Elements"**

### 2. **Encontra as imagens:**
   - Usa `Ctrl+F` para procurar por `<img`
   - Ou clica no ícone de seleção e aponta para uma imagem

### 3. **Copia o HTML:**
   - Clica direito no elemento `<img>` no HTML
   - Seleciona **"Copy element"**
   - Cola num ficheiro .html ou .txt

## 📋 **FORMATO SUGERIDO**

Cria ficheiros separados para cada produto:
- `fato-chuva-reflector.html`
- `produto2.html`
- etc.

Ou um ficheiro único `todos-html-samples.txt`:

```
=== PRODUTO: Fato de chuva reflector ===
<img src="https://static.wixstatic.com/media/..." 
     alt="Fato de chuva" 
     data-hook="product-image" 
     class="..." />

=== PRODUTO: [Nome do próximo] ===
<img ... />
```

## 🔍 **O QUE PROCURAR**
- Atributos `data-hook`
- Classes CSS específicas
- Estrutura de galerias
- Elementos pai das imagens (div, section, etc.)

## ✅ **META: HTML de 3-5 produtos diferentes** 