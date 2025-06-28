# 🌐 NETWORK DATA - INSTRUÇÕES

## 🎯 **OBJETIVO**
Capturar dados de rede para entender como o site carrega conteúdo.

## 📝 **COMO FAZER**

### 1. **Abre Developer Tools:**
   - Pressiona `F12`
   - Vai ao tab **"Network"**

### 2. **Recarrega a página:**
   - Com Network tab aberto
   - Pressiona `F5` ou `Ctrl+R`
   - Observa os requests que aparecem

### 3. **Procura por:**
   - **Requests de imagens** (jpg, png, webp)
   - **API calls** (JSON, XML)
   - **Requests para wixstatic.com**

## 📋 **O QUE COPIAR**

### **Requests interessantes:**
- Clica direito num request → "Copy as cURL"
- Ou "Copy link address"
- Cola num ficheiro .txt

### **Formato sugerido:**
```
=== PÁGINA: Fato de chuva reflector ===

REQUEST 1: Imagem principal
URL: https://static.wixstatic.com/media/abc123_image.jpg
Método: GET
Status: 200

REQUEST 2: API call (se houver)
URL: https://...
Método: GET/POST
Response: [copia parte da resposta]
```

## 💡 **ALTERNATIVA SIMPLES**
Se for muito complicado, simplesmente:
- Anota URLs que vês a carregar
- Especialmente URLs de imagens
- Cola numa lista simples

## ✅ **META: Dados de 2-3 páginas diferentes** 