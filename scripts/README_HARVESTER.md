# 🚜 AliTools Image Harvester - INSTRUÇÕES

## 🎯 **O QUE FAZ**
Baixa TODAS as imagens dos produtos AliTools descobertos e organiza numa pasta para validação manual.

## 🚀 **COMO EXECUTAR**

### 1. **Executar o script:**
```bash
cd scripts
python3 alitools_image_harvester.py
```

### 2. **Confirmar execução:**
- O script vai pedir confirmação
- Digite `s` para continuar

### 3. **Aguardar coleta:**
- Vai processar os 6 produtos descobertos
- Baixa todas as imagens em alta qualidade (800x800)
- Organiza por pasta de produto

## 📁 **ESTRUTURA DE SAÍDA**

```
alitools-research/imagens-coletadas/
├── parka-impermiavel-reflectora/
│   ├── 01_800x800.jpg
│   ├── 02_800x800.jpg
│   └── ...
├── fato-de-chuva-reflector/
│   ├── 01_800x800.jpg
│   └── ...
├── luva-nitrile-preta/
├── talocha-de-grosa/
├── espatula-em-abs/
├── serrote-prof-cortar-ferro/
└── relatorio_coleta.json
```

## 📊 **RELATÓRIO**
- **`relatorio_coleta.json`** → Estatísticas completas da coleta
- **Cada pasta** → Imagens organizadas por produto
- **Nomes dos arquivos** → `{índice}_{largura}x{altura}.{extensão}`

## ✅ **PRÓXIMOS PASSOS**
1. **Validar manualmente** as imagens baixadas
2. **Selecionar as melhores** para cada produto
3. **Integrar no sistema VIP** (quando estiver pronto)

## 🔧 **CARACTERÍSTICAS TÉCNICAS**
- **Filtra automaticamente** logos/ícones/thumbnails pequenos
- **Otimiza qualidade** para 800x800px, 95% qualidade
- **Usa padrões descobertos** na pesquisa manual
- **Respeita rate limits** com pausas entre requests
- **Relatório detalhado** de sucessos/falhas

---

**🎯 OBJETIVO:** Coletar imagens para validação antes de integração!** 