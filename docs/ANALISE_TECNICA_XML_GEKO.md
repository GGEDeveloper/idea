# Análise Técnica — XML Completo Geko (UTF8, EN)

## 1. Introdução
Este documento resume a estrutura, campos, exemplos e recomendações para integração do ficheiro XML completo fornecido pela Geko, destinado à integração com lojas online e sistemas de vendas.

---

## 2. Estrutura Geral do XML
- **Elemento raiz:** `<offer file_format="IOF" version="2.6" generated="...">`
- **Produtos:** `<products language="pl" currency="EUR">`
    - Múltiplos `<product ...>`

### Exemplo de Estrutura de Produto
```xml
<product id="24" vat="0" code="C00049" code_on_card="C00049" EAN="5901477140723" code_producer="5901477140723">
    <producer name="GEKO" id=""/>
    <category id="105266" name="Podnośniki hydrauliczne" path="Części zamienne\Podnośniki hydrauliczne"/>
    <category_idosell path="Części zamienne\Podnośniki hydrauliczne" />
    <unit id="1409457136565705379" name="kpl." moq="1"/>
    <card url="https://b2b.geko.pl/pl/kolo-do-podnosnika-niskoprofilowego-2-5t"/>
    <description>
        <name><![CDATA[Koło do podnośnika niskoprofilowego 2,5T]]></name>
        <long_desc xml:lang="pl"><![CDATA[]]></long_desc>
        <short_desc xml:lang="pl"><![CDATA[]]></short_desc>
        <description><![CDATA[]]></description>
    </description>
    <delivery></delivery>
    <price gross="2.18" net="2.18"/>
    <srp gross="" net=""/>
    <sizes>
        <size code="C00049" weight="90.00" grossWeight="0.00">
            <stock id="1" quantity="0"/>
            <price gross="2.18" net="2.18"/>
            <srp gross="" net=""/>
        </size>
    </sizes>
    <images>
        <large>
            <image url="https://b2b.geko.pl/zasoby/import/2/25_0_16651359.jpg"/>
        </large>
    </images>
</product>
```

---

## 3. Campos Principais e Descrição
| Campo                | Descrição                                                                 | Observações |
|----------------------|---------------------------------------------------------------------------|-------------|
| id                   | Identificador único do produto                                             |             |
| vat                  | Taxa de IVA                                                               |             |
| code                 | Código interno                                                            |             |
| code_on_card         | Código apresentado no cartão/ficha                                        |             |
| EAN                  | Código de barras EAN                                                      |             |
| code_producer        | Código do fabricante                                                       |             |
| <producer>           | Nome e id do fabricante                                                   |             |
| <category>           | Categoria principal, nome e path (em polaco)                             |             |
| <category_idosell>   | Path da categoria para integração com IdoSell                             |             |
| <unit>               | Unidade de venda, nome e quantidade mínima (moq)                          |             |
| <card>               | URL da ficha do produto                                                    |             |
| <description>        | Nome, descrição longa, curta e descrição livre (todos em polaco)          |             |
| <price>              | Preço bruto e líquido                                                     |             |
| <srp>                | Preço recomendado (pode estar vazio)                                      |             |
| <sizes>              | Lista de tamanhos/variações                                               | Normalmente só um size |
| <stock>              | Quantidade disponível                                                     | Pode vir como "0", "6,00", etc. |
| <images>             | Imagens do produto (pode ter várias ou nenhuma)                           |             |

---

## 4. Observações de Localização
- Mesmo no ficheiro “en”, os campos de nome, descrição e categoria estão em polaco.
- O frontend deverá prever apresentação destes campos como estão ou implementar tradução.

---

## 5. Filtros e Parâmetros Avançados
- O XML pode ser filtrado na requisição por parâmetros:
    - `?filters=` — inclui apenas produtos com determinados IDs de características
    - `?exfilters=` — exclui produtos com determinados IDs de características
    - `?stream=true` — retorna o ficheiro diretamente no corpo da resposta
- Exemplo de uso: `/current-integration-link?filters=22,77225&stream=true`

---

## 6. Recomendações para Integração
- Usar o campo EAN como identificador principal para importação e sincronização.
- Implementar fallback para imagens ausentes.
- Prever múltiplas imagens por produto.
- Considerar a possibilidade de variações (sizes), mesmo que normalmente só exista uma.
- Implementar lógica de stock, preço e filtros baseada nos campos do XML.
- Respeitar limites de requisições da API (não fazer requests em excesso).
- Garantir tratamento de erros robusto (stock, preço, imagens, etc.).

---

## 7. Exemplos Reais de Produtos

### Produto com imagens e stock
```xml
<product id="43" ...>
    ...
    <sizes>
        <size ...>
            <stock id="1" quantity="0"/>
            <price gross="60.06" net="60.06"/>
        </size>
    </sizes>
    <images>
        <large>
            <image url="https://b2b.geko.pl/zasoby/import/4/43_1_35789.jpg"/>
        </large>
    </images>
</product>
```

### Produto sem imagens
```xml
<product id="27" ...>
    ...
    <images>
        <large>
        </large>
    </images>
</product>
```

---

## 8. Considerações Finais
- O ficheiro XML é extenso e pode conter milhares de produtos.
- A estrutura é consistente, mas os campos textuais estão em polaco.
- O sistema de integração deve ser flexível para lidar com ausências de imagens, múltiplas imagens, variações e possíveis mudanças no schema.

---

## 9. Análise Extrema — Elementos, Frequências e Variações

### 9.1. Estatística e Elementos Presentes
- Elementos mais frequentes por produto: `<product>`, `<producer>`, `<category>`, `<category_idosell>`, `<unit>`, `<card>`, `<description>`, `<delivery>`, `<price>`, `<srp>`, `<sizes>`, `<size>`, `<stock>`, `<images>`, `<large>`, `<image>`.
- Elementos HTML embutidos em descrições: `<li>`, `<strong>`, `<td>`, `<p>`, `<ul>`, `<h4>`, `<br>`, `<tr>`, `<h3>`, `<th>`, `<table>`, `<tbody>`, `<img>`, `<span>`, `<h2>`, `<div>`, `<em>`, `<h5>`, `<iframe>`, `<dt>`, `<dl>`, `<a>`, `<ol>`, `<h1>`, `<hr>`, `<sup>`, `<section>`, `<h6>`, `<u>`, `<sub>`, `<thead>`, `<pre>`, `<article>`.
- O HTML pode ser complexo: tabelas, listas, imagens, títulos, links, etc.

### 9.2. Variações e Casos Especiais
- Produtos podem ter múltiplas imagens ou nenhuma.
- O bloco `<sizes>` pode conter múltiplas variações (raramente), cada uma com stock e preço próprios.
- `<srp>`, `<delivery>`, `<long_desc>`, `<short_desc>`, `<description>` podem estar vazios ou preenchidos.
- `<unit>` pode variar muito (ex: unidade, conjunto, etc.).
- Campos como EAN, code, code_on_card, code_producer podem estar ausentes em casos raros.
- Categorias podem ser profundas e variadas.

### 9.3. Exemplo Real de Descrição Rica
```xml
<description>
  <name><![CDATA[Chave de Impacto]]></name>
  <long_desc xml:lang="pl"><![CDATA[
    <p>Chave de impacto profissional.</p>
    <ul>
      <li>Torque: 600Nm</li>
      <li>Voltagem: 18V</li>
      <li>Inclui mala de transporte</li>
    </ul>
    <table>
      <tr><th>Parâmetro</th><th>Valor</th></tr>
      <tr><td>Peso</td><td>2kg</td></tr>
      <tr><td>Dimensões</td><td>30x20x10cm</td></tr>
    </table>
    <img src="https://b2b.geko.pl/zasoby/import/6/61_1_35821.jpg"/>
  ]]></long_desc>
</description>
```

### 9.4. Recomendações Avançadas
- O parser deve ser tolerante e flexível, aceitando campos ausentes ou vazios.
- O frontend deve renderizar HTML das descrições com segurança (sanitize).
- O modelo de dados deve prever múltiplas imagens, múltiplas variações, campos opcionais e descrições ricas.
- O sistema de filtragem pode ser expandido para considerar categorias, unidade, fabricante, atributos técnicos (extraíveis do HTML), etc.
- Deve-se prever fallback para qualquer campo ausente: nome, descrição, imagem, stock, preço.
- Deve-se monitorar o schema para possíveis mudanças e adaptar rapidamente.

---

**Este documento deve ser atualizado sempre que houver alterações na estrutura do XML ou nas necessidades do projeto.**
