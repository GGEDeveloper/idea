# Test info

- Name: Página inicial carrega corretamente
- Location: /home/pixiewsl/CascadeProjects/idea/tests/e2e/smoke.test.js:4:1

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)

Locator: locator(':root')
Expected pattern: /Alimamedetools/
Received string:  "Loja Moderna Online"
Call log:
  - expect.toHaveTitle with timeout 5000ms
  - waiting for locator(':root')
    8 × locator resolved to <html lang="en">…</html>
      - unexpected value "Loja Moderna Online"

    at /home/pixiewsl/CascadeProjects/idea/tests/e2e/smoke.test.js:9:22
```

# Page snapshot

```yaml
- banner:
  - link "ALIMAMEDETOOLS Logótipo":
    - /url: /
    - img "ALIMAMEDETOOLS Logótipo"
  - button "Pesquisar"
  - searchbox "Pesquisar produtos"
  - navigation:
    - link "Home":
      - /url: /
    - link "Produtos":
      - /url: /produtos
    - link "Sobre Nós":
      - /url: /sobre
    - link "Contato":
      - /url: /contato
  - button "Entrar"
  - link:
    - /url: /cart
- main:
  - img
  - img "ALIMAMEDETOOLS logotipo"
  - heading "A MARCA DAS MARCAS" [level=1]
  - paragraph: Ferramentas, bricolage, construção, jardim e proteção com inovação, variedade e preços competitivos para revendedores exigentes.
  - text: TOP
  - img "Berbequim Profissional 1500W"
  - text: Berbequim Profissional 1500W Ferramentas Elétricas €249,99 Premium
  - img "Corta-Relva Automático"
  - text: Corta-Relva Automático Jardim €499,00 TOP
  - img "Compressor Industrial 50L"
  - text: Compressor Industrial 50L Oficina €329,00 Premium
  - img "Escada Telescópica Premium"
  - text: Escada Telescópica Premium Construção €199,00
  - link "Ver Produtos":
    - /url: /produtos
  - heading "Nossas Categorias" [level=2]
  - paragraph: Explore nossa ampla variedade de categorias de produtos de qualidade
  - link "Garden 501 produtos Ver produtos":
    - /url: /produtos?categoria=Garden
    - heading "Garden" [level=3]
    - paragraph: 501 produtos
    - text: Ver produtos
  - link "Construction and Renovation 254 produtos Ver produtos":
    - /url: /produtos?categoria=Construction%20and%20Renovation
    - heading "Construction and Renovation" [level=3]
    - paragraph: 254 produtos
    - text: Ver produtos
  - link "Service Equipment 220 produtos Ver produtos":
    - /url: /produtos?categoria=Service%20Equipment
    - heading "Service Equipment" [level=3]
    - paragraph: 220 produtos
    - text: Ver produtos
  - link "Heaters 186 produtos Ver produtos":
    - /url: /produtos?categoria=Heaters
    - heading "Heaters" [level=3]
    - paragraph: 186 produtos
    - text: Ver produtos
  - link "Wrenches 181 produtos Ver produtos":
    - /url: /produtos?categoria=Wrenches
    - heading "Wrenches" [level=3]
    - paragraph: 181 produtos
    - text: Ver produtos
  - link "Parts for Power Generators 169 produtos Ver produtos":
    - /url: /produtos?categoria=Parts%20for%20Power%20Generators
    - heading "Parts for Power Generators" [level=3]
    - paragraph: 169 produtos
    - text: Ver produtos
  - link "Ver todas as categorias":
    - /url: /produtos
  - heading "Sobre a Marca" [level=2]
  - heading "Nossa História" [level=3]
  - paragraph: Conheça nossa trajetória e valores.
  - heading "Nossa Missão" [level=3]
  - paragraph: Entenda nosso propósito e objetivos.
  - link "Saiba Mais":
    - /url: /sobre
- contentinfo:
  - img "ALIMAMEDETOOLS logotipo"
  - heading "ALIMAMEDETOOLS — A MARCA DAS MARCAS" [level=2]
  - paragraph: Centro Empresarial Cacém / Paço de Arcos - Pavilhão I; Estrada Nacional 249-3 KM 1.8 E, São Marcos, 2735-307 Cacém, Portugal
  - paragraph:
    - link "alimamedetools@gmail.com":
      - /url: mailto:alimamedetools@gmail.com
    - text: ·
    - link "(+351) 96 396 59 03":
      - /url: tel:+351963965903
  - paragraph: "Seg a Sex: 9:00 às 12:30 — 14:00 às 18:30"
  - paragraph: © 2025 ALIMAMEDETOOLS. Todos os direitos reservados.
```

# Test source

```ts
   1 | // @ts-check
   2 | import { test, expect } from '@playwright/test';
   3 |
   4 | test('Página inicial carrega corretamente', async ({ page }) => {
   5 |   // Navega para a página inicial
   6 |   await page.goto('http://localhost:5173');
   7 |   
   8 |   // Verifica se o título da página está correto
>  9 |   await expect(page).toHaveTitle(/Alimamedetools/);
     |                      ^ Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)
  10 |   
  11 |   // Verifica se o logo está visível
  12 |   const logo = page.locator('header img[alt="ALIMAMEDETOOLS Logótipo"]');
  13 |   await expect(logo).toBeVisible();
  14 |   
  15 |   // Verifica se a navegação principal está visível
  16 |   const navLinks = ['Home', 'Produtos', 'Sobre Nós', 'Contato'];
  17 |   for (const linkText of navLinks) {
  18 |     await expect(page.getByRole('link', { name: linkText, exact: true })).toBeVisible();
  19 |   }
  20 | });
  21 |
```