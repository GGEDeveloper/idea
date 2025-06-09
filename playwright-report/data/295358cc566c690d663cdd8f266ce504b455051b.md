# Test info

- Name: Página inicial carrega corretamente
- Location: /home/pixiewsl/CascadeProjects/idea/tests/e2e/smoke.test.js:4:1

# Error details

```
Error: expect(locator).toHaveTitle(expected)

Locator: locator(':root')
Expected pattern: /Alimamedetools/
Received string:  "Loja Moderna Online"
Call log:
  - expect.toHaveTitle with timeout 10000ms
  - waiting for locator(':root')
    6 × locator resolved to <html lang="en">…</html>
      - unexpected value "Loja Moderna Online"

    at /home/pixiewsl/CascadeProjects/idea/tests/e2e/smoke.test.js:9:22
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
     |                      ^ Error: expect(locator).toHaveTitle(expected)
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