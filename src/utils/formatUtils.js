/**
 * Formata um número como uma string de moeda.
 * @param {number|string|null|undefined} price - O valor numérico do preço.
 * @param {string} [currency='EUR'] - O código ISO da moeda (ex: 'EUR', 'USD').
 * @param {string} [locale='pt-PT'] - O locale para formatação (ex: 'pt-PT', 'en-US').
 * @returns {string} O preço formatado como string, ou uma mensagem default se o preço for inválido.
 */
export const formatPrice = (price, currency = 'EUR', locale = 'pt-PT') => {
  const numericPrice = parseFloat(String(price).replace(',', '.'));

  if (price === null || price === undefined || isNaN(numericPrice)) {
    // Tenta obter a tradução de 'Preço sob consulta' ou usa um fallback
    // Para simplificar aqui, usamos um texto fixo, mas idealmente viria do i18n.
    return 'Preço sob consulta'; 
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericPrice);
  } catch (error) {
    console.error('[formatPrice] Erro ao formatar preço:', error, { price, currency, locale });
    // Fallback para uma formatação simples se Intl falhar (ex: locale inválido)
    return `${currencySymbol(currency)}${numericPrice.toFixed(2)}`;
  }
};

// Função auxiliar para símbolo da moeda, caso Intl.NumberFormat não seja suficiente
// ou para um fallback mais simples.
const currencySymbol = (currencyCode) => {
  switch (currencyCode.toUpperCase()) {
    case 'EUR': return '€';
    case 'USD': return '$';
    case 'GBP': return '£';
    default: return currencyCode + ' '; // Retorna o código se o símbolo não for conhecido
  }
}

// Pode adicionar outras funções de formatação aqui, como datas, etc. 