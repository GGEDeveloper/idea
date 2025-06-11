// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      'Nossos Produtos': 'Nossos Produtos',
      'Resultados para: "{{search}}"': 'Resultados para: "{{search}}"',
      'Encontre a ferramenta perfeita para o seu projeto, com a ajuda dos nossos filtros especializados.': 'Encontre a ferramenta perfeita para o seu projeto, com a ajuda dos nossos filtros especializados.',
      'Nenhum produto encontrado': 'Nenhum produto encontrado',
      'Tente ajustar seus filtros ou busca': 'Tente ajustar seus filtros ou busca',
      'Limpar todos os filtros': 'Limpar todos os filtros',
      'Faça login para ver preço': 'Faça login para ver preço',
      'Preço sob consulta': 'Preço sob consulta',
      'Adicionar ao Carrinho': 'Adicionar ao Carrinho',
      'Faça login para comprar': 'Faça login para comprar',
      'Ref:': 'Ref:',
      'Stock:': 'Stock:',
    }
  },
  en: {
    translation: {
      'Nossos Produtos': 'Our Products',
      'Resultados para: "{{search}}"': 'Results for: "{{search}}"',
      'Encontre a ferramenta perfeita para o seu projeto, com a ajuda dos nossos filtros especializados.': 'Find the perfect tool for your project with our specialized filters.',
      'Nenhum produto encontrado': 'No products found',
      'Tente ajustar seus filtros ou busca': 'Try adjusting your filters or search',
      'Limpar todos os filtros': 'Clear all filters',
      'Faça login para ver preço': 'Login to see price',
      'Preço sob consulta': 'Price on request',
      'Adicionar ao Carrinho': 'Add to Cart',
      'Faça login para comprar': 'Login to buy',
      'Ref:': 'Ref:',
      'Stock:': 'Stock:',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
