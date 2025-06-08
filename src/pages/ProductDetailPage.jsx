// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { drillData } from '../data/drillData';
import { useCart } from '../contexts/CartContext'; // Importar useCart
import { StarIcon } from '@heroicons/react/20/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/outline'; // Para botão de voltar

const ProductDetailPage = () => {
  const { ean } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${ean}`)
      .then(res => {
        if (!res.ok) throw new Error('Produto não encontrado');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [ean]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">A carregar detalhes do produto...</div>;
  }
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-700">Produto não encontrado!</h1>
        <Link to="/produtos" className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
          Voltar para Produtos
        </Link>
      </div>
    );
  }

  // Fallbacks para campos essenciais
  const nome = product.name && product.name.trim() !== '' ? product.name : 'Produto sem nome';
  const preco = product.pricegross ? `€ ${Number(product.pricegross).toFixed(2)}` : 'Preço indisponível';
  const descricao = product.longdescription || product.shortdescription || 'Sem descrição disponível.';
  const imagens = Array.isArray(product.images) && product.images.length > 0 ? product.images : [{ url: '/placeholder.png', is_main: true }];
  const eanVal = product.ean || '';
  const sku = product.sku || '';
  const produtor = product.producername || '';
  const categoria = product.categoryname || '';
  const stock = Array.isArray(product.stock) && product.stock.length > 0 ? product.stock[0].quantity : null;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/produtos" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors group">
            <ChevronLeftIcon className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
            Voltar para todos os produtos
          </Link>
        </div>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden lg:flex">
          {/* Galeria de Imagens */}
          <div className="lg:w-1/2 flex flex-col items-center justify-center bg-gray-100">
            <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center">
              <img 
                src={imagens[0].url || '/placeholder.png'}
                alt={nome}
                className="w-full h-full object-contain rounded-lg"
                onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
              />
            </div>
            {/* Miniaturas se houver várias imagens */}
            {imagens.length > 1 && (
              <div className="flex gap-2 mt-4">
                {imagens.map((img, idx) => (
                  <img
                    key={img.url + idx}
                    src={img.url || '/placeholder.png'}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-16 h-16 object-contain rounded border border-gray-200 bg-white"
                    onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Coluna de Informações */}
          <div className="lg:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">{nome}</h1>
            <p className="text-lg text-gray-500 mb-2">{produtor}{categoria && ` · ${categoria}`}</p>
            <p className="text-sm text-gray-400 mb-2">EAN: {eanVal} {sku && `· SKU: ${sku}`}</p>
            <span className="inline-block mb-4 text-base font-semibold text-green-700">
              {stock !== null && stock !== undefined ? `Stock: ${stock}` : 'Stock: Indisponível'}
            </span>
            <div className="mb-6">
              <span className="text-4xl font-bold text-indigo-600">{preco}</span>
              {/* Preços detalhados (ex: promocional) */}
              {Array.isArray(product.prices) && product.prices.length > 0 && (
                <div className="mt-2 space-y-1">
                  {product.prices.map((p, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      {p.price_type && <span className="font-semibold mr-2">{p.price_type}:</span>}
                      {p.gross_value ? `€ ${Number(p.gross_value).toFixed(2)}` : ''}
                      {p.currency && <span className="ml-1">{p.currency}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-gray-700 text-base mb-6 leading-relaxed">
              {descricao}
            </p>
            {/* Variantes */}
            {Array.isArray(product.variants) && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Variantes Disponíveis:</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {product.variants.map((v, idx) => (
                    <li key={idx}>{v.name || v.geko_variant_stock_id || 'Variante'}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Atributos dinâmicos */}
            {Array.isArray(product.attributes) && product.attributes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Atributos:</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {product.attributes.map((a, idx) => (
                    <li key={idx}>
                      {a.name}: {a.value_text ?? a.value_number ?? (a.value_boolean !== null ? (a.value_boolean ? 'Sim' : 'Não') : '')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-auto">
              <button 
                type="button"
                onClick={() => addToCart(product)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
