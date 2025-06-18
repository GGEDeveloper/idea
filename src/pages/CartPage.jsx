// src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { PlusIcon, MinusIcon, TrashIcon, ArrowLeftIcon, ShoppingCartIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Função para obter MOQ do produto (mock - seria obtido da API/base de dados)
  const getProductMOQ = (productEan) => {
    // Por agora, retorna 1 como padrão. No futuro, esta informação viria da base de dados
    // baseada nos dados XML da Geko que contêm o atributo MOQ
    return 1;
  };

  // Função para validar e ajustar quantidade baseada no MOQ
  const handleQuantityChange = (itemId, newQuantity, moq = 1) => {
    if (newQuantity < moq) {
      toast.error(t('cart.quantityTooLow', { moq }), {
        duration: 4000,
        icon: '⚠️'
      });
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  // Função para ajustar automaticamente para a quantidade mínima
  const adjustToMinimum = (itemId, moq) => {
    setIsProcessing(true);
    setTimeout(() => {
      updateQuantity(itemId, moq);
      toast.success(t('cart.adjustQuantity'), { icon: '✓' });
      setIsProcessing(false);
    }, 300);
  };

  // Função para formatar preços
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Função para calcular IVA
  const calculateTax = (subtotal) => {
    return subtotal * 0.23;
  };

  // Função para obter URL da imagem com fallback
  const getImageUrl = (item) => {
    return item.image || item.imageUrl || '/placeholder-product.jpg';
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCartIcon className="w-16 h-16 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {t('cart.emptyTitle')}
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {t('cart.emptyMessage')}
              </p>
              <Link
                to="/produtos"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                {t('cart.viewProducts')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {t('cart.pageTitle')}
              </h1>
              <p className="text-gray-600">
                {t('cart.itemsTotal')}: {cartItems.reduce((total, item) => total + item.quantity, 0)} {t('cart.items')}
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <Link
                to="/produtos"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors group"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:flex lg:gap-8">
          
          {/* Lista de Produtos */}
          <div className="lg:w-2/3">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Artigos no Carrinho ({cartItems.length})
                </h2>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => {
                  const moq = getProductMOQ(item.ean);
                  const hasLowQuantity = item.quantity < moq;
                  
                  return (
                    <li key={item.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start space-x-6">
                        
                        {/* Imagem do Produto */}
                        <div className="flex-shrink-0">
                          <div className="relative group">
                            <img 
                              src={getImageUrl(item)}
                              alt={item.name} 
                              className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-2 border-gray-200 group-hover:border-indigo-300 transition-colors duration-200 shadow-sm" 
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-product.jpg';
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 rounded-xl transition-all duration-200"></div>
                          </div>
                        </div>
                        
                        {/* Informações do Produto */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                              <Link 
                                to={`/produtos/${item.ean}`} 
                                className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200 line-clamp-2"
                              >
                                {item.name}
                              </Link>
                              
                              {item.brand && (
                                <p className="text-sm text-gray-500 mt-1 font-medium">
                                  {item.brand}
                                </p>
                              )}
                              
                              <div className="mt-2 flex items-center space-x-4">
                                <p className="text-xl font-bold text-gray-900">
                                  {formatPrice(item.price)}
                                </p>
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <InformationCircleIcon className="w-4 h-4" />
                                  <span>EAN: {item.ean}</span>
                                </div>
                              </div>
                              
                              {/* Aviso de MOQ */}
                              {hasLowQuantity && (
                                <div className="mt-3 flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-sm text-yellow-800 font-medium">
                                      {t('cart.moqWarning', { moq })}
                                    </p>
                                    <button
                                      onClick={() => adjustToMinimum(item.id, moq)}
                                      disabled={isProcessing}
                                      className="mt-2 text-xs text-yellow-700 hover:text-yellow-900 font-medium underline disabled:opacity-50"
                                    >
                                      {t('cart.adjustQuantity')}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Controlos de Quantidade e Remoção */}
                            <div className="flex flex-col items-end space-y-4">
                              
                              {/* Controlos de Quantidade */}
                              <div className="flex items-center bg-gray-50 border-2 border-gray-200 rounded-xl overflow-hidden">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1, moq)}
                                  disabled={item.quantity <= 1}
                                  className="p-3 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:bg-gray-100"
                                  aria-label={t('cart.decreaseQuantity')}
                                >
                                  <MinusIcon className="w-4 h-4" />
                                </button>
                                
                                <div className="px-4 py-3 min-w-[60px] text-center">
                                  <span className="text-lg font-semibold text-gray-900 tabular-nums">
                                    {item.quantity}
                                  </span>
                                </div>
                                
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1, moq)}
                                  className="p-3 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
                                  aria-label={t('cart.increaseQuantity')}
                                >
                                  <PlusIcon className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* Subtotal do Item */}
                              <div className="text-right">
                                <p className="text-sm text-gray-500">{t('cart.subtotal')}:</p>
                                <p className="text-lg font-bold text-gray-900">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                              
                              {/* Botão de Remoção */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-800 transition-colors focus:outline-none group"
                                aria-label={t('cart.removeItem')}
                              >
                                <TrashIcon className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" />
                                {t('cart.removeItem')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {/* Ações do Carrinho - Mobile */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 lg:hidden">
              <Link
                to="/produtos"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors group w-full sm:w-auto justify-center sm:justify-start"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
                {t('cart.continueShopping')}
              </Link>
              <button
                onClick={clearCart}
                className="px-6 py-3 border-2 border-red-500 text-red-600 font-semibold rounded-xl hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-all duration-200 w-full sm:w-auto"
              >
                {t('cart.clearCart')}
              </button>
            </div>
          </div>

          {/* Resumo da Encomenda */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-white shadow-xl rounded-2xl border border-gray-200 sticky top-6">
              
              {/* Header do Resumo */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-5 border-b border-gray-200 rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <ShoppingCartIcon className="w-6 h-6 mr-2 text-indigo-600" />
                  {t('cart.orderSummary')}
                </h2>
              </div>
              
              {/* Detalhes do Resumo */}
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>{t('cart.subtotal')}</p>
                    <p>{formatPrice(getCartTotal())}</p>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>{t('cart.shipping')}</p>
                    <p className="font-medium text-green-600">{t('cart.free')}</p>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>{t('cart.tax')}</p>
                    <p>{formatPrice(calculateTax(getCartTotal()))}</p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <p>{t('cart.total')}</p>
                      <p className="text-xl">{formatPrice(getCartTotal() + calculateTax(getCartTotal()))}</p>
                    </div>
                  </div>
                </div>
                
                {/* Informação de Entrega */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">{t('cart.estimatedDelivery')}</p>
                      <p>3-5 {t('cart.businessDays')}</p>
                    </div>
                  </div>
                </div>
                
                {/* Botão de Finalizar */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 font-semibold text-lg shadow-lg transform hover:scale-105"
                >
                  {t('cart.proceedToCheckout')}
                </button>
                
                {/* Ações Adicionais - Desktop */}
                <div className="mt-6 hidden lg:flex justify-between items-center pt-4 border-t border-gray-200">
                  <Link
                    to="/produtos"
                    className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors text-sm group"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-1 inline transform group-hover:-translate-x-1 transition-transform duration-200" />
                    {t('cart.continueShopping')}
                  </Link>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 font-medium transition-colors text-sm"
                  >
                    {t('cart.clearCart')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
