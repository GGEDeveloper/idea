'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function CarrinhoPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getTotalItems, isInitialized, isLoading } = useCart();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    // Redirect to checkout page
    router.push('/checkout');
  };

  // Loading state - mostrar enquanto está inicializando
  if (isLoading || !isInitialized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            Carrinho de Compras
          </h1>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando carrinho...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calcular totais após garantir que está inicializado
  const totalItems = getTotalItems();
  const totalAmount = getCartTotal();
  
  // Estado de carrinho vazio
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            Carrinho de Compras
          </h1>
          
          {/* Empty Cart State */}
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-shopping-cart text-3xl text-gray-400"></i>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              O seu carrinho está vazio
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Parece que ainda não adicionou nenhum produto ao seu carrinho.<br />
              Explore os nossos produtos e encontre as ferramentas que precisa.
            </p>
            
            <div className="space-y-4">
              <Link 
                href="/produtos" 
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Explorar Produtos
              </Link>
              
              <br />
              
              <Link 
                href="/categorias" 
                className="inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Ver Categorias
              </Link>
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shipping-fast text-xl text-blue-600 dark:text-blue-400"></i>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Envio Rápido</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Entrega em todo o território nacional
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-xl text-green-600 dark:text-green-400"></i>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Compra Segura</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pagamentos 100% seguros e protegidos
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-tools text-xl text-yellow-600 dark:text-yellow-400"></i>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Qualidade Premium</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ferramentas profissionais de alta qualidade
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Carrinho de Compras
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clear Cart Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Produtos no Carrinho
              </h2>
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors"
              >
                Limpar Carrinho
              </button>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-full sm:w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <i className="fas fa-cube text-2xl"></i>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                      {item.name}
                    </h3>
                    {item.brand && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Marca: {item.brand}
                      </p>
                    )}
                    {item.ean && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                        Código: {item.ean}
                      </p>
                    )}
                    
                    {/* Price and Quantity Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          €{item.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          cada
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-white dark:bg-gray-600 rounded-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <i className="fas fa-minus text-xs"></i>
                          </button>
                          <span className="font-medium text-gray-900 dark:text-white w-12 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-white dark:bg-gray-600 rounded-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                          >
                            <i className="fas fa-plus text-xs"></i>
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          aria-label={`Remover ${item.name} do carrinho`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Subtotal:
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Resumo do Pedido
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
                  <span>€{totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Envio</span>
                  <span className="text-green-600 dark:text-green-400">Gratuito</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-800 dark:text-white">
                    <span>Total</span>
                    <span>€{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Finalizar Compra
                </button>
                
                <Link 
                  href="/produtos"
                  className="block w-full text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 py-2 transition-colors"
                >
                  Continuar a Comprar
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Informações Importantes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Entrega</h4>
              <ul className="space-y-1">
                <li>• Entrega gratuita em encomendas superiores a €50</li>
                <li>• Prazo de entrega: 3-5 dias úteis</li>
                <li>• Entrega em todo o território nacional</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Garantias</h4>
              <ul className="space-y-1">
                <li>• Garantia de 2 anos em todas as ferramentas</li>
                <li>• Política de devolução de 30 dias</li>
                <li>• Suporte técnico especializado</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 