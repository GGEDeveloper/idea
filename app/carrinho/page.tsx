'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function CarrinhoPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getTotalItems } = useCart();
  
  const totalItems = getTotalItems();
  const totalAmount = getCartTotal();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    // TODO: Implement checkout functionality
    // For now, redirect to login if needed or create order
    router.push('/login');
  };

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
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <i className="fas fa-shipping-fast text-2xl text-blue-600 dark:text-blue-400 mb-3"></i>
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Envio Rápido</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Entrega em 24-48h para parceiros</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <i className="fas fa-shield-alt text-2xl text-green-600 dark:text-green-400 mb-3"></i>
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Garantia</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Produtos com garantia oficial</p>
            </div>
            
            <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <i className="fas fa-headset text-2xl text-yellow-600 dark:text-yellow-400 mb-3"></i>
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Suporte</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Apoio técnico especializado</p>
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
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          €{item.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          cada
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Resumo do Pedido
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'}):</span>
                  <span className="text-gray-900 dark:text-white font-medium">€{totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Portes de envio:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Grátis</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">€{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  <span>Finalizar Compra</span>
                </button>
                
                <Link
                  href="/produtos"
                  className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium text-center block"
                >
                  Continuar a Comprar
                </Link>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-shield-alt text-green-600 dark:text-green-400 mt-1"></i>
                  <div>
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                      Compra Segura
                    </h4>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Os seus dados estão protegidos e a transação é 100% segura.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Precisa de mais alguma coisa?
          </p>
          <Link
            href="/produtos"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Voltar aos Produtos</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 