import React from 'react';

export default function CarrinhoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Carrinho de Compras
        </h1>
        
        {/* Empty Cart State */}
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-shopping-cart text-3xl text-gray-400"></i>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            O seu carrinho está vazio
          </h2>
          
          <p className="text-gray-600 mb-8">
            Parece que ainda não adicionou nenhum produto ao seu carrinho.<br />
            Explore os nossos produtos e encontre as ferramentas que precisa.
          </p>
          
          <div className="space-y-4">
            <a 
              href="/produtos" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Explorar Produtos
            </a>
            
            <br />
            
            <a 
              href="/categorias" 
              className="inline-block text-blue-600 hover:text-blue-700 transition-colors"
            >
              Ver Categorias
            </a>
          </div>
        </div>
        
        {/* Future Cart Items Section - Hidden for now */}
        <div className="hidden">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center space-x-4">
              <img 
                src="/placeholder-product.jpg" 
                alt="Product" 
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Nome do Produto</h3>
                <p className="text-gray-600">Código: ABC123</p>
                <p className="text-lg font-bold text-blue-600">€99.99</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                  <i className="fas fa-minus text-xs"></i>
                </button>
                <span className="font-medium">1</span>
                <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                  <i className="fas fa-plus text-xs"></i>
                </button>
              </div>
              <button className="text-red-500 hover:text-red-700">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          {/* Cart Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Resumo do Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>€99.99</span>
              </div>
              <div className="flex justify-between">
                <span>Portes de envio:</span>
                <span>€5.00</span>
              </div>
              <div className="border-t pt-2 font-semibold flex justify-between">
                <span>Total:</span>
                <span>€104.99</span>
              </div>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-6">
              Finalizar Compra
            </button>
          </div>
        </div>
        
        {/* Information Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <i className="fas fa-shipping-fast text-2xl text-blue-600 mb-3"></i>
            <h3 className="font-medium text-gray-800 mb-2">Envio Rápido</h3>
            <p className="text-sm text-gray-600">Entrega em 24-48h para parceiros</p>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <i className="fas fa-shield-alt text-2xl text-green-600 mb-3"></i>
            <h3 className="font-medium text-gray-800 mb-2">Garantia</h3>
            <p className="text-sm text-gray-600">Produtos com garantia oficial</p>
          </div>
          
          <div className="text-center p-6 bg-yellow-50 rounded-lg">
            <i className="fas fa-headset text-2xl text-yellow-600 mb-3"></i>
            <h3 className="font-medium text-gray-800 mb-2">Suporte</h3>
            <p className="text-sm text-gray-600">Apoio técnico especializado</p>
          </div>
        </div>
      </div>
    </div>
  );
} 