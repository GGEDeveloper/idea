import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const OrderCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Order state
  const [selectedUser, setSelectedUser] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderStatus, setOrderStatus] = useState('pending_approval');
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productSearchResults, setProductSearchResults] = useState([]);
  
  // UI states
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);

  const statusOptions = [
    { value: 'pending_approval', label: 'Pendente Aprovação' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregue' }
  ];

  // Search for users
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUserSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const users = await response.json();
        setUserSearchResults(users);
      }
    } catch (error) {
      console.error('Erro ao pesquisar utilizadores:', error);
    }
  };

  // Search for products
  const searchProducts = async (query) => {
    if (!query.trim()) {
      setProductSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/products?search=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setProductSearchResults(data.products || []);
      }
    } catch (error) {
      console.error('Erro ao pesquisar produtos:', error);
    }
  };

  // Handle user search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(userSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Handle product search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(productSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const selectUser = (user) => {
    setSelectedUser(user);
    setUserSearch('');
    setUserSearchResults([]);
    setShowUserSearch(false);
  };

  const addProduct = (product) => {
    const existingItem = orderItems.find(item => item.ean === product.ean);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.ean === product.ean 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        ean: product.ean,
        name: product.name,
        price: product.price || 0,
        quantity: 1
      }]);
    }
    
    setProductSearch('');
    setProductSearchResults([]);
    setShowProductSearch(false);
  };

  const updateQuantity = (ean, quantity) => {
    if (quantity <= 0) {
      removeItem(ean);
      return;
    }
    
    setOrderItems(orderItems.map(item => 
      item.ean === ean ? { ...item, quantity } : item
    ));
  };

  const removeItem = (ean) => {
    setOrderItems(orderItems.filter(item => item.ean !== ean));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError('Por favor, selecione um cliente');
      return;
    }
    
    if (orderItems.length === 0) {
      setError('Por favor, adicione pelo menos um produto');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const orderData = {
        user_id: selectedUser.user_id,
        order_status: orderStatus,
        items: orderItems.map(item => ({
          product_ean: item.ean,
          quantity: item.quantity,
          price_at_purchase: item.price,
          product_name: item.name
        })),
        total_amount: calculateTotal()
      };
      
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao criar encomenda');
      }
      
      const newOrder = await response.json();
      navigate(`/admin/orders/${newOrder.order_id}`);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <nav className="text-sm text-gray-600 mb-2">
          <Link to="/admin" className="hover:text-blue-600">Admin</Link>
          <span className="mx-2">›</span>
          <Link to="/admin/orders" className="hover:text-blue-600">Encomendas</Link>
          <span className="mx-2">›</span>
          <span>Criar Nova</span>
        </nav>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Criar Nova Encomenda</h1>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="inline-flex items-center bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Selecionar Cliente
              </h2>
              
              {selectedUser ? (
                <div className="bg-gray-50 p-4 rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedUser.first_name || selectedUser.last_name ? 
                          `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() : 
                          'Nome não disponível'
                        }
                      </h3>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                      {selectedUser.company_name && (
                        <p className="text-sm text-gray-600">{selectedUser.company_name}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar cliente por email, nome ou empresa..."
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setShowUserSearch(true);
                      }}
                      onFocus={() => setShowUserSearch(true)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {showUserSearch && userSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {userSearchResults.map((user) => (
                        <button
                          key={user.user_id}
                          type="button"
                          onClick={() => selectUser(user)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {user.first_name || user.last_name ? 
                              `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                              'Nome não disponível'
                            }
                          </div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          {user.company_name && (
                            <div className="text-sm text-gray-600">{user.company_name}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Products Selection */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Produtos da Encomenda
              </h2>
              
              {/* Add Product Search */}
              <div className="relative mb-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar produto por nome, EAN ou marca..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductSearch(true);
                    }}
                    onFocus={() => setShowProductSearch(true)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {showProductSearch && productSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {productSearchResults.map((product) => (
                      <button
                        key={product.ean}
                        type="button"
                        onClick={() => addProduct(product)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-600">EAN: {product.ean}</div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(product.price)} • Stock: {product.total_stock || 0}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Items */}
              {orderItems.length > 0 ? (
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.ean} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">EAN: {item.ean}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.price)} cada</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.ean, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-sm text-gray-600 w-20 text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.ean)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum produto adicionado. Use a pesquisa acima para adicionar produtos.
                </p>
              )}
            </div>
          </div>

          {/* Order Settings */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Configurações</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Inicial
                  </label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading || !selectedUser || orderItems.length === 0}
                className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition-colors"
              >
                {loading ? 'A criar...' : 'Criar Encomenda'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderCreatePage; 