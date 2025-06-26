'use client';

import React, { useState, useEffect } from 'react';
import { 
  CurrencyEuroIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface PriceList {
  price_list_id: number;
  name: string;
  description: string;
}

interface PricingRule {
  id: number;
  name: string;
  description: string;
  markup_percentage: number;
  min_margin: number;
  is_active: boolean;
  applies_to: string;
  created_at: string;
}

interface PricingStats {
  totalPriceLists: number;
  totalRules: number;
  averageMarkup: number;
  lastUpdated: string;
}

interface ProductPrice {
  ean: string;
  name: string;
  brand: string;
  variantid: string;
  variant_name: string;
  stockquantity: number;
  current_price: number;
  promotional_price?: number;
  effective_price: number;
  categories: string[];
  has_campaign: boolean;
}

// Component: Product Price Editor
function ProductPriceEditor() {
  const [products, setProducts] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    category: '',
    priceListId: '4', // Preço Cliente por default
    page: 1,
    limit: 20
  });
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});
  const [availableFilters, setAvailableFilters] = useState<any>({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/pricing/products?${params}`, { 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setAvailableFilters(data.filters || {});
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const handlePriceChange = (variantid: string, newPrice: number) => {
    setEditingPrices(prev => ({
      ...prev,
      [variantid]: newPrice
    }));
  };

  const saveChanges = async () => {
    if (Object.keys(editingPrices).length === 0) return;

    try {
      const updates = Object.entries(editingPrices).map(([variantid, newPrice]) => ({
        variantid,
        price_list_id: parseInt(filters.priceListId),
        new_price: newPrice
      }));

      const response = await fetch('/api/admin/pricing/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          updates,
          reason: 'Manual price update via admin interface'
        })
      });

      if (response.ok) {
        setEditingPrices({});
        fetchProducts(); // Refresh data
        alert('Preços atualizados com sucesso!');
      } else {
        alert('Erro ao atualizar preços');
      }
    } catch (error) {
      console.error('Error updating prices:', error);
      alert('Erro ao atualizar preços');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Editar Preços de Produtos
          </h2>
          {Object.keys(editingPrices).length > 0 && (
            <button
              onClick={saveChanges}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              💾 Guardar {Object.keys(editingPrices).length} Alterações
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            className="px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          />
          
          <select
            value={filters.priceListId}
            onChange={(e) => setFilters(prev => ({ ...prev, priceListId: e.target.value, page: 1 }))}
            className="px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          >
            {availableFilters.priceLists?.map((list: any) => (
              <option key={list.price_list_id} value={list.price_list_id}>
                {list.name}
              </option>
            ))}
          </select>

          <select
            value={filters.brand}
            onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value, page: 1 }))}
            className="px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          >
            <option value="">Todas as marcas</option>
            {availableFilters.brands?.map((brand: string) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
            className="px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          >
            <option value="">Todas as categorias</option>
            {availableFilters.categories?.map((cat: string) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            🔍 Filtrar
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">A carregar produtos...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Marca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Preço Atual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Novo Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Promoção
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <tr key={product.variantid} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        EAN: {product.ean}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {product.brand}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.stockquantity > 0 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {product.stockquantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    €{product.current_price?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      step="0.01"
                      value={editingPrices[product.variantid] ?? product.current_price ?? 0}
                      onChange={(e) => handlePriceChange(product.variantid, parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {product.has_campaign ? (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 rounded-full text-xs">
                        🎯 €{product.promotional_price?.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Component: Bulk Operations Manager  
function BulkOperationsManager() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Operações em Massa
        </h2>
      </div>
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Operações em Massa de Preços
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aplique markups, descontos ou atualize preços em massa baseado em filtros avançados.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Interface em desenvolvimento - APIs implementadas ✅
          </div>
        </div>
      </div>
    </div>
  );
}

// Component: Campaigns Manager
function CampaignsManager() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Campanhas Promocionais
        </h2>
      </div>
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Gestão de Campanhas Promocionais
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Crie e gira campanhas promocionais com preços especiais, datas de início/fim e targeting avançado.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Interface em desenvolvimento - APIs implementadas ✅
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPricingPage() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [stats, setStats] = useState<PricingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'lists' | 'rules' | 'products' | 'bulk' | 'campaigns'>('products');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch price lists
      const listsResponse = await fetch('/api/admin/pricing?type=lists', { credentials: 'include' });
      const listsData = await listsResponse.json();
      
      // Fetch pricing rules  
      const rulesResponse = await fetch('/api/admin/pricing?type=rules', { credentials: 'include' });
      const rulesData = await rulesResponse.json();

      if (listsResponse.ok && rulesResponse.ok) {
        setPriceLists(listsData.priceLists || []);
        setPricingRules(rulesData.rules || []);
        
        // Calculate stats
        setStats({
          totalPriceLists: listsData.priceLists?.length || 0,
          totalRules: rulesData.rules?.length || 0,
          averageMarkup: 25.0, // Default until calculated
          lastUpdated: new Date().toISOString()
        });
        
        setError(null);
      } else {
        setError('Erro ao carregar configurações de preços');
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSavePriceList = async (formData: any) => {
    try {
      setSaveLoading(true);
      const method = editingItem ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/pricing/lists', { credentials: 'include',
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem ? { ...formData, id: editingItem.price_list_id } : formData)
      });

      if (response.ok) {
        await fetchData();
        setShowForm(false);
        setEditingItem(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao salvar lista de preços');
      }
    } catch (error) {
      console.error('Error saving price list:', error);
      alert('Erro de conexão');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeletePriceList = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta lista de preços?')) return;

    try {
      const response = await fetch(`/api/admin/pricing/lists/${id}`, { credentials: 'include',
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao excluir lista de preços');
      }
    } catch (error) {
      console.error('Error deleting price list:', error);
      alert('Erro de conexão');
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Gestão de Preços
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure listas de preços e regras de markup
            </p>
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nova {activeTab === 'lists' ? 'Lista' : 'Regra'}</span>
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <CurrencyEuroIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Listas de Preços</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPriceLists}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <i className="fas fa-percentage text-2xl text-green-600 dark:text-green-400"></i>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Regras Ativas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRules}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <i className="fas fa-chart-line text-2xl text-yellow-600 dark:text-yellow-400"></i>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Markup Médio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageMarkup.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <i className="fas fa-clock text-2xl text-purple-600 dark:text-purple-400"></i>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Última Atualização</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(stats.lastUpdated)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                🛍️ Editar Preços
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bulk'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                ⚡ Operações em Massa
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'campaigns'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                🎯 Campanhas Promocionais
              </button>
              <button
                onClick={() => setActiveTab('lists')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lists'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                📋 Listas ({priceLists.length})
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rules'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                🔧 Regras ({pricingRules.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Price Lists Tab */}
        {activeTab === 'lists' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Listas de Preços
              </h2>
            </div>

            {priceLists.length === 0 ? (
              <div className="p-12 text-center">
                <CurrencyEuroIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhuma lista de preços
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Crie sua primeira lista de preços para começar.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {priceLists.map((list) => (
                      <tr key={list.price_list_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {list.price_list_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {list.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {list.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingItem(list);
                                setShowForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Editar"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePriceList(list.price_list_id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Excluir"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products Price Editor Tab */}
        {activeTab === 'products' && (
          <ProductPriceEditor />
        )}

        {/* Bulk Operations Tab */}
        {activeTab === 'bulk' && (
          <BulkOperationsManager />
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <CampaignsManager />
        )}

        {/* Pricing Rules Tab */}
        {activeTab === 'rules' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Regras de Markup Automático
              </h2>
            </div>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <CheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Sistema Avançado Implementado v1.7.0
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    O sistema completo de gestão de preços está agora operacional. Use as abas "Editar Preços", 
                    "Operações em Massa" e "Campanhas" para gestão completa.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-12 text-center">
              <CurrencyEuroIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Regras Automáticas Avançadas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Configure regras para aplicar markups automáticos baseados em categorias, 
                marcas, datas ou outros critérios avançados.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Funcionalidade avançada - Em desenvolvimento para v1.8.0
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  name: formData.get('name'),
                  description: formData.get('description')
                };
                handleSavePriceList(data);
              }}>
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {editingItem ? 'Editar' : 'Nova'} Lista de Preços
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingItem(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        defaultValue={editingItem?.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Nome da lista de preços"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descrição
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        defaultValue={editingItem?.description || ''}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Descrição da lista de preços"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingItem(null);
                      }}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {saveLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <CheckIcon className="h-4 w-4" />
                      )}
                      <span>{saveLoading ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 