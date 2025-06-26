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
import GekoApprovalsManager from '../../../src/components/admin/pricing/GekoApprovalsManager';

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
  current_price: number | string;
  promotional_price?: number | string;
  effective_price: number | string;
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
                    €{(Number(product.current_price) || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      step="0.01"
                      value={editingPrices[product.variantid] ?? Number(product.current_price) ?? 0}
                      onChange={(e) => handlePriceChange(product.variantid, parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {product.has_campaign ? (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 rounded-full text-xs">
                        🎯 €{(Number(product.promotional_price) || 0).toFixed(2)}
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
  const [operations, setOperations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewOperation, setShowNewOperation] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [availableFilters, setAvailableFilters] = useState<any>({});

  const [newOperation, setNewOperation] = useState({
    operationType: 'markup' as 'markup' | 'discount' | 'fixed_price',
    operationName: '',
    filters: {
      category: '',
      brand: '',
      priceListId: 4,
      minPrice: '',
      maxPrice: '',
      hasStock: '',
    },
    operationData: {
      percentage: '',
      fixedPrice: ''
    },
    applyImmediately: true
  });

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pricing/bulk', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setOperations(data.operations || []);
      }
    } catch (error) {
      console.error('Error fetching operations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/admin/pricing/products?limit=1', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAvailableFilters(data.filters || {});
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchOperations();
    fetchFilters();
  }, []);

  const executeOperation = async () => {
    if (!newOperation.operationName || !newOperation.operationType) {
      alert('Nome da operação e tipo são obrigatórios');
      return;
    }

    if (newOperation.operationType === 'fixed_price' && !newOperation.operationData.fixedPrice) {
      alert('Preço fixo é obrigatório para este tipo de operação');
      return;
    }

    if (['markup', 'discount'].includes(newOperation.operationType) && !newOperation.operationData.percentage) {
      alert('Percentagem é obrigatória para este tipo de operação');
      return;
    }

    try {
      setExecuting(true);
      
      const requestData = {
        operationType: newOperation.operationType,
        operationName: newOperation.operationName,
        filters: {
          ...newOperation.filters,
          minPrice: newOperation.filters.minPrice ? parseFloat(newOperation.filters.minPrice) : undefined,
          maxPrice: newOperation.filters.maxPrice ? parseFloat(newOperation.filters.maxPrice) : undefined,
          hasStock: newOperation.filters.hasStock === '' ? undefined : newOperation.filters.hasStock === 'true'
        },
        operationData: {
          percentage: newOperation.operationData.percentage ? parseFloat(newOperation.operationData.percentage) : undefined,
          fixedPrice: newOperation.operationData.fixedPrice ? parseFloat(newOperation.operationData.fixedPrice) : undefined
        },
        applyImmediately: newOperation.applyImmediately
      };

      const response = await fetch('/api/admin/pricing/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Operação executada: ${result.affectedCount || 0} preços atualizados`);
        
        // Reset form
        setNewOperation({
          operationType: 'markup',
          operationName: '',
          filters: {
            category: '',
            brand: '',
            priceListId: 4,
            minPrice: '',
            maxPrice: '',
            hasStock: '',
          },
          operationData: {
            percentage: '',
            fixedPrice: ''
          },
          applyImmediately: true
        });
        setShowNewOperation(false);
        fetchOperations();
      } else {
        const error = await response.json();
        alert(`❌ Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Error executing operation:', error);
      alert('❌ Erro ao executar operação');
    } finally {
      setExecuting(false);
    }
  };

  const getOperationTypeLabel = (type: string) => {
    const labels = {
      markup: '📈 Markup',
      discount: '📉 Desconto',
      fixed_price: '💰 Preço Fixo',
      category_update: '📂 Atualização por Categoria',
      brand_update: '🏷️ Atualização por Marca'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header with New Operation Button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              ⚡ Operações em Massa
            </h2>
            <button
              onClick={() => setShowNewOperation(!showNewOperation)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Nova Operação</span>
            </button>
          </div>
        </div>

        {/* New Operation Form */}
        {showNewOperation && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Configuração da Operação</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome da Operação
                  </label>
                  <input
                    type="text"
                    value={newOperation.operationName}
                    onChange={(e) => setNewOperation(prev => ({ ...prev, operationName: e.target.value }))}
                    placeholder="Ex: Markup 25% em produtos eletrónicos"
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Operação
                  </label>
                  <select
                    value={newOperation.operationType}
                    onChange={(e) => setNewOperation(prev => ({ 
                      ...prev, 
                      operationType: e.target.value as any,
                      operationData: { percentage: '', fixedPrice: '' } // Reset data when type changes
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="markup">📈 Aplicar Markup (%)</option>
                    <option value="discount">📉 Aplicar Desconto (%)</option>
                    <option value="fixed_price">💰 Definir Preço Fixo</option>
                  </select>
                </div>

                {/* Operation Value */}
                {newOperation.operationType === 'fixed_price' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preço Fixo (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newOperation.operationData.fixedPrice}
                      onChange={(e) => setNewOperation(prev => ({ 
                        ...prev, 
                        operationData: { ...prev.operationData, fixedPrice: e.target.value }
                      }))}
                      placeholder="Ex: 99.99"
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Percentagem (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newOperation.operationData.percentage}
                      onChange={(e) => setNewOperation(prev => ({ 
                        ...prev, 
                        operationData: { ...prev.operationData, percentage: e.target.value }
                      }))}
                      placeholder="Ex: 25.5"
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="applyImmediately"
                    checked={newOperation.applyImmediately}
                    onChange={(e) => setNewOperation(prev => ({ ...prev, applyImmediately: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <label htmlFor="applyImmediately" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Executar imediatamente
                  </label>
                </div>
              </div>

              {/* Right Column - Filters */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Filtros de Produtos</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lista de Preços
                  </label>
                  <select
                    value={newOperation.filters.priceListId}
                    onChange={(e) => setNewOperation(prev => ({ 
                      ...prev, 
                      filters: { ...prev.filters, priceListId: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    {availableFilters.priceLists?.map((list: any) => (
                      <option key={list.price_list_id} value={list.price_list_id}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoria
                    </label>
                    <select
                      value={newOperation.filters.category}
                      onChange={(e) => setNewOperation(prev => ({ 
                        ...prev, 
                        filters: { ...prev.filters, category: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                      <option value="">Todas</option>
                      {availableFilters.categories?.map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Marca
                    </label>
                    <select
                      value={newOperation.filters.brand}
                      onChange={(e) => setNewOperation(prev => ({ 
                        ...prev, 
                        filters: { ...prev.filters, brand: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                      <option value="">Todas</option>
                      {availableFilters.brands?.map((brand: string) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preço Mín. (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newOperation.filters.minPrice}
                      onChange={(e) => setNewOperation(prev => ({ 
                        ...prev, 
                        filters: { ...prev.filters, minPrice: e.target.value }
                      }))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preço Máx. (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newOperation.filters.maxPrice}
                      onChange={(e) => setNewOperation(prev => ({ 
                        ...prev, 
                        filters: { ...prev.filters, maxPrice: e.target.value }
                      }))}
                      placeholder="999.99"
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock
                  </label>
                  <select
                    value={newOperation.filters.hasStock}
                    onChange={(e) => setNewOperation(prev => ({ 
                      ...prev, 
                      filters: { ...prev.filters, hasStock: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="">Todos os produtos</option>
                    <option value="true">Apenas com stock</option>
                    <option value="false">Apenas sem stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowNewOperation(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={executeOperation}
                disabled={executing}
                className={`px-6 py-2 rounded-md text-white ${
                  executing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } flex items-center space-x-2`}
              >
                {executing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Executando...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Executar Operação</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Operations History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Histórico de Operações
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">A carregar operações...</p>
            </div>
          ) : operations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma operação executada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                As operações em massa aparecerão aqui após serem executadas.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Operação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Produtos Afetados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Executado por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {operations.map((operation) => (
                  <tr key={operation.operation_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {operation.operation_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {getOperationTypeLabel(operation.operation_type)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(operation.status)}`}>
                        {operation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {operation.affected_count || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {operation.first_name} {operation.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(operation.created_at).toLocaleDateString('pt-PT')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// Component: Campaigns Manager
function CampaignsManager() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [creating, setCreating] = useState(false);
  const [availableFilters, setAvailableFilters] = useState<any>({});

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    campaignType: 'promotional' as 'promotional' | 'seasonal' | 'clearance' | 'flash_sale' | 'bulk_discount',
    startDate: '',
    endDate: '',
    isActive: true,
    priority: 1,
    discountType: 'percentage' as 'percentage' | 'fixed_amount',
    discountValue: '',
    filters: {
      categories: [] as string[],
      brands: [] as string[],
      priceListId: 4,
      minPrice: '',
      maxPrice: '',
      hasStock: '',
    }
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pricing/campaigns', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/admin/pricing/products?limit=1', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAvailableFilters(data.filters || {});
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchFilters();
  }, []);

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.discountValue) {
      alert('Nome da campanha e valor do desconto são obrigatórios');
      return;
    }

    if (!newCampaign.startDate || !newCampaign.endDate) {
      alert('Datas de início e fim são obrigatórias');
      return;
    }

    try {
      setCreating(true);
      
      const requestData = {
        name: newCampaign.name,
        description: newCampaign.description,
        campaignType: newCampaign.campaignType,
        startDate: newCampaign.startDate,
        endDate: newCampaign.endDate,
        isActive: newCampaign.isActive,
        priority: newCampaign.priority,
        discountType: newCampaign.discountType,
        discountValue: parseFloat(newCampaign.discountValue),
        filters: {
          ...newCampaign.filters,
          minPrice: newCampaign.filters.minPrice ? parseFloat(newCampaign.filters.minPrice) : undefined,
          maxPrice: newCampaign.filters.maxPrice ? parseFloat(newCampaign.filters.maxPrice) : undefined,
          hasStock: newCampaign.filters.hasStock === '' ? undefined : newCampaign.filters.hasStock === 'true'
        }
      };

      const response = await fetch('/api/admin/pricing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Campanha criada: ${result.affectedCount || 0} produtos incluídos`);
        
        // Reset form
        setNewCampaign({
          name: '',
          description: '',
          campaignType: 'promotional',
          startDate: '',
          endDate: '',
          isActive: true,
          priority: 1,
          discountType: 'percentage',
          discountValue: '',
          filters: {
            categories: [],
            brands: [],
            priceListId: 4,
            minPrice: '',
            maxPrice: '',
            hasStock: '',
          }
        });
        setShowNewCampaign(false);
        fetchCampaigns();
      } else {
        const error = await response.json();
        alert(`❌ Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('❌ Erro ao criar campanha');
    } finally {
      setCreating(false);
    }
  };

  const toggleCampaignStatus = async (campaignId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/pricing/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        fetchCampaigns();
      } else {
        const error = await response.json();
        alert(`❌ Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Error toggling campaign:', error);
      alert('❌ Erro ao alterar estado da campanha');
    }
  };

  const getCampaignTypeLabel = (type: string) => {
    const labels = {
      promotional: '🎯 Promocional',
      seasonal: '🌞 Sazonal', 
      clearance: '🔥 Liquidação',
      flash_sale: '⚡ Flash Sale',
      bulk_discount: '📦 Desconto Volume'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (campaign: any) => {
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);
    
    if (!campaign.is_active) {
      return { text: 'Inativo', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' };
    }
    
    if (now < start) {
      return { text: 'Agendado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
    }
    
    if (now >= start && now <= end) {
      return { text: 'Ativo', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    }
    
    return { text: 'Expirado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with New Campaign Button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              🎯 Campanhas Promocionais
            </h2>
            <button
              onClick={() => setShowNewCampaign(!showNewCampaign)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Nova Campanha</span>
            </button>
          </div>
        </div>

        {/* New Campaign Form */}
        {showNewCampaign && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Informações da Campanha</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome da Campanha
                  </label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Black Friday 2024"
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição detalhada da campanha"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Campanha
                  </label>
                  <select
                    value={newCampaign.campaignType}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, campaignType: e.target.value as any }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="promotional">🎯 Promocional</option>
                    <option value="seasonal">🌞 Sazonal</option>
                    <option value="clearance">🔥 Liquidação</option>
                    <option value="flash_sale">⚡ Flash Sale</option>
                    <option value="bulk_discount">📦 Desconto Volume</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Início
                    </label>
                    <input
                      type="datetime-local"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Fim
                    </label>
                    <input
                      type="datetime-local"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Desconto
                    </label>
                    <select
                      value={newCampaign.discountType}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, discountType: e.target.value as any }))}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                      <option value="percentage">📊 Percentagem (%)</option>
                      <option value="fixed_amount">💰 Valor Fixo (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valor do Desconto
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCampaign.discountValue}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, discountValue: e.target.value }))}
                      placeholder={newCampaign.discountType === 'percentage' ? '25.0' : '10.00'}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prioridade
                    </label>
                    <select
                      value={newCampaign.priority}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                      <option value={1}>🔴 Alta (1)</option>
                      <option value={2}>🟡 Média (2)</option>
                      <option value={3}>🟢 Baixa (3)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={newCampaign.isActive}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="h-4 w-4 text-green-600 rounded border-gray-300"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Ativar imediatamente
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Filters */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Produtos Incluídos</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lista de Preços
                  </label>
                  <select
                    value={newCampaign.filters.priceListId}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      filters: { ...prev.filters, priceListId: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    {availableFilters.priceLists?.map((list: any) => (
                      <option key={list.price_list_id} value={list.price_list_id}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categorias (múltipla seleção)
                  </label>
                  <select
                    multiple
                    value={newCampaign.filters.categories}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setNewCampaign(prev => ({ 
                        ...prev, 
                        filters: { ...prev.filters, categories: selected }
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white h-24"
                  >
                    {availableFilters.categories?.map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ctrl+Click para selecionar múltiplas categorias
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Marcas (múltipla seleção)
                  </label>
                  <select
                    multiple
                    value={newCampaign.filters.brands}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setNewCampaign(prev => ({ 
                        ...prev, 
                        filters: { ...prev.filters, brands: selected }
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white h-24"
                  >
                    {availableFilters.brands?.map((brand: string) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ctrl+Click para selecionar múltiplas marcas
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preço Mín. (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCampaign.filters.minPrice}
                      onChange={(e) => setNewCampaign(prev => ({ 
                        ...prev, 
                        filters: { ...prev.filters, minPrice: e.target.value }
                      }))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preço Máx. (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newCampaign.filters.maxPrice}
                      onChange={(e) => setNewCampaign(prev => ({ 
                        ...prev, 
                        filters: { ...prev.filters, maxPrice: e.target.value }
                      }))}
                      placeholder="999.99"
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock
                  </label>
                  <select
                    value={newCampaign.filters.hasStock}
                    onChange={(e) => setNewCampaign(prev => ({ 
                      ...prev, 
                      filters: { ...prev.filters, hasStock: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="">Todos os produtos</option>
                    <option value="true">Apenas com stock</option>
                    <option value="false">Apenas sem stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowNewCampaign(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={createCampaign}
                disabled={creating}
                className={`px-6 py-2 rounded-md text-white ${
                  creating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } flex items-center space-x-2`}
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <span>🎯</span>
                    <span>Criar Campanha</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Campaigns List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Campanhas Ativas e Agendadas
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">A carregar campanhas...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma campanha criada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                As campanhas promocionais aparecerão aqui após serem criadas.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Campanha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Desconto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Produtos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {campaigns.map((campaign) => {
                  const status = getStatusBadge(campaign);
                  return (
                    <tr key={campaign.campaign_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {campaign.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {getCampaignTypeLabel(campaign.campaign_type)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {campaign.discount_type === 'percentage' 
                          ? `${campaign.discount_value}%` 
                          : `€${campaign.discount_value}`
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div>{formatDate(campaign.start_date)}</div>
                        <div>{formatDate(campaign.end_date)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {campaign.products_count || 0}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => toggleCampaignStatus(campaign.campaign_id, campaign.is_active)}
                          className={`px-3 py-1 rounded-md text-xs ${
                            campaign.is_active 
                              ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                          }`}
                        >
                          {campaign.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// Component: Pricing Config Manager
function PricingConfigManager() {
  const [configs, setConfigs] = useState<any>({});
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    defaultPriceList: '',
    defaultAdminPriceList: '',
    markups: {} as Record<string, string>
  });

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      
      // Fetch current configurations
      const configResponse = await fetch('/api/admin/pricing?type=config', { credentials: 'include' });
      const configData = await configResponse.json();
      
      // Fetch price lists
      const listsResponse = await fetch('/api/admin/pricing?type=lists', { credentials: 'include' });
      const listsData = await listsResponse.json();
      
      if (configResponse.ok && listsResponse.ok) {
        const configMap = configData.configs?.reduce((acc: any, config: any) => {
          acc[config.config_key] = config.config_value;
          return acc;
        }, {}) || {};
        
        setConfigs(configMap);
        setPriceLists(listsData.priceLists || []);
        
        // Initialize settings
        setSettings({
          defaultPriceList: configMap['default_customer_price_list'] || '4',
          defaultAdminPriceList: configMap['default_admin_price_list'] || '4',
          markups: {
            '1': configMap['markup_supplier_price'] || '0',
            '2': configMap['markup_base_selling_price'] || '25',
            '4': configMap['markup_customer_price'] || '35'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const saveConfigs = async () => {
    try {
      setSaving(true);
      
      const configUpdates = [
        { key: 'default_customer_price_list', value: settings.defaultPriceList },
        { key: 'default_admin_price_list', value: settings.defaultAdminPriceList },
        { key: 'markup_supplier_price', value: settings.markups['1'] || '0' },
        { key: 'markup_base_selling_price', value: settings.markups['2'] || '25' },
        { key: 'markup_customer_price', value: settings.markups['4'] || '35' }
      ];

      const response = await fetch('/api/admin/pricing/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ configs: configUpdates })
      });

      if (response.ok) {
        alert('✅ Configurações salvas com sucesso!');
        fetchConfigs(); // Refresh data
      } else {
        const error = await response.json();
        alert(`❌ Erro: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving configs:', error);
      alert('❌ Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkupChange = (priceListId: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      markups: {
        ...prev.markups,
        [priceListId]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Default Price List Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            ⚙️ Lista de Preços Padrão para Clientes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Defina qual lista de preços os clientes veem por padrão após o login
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">A carregar configurações...</p>
            </div>
          ) : (
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lista de Preços Padrão
              </label>
              <select
                value={settings.defaultPriceList}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultPriceList: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {priceLists.map(list => (
                  <option key={list.price_list_id} value={list.price_list_id}>
                    {list.name} (ID: {list.price_list_id})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Esta lista será mostrada automaticamente aos clientes quando fizerem login
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Default Price List Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            👨‍💼 Lista de Preços Padrão para Admin
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Defina qual lista de preços o admin vê por padrão na área de gestão de produtos
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">A carregar configurações...</p>
            </div>
          ) : (
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lista de Preços Padrão Admin
              </label>
              <select
                value={settings.defaultAdminPriceList}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultAdminPriceList: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {priceLists.map(list => (
                  <option key={list.price_list_id} value={list.price_list_id}>
                    {list.name} (ID: {list.price_list_id})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Esta lista será mostrada por padrão ao admin na gestão de produtos e preços
              </p>
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-amber-600 dark:text-amber-400">💡</div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Recomendação:</strong> Use "Supplier Price" para ver custos ou "Preço Cliente" para ver preços finais
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Markup Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            📊 Markups Base por Lista de Preços
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure as margens automáticas aplicadas sobre o custo de fornecedor para cada lista
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">A carregar configurações...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {priceLists.map(list => (
                <div key={list.price_list_id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {list.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {list.description}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ID: {list.price_list_id}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Markup:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1000"
                        value={settings.markups[list.price_list_id] || '0'}
                        onChange={(e) => handleMarkupChange(list.price_list_id.toString(), e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        placeholder="0"
                      />
                      <span className="absolute right-8 top-1 text-xs text-gray-500 dark:text-gray-400">%</span>
                    </div>
                    
                    {list.price_list_id === 1 && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        Custo Base
                      </span>
                    )}
                    {list.price_list_id === 4 && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        Padrão Clientes
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-600 dark:text-blue-400">ℹ️</div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Como Funcionam os Markups
                    </h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                      <p>• <strong>Supplier Price (ID: 1):</strong> Custo base do fornecedor (normalmente 0% markup)</p>
                      <p>• <strong>Base Selling Price (ID: 2):</strong> Preço de venda base com markup padrão</p>
                      <p>• <strong>Preço Cliente (ID: 4):</strong> Preço final mostrado aos clientes (markup recomendado: 25-40%)</p>
                      <p className="mt-2 font-medium">💡 Exemplo: Custo €10 + Markup 35% = Preço Final €13.50</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Save Button */}
        <button
          onClick={saveConfigs}
          disabled={saving || loading}
          className={`px-6 py-3 rounded-lg text-white font-medium ${
            saving || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } flex items-center justify-center space-x-2 flex-1`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <CheckIcon className="h-5 w-5" />
              <span>Salvar Configurações</span>
            </>
          )}
        </button>
        
        {/* Recalculate Button */}
        <button
          onClick={async () => {
            if (!confirm('⚠️ Isto irá recalcular TODOS os preços baseado nas configurações atuais. Continuar?')) return;
            
            try {
              setSaving(true);
              const response = await fetch('/api/admin/pricing/recalculate', {
                method: 'POST',
                credentials: 'include'
              });
              
              if (response.ok) {
                const data = await response.json();
                alert(`✅ ${data.message}\n\n📊 Resultados:\n• Preços base atualizados: ${data.result.basePricesUpdated}\n• Preços cliente atualizados: ${data.result.customerPricesUpdated}\n• Total afetado: ${data.result.totalAffected}\n• Duração: ${data.result.durationMs}ms`);
                // Refresh configs after recalculation
                fetchConfigs();
              } else {
                const error = await response.json();
                alert(`❌ Erro: ${error.error}`);
              }
            } catch (error) {
              console.error('Error recalculating prices:', error);
              alert('❌ Erro ao recalcular preços');
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving || loading}
          className={`px-6 py-3 rounded-lg text-white font-medium ${
            saving || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700'
          } flex items-center justify-center space-x-2 flex-1`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Recalculando...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Recalcular Preços</span>
            </>
          )}
        </button>
      </div>
      
      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-4">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-600 dark:text-yellow-400">⚠️</div>
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p><strong>Importante:</strong> Salve as configurações antes de recalcular para aplicar as novas margens.</p>
            <p className="mt-1">O recálculo afeta TODOS os preços da plataforma baseado nas configurações atuais.</p>
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
  const [activeTab, setActiveTab] = useState<'lists' | 'rules' | 'products' | 'bulk' | 'campaigns' | 'config' | 'geko-approvals'>('products');
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
                onClick={() => setActiveTab('config')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'config'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                ⚙️ Configurações
              </button>
              <button
                onClick={() => setActiveTab('geko-approvals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'geko-approvals'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                🔄 Aprovações Geko
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

        {/* Config Tab */}
        {activeTab === 'config' && (
          <PricingConfigManager />
        )}

        {/* Geko Approvals Tab */}
        {activeTab === 'geko-approvals' && (
          <GekoApprovalsManager />
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
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                ✅ Sistema de Aprovação da Geko disponível na aba "🔄 Aprovações Geko"
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