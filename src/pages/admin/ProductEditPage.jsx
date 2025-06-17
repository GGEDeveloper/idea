import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Um componente reutilizável para a gestão de stock de uma variação
const StockManager = ({ productId, variation }) => {
    const [stock, setStock] = useState(null);
    const [newStock, setNewStock] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const variantId = variation.variantid;

    const fetchStock = useCallback(async () => {
        if (!productId || !variantId) {
            setError('ProductID ou VariantID em falta para buscar stock.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            const response = await fetch(`/api/products/${productId}/variations/${variantId}/stock`);
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Falha ao buscar stock: ${response.status} ${errText}`);
            }
            const data = await response.json();
            setStock(data);
            setNewStock(data.quantity !== undefined ? String(data.quantity) : '');
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [productId, variantId]);

    useEffect(() => {
        fetchStock();
    }, [fetchStock]);

    const handleUpdateStock = async () => {
        if (newStock === '' || isNaN(parseInt(newStock, 10))) {
            setError('Quantidade de stock inválida.');
            return;
        }
        try {
            setError('');
            setSuccess('');
            const response = await fetch(`/api/products/${productId}/variations/${variantId}/stock`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: parseInt(newStock, 10) })
            });
            if (!response.ok) {
                 const errData = await response.json();
                 throw new Error(errData.error || 'Falha ao atualizar stock');
            }
            const updatedStock = await response.json();
            setStock(updatedStock);
            setNewStock(String(updatedStock.quantity));
            setSuccess('Stock atualizado com sucesso!');
        } catch (e) {
            setError(e.message);
        }
    };
    
    if (loading) return <tr><td colSpan="3">A carregar stock...</td></tr>;

    return (
        <tr className="border-b">
            <td className="py-2 px-4">{variation.sku || 'N/A'}</td>
            <td className="py-2 px-4">
                <input 
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-24 p-1 border rounded"
                />
            </td>
            <td className="py-2 px-4">
                <button 
                    onClick={handleUpdateStock} 
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={loading}
                >
                    Atualizar Stock
                </button>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                {success && <p className="text-green-500 text-xs mt-1">{success}</p>}
            </td>
        </tr>
    );
};


const ProductEditPage = () => {
  const { ean } = useParams();
  const navigate = useNavigate();
  
  const [productData, setProductData] = useState({
    name: '',
    brand: '',
    shortdescription: '',
    longdescription: '',
    active: true,
  });
  const [originalProduct, setOriginalProduct] = useState(null);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');


  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        setFormError('');
        setFormSuccess('');

        const productResponse = await fetch(`/api/admin/products/${ean}`);
        if (!productResponse.ok) {
            if (productResponse.status === 404) throw new Error('Produto não encontrado.');
            throw new Error(`Falha ao buscar dados do produto: ${productResponse.status}`);
        }
        const fetchedProduct = await productResponse.json();
        
        setOriginalProduct(fetchedProduct);
        setProductData({
            name: fetchedProduct.name || '',
            brand: fetchedProduct.brand || '',
            shortdescription: fetchedProduct.shortdescription || '',
            longdescription: fetchedProduct.longdescription || '',
            active: fetchedProduct.active !== undefined ? fetchedProduct.active : true,
        });
        setVariations(fetchedProduct.variants || []);

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (ean) {
    fetchProductData();
    } else {
        setError("EAN do produto não fornecido.");
        setLoading(false);
    }
  }, [ean]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/products/${ean}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha ao atualizar o produto.');
      }
      
      const updatedProduct = await response.json();
      setOriginalProduct(updatedProduct);
      setProductData({
            name: updatedProduct.name || '',
            brand: updatedProduct.brand || '',
            shortdescription: updatedProduct.shortdescription || '',
            longdescription: updatedProduct.longdescription || '',
            active: updatedProduct.active !== undefined ? updatedProduct.active : true,
      });
      setFormSuccess('Produto atualizado com sucesso!');
      if (updatedProduct.variants) {
          setVariations(updatedProduct.variants);
      }

    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm(`Tem a certeza que quer ${originalProduct?.active ? 'desativar' : 'ativar'} este produto?`)) return;
    setFormError('');
    setFormSuccess('');
    setLoading(true);
    try {
        const targetStatus = !productData.active;
        const payload = { ...productData, active: targetStatus };

        const response = await fetch(`/api/admin/products/${ean}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `Falha ao ${targetStatus ? 'ativar' : 'desativar'} o produto.`);
        }
        const updatedProduct = await response.json();
        setOriginalProduct(updatedProduct);
        setProductData(prev => ({ ...prev, active: updatedProduct.active }));
        setFormSuccess(`Produto ${updatedProduct.active ? 'ativado' : 'desativado'} com sucesso!`);

    } catch (err) {
        setFormError(err.message);
    } finally {
        setLoading(false);
    }
  };


  if (loading && !originalProduct) {
    return <div className="p-8 text-center">A carregar dados do produto...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Erro: {error}</div>;
  }

  if (!originalProduct) {
    return <div className="p-8 text-center">Produto não encontrado ou EAN inválido.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <nav className="text-sm text-gray-600 mb-2">
          <Link to="/admin" className="hover:text-blue-600">Admin</Link>
          <span className="mx-2">›</span>
          <Link to="/admin/products" className="hover:text-blue-600">Produtos</Link>
          <span className="mx-2">›</span>
          <span>Editar</span>
        </nav>
        <h1 className="text-3xl font-bold">Editar Produto: {originalProduct.name} (EAN: {ean})</h1>
      </div>

      {formError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{formError}</div>}
      {formSuccess && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{formSuccess}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Informações Gerais</h2>
        
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
          <input type="text" name="name" id="name" value={productData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="mb-4">
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marca</label>
          <input type="text" name="brand" id="brand" value={productData.brand} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="mb-4">
          <label htmlFor="shortdescription" className="block text-sm font-medium text-gray-700">Descrição Curta</label>
          <textarea name="shortdescription" id="shortdescription" value={productData.shortdescription} onChange={handleChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
        </div>
        
        <div className="mb-4">
          <label htmlFor="longdescription" className="block text-sm font-medium text-gray-700">Descrição Longa</label>
          <textarea name="longdescription" id="longdescription" value={productData.longdescription} onChange={handleChange} rows="5" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="active" className="flex items-center">
            <input type="checkbox" name="active" id="active" checked={productData.active} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <span className="ml-2 text-sm text-gray-700">Produto Ativo</span>
          </label>
        </div>
        
        <p className="text-sm text-gray-600 mb-2"><strong>ID Interno (productid):</strong> {originalProduct.productid}</p>
        <p className="text-sm text-gray-600 mb-4"><strong>EAN:</strong> {originalProduct.ean}</p>


        <div className="flex items-center justify-between mt-6">
            <button 
                type="submit" 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                disabled={loading}
            >
              {loading ? 'A Guardar...' : 'Guardar Alterações'}
            </button>
            <button 
                type="button"
                onClick={handleDelete}
                className={`${productData.active ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50`}
                disabled={loading}
            >
              {loading ? 'Aguarde...' : (productData.active ? 'Desativar Produto' : 'Ativar Produto')}
            </button>
      </div>
      </form>
      
      {/* Secção de Gestão de Stock */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Gestão de Stock por Variação</h2>
        {variations && variations.length > 0 ? (
            <table className="min-w-full">
                <thead>
                    <tr className="border-b-2">
                        <th className="text-left py-2 px-4">SKU da Variação</th>
                        <th className="text-left py-2 px-4">Quantidade Atual</th>
                        <th className="text-left py-2 px-4">Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {variations.map(v => <StockManager key={v.variantid} productId={originalProduct.productid} variation={v} />)}
                </tbody>
            </table>
        ) : (
            <p>Este produto não tem variações registadas ou não foram carregadas.</p>
        )}
      </div>
    </div>
  );
};

export default ProductEditPage; 