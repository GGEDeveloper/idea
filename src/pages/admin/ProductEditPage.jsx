import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

// Um componente reutilizável para a gestão de stock de uma variação
const StockManager = ({ productId, variation }) => {
    const [stock, setStock] = useState(null);
    const [newStock, setNewStock] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const variantStockId = variation.geko_variant_stock_id;

    const fetchStock = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            const response = await fetch(`/api/products/${productId}/variations/${variantStockId}/stock`);
            if (!response.ok) throw new Error('Falha ao buscar stock');
            const data = await response.json();
            setStock(data);
            setNewStock(data.quantity);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [productId, variantStockId]);

    useEffect(() => {
        fetchStock();
    }, [fetchStock]);

    const handleUpdateStock = async () => {
        try {
            setError('');
            setSuccess('');
            const response = await fetch(`/api/products/${productId}/variations/${variantStockId}/stock`, {
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
            setSuccess('Stock atualizado com sucesso!');
        } catch (e) {
            setError(e.message);
        }
    };
    
    if (loading) return <tr><td colSpan="3">A carregar stock...</td></tr>;

    return (
        <tr className="border-b">
            <td className="py-2 px-4">{variation.sku}</td>
            <td className="py-2 px-4">
                <input 
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-24 p-1 border rounded"
                />
            </td>
            <td className="py-2 px-4">
                <button onClick={handleUpdateStock} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                    Atualizar
                </button>
                {error && <p className="text-red-500 text-xs ml-2">{error}</p>}
                {success && <p className="text-green-500 text-xs ml-2">{success}</p>}
            </td>
        </tr>
    );
};


const ProductEditPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Buscar dados do produto principal
        const productResponse = await fetch(`/api/products/${id}`);
        if (!productResponse.ok) throw new Error('Produto não encontrado');
        const productData = await productResponse.json();
        setProduct(productData);

        // Buscar as variações do produto
        const variationsResponse = await fetch(`/api/products/${id}/variations`);
        if (!variationsResponse.ok) throw new Error('Falha ao buscar variações');
        const variationsData = await variationsResponse.json();
        setVariations(variationsData);

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">A carregar dados do produto...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Erro: {error}</div>;
  }

  if (!product) {
    return <div className="p-8 text-center">Produto não encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Editar Produto: {product.name}</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Informações Gerais</h2>
          <p><strong>ID:</strong> {product.productid}</p>
          <p><strong>SKU:</strong> {product.sku}</p>
          <p><strong>EAN:</strong> {product.ean}</p>
      </div>
      
      {/* Secção de Gestão de Stock */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Gestão de Stock por Variação</h2>
        {variations.length > 0 ? (
            <table className="min-w-full">
                <thead>
                    <tr className="border-b-2">
                        <th className="text-left py-2 px-4">SKU da Variação</th>
                        <th className="text-left py-2 px-4">Quantidade</th>
                        <th className="text-left py-2 px-4">Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {variations.map(v => <StockManager key={v.geko_variant_stock_id} productId={id} variation={v} />)}
                </tbody>
            </table>
        ) : (
            <p>Este produto não tem variações registadas.</p>
        )}
      </div>
    </div>
  );
};

export default ProductEditPage; 