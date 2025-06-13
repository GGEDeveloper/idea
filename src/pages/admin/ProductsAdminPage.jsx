import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductsAdminPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // NOTA: Para o admin, queremos a lista completa, sem filtros complexos por agora.
        const response = await fetch('/api/products'); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('[Admin Page] Dados recebidos da API:', data); // LOG PARA DEBUG
        setProducts(data.products || []); // A API de listagem retorna um objeto { products: [...] }
      } catch (e) {
        setError(e.message);
        console.error("Erro ao buscar produtos para a área de admin:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">A carregar produtos...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Erro: {error}</div>;
  }

  console.log('[Admin Page] A renderizar tabela com estes produtos no estado:', products);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestão de Produtos</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Nome</th>
              <th className="py-2 px-4 border-b">EAN</th>
              <th className="py-2 px-4 border-b">Marca</th>
              <th className="py-2 px-4 border-b">Categoria</th>
              <th className="py-2 px-4 border-b">Stock Total</th>
              <th className="py-2 px-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="py-2 px-4 border-b">{product.id}</td>
                <td className="py-2 px-4 border-b">{product.name || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{product.ean || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{product.brand || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{product.category || 'N/A'}</td>
                <td className="py-2 px-4 border-b text-center">{product.total_stock ?? 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  <Link to={`/admin/products/edit/${product.id}`} className="text-blue-500 hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsAdminPage; 