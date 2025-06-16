import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductsAdminPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // TODO: Add search, filter, and sort state here

  useEffect(() => {
    const fetchProducts = async (page = 1) => { // Added page parameter
      try {
        setLoading(true);
        // Using the new admin endpoint
        // TODO: Add query params for search, filters, sort, and pagination (limit)
        const response = await fetch(`/api/admin/products?page=${page}&limit=20&sortBy=name&order=asc`); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('[Admin Page] Dados recebidos da API admin:', data); 
        setProducts(data.products || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || 0);
      } catch (e) {
        setError(e.message);
        console.error("Erro ao buscar produtos para a área de admin:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts(currentPage);
  }, [currentPage]); // Refetch when currentPage changes

  // TODO: Implement functions to handle page changes (next, previous, specific page)
  // const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  // const handlePreviousPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  if (loading) {
    return <div className="p-8 text-center">A carregar produtos...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Erro: {error}</div>;
  }

  // console.log('[Admin Page] A renderizar tabela com estes produtos no estado:', products);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestão de Produtos ({totalProducts})</h1>
        <Link 
          to="/admin/products/create" 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Criar Novo Produto
        </Link>
      </div>
      {/* TODO: Add search, filter, and sort controls here */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              {/* Removed product.id column, EAN is primary identifier here */}
              <th className="py-2 px-4 border-b">Nome</th>
              <th className="py-2 px-4 border-b">EAN</th>
              <th className="py-2 px-4 border-b">Marca</th>
              <th className="py-2 px-4 border-b">Categorias</th> {/* Changed from Categoria */}
              <th className="py-2 px-4 border-b">Stock Total</th>
              <th className="py-2 px-4 border-b">Ativo?</th> {/* Added Active status column */}
              <th className="py-2 px-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
              // Using EAN as key, assuming it's unique and present
              <tr key={product.ean}> 
                <td className="py-2 px-4 border-b">{product.name || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{product.ean || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{product.brand || 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  {product.categories && product.categories.length > 0 
                    ? product.categories.map(cat => cat.name).join(', ') 
                    : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b text-center">{product.total_stock ?? 'N/A'}</td>
                <td className="py-2 px-4 border-b text-center"> {/* Active status cell */}
                  {product.active ? (
                    <span className="text-green-500">Sim</span>
                  ) : (
                    <span className="text-red-500">Não</span>
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {/* Link to edit page using EAN */}
                  <Link to={`/admin/products/edit/${product.ean}`} className="text-blue-500 hover:underline">
                    Editar
                  </Link>
                  {/* TODO: Add Deactivate/Activate button later */}
                </td>
              </tr>
            ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 px-4 border-b text-center">Nenhum produto encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* TODO: Add Pagination controls here */}
      <div className="mt-4 flex justify-between items-center">
        <span>Página {currentPage} de {totalPages}</span>
        <div>
          {/* <button onClick={handlePreviousPage} disabled={currentPage <= 1} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l disabled:opacity-50">Anterior</button> */}
          {/* <button onClick={handleNextPage} disabled={currentPage >= totalPages} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r disabled:opacity-50">Próxima</button> */}
          <span>(Placeholder para controlos de paginação)</span>
        </div>
      </div>
    </div>
  );
};

export default ProductsAdminPage; 