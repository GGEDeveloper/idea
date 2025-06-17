import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  PencilIcon, 
  ArrowLeftIcon,
  TagIcon,
  CubeIcon,
  PhotoIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ProductViewPage = () => {
  const { ean } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/products/${ean}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data);
      } catch (e) {
        setError(e.message);
        console.error("Erro ao buscar produto:", e);
      } finally {
        setLoading(false);
      }
    };

    if (ean) {
      fetchProduct();
    }
  }, [ean]);

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-8 text-center">A carregar produto...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Erro: {error}</div>
        <button 
          onClick={() => navigate('/admin/products')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Voltar aos Produtos
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 mb-4">Produto não encontrado</div>
        <button 
          onClick={() => navigate('/admin/products')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Voltar aos Produtos
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header with breadcrumbs */}
      <div className="mb-6">
        <nav className="text-sm text-gray-600 mb-2">
          <Link to="/admin" className="hover:text-blue-600">Admin</Link>
          <span className="mx-2">›</span>
          <Link to="/admin/products" className="hover:text-blue-600">Produtos</Link>
          <span className="mx-2">›</span>
          <span>{product.name || product.ean}</span>
        </nav>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{product.name || 'Produto sem nome'}</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => navigate('/admin/products')}
              className="inline-flex items-center bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Voltar
            </button>
            <Link 
              to={`/admin/products/edit/${product.ean}`}
              className="inline-flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* Product Status Badge */}
      <div className="mb-6">
        {product.active ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <InformationCircleIcon className="h-4 w-4 mr-1" />
            Produto Ativo
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <InformationCircleIcon className="h-4 w-4 mr-1" />
            Produto Inativo
          </span>
        )}
        {product.is_featured && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 ml-2">
            <TagIcon className="h-4 w-4 mr-1" />
            Em Destaque
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">EAN</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{product.ean}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product ID</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{product.productid || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{product.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Marca</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{product.brand || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Descrições</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição Curta</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded min-h-[60px]">
                  {product.shortdescription || 'Nenhuma descrição curta disponível'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição Longa</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded min-h-[120px] whitespace-pre-wrap">
                  {product.longdescription || 'Nenhuma descrição longa disponível'}
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Categorias</h2>
            {product.categories && product.categories.length > 0 ? (
              <div className="space-y-2">
                {product.categories.map((category, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                    <TagIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-900">{category.name}</span>
                    {category.path && (
                      <span className="text-xs text-gray-500 ml-2">({category.path})</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma categoria atribuída</p>
            )}
          </div>

          {/* Product Variants */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CubeIcon className="h-5 w-5 mr-2" />
              Variantes e Stock
            </h2>
            {product.variants && product.variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variante</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço Base</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Promoção</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.variants.map((variant, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {variant.variant_name || variant.variantid}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {variant.stockquantity || 0}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(variant.base_selling_price)}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {variant.is_on_sale ? (
                            <span className="text-green-600">
                              {formatCurrency(variant.promotional_price)}
                            </span>
                          ) : (
                            <span className="text-gray-500">Não</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma variante disponível</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <PhotoIcon className="h-5 w-5 mr-2" />
              Imagens
            </h2>
            {product.images && product.images.length > 0 ? (
              <div className="space-y-3">
                {product.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image.url} 
                      alt={image.alt || product.name}
                      className="w-full h-32 object-cover rounded border"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                    {image.is_primary && (
                      <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma imagem disponível</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Metadados</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Criado em</label>
                <p className="text-sm text-gray-900">{formatDate(product.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Atualizado em</label>
                <p className="text-sm text-gray-900">{formatDate(product.updated_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preço Principal</label>
                <p className="text-sm text-gray-900">{formatCurrency(product.price)}</p>
              </div>
            </div>
          </div>

          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Atributos</h2>
              <div className="space-y-2">
                {product.attributes.map((attr, index) => (
                  <div key={index} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium text-gray-700">{attr.key}</span>
                    <span className="text-sm text-gray-900">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductViewPage; 