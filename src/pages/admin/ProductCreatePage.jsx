import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const [productData, setProductData] = useState({
    ean: '',
    productid: '', // This is the database productid, seems to be required by createProduct query
    name: '',
    brand: '',
    shortdescription: '',
    longdescription: '',
    price: '', // Assuming this is for the 'Base Price'
    active: true,
    // Add other fields like categories, images, initial variations later if needed
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

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

    // Basic validation
    if (!productData.ean || !productData.productid || !productData.name) {
      setFormError('EAN, ID do Produto (productid) e Nome são obrigatórios.');
      setLoading(false);
      return;
    }
    
    const payload = {
        ...productData,
        price: productData.price !== '' ? parseFloat(String(productData.price).replace(',', '.')) : undefined,
    };
    // Remove price from payload if it's undefined to avoid issues with the backend if it expects a number or nothing
    if (payload.price === undefined) {
        delete payload.price;
    }


    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha ao criar o produto.');
      }
      
      const newProduct = await response.json();
      setFormSuccess(`Produto "${newProduct.name}" criado com sucesso! Redirecionando...`);
      
      // Optionally reset form or navigate
      setTimeout(() => {
        navigate('/admin/products'); // Navigate to products list
        // Or navigate to edit page: navigate(`/admin/products/edit/${newProduct.ean}`);
      }, 2000);

    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Criar Novo Produto</h1>

      {formError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{formError}</div>}
      {formSuccess && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{formSuccess}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna 1 */}
          <div>
            <div className="mb-4">
              <label htmlFor="ean" className="block text-sm font-medium text-gray-700">EAN*</label>
              <input type="text" name="ean" id="ean" value={productData.ean} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div className="mb-4">
              <label htmlFor="productid" className="block text-sm font-medium text-gray-700">ID do Produto (productid)*</label>
              <input type="text" name="productid" id="productid" value={productData.productid} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              <p className="text-xs text-gray-500 mt-1">ID interno/legacy. Deve ser único.</p>
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Produto*</label>
              <input type="text" name="name" id="name" value={productData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div className="mb-4">
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marca</label>
              <input type="text" name="brand" id="brand" value={productData.brand} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            
            <div className="mb-4">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço Base (ex: 19.99)</label>
              <input 
                type="number" 
                name="price" 
                id="price" 
                value={productData.price} 
                onChange={handleChange} 
                step="0.01"
                placeholder="Ex: 19.99"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
              />
            </div>

          </div>

          {/* Coluna 2 */}
          <div>
            <div className="mb-4">
              <label htmlFor="shortdescription" className="block text-sm font-medium text-gray-700">Descrição Curta</label>
              <textarea name="shortdescription" id="shortdescription" value={productData.shortdescription} onChange={handleChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
            </div>
            
            <div className="mb-4">
              <label htmlFor="longdescription" className="block text-sm font-medium text-gray-700">Descrição Longa</label>
              <textarea name="longdescription" id="longdescription" value={productData.longdescription} onChange={handleChange} rows="7" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="active" className="flex items-center">
                <input type="checkbox" name="active" id="active" checked={productData.active} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <span className="ml-2 text-sm text-gray-700">Produto Ativo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button 
            type="submit" 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'A Criar Produto...' : 'Criar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductCreatePage; 