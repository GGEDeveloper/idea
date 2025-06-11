// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getProductByEan } from '../services/productService';

import ProductImageGallery from '../components/products/ProductImageGallery';
import ProductInfo from '../components/products/ProductInfo';
import ProductTabs from '../components/products/ProductTabs';

import { ChevronLeftIcon } from '@heroicons/react/24/outline';

const ProductDetailPage = () => {
  const { ean } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductByEan(ean);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [ean]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">A carregar detalhes do produto...</div>;
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-700">{error || 'Produto não encontrado!'}</h1>
        <Link to="/produtos" className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
          Voltar para Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/produtos" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors group">
            <ChevronLeftIcon className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
            Voltar para todos os produtos
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="lg:flex">
            <ProductImageGallery images={product.images} />
            <ProductInfo product={product} addToCart={addToCart} />
          </div>
          <ProductTabs 
            description={product.longdescription || product.shortdescription}
            attributes={product.attributes}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
