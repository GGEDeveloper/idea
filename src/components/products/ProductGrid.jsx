// src/components/products/ProductGrid.jsx
import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, isAuthenticated, hasPermission, onLog }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {products.map((product) => {
      const uniqueKey = product.id_products || product.id || `product-${Math.random().toString(36).substr(2, 9)}`;
      return (
        <ProductCard
          key={uniqueKey}
          product={product}
          isAuthenticated={isAuthenticated}
          hasPermission={hasPermission}
          onLog={onLog}
        />
      );
    })}
  </div>
);

export default ProductGrid;
