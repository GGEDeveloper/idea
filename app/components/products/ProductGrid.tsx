'use client';

import React from 'react';
import ProductCard from './ProductCard';

interface Product {
  ean: string;
  name: string;
  shortdescription?: string;
  brand?: string;
  product_price?: number;
  price?: number;
  priceStatus?: string;
  images?: Array<{
    url: string;
    alt?: string;
    is_primary?: boolean;
  }>;
  image_url?: string;
}

interface ProductGridProps {
  products: Product[];
  isAuthenticated?: boolean;
  hasPermission?: (permission: string) => boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  isAuthenticated = false, 
  hasPermission = () => false 
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {products.map((product) => {
      const uniqueKey = product.ean || `product-${Math.random().toString(36).substr(2, 9)}`;
      return (
        <ProductCard
          key={uniqueKey}
          product={product}
          isAuthenticated={isAuthenticated}
          hasPermission={hasPermission}
        />
      );
    })}
  </div>
);

export default ProductGrid; 