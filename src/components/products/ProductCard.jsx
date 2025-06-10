import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';

const ProductCard = ({ product }) => {
  // Formatar preço
  const productPrice = product.price_gross 
    ? new Intl.NumberFormat('pt-PT', { 
        style: 'currency', 
        currency: 'EUR' 
      }).format(product.price_gross)
    : 'Preço indisponível';

  // Obter URL da imagem principal
  const mainImage = Array.isArray(product.images) 
    ? product.images.find(img => img.is_main)?.url || 
      (product.images[0]?.url || '/placeholder-product.jpg')
    : (product.image_url || '/placeholder-product.jpg');

  return (
    <Link 
      to={`/produto/${product.id_products || product.id}`} 
      className="group block overflow-hidden rounded-lg border border-border-base bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={mainImage}
          alt={product.name || 'Produto sem nome'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-text-base line-clamp-2 h-14">
          {product.name || 'Produto sem nome'}
        </h3>
        <div className="mt-2 flex items-center">
          <div className="flex">
            {[0, 1, 2, 3, 4].map((rating) => (
              <StarIcon
                key={rating}
                className={`h-5 w-5 ${
                  rating < 4 ? 'text-yellow-400' : 'text-gray-200'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="text-xs text-text-muted ml-2">(24)</p>
        </div>
        <p className="mt-2 text-lg font-medium text-text-base">
          {productPrice}
        </p>
        {product.ean && (
          <p className="mt-1 text-xs text-text-muted">
            Ref: {product.ean}
          </p>
        )}
        <div className="mt-4">
          <button 
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
