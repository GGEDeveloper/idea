import React, { useState, useEffect } from 'react';

const ProductImageGallery = ({ images = [] }) => {
  // Find the main image or default to the first one
  const initialImage = images.find(img => img.is_main) || (images.length > 0 ? images[0] : null);
  const [mainImage, setMainImage] = useState(initialImage);

  // Update the main image if the product (and its images) changes
  useEffect(() => {
    const newInitialImage = images.find(img => img.is_main) || (images.length > 0 ? images[0] : null);
    setMainImage(newInitialImage);
  }, [images]);

  // Handle case with no images
  if (!images || images.length === 0) {
    return (
      <div className="lg:w-1/2 flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center bg-gray-200 rounded-lg">
          <img
            src="/placeholder.png"
            alt="Produto sem imagem"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:w-1/2 flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Main Image Display */}
      <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center mb-4">
        <img
          src={mainImage?.url || '/placeholder.png'}
          alt="Imagem principal do produto"
          className="w-full h-full object-contain rounded-lg transition-opacity duration-300"
          onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {images.map((img, idx) => (
            <button
              key={img.url + idx}
              onClick={() => setMainImage(img)}
              className={`w-16 h-16 p-1 rounded border-2 transition-colors ${mainImage?.url === img.url ? 'border-indigo-500' : 'border-transparent hover:border-gray-300'}`}
            >
              <img
                src={img.url || '/placeholder.png'}
                alt={`Miniatura ${idx + 1}`}
                className="w-full h-full object-contain bg-white rounded-sm"
                onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
