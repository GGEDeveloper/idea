import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ProductImageGallery = ({ images = [] }) => {
  // Find the main image or default to the first one
  const initialImage = images.find(img => img.is_primary) || (images.length > 0 ? images[0] : null);
  const [mainImage, setMainImage] = useState(initialImage);
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update the main image if the product (and its images) changes
  useEffect(() => {
    const newInitialImage = images.find(img => img.is_primary) || (images.length > 0 ? images[0] : null);
    setMainImage(newInitialImage);
    setCurrentIndex(0);
  }, [images]);

  const handleImageSelect = (img, index) => {
    setMainImage(img);
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    if (images.length > 1) {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      setMainImage(images[newIndex]);
      setCurrentIndex(newIndex);
    }
  };

  const handleNext = () => {
    if (images.length > 1) {
      const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      setMainImage(images[newIndex]);
      setCurrentIndex(newIndex);
    }
  };

  // Handle case with no images
  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6 md:p-8 h-full min-h-[500px]">
        <div className="w-full max-w-lg h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center bg-white rounded-2xl shadow-inner border-4 border-dashed border-gray-300">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Sem imagem disponível</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 h-full">
      {/* Main Image Display */}
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] mb-6 group">
        <div className="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden relative">
        <img
            src={mainImage?.url || '/placeholder-product.jpg'}
          alt="Imagem principal do produto"
            className={`w-full h-full object-contain transition-all duration-500 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in hover:scale-105'
            }`}
            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-product.jpg'; }}
            onClick={() => setIsZoomed(!isZoomed)}
          />
          
          {/* Zoom indicator */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </div>

          {/* Navigation arrows for multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-3 max-w-md">
          {images.map((img, idx) => (
            <button
              key={img.url + idx}
                onClick={() => handleImageSelect(img, idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all duration-200 ${
                  mainImage?.url === img.url 
                    ? 'ring-4 ring-indigo-500 ring-offset-2 shadow-lg scale-110' 
                    : 'ring-2 ring-gray-200 hover:ring-indigo-300 hover:scale-105 shadow-md'
                }`}
            >
              <img
                  src={img.url || '/placeholder-product.jpg'}
                alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-contain bg-white"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-product.jpg'; }}
              />
                {mainImage?.url === img.url && (
                  <div className="absolute inset-0 bg-indigo-500 bg-opacity-20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
            </button>
          ))}
          </div>
        </div>
      )}

      {/* Image info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Clique na imagem para ampliar
        </p>
        {images.length > 1 && (
          <p className="text-xs text-gray-500 mt-1">
            Use as setas ou clique nas miniaturas para navegar
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
