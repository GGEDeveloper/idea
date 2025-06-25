'use client';

import { useState, useEffect } from 'react';

type ViewMode = 'grid' | 'list';
type ProductsPerPage = 10 | 20 | 50 | 100;

interface ProductViewPreferences {
  viewMode: ViewMode;
  productsPerPage: ProductsPerPage;
}

interface UseProductViewPreferencesReturn {
  viewMode: ViewMode;
  productsPerPage: ProductsPerPage;
  isLoaded: boolean;
  setViewMode: (mode: ViewMode) => void;
  setProductsPerPage: (count: ProductsPerPage) => void;
}

const DEFAULT_PREFERENCES: ProductViewPreferences = {
  viewMode: 'grid',
  productsPerPage: 20,
};

const STORAGE_KEY = 'productViewPreferences';

export const useProductViewPreferences = (): UseProductViewPreferencesReturn => {
  const [preferences, setPreferences] = useState<ProductViewPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as ProductViewPreferences;
          
          // Validate parsed data
          const validViewMode = ['grid', 'list'].includes(parsed.viewMode) ? parsed.viewMode : DEFAULT_PREFERENCES.viewMode;
          const validProductsPerPage = [10, 20, 50, 100].includes(parsed.productsPerPage) ? parsed.productsPerPage : DEFAULT_PREFERENCES.productsPerPage;
          
          setPreferences({
            viewMode: validViewMode,
            productsPerPage: validProductsPerPage,
          });
        }
      } catch (error) {
        console.warn('Error loading product view preferences:', error);
        // Use defaults if parsing fails
        setPreferences(DEFAULT_PREFERENCES);
      }
      
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.warn('Error saving product view preferences:', error);
      }
    }
  }, [preferences, isLoaded]);

  const setViewMode = (mode: ViewMode) => {
    setPreferences(prev => ({
      ...prev,
      viewMode: mode,
    }));
  };

  const setProductsPerPage = (count: ProductsPerPage) => {
    setPreferences(prev => ({
      ...prev,
      productsPerPage: count,
    }));
  };

  return {
    viewMode: preferences.viewMode,
    productsPerPage: preferences.productsPerPage,
    isLoaded,
    setViewMode,
    setProductsPerPage,
  };
}; 