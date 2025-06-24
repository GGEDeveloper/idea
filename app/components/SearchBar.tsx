'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface SearchResult {
  ean: string;
  name: string;
  shortdescription?: string;
  brand?: string;
  image_url?: string;
  price?: number;
}

interface SearchBarProps {
  onResultSelect?: (item: SearchResult) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onResultSelect, className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/produtos?search=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  // Debounced search function
  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`Erro ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setShowDropdown(Array.isArray(data) && data.length > 0);
    } catch (err) {
      console.error('Search error:', err);
      setError('Não foi possível realizar a pesquisa. Tente novamente mais tarde.');
      setResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleSelect = (item: SearchResult) => {
    setQuery(item.name);
    setShowDropdown(false);
    if (onResultSelect) onResultSelect(item);
    // Navigate to product page
    router.push(`/produtos/${item.ean}`);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setError(null);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <button 
            type="submit" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="Pesquisar"
          >
            <MagnifyingGlassIcon 
              className="h-4 w-4" 
              aria-hidden="true"
            />
          </button>
          <input
            ref={inputRef}
            type="search"
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
            placeholder="Pesquisar produtos..."
            value={query}
            onChange={handleInput}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowDropdown(false);
              } else if (e.key === 'Enter' && !showDropdown) {
                handleSubmit(e);
              }
            }}
            aria-label="Pesquisar produtos"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-controls="search-results"
            autoComplete="off"
          />
          {loading && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2" role="status" aria-live="polite">
              <ArrowPathIcon 
                className="h-4 w-4 text-gray-400 animate-spin" 
                aria-hidden="true"
              />
              <span className="sr-only">Pesquisando...</span>
            </div>
          )}
          {query && !loading && (
            <button 
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label="Limpar pesquisa"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {error && (
          <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm dark:bg-red-900 dark:border-red-800 dark:text-red-200" role="alert">
            {error}
          </div>
        )}
      </form>
      
      {showDropdown && (
        <div 
          id="search-results"
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-96 overflow-y-auto z-50" 
          ref={dropdownRef}
          role="region"
          aria-live="polite"
          aria-label="Resultados da pesquisa"
        >
          {results.length > 0 ? (
            <ul role="listbox" aria-label="Produtos encontrados">
              {results.map((item) => (
                <li 
                  key={item.ean} 
                  onClick={() => handleSelect(item)}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  role="option"
                  aria-selected="false"
                >
                  <div className="flex items-center space-x-3">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </div>
                      {item.brand && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.brand}
                        </div>
                      )}
                      {item.shortdescription && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {item.shortdescription.length > 60 
                            ? `${item.shortdescription.substring(0, 60)}...` 
                            : item.shortdescription}
                        </div>
                      )}
                      {item.price && (
                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          €{Number(item.price).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 && !loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400" role="status">
              <p>Nenhum resultado encontrado para "{query}".</p>
              <p className="text-sm mt-1">Tente termos diferentes ou verifique a ortografia.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 