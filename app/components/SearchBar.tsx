'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import '../styles/SearchBar.css';

interface SearchBarProps {
  onResultSelect?: (item: any) => void;
  className?: string;
}

interface SearchResult {
  ean: string;
  name: string;
  price?: number;
  shortdescription?: string;
  image_url?: string;
}

function SearchBar({ onResultSelect, className = '' }: SearchBarProps) {
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
      // Navigate to products page with search query
      router.push(`/produtos?search=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  // Debounced search effect
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
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        try {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Erro ao realizar a pesquisa', {
            cause: {
              code: errorData.code || 'UNKNOWN_ERROR',
              details: errorData.details
            } as any
          });
        } catch (jsonError) {
          throw new Error(`Erro ${res.status}: ${res.statusText}`, {
            cause: { code: 'NETWORK_ERROR' } as any
          });
        }
      }
      
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setShowDropdown(Array.isArray(data) && data.length > 0);
    } catch (err: any) {
      console.error('Search error:', {
        message: err.message,
        code: err.cause?.code || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      });
      
      setError(
        err.cause?.code === 'NETWORK_ERROR'
          ? 'Erro de conexão. Verifique sua internet e tente novamente.'
          : 'Não foi possível realizar a pesquisa. Tente novamente mais tarde.'
      );
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
    // Navigate to product detail page
    router.push(`/produtos/${item.ean}`);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setError(null);
  };

  return (
    <div className={`search-bar-container ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="search-input-container">
          <button 
            type="submit" 
            className="search-submit"
            aria-label="Pesquisar"
          >
            <MagnifyingGlassIcon 
              className="h-4 w-4 text-gray-400" 
              aria-hidden="true"
            />
          </button>
          <input
            ref={inputRef}
            type="search"
            className="search-input"
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
            <div className="search-loading" role="status" aria-live="polite">
              <ArrowPathIcon 
                className="h-4 w-4 text-gray-400 animate-spin" 
                aria-hidden="true"
              />
              <span className="sr-only">A pesquisar...</span>
            </div>
          )}
          {query && !loading && (
            <button 
              type="button"
              onClick={clearSearch}
              className="clear-search"
              aria-label="Limpar pesquisa"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {error && (
          <div className="search-error" role="alert">
            {error}
          </div>
        )}
      </form>
      
      {showDropdown && (
        <div 
          id="search-results"
          className="search-dropdown" 
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
                  role="option"
                  aria-selected="false"
                >
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="search-result-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="search-result-details">
                    <div className="search-result-name">{item.name}</div>
                    {item.price && (
                      <div className="search-result-price">
                        {parseFloat(item.price.toString()).toFixed(2)} €
                      </div>
                    )}
                    {item.shortdescription && (
                      <div className="search-result-desc">
                        {item.shortdescription.length > 60 
                          ? `${item.shortdescription.substring(0, 60)}...` 
                          : item.shortdescription}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 && !loading ? (
            <div className="search-no-results" role="status">
              <p>Nenhum resultado encontrado para "{query}". Tente outras palavras-chave.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default SearchBar; 