// src/components/SearchBar.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './SearchBar.css';

function SearchBar({ onResultSelect, className = '' }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const handleInput = (e) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to products page with search query
      navigate(`/produtos?search=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  // Debounced search effect
  const performSearch = useCallback(async (searchTerm) => {
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
            }
          });
        } catch (jsonError) {
          throw new Error(`Erro ${res.status}: ${res.statusText}`, {
            cause: { code: 'NETWORK_ERROR' }
          });
        }
      }
      
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setShowDropdown(Array.isArray(data) && data.length > 0);
    } catch (err) {
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
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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



  const handleSelect = (item) => {
    setQuery(item.name);
    setShowDropdown(false);
    if (onResultSelect) onResultSelect(item);
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
            aria-label={t('search.submit')}
          >
            <FontAwesomeIcon 
              icon={faSearch} 
              className="search-icon" 
              aria-hidden="true"
            />
          </button>
          <input
            ref={inputRef}
            type="search"
            className="search-input"
            placeholder={t('search.placeholder')}
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
            aria-label={t('search.placeholder')}
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-controls="search-results"
            autoComplete="off"
          />
          {loading && (
            <div className="search-loading" role="status" aria-live="polite">
              <FontAwesomeIcon 
                icon={faSpinner} 
                className="search-loading-icon" 
                spin 
                aria-hidden="true"
              />
              <span className="sr-only">{t('search.searching')}</span>
            </div>
          )}
          {query && !loading && (
            <button 
              type="button"
              onClick={clearSearch}
              className="clear-search"
              aria-label={t('search.clearSearch')}
            >
              <FontAwesomeIcon icon={faTimes} />
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
          aria-label={t('search.results')}
        >
          {results.length > 0 ? (
            <ul role="listbox" aria-label={t('search.foundItems')}>
              {results.map((item) => (
                <li 
                  key={item.id_products} 
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
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="search-result-details">
                    <div className="search-result-name">{item.name}</div>
                    {item.price && (
                      <div className="search-result-price">
                        {parseFloat(item.price).toFixed(2)} €
                      </div>
                    )}
                    {item.short_desc && (
                      <div className="search-result-desc">
                        {item.short_desc.length > 60 
                          ? `${item.short_desc.substring(0, 60)}...` 
                          : item.short_desc}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 && !loading ? (
            <div className="search-no-results" role="status">
              <p>{t('search.noResults')} "{query}". {t('search.suggestions')}</p>

            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
