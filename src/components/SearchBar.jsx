// src/components/SearchBar.jsx
import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onResultSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);

  const handleInput = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);
    if (value.length >= 2) {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        if (!res.ok) throw new Error('Erro na pesquisa');
        const data = await res.json();
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        setError('Erro ao pesquisar');
        setResults([]);
      }
      setLoading(false);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (item) => {
    setQuery(item.name);
    setShowDropdown(false);
    if (onResultSelect) onResultSelect(item);
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-input"
        placeholder="Pesquisar produtos..."
        value={query}
        onChange={handleInput}
        onFocus={() => query.length >= 2 && setShowDropdown(true)}
      />
      {loading && <div className="search-loading">A pesquisar...</div>}
      {showDropdown && results.length > 0 && (
        <ul className="search-dropdown">
          {results.map((item) => (
            <li key={item.id_products} onClick={() => handleSelect(item)}>
              <span className="search-result-name">{item.name}</span>
              {item.price && <span className="search-result-price">€{item.price}</span>}
            </li>
          ))}
        </ul>
      )}
      {showDropdown && !loading && results.length === 0 && (
        <div className="search-no-results">Nenhum resultado encontrado</div>
      )}
      {error && <div className="search-error">{error}</div>}
    </div>
  );
}

export default SearchBar;
