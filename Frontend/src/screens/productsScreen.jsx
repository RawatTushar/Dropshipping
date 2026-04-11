import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import CartFloating from '../components/cart/CartFloating';
import ProductCard from '../components/products/ProductCard';
import { fetchProducts } from '../features/products/productsSlice';
import { rankProductForQuery } from '../utils/catalogSearch';
import '../productsScreen.css';

const DEBOUNCE_MS = 110;

const ProductsScreen = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const blurTimeout = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const normalizedSearch = debouncedQuery.toLowerCase();

  const rankedMatches = useMemo(() => {
    if (!normalizedSearch) return [];
    const scored = [];
    for (const p of items) {
      const score = rankProductForQuery(p, normalizedSearch);
      if (score != null) scored.push({ product: p, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [items, normalizedSearch]);

  const suggestions = useMemo(() => {
    return rankedMatches.slice(0, 8).map((x) => x.product);
  }, [rankedMatches]);

  const filteredItems = useMemo(() => {
    if (!normalizedSearch) return items;
    return rankedMatches.map((x) => x.product);
  }, [items, normalizedSearch, rankedMatches]);

  const clearBlurTimeout = useCallback(() => {
    if (blurTimeout.current) {
      window.clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
  }, []);

  const scheduleCloseSuggestions = useCallback(() => {
    clearBlurTimeout();
    blurTimeout.current = window.setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }, 160);
  }, [clearBlurTimeout]);

  const applySuggestionProduct = useCallback((product) => {
    setQuery(product.name);
    setDebouncedQuery(product.name.trim());
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    inputRef.current?.focus();
  }, []);

  const onInputKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      applySuggestionProduct(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  useEffect(() => {
    if (activeSuggestion >= suggestions.length) {
      setActiveSuggestion(suggestions.length ? suggestions.length - 1 : -1);
    }
  }, [activeSuggestion, suggestions.length]);

  const highlightMatch = (text, q) => {
    const full = String(text || '');
    const needle = q.trim();
    if (!needle) return full;
    const lower = full.toLowerCase();
    const idx = lower.indexOf(needle.toLowerCase());
    if (idx < 0) return full;
    return (
      <>
        {full.slice(0, idx)}
        <mark className="catalog-suggestion-mark">{full.slice(idx, idx + needle.length)}</mark>
        {full.slice(idx + needle.length)}
      </>
    );
  };

  return (
    <DashboardLayout
      title="Products"
      subtitle="Live catalog from your database"
    >
      <div className="catalog-wrap">
        <div className="catalog-search">
          <input
            ref={inputRef}
            type="search"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setActiveSuggestion(-1);
            }}
            onFocus={() => {
              clearBlurTimeout();
              setShowSuggestions(true);
            }}
            onBlur={scheduleCloseSuggestions}
            onKeyDown={onInputKeyDown}
            placeholder="Search name, brand, category…"
            aria-autocomplete="list"
            aria-expanded={showSuggestions && suggestions.length > 0}
            aria-controls="catalog-suggestion-list"
          />
          {query ? (
            <button
              type="button"
              className="catalog-search-clear"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQuery('');
                setDebouncedQuery('');
                setActiveSuggestion(-1);
                inputRef.current?.focus();
              }}
            >
              Clear
            </button>
          ) : null}
          {showSuggestions && suggestions.length > 0 ? (
            <div
              id="catalog-suggestion-list"
              className="catalog-suggestions"
              role="listbox"
            >
              {suggestions.map((s, idx) => (
                <button
                  key={s._id}
                  type="button"
                  role="option"
                  aria-selected={idx === activeSuggestion}
                  className={`catalog-suggestion-item${idx === activeSuggestion ? ' catalog-suggestion-item--active' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActiveSuggestion(idx)}
                  onClick={() => applySuggestionProduct(s)}
                >
                  <span className="catalog-suggestion-title">
                    {highlightMatch(s.name, query)}
                  </span>
                  <span className="catalog-suggestion-meta">
                    {[s.category, s.brand].filter(Boolean).join(' · ')}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {loading ? <p>Loading products...</p> : null}
        {error ? <p className="catalog-error">{error}</p> : null}

        {!loading && !error && filteredItems.length === 0 ? (
          <p>No products match your search.</p>
        ) : null}

        <div className="catalog-grid">
          {filteredItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
      <CartFloating />
    </DashboardLayout>
  );
};

export default ProductsScreen;
