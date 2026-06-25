import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../../components/DashboardLayout';
import CartFloating from '../../../components/cart/CartFloating';
import ProductCard from '../../../components/products/ProductCard';
import { fetchProducts } from '../productsSlice';
import { rankProductForQuery } from '../../../utils/catalogSearch';
import {
  buildCatalogList,
  QUICK_FILTERS,
  SORT_OPTIONS,
  uniqueCategories,
} from '../../../utils/catalogDisplay';
import '../../../productsScreen.css';

const PRODUCTS_PAGE_SIZE = 12;

const ProductsScreen = () => {
  const dispatch = useDispatch();
  const { items, categories: serverCategories, loading, error, pagination } = useSelector((state) => state.products);
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [sort, setSort] = useState('featured');
  const [category, setCategory] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [quick, setQuick] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const blurTimeout = useRef(null);
  const inputRef = useRef(null);

  const deferredQuery = useDeferredValue(query);
  const normalizedSearch = deferredQuery.trim().toLowerCase();

  useEffect(() => {
    dispatch(
      fetchProducts({
        page: 1,
        limit: 100,
        search: normalizedSearch,
        category: category === 'all' ? '' : category,
        minRating,
        quick,
        sort,
      }),
    );
  }, [dispatch, normalizedSearch, category, minRating, quick, sort]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        dispatch(
          fetchProducts({
            page: 1,
            limit: 100,
            search: normalizedSearch,
            category: category === 'all' ? '' : category,
            minRating,
            quick,
            sort,
          }),
        );
      }
    };
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, [dispatch, normalizedSearch, category, minRating, quick, sort]);

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

  const categories = useMemo(
    () => (serverCategories?.length ? serverCategories : uniqueCategories(items)),
    [items, serverCategories],
  );

  const displayItems = useMemo(
    () =>
      buildCatalogList(filteredItems, {
        category,
        minRating,
        quick,
        sort,
      }),
    [filteredItems, category, minRating, quick, sort],
  );
  const totalPages = Math.max(1, Math.ceil(displayItems.length / PRODUCTS_PAGE_SIZE));
  const totalItems = displayItems.length;
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PAGE_SIZE;
    return displayItems.slice(start, start + PRODUCTS_PAGE_SIZE);
  }, [displayItems, currentPage]);

  const toggleQuick = (id) => {
    setQuick((q) => (q === id ? null : id));
    setCurrentPage(1);
  };

  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) + (minRating > 0 ? 1 : 0) + (quick ? 1 : 0);

  const closeFiltersModal = useCallback(() => {
    setFiltersOpen(false);
  }, []);

  const openFiltersModal = useCallback(() => {
    setFiltersOpen(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (!filtersOpen) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') closeFiltersModal();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [filtersOpen, closeFiltersModal]);

  const resetFilters = () => {
    setCategory('all');
    setMinRating(0);
    setQuick(null);
    setCurrentPage(1);
  };

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
    setCurrentPage(1);
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
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const paginationItems = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) pages.push('...');
    for (let p = start; p <= end; p += 1) pages.push(p);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

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

  const filterModal =
    filtersOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            className={`catalog-filters-modal${filtersOpen ? ' catalog-filters-modal--open' : ''}`}
            role="presentation"
          >
            <button
              type="button"
              className="catalog-filters-modal__scrim"
              aria-label="Close filters"
              onClick={closeFiltersModal}
            />
            <div
              className="catalog-filters-modal__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="catalog-filters-title"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="catalog-filters-modal__header">
                <div className="catalog-filters-modal__head-text">
                  <h2 id="catalog-filters-title" className="catalog-filters-modal__title">
                    Filters
                  </h2>
                  <p className="catalog-filters-modal__subtitle">
                    Narrow results by category, star rating, or curated picks. Search still applies.
                  </p>
                </div>
                <button
                  type="button"
                  className="catalog-filters-modal__close"
                  onClick={closeFiltersModal}
                  aria-label="Close"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </header>

              <div className="catalog-filters-modal__body">
                <div className="catalog-filter-section">
                  <div className="catalog-filter-section__head">
                    <h3 className="catalog-filter-section__title">Category</h3>
                    <p className="catalog-filter-section__desc">Shop within a single department</p>
                  </div>
                  <div className="catalog-filter-chips" role="group" aria-label="Category">
                    <button
                      type="button"
                      className={`catalog-filter-chip${category === 'all' ? ' catalog-filter-chip--on' : ''}`}
                      onClick={() => {
                        setCategory('all');
                        setCurrentPage(1);
                      }}
                    >
                      All categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`catalog-filter-chip${category === c ? ' catalog-filter-chip--on' : ''}`}
                        onClick={() => {
                          setCategory(c);
                          setCurrentPage(1);
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="catalog-filter-section">
                  <div className="catalog-filter-section__head">
                    <h3 className="catalog-filter-section__title">Minimum rating</h3>
                    <p className="catalog-filter-section__desc">Only show products at or above this score</p>
                  </div>
                  <div className="catalog-filter-chips" role="group" aria-label="Minimum rating">
                    {[
                      { v: 0, label: 'Any rating' },
                      { v: 4, label: '4★ and up' },
                      { v: 4.5, label: '4.5★ and up' },
                    ].map(({ v, label }) => (
                      <button
                        key={v}
                        type="button"
                        className={`catalog-filter-chip${minRating === v ? ' catalog-filter-chip--on' : ''}`}
                        onClick={() => {
                          setMinRating(v);
                          setCurrentPage(1);
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="catalog-filter-section">
                  <div className="catalog-filter-section__head">
                    <h3 className="catalog-filter-section__title">Quick picks</h3>
                    <p className="catalog-filter-section__desc">Trending, top-rated, or deep discounts</p>
                  </div>
                  <div className="catalog-filter-chips catalog-filter-chips--stack" role="group" aria-label="Quick filters">
                    {QUICK_FILTERS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`catalog-filter-chip catalog-filter-chip--wide${quick === f.id ? ' catalog-filter-chip--on' : ''}`}
                        onClick={() => toggleQuick(f.id)}
                      >
                        <span className="catalog-filter-chip__label">{f.label}</span>
                        <span className="catalog-filter-chip__hint">{f.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <footer className="catalog-filters-modal__footer">
                <button type="button" className="catalog-filters-modal__reset" onClick={resetFilters}>
                  Clear all
                </button>
                <button type="button" className="catalog-filters-modal__apply" onClick={closeFiltersModal}>
                  Show {totalItems} {totalItems === 1 ? 'product' : 'products'}
                </button>
              </footer>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <DashboardLayout
      title="Products"
      subtitle="Browse the catalog — refine with sort and filters"
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
              setCurrentPage(1);
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
                setCurrentPage(1);
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
                  key={s._id || s.id}
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

{!loading && !error && items.length > 0 ? (
           <section className="catalog-controls" aria-label="Sort and filter catalog">
             <div className="catalog-controls__inner">
               <div className="catalog-controls__sort-block">
                 <div className="catalog-controls__sort-head">
                   <span className="catalog-controls__eyebrow">Sort</span>
                   <span className="catalog-controls__hint">How products are ordered in the grid</span>
                 </div>
                 <div className="catalog-sort-shell">
                   <label className="visually-hidden" htmlFor="catalog-sort">
                     Sort products by
                   </label>
                   <select
                     id="catalog-sort"
                     className="catalog-sort-select"
                     value={sort}
                     onChange={(e) => {
                       setSort(e.target.value);
                       setCurrentPage(1);
                     }}
                   >
                     {SORT_OPTIONS.map((o) => (
                       <option key={o.id} value={o.id}>
                         {o.label}
                       </option>
                     ))}
                   </select>
                 </div>
               </div>

               <div className="catalog-controls__aside">
                 <button
                   type="button"
                   className="catalog-filters-trigger"
                   onClick={openFiltersModal}
                   aria-haspopup="dialog"
                   aria-expanded={filtersOpen}
                 >
                   <span className="catalog-filters-trigger__icon" aria-hidden>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                       <path d="M4 6h16M7 12h10M10 18h4" />
                       <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
                       <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none" />
                       <circle cx="14" cy="18" r="1.5" fill="currentColor" stroke="none" />
                     </svg>
                   </span>
                   <span className="catalog-filters-trigger__text">
                     <span className="catalog-filters-trigger__title">Filters</span>
                     <span className="catalog-filters-trigger__sub">Category, rating &amp; deals</span>
                   </span>
{activeFilterCount > 0 ? (
                      <span className="catalog-filters-trigger__badge" aria-label={`${activeFilterCount} active filters`}>
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {loading ? <p>Loading products...</p> : null}
        {error ? <p className="catalog-error">{error}</p> : null}

        {!loading && !error && items.length > 0 && filteredItems.length === 0 ? (
          <p className="catalog-empty-msg">No products match your search.</p>
        ) : null}

        {!loading &&
        !error &&
        items.length > 0 &&
        filteredItems.length > 0 &&
        displayItems.length === 0 ? (
          <p className="catalog-empty-msg">
            No products match these filters. Try clearing quick picks or choosing “All” categories.
          </p>
        ) : null}

        <div className="catalog-grid">
          {pagedItems.map((product, idx) => (
            <div
              key={product._id || product.id}
              className="catalog-grid-cell"
              style={{ animationDelay: `${Math.min(idx, 12) * 35}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        {!loading && !error && totalPages > 1 ? (
          <nav className="catalog-pagination" aria-label="Products pagination">
            <button
              type="button"
              className="catalog-pagination__btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {paginationItems.map((entry, idx) =>
              entry === '...' ? (
                <span key={`dots-${idx}`} className="catalog-pagination__dots" aria-hidden>
                  ...
                </span>
              ) : (
                <button
                  key={`page-${entry}`}
                  type="button"
                  className={`catalog-pagination__btn${currentPage === entry ? ' catalog-pagination__btn--active' : ''}`}
                  onClick={() => setCurrentPage(entry)}
                  aria-current={currentPage === entry ? 'page' : undefined}
                >
                  {entry}
                </button>
              )
            )}
            <button
              type="button"
              className="catalog-pagination__btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </nav>
        ) : null}
      </div>
      <CartFloating />
      {filterModal}
    </DashboardLayout>
  );
};

export default ProductsScreen;
