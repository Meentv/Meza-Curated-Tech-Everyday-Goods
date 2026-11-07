/* ==========================================================================
   Shop — the catalog page.

   - Filter controls (categories, brands, price range, availability) and the
     sort select are rendered FROM the product data, so they never go stale.
   - One state object { q, cat, brand, min, max, avail, sort } lives in the
     URL (?q=&cat=&brand=&min=&max=&avail=&sort=), so refreshing, sharing or
     using back/forward always restores the same shop state.
   - Rendering itself is one pure pipeline from lib/catalog.js:
        applyCatalogQuery(PRODUCTS, state)  =  search → filter → sort
   ========================================================================== */

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { PRODUCTS } from '../data/products.js';
import { num, money } from '../lib/format.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback.js';
import {
  SORT_OPTIONS,
  AVAILABILITY_OPTIONS,
  listCategories,
  listBrands,
  priceBounds,
  applyCatalogQuery,
} from '../lib/catalog.js';

/* Default state. Empty string = "not set". Defaults are omitted from the URL. */
const DEFAULTS = { q: '', cat: '', brand: '', min: '', max: '', avail: 'all', sort: 'featured' };
const BOUNDS = priceBounds(PRODUCTS);

/** URL → state (sanitized: prices must be numbers, sort/avail must be known ids). */
function stateFromParams(params) {
  const s = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) {
    if (params.has(key)) s[key] = params.get(key);
  }
  if (s.min !== '' && !Number.isFinite(Number(s.min))) s.min = '';
  if (s.max !== '' && !Number.isFinite(Number(s.max))) s.max = '';
  if (!SORT_OPTIONS.some((o) => o.id === s.sort)) s.sort = DEFAULTS.sort;
  if (!AVAILABILITY_OPTIONS.some((o) => o.id === s.avail)) s.avail = DEFAULTS.avail;
  return s;
}

/** state → URL params (defaults omitted so the URL stays readable). */
function paramsFromState(state) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(state)) {
    const isDefault =
      value === '' || (key === 'avail' && value === 'all') || (key === 'sort' && value === 'featured');
    if (!isDefault) params.set(key, value);
  }
  return params;
}

export default function Shop() {
  usePageMeta(
    'Shop — Meza',
    'Browse the Meza catalog: search, filter by category, brand, price and availability, and sort the collection.',
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const state = stateFromParams(searchParams);

  const [searchText, setSearchText] = useState(state.q);
  const [minInput, setMinInput] = useState(state.min);
  const [maxInput, setMaxInput] = useState(state.max);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Keep the local inputs in step with the URL (back/forward, shared links).
  useEffect(() => { setSearchText(state.q); }, [state.q]);
  useEffect(() => { setMinInput(state.min); }, [state.min]);
  useEffect(() => { setMaxInput(state.max); }, [state.max]);

  /** Merge a patch into the URL state, sanitize it, repaint everything. */
  const update = useCallback((patch) => {
    setSearchParams((prev) => {
      const next = { ...stateFromParams(prev), ...patch };
      // If min > max, swap them instead of showing an impossible range.
      if (next.min !== '' && next.max !== '' && Number(next.min) > Number(next.max)) {
        [next.min, next.max] = [next.max, next.min];
      }
      return paramsFromState(next);
    }, { replace: true });
  }, [setSearchParams]);

  const updateSearch = useDebouncedCallback((value) => update({ q: value }), 200);

  const results = applyCatalogQuery(PRODUCTS, {
    q: state.q,
    category: state.cat || undefined,
    brand: state.brand || undefined,
    min: state.min === '' ? null : Number(state.min),
    max: state.max === '' ? null : Number(state.max),
    availability: state.avail,
    sort: state.sort,
  });

  const label = `${num(results.length)} product${results.length === 1 ? '' : 's'}`;
  const clearAll = () => update({ ...DEFAULTS });
  // Price inputs apply on blur / Enter (the "change" behaviour of the original site).
  const applyPrice = () => update({ min: minInput, max: maxInput });
  const priceKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); applyPrice(); } };

  /* ---------------------------------------------------------------------- */
  /* Controls                                                                */
  /* ---------------------------------------------------------------------- */
  const chip = (key, value, text, pressed) => (
    <button
      key={`${key}-${value || 'all'}`}
      className="chip"
      type="button"
      aria-pressed={pressed}
      data-value={value || 'All'}
      onClick={() => update({ [key]: pressed && value ? '' : value })}
    >
      {text}
    </button>
  );

  return (
    <div className="container">
      <div className="page-head">
        <h1>Shop</h1>
        <p className="muted" data-count aria-live="polite">{label}</p>
      </div>

      {/* Search: always visible, full width */}
      <div className="search shop-search">
        <Icon name="search" />
        <label className="visually-hidden" htmlFor="shop-search">Search products</label>
        <input
          className="field__input"
          id="shop-search"
          data-search
          type="search"
          placeholder="Search name, brand, category…"
          autoComplete="off"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            updateSearch(e.target.value.trim());
          }}
        />
      </div>

      <div className="shop-layout">
        {/* Filters: collapsible on mobile (button), sidebar on desktop */}
        <aside className="filters" aria-label="Product filters">
          <button
            className="filters__toggle"
            type="button"
            data-filters-toggle
            aria-expanded={filtersOpen}
            aria-controls="filters-body"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="funnel" />
              Filters
            </span>
            <Icon name="chevron-down" />
          </button>

          <div className="filters__body" id="filters-body" hidden={!filtersOpen}>
            <div className="filter-group">
              <h3>Category</h3>
              <div className="chip-row">
                {chip('cat', '', 'All', !state.cat)}
                {listCategories(PRODUCTS).map((c) =>
                  chip('cat', c, c, state.cat === c))}
              </div>
            </div>

            <div className="filter-group">
              <h3>Brand</h3>
              <div className="chip-row">
                {chip('brand', '', 'All', !state.brand)}
                {listBrands(PRODUCTS).map((b) =>
                  chip('brand', b, b, state.brand === b))}
              </div>
            </div>

            <div className="filter-group">
              <h3>Price (₦)</h3>
              <div className="price-range">
                <div className="field">
                  <label className="field__label visually-hidden" htmlFor="price-min">Minimum price</label>
                  <input
                    className="field__input"
                    id="price-min"
                    data-min-input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    placeholder={`Min · ${money(BOUNDS.min)}`}
                    value={minInput}
                    onChange={(e) => setMinInput(e.target.value)}
                    onBlur={applyPrice}
                    onKeyDown={priceKey}
                  />
                </div>
                <div className="field">
                  <label className="field__label visually-hidden" htmlFor="price-max">Maximum price</label>
                  <input
                    className="field__input"
                    id="price-max"
                    data-max-input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    placeholder={`Max · ${money(BOUNDS.max)}`}
                    value={maxInput}
                    onChange={(e) => setMaxInput(e.target.value)}
                    onBlur={applyPrice}
                    onKeyDown={priceKey}
                  />
                </div>
              </div>
              <p className="field__hint">Applied when you leave the field or press Enter.</p>
            </div>

            <div className="filter-group">
              <h3>Availability</h3>
              <div className="chip-row">
                {AVAILABILITY_OPTIONS.map((opt) =>
                  chip(
                    'avail',
                    opt.id,
                    opt.label,
                    state.avail === opt.id,
                  ))}
              </div>
            </div>

            <button className="btn btn--ghost btn--sm" type="button" onClick={clearAll}>
              Clear all filters
            </button>
          </div>
        </aside>

        {/* Results */}
        <section className="shop-main" aria-label="Products">
          <div className="toolbar">
            <span className="muted">{label}</span>
            <label className="sort" htmlFor="sort-select">
              <span className="muted">Sort</span>
              <select
                id="sort-select"
                data-sort-select
                value={state.sort}
                onChange={(e) => update({ sort: e.target.value })}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="product-grid" hidden={results.length === 0}>
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          <div className="empty" hidden={results.length !== 0}>
            <Icon name="search" />
            <h3>No products match</h3>
            <p>Try a different search term, or clear the filters to see the full collection.</p>
            <button className="btn btn--outline" type="button" onClick={clearAll}>
              Clear all filters
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
