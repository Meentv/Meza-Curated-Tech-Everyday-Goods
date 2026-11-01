/* ==========================================================================
   catalog.js — PURE catalog operations: search / filter / sort.
   No DOM, no localStorage — every function takes the products array as an
   argument, which makes them trivially unit-testable in Node (tests/).
   shop.js runs everything through applyCatalogQuery().
   ========================================================================== */

export const SORT_OPTIONS = [
  { id: 'featured',   label: 'Featured' },
  { id: 'newest',     label: 'Newest' },
  { id: 'price-asc',  label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
];

export const AVAILABILITY_OPTIONS = [
  { id: 'all',          label: 'All' },
  { id: 'in-stock',     label: 'In stock' },
  { id: 'out-of-stock', label: 'Out of stock' },
];

/** Unique categories / brands, derived from the data (never hardcoded). */
export const listCategories = (products) => [...new Set(products.map((p) => p.category))];
export const listBrands = (products) =>
  [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b));

/** Lowest/highest price — used to pre-fill the price-range filter inputs. */
export function priceBounds(products) {
  const prices = products.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Case-insensitive match across name, brand, category, tagline, description. */
export function searchProducts(products, query) {
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) =>
    [p.name, p.brand, p.category, p.tagline, p.description].some((field) =>
      (field ?? '').toLowerCase().includes(q)
    )
  );
}

/** state: { category, brand, min, max, availability } — all optional, all compose. */
export function filterProducts(products, state = {}) {
  return products.filter((p) => {
    if (state.category && p.category !== state.category) return false;
    if (state.brand && p.brand !== state.brand) return false;
    if (state.min != null && state.min !== '' && p.price < Number(state.min)) return false;
    if (state.max != null && state.max !== '' && p.price > Number(state.max)) return false;
    if (state.availability && state.availability !== 'all' && p.availability !== state.availability) return false;
    return true;
  });
}

export function sortProducts(products, sortId = 'featured') {
  const copy = [...products]; // never mutate the source array
  switch (sortId) {
    case 'price-asc':  return copy.sort((a, b) => a.price - b.price);
    case 'price-desc': return copy.sort((a, b) => b.price - a.price);
    case 'newest':     return copy.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    case 'featured':
    default:
      return copy.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || b.addedAt.localeCompare(a.addedAt)
      );
  }
}

/** The single pipeline: search → filter → sort. */
export function applyCatalogQuery(products, state = {}) {
  return sortProducts(filterProducts(searchProducts(products, state.q), state), state.sort);
}
