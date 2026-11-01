/* ==========================================================================
   shop.js — the catalog page (loaded via <body data-page="shop">).

   What it does:
   - Renders the filter controls (categories, brands, price range,
     availability) and the sort select FROM the product data.
   - Keeps one `state` object { q, cat, brand, min, max, avail, sort }.
   - Every change → update() → writes the state into the URL with
     history.replaceState() → re-renders. So refreshing, sharing or
     using back/forward (popstate) always restores the same shop state.
   - Rendering itself is one pure pipeline from utils/catalog.js:
        applyCatalogQuery(PRODUCTS, state)  =  search → filter → sort
     so search, filters and sorting always work together.
   ========================================================================== */

import { PRODUCTS } from '../data/products.js';
import { productCard } from '../components/product-card.js';
import { h, $ } from '../utils/dom.js';
import { num, money } from '../utils/format.js';
import {
  SORT_OPTIONS,
  AVAILABILITY_OPTIONS,
  listCategories,
  listBrands,
  priceBounds,
  applyCatalogQuery,
} from '../utils/catalog.js';

/* Default state. Empty string = "not set". Defaults are omitted from the URL. */
const DEFAULTS = { q: '', cat: '', brand: '', min: '', max: '', avail: 'all', sort: 'featured' };

let state = { ...DEFAULTS };

export function init() {
  buildControls();
  wireEvents();
  // Initial state comes from the URL (?q=…&cat=…&sort=…), so shared/refreshed
  // links restore the exact same view.
  state = stateFromURL();
  paintControls();
  render();
  window.addEventListener('popstate', () => {
    state = stateFromURL();
    paintControls();
    render();
  });
}

/* ------------------------------------------------------------------------
   URL <-> state
   ------------------------------------------------------------------------ */
function stateFromURL() {
  const params = new URLSearchParams(location.search);
  const s = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) {
    if (params.has(key)) s[key] = params.get(key);
  }
  // Sanitize: prices must be finite numbers, sort/avail must be known ids.
  if (s.min !== '' && !Number.isFinite(Number(s.min))) s.min = '';
  if (s.max !== '' && !Number.isFinite(Number(s.max))) s.max = '';
  if (!SORT_OPTIONS.some((o) => o.id === s.sort)) s.sort = DEFAULTS.sort;
  if (!AVAILABILITY_OPTIONS.some((o) => o.id === s.avail)) s.avail = DEFAULTS.avail;
  return s;
}

/** Merge a patch into state, push it to the URL, repaint controls, re-render. */
function update(patch) {
  state = { ...state, ...patch };
  // If min > max, swap them instead of showing an impossible range.
  if (state.min !== '' && state.max !== '' && Number(state.min) > Number(state.max)) {
    [state.min, state.max] = [state.max, state.min];
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(state)) {
    const isDefault =
      value === '' || (key === 'avail' && value === 'all') || (key === 'sort' && value === 'featured');
    if (!isDefault) params.set(key, value);
  }
  const qs = params.toString();
  history.replaceState(null, '', qs ? `shop.html?${qs}` : 'shop.html');
  paintControls();
  render();
}

/* ------------------------------------------------------------------------
   Rendering
   ------------------------------------------------------------------------ */
function render() {
  const results = applyCatalogQuery(PRODUCTS, {
    q: state.q,
    category: state.cat || undefined,
    brand: state.brand || undefined,
    min: state.min === '' ? null : Number(state.min),
    max: state.max === '' ? null : Number(state.max),
    availability: state.avail,
    sort: state.sort,
  });

  const grid = $('[data-grid]');
  grid.replaceChildren(...results.map(productCard));

  const label = `${num(results.length)} product${results.length === 1 ? '' : 's'}`;
  $('[data-count]').textContent = label;
  const count2 = $('[data-count-2]');
  if (count2) count2.textContent = label;

  const empty = $('[data-empty]');
  empty.hidden = results.length !== 0;
  grid.hidden = results.length === 0;
}

/* ------------------------------------------------------------------------
   Controls (built from data, so they can never go stale)
   ------------------------------------------------------------------------ */
const chipRefs = { cat: [], brand: [], avail: [] };

function buildControls() {
  // Category chips: "All" + one per category found in the data
  const catsMount = $('[data-cats]');
  chipRefs.cat.push(makeChip(catsMount, 'All', () => update({ cat: '' })));
  for (const cat of listCategories(PRODUCTS)) {
    chipRefs.cat.push(makeChip(catsMount, cat, () => update({ cat: state.cat === cat ? '' : cat })));
  }

  // Brand chips
  const brandsMount = $('[data-brands]');
  chipRefs.brand.push(makeChip(brandsMount, 'All', () => update({ brand: '' })));
  for (const brand of listBrands(PRODUCTS)) {
    chipRefs.brand.push(makeChip(brandsMount, brand, () => update({ brand: state.brand === brand ? '' : brand })));
  }

  // Availability chips
  const availMount = $('[data-avail]');
  for (const opt of AVAILABILITY_OPTIONS) {
    chipRefs.avail.push(
      makeChip(availMount, opt.label, () => update({ avail: state.avail === opt.id ? 'all' : opt.id }), opt.id)
    );
  }

  // Price range placeholders come from the actual price bounds
  const bounds = priceBounds(PRODUCTS);
  $('[data-min-input]').placeholder = `Min · ${money(bounds.min)}`;
  $('[data-max-input]').placeholder = `Max · ${money(bounds.max)}`;

  // Sort select
  const select = $('[data-sort-select]');
  for (const opt of SORT_OPTIONS) {
    select.append(h('option', { value: opt.id }, opt.label));
  }
}

function makeChip(mount, label, onClick, value = label) {
  const el = h('button', {
    class: 'chip', type: 'button', 'aria-pressed': 'false', dataset: { value },
    on: { click: onClick },
  }, label);
  mount.append(el);
  return { value, el };
}

/** Reflect the current state into the controls (inputs, pressed chips, select). */
function paintControls() {
  const search = $('[data-search]');
  if (search.value !== state.q) search.value = state.q;

  for (const { value, el } of chipRefs.cat) el.setAttribute('aria-pressed', String(state.cat === value || (value === 'All' && !state.cat)));
  for (const { value, el } of chipRefs.brand) el.setAttribute('aria-pressed', String(state.brand === value || (value === 'All' && !state.brand)));
  for (const { value, el } of chipRefs.avail) el.setAttribute('aria-pressed', String(state.avail === value));

  const minInput = $('[data-min-input]');
  const maxInput = $('[data-max-input]');
  if (minInput.value !== state.min) minInput.value = state.min;
  if (maxInput.value !== state.max) maxInput.value = state.max;

  $('[data-sort-select]').value = state.sort;
}

/* ------------------------------------------------------------------------
   Events
   ------------------------------------------------------------------------ */
function wireEvents() {
  // Search input — debounced so we don't re-render on every keystroke
  const search = $('[data-search]');
  search.addEventListener('input', debounce(() => update({ q: search.value.trim() }), 200));

  // Price inputs apply on "change" (blur / Enter), not on every keystroke
  for (const input of [$('[data-min-input]'), $('[data-max-input]')]) {
    input.addEventListener('change', () => update({ min: $('[data-min-input]').value, max: $('[data-max-input]').value }));
  }

  $('[data-sort-select]').addEventListener('change', (e) => update({ sort: e.target.value }));

  // Clear-all (toolbar-less, inside filters + inside empty state)
  for (const btn of document.querySelectorAll('[data-clear-all], [data-empty-clear]')) {
    btn.addEventListener('click', () => update({ ...DEFAULTS }));
  }

  // Mobile filters toggle
  const toggle = $('[data-filters-toggle]');
  const body = $('[data-filters-body]');
  toggle.addEventListener('click', () => {
    const open = body.hidden;
    body.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  });
}

/** Classic debounce: wait until the user pauses for `ms` before running fn. */
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
