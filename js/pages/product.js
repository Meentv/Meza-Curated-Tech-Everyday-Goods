/* ==========================================================================
   product.js — product detail page. URL: product.html?id=<slug>

   - Reads the slug from ?id=; unknown slug → redirect to 404.html
   - Renders breadcrumbs, gallery (thumbs + prev/next + arrow keys),
     price/availability, description, specs, qty stepper, add-to-cart,
     wishlist toggle, and related products (same category) — all from
     products.js via the shared productCard for the related grid.
   ========================================================================== */

import { PRODUCTS, getProductBySlug } from '../data/products.js';
import { productCard } from '../components/product-card.js';
import { qtyStepper } from '../components/qty.js';
import { toast } from '../components/toast.js';
import { h, icon, $ } from '../utils/dom.js';
import { money } from '../utils/format.js';
import { addToCart, MAX_QTY } from '../utils/cart.js';
import { toggleWishlist, isWished } from '../utils/wishlist.js';

export function init() {
  const slug = new URLSearchParams(location.search).get('id') || '';
  const product = getProductBySlug(slug);
  if (!product) {
    location.replace('404.html');   // unknown product id → friendly 404
    return;
  }
  document.title = `${product.name} — Meza`;
  renderCrumbs(product);
  renderGallery(product);
  renderInfo(product);
  renderRelated(product);
}

/* Home / Shop / Category / Product */
function renderCrumbs(p) {
  const sep = () => h('span', { class: 'crumbs__sep', html: icon('chevron-right'), 'aria-hidden': 'true' });
  $('[data-crumbs]').replaceChildren(
    h('a', { href: 'index.html' }, 'Home'), sep(),
    h('a', { href: 'shop.html' }, 'Shop'), sep(),
    h('a', { href: `shop.html?cat=${encodeURIComponent(p.category)}` }, p.category), sep(),
    h('span', { 'aria-current': 'page' }, p.name));
}

/* Gallery: main stage + thumbnails + prev/next (wrap-around) + arrow keys. */
function renderGallery(p) {
  const gallery = $('[data-gallery]');
  const stage = $('[data-stage-img]');
  const thumbs = $('[data-thumbs]');
  const prev = $('[data-prev]');
  const next = $('[data-next]');
  const flag = $('[data-flag]');

  let i = 0;
  const show = (n) => {
    i = (n + p.images.length) % p.images.length;          // wrap around
    stage.src = p.images[i];
    stage.alt = `${p.name} — image ${i + 1} of ${p.images.length}`;
    [...thumbs.children].forEach((t, ti) => t.setAttribute('aria-current', String(ti === i)));
  };

  p.images.forEach((src, ti) => {
    thumbs.append(h('button', {
      class: 'pdp__thumb', type: 'button',
      'aria-current': String(ti === 0),
      'aria-label': `Show image ${ti + 1} of ${p.images.length}`,
      on: { click: () => show(ti) },
    }, h('img', { src, alt: '', width: '200', height: '200', loading: 'lazy', decoding: 'async' })));
  });

  // With a single image, the gallery controls are pointless — hide them.
  if (p.images.length < 2) {
    thumbs.hidden = true; prev.hidden = true; next.hidden = true;
    gallery.removeAttribute('tabindex');
  } else {
    prev.addEventListener('click', () => show(i - 1));
    next.addEventListener('click', () => show(i + 1));
    gallery.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
    });
  }

  const flagText = p.availability !== 'in-stock' ? 'Out of stock' : p.isNew ? 'New' : p.previousPrice ? 'Sale' : null;
  if (flagText) { flag.textContent = flagText; flag.hidden = false; }

  show(0);
}

function renderInfo(p) {
  const out = p.availability !== 'in-stock';

  $('[data-brandcat]').textContent = `${p.brand} · ${p.category}`;
  $('[data-name]').textContent = p.name;
  $('[data-price]').replaceChildren(
    p.previousPrice ? h('s', { class: 'card__price-old' }, money(p.previousPrice)) : null,
    h('span', { class: 'pdp__price-now' }, money(p.price)));

  const avail = $('[data-avail]');
  avail.textContent = out ? 'Out of stock' : 'In stock';
  avail.classList.add(out ? 'pdp__avail--out' : 'pdp__avail--in');

  $('[data-desc]').textContent = p.description;

  // Specs as a definition list
  $('[data-specs]').replaceChildren(
    ...p.specs.flatMap((s) => [h('dt', {}, s.label), h('dd', {}, s.value)]));

  // Quantity + add to cart
  let qty = 1;
  $('[data-qty-slot]').replaceChildren(
    qtyStepper({ value: qty, max: MAX_QTY, onChange: (v) => { qty = v; } }));

  const addBtn = $('[data-add]');
  addBtn.disabled = out;   // out-of-stock cannot be added
  addBtn.addEventListener('click', () => {
    const r = addToCart(p.id, qty);
    if (!r.ok) {
      toast(`Sorry — “${p.name}” is currently out of stock`, 'error');
      return;
    }
    toast(`Added ${qty} × “${p.name}” to your cart`, 'success');
  });

  // Wishlist toggle
  const wishBtn = $('[data-wish]');
  const paintWish = () => {
    const wished = isWished(p.id);
    wishBtn.classList.toggle('is-active', wished);
    wishBtn.setAttribute('aria-pressed', String(wished));
    wishBtn.setAttribute('aria-label', wished ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`);
  };
  wishBtn.addEventListener('click', () => {
    const r = toggleWishlist(p.id);
    if (!r.ok) return;
    paintWish();
    toast(r.wished ? `Saved “${p.name}” to your wishlist` : `Removed “${p.name}” from your wishlist`, r.wished ? 'success' : 'info');
  });
  paintWish();
}

/* Same category, excluding the product itself, max 4. */
function renderRelated(p) {
  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  if (related.length === 0) { $('[data-related-wrap]').hidden = true; return; }
  $('[data-related]').replaceChildren(...related.map(productCard));
}
