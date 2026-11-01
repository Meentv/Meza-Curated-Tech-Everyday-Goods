/* ==========================================================================
   product-card.js — the ONE product card renderer, reused by the homepage,
   shop grid, wishlist and "related products". Keeping it in one place is
   what guarantees product info looks identical on every page.

   Card anatomy: image (links to detail page) + flag badge + brand/category
   meta + name (link) + tagline + price row (previous price, add-to-cart,
   wishlist heart). Out-of-stock cards are dimmed and cannot be added.
   ========================================================================== */

import { h, icon } from '../utils/dom.js';
import { money } from '../utils/format.js';
import { addToCart } from '../utils/cart.js';
import { toggleWishlist, isWished } from '../utils/wishlist.js';
import { toast } from './toast.js';

export function productCard(p) {
  const out = p.availability !== 'in-stock';
  const detailHref = `product.html?id=${encodeURIComponent(p.slug)}`;
  const badgeText = out ? 'Out of stock' : p.isNew ? 'New' : p.previousPrice ? 'Sale' : null;

  // --- wishlist heart -------------------------------------------------------
  const wishBtn = h('button', {
    class: `icon-btn card__wish${isWished(p.id) ? ' is-active' : ''}`,
    type: 'button',
    'aria-pressed': String(isWished(p.id)),
    'aria-label': isWished(p.id) ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`,
    html: icon('heart'),
    on: {
      click: (ev) => {
        ev.preventDefault(); // card media/name links must not trigger
        const r = toggleWishlist(p.id);
        if (!r.ok) return;
        wishBtn.classList.toggle('is-active', r.wished);
        wishBtn.setAttribute('aria-pressed', String(r.wished));
        wishBtn.setAttribute('aria-label',
          r.wished ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`);
        toast(r.wished ? `Saved “${p.name}” to your wishlist` : `Removed “${p.name}” from your wishlist`,
          r.wished ? 'success' : 'info');
      },
    },
  });

  // --- add to cart ------------------------------------------------------------
  const addBtn = h('button', {
    class: 'btn btn--outline btn--sm card__add',
    type: 'button',
    disabled: out ? true : null,
    on: {
      click: (ev) => {
        ev.preventDefault();
        const r = addToCart(p.id, 1);
        if (!r.ok) {
          toast(r.reason === 'unavailable'
            ? `Sorry — “${p.name}” is currently out of stock`
            : 'Could not add that item', 'error');
          return;
        }
        toast(`Added “${p.name}” to your cart`, 'success');
      },
    },
  }, out ? 'Out of stock' : 'Add to cart');

  // --- price ------------------------------------------------------------------
  const price = h('p', { class: 'card__price' },
    p.previousPrice ? h('s', { class: 'card__price-old' }, money(p.previousPrice)) : null,
    h('span', { class: 'card__price-now' }, money(p.price)));

  return h('article', { class: `card${out ? ' card--out' : ''}`, dataset: { id: p.id } },
    h('a', { class: 'card__media', href: detailHref, tabindex: '-1', 'aria-hidden': 'true' },
      h('img', {
        src: p.images[0], alt: '', width: '1200', height: '1200',
        loading: 'lazy', decoding: 'async',
      }),
      badgeText ? h('span', { class: 'badge--flag' }, badgeText) : null),
    h('div', { class: 'card__body' },
      h('p', { class: 'card__meta muted' }, `${p.brand} · ${p.category}`),
      h('h3', { class: 'card__name' }, h('a', { href: detailHref }, p.name)),
      h('p', { class: 'card__tagline muted' }, p.tagline),
      h('div', { class: 'card__row' },
        price,
        h('div', { class: 'card__actions' }, wishBtn, addBtn))));
}
