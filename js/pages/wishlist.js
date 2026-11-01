/* ==========================================================================
   wishlist.js (page) — renders saved products as standard product cards
   (the card already has remove-from-wishlist + add-to-cart actions), and
   re-renders on any wishlist change. Empty state when nothing is saved.
   ========================================================================== */

import { $ } from '../utils/dom.js';
import { num } from '../utils/format.js';
import { productCard } from '../components/product-card.js';
import { getWishlist, getWishlistCount, onWishlistChange } from '../utils/wishlist.js';

export function init() {
  render();
  onWishlistChange(render);
}

function render() {
  const items = getWishlist();
  const count = getWishlistCount();
  $('[data-count]').textContent = `${num(count)} saved`;
  $('[data-grid]').hidden = items.length === 0;
  $('[data-empty]').hidden = items.length > 0;
  $('[data-grid]').replaceChildren(...items.map(productCard));
}
