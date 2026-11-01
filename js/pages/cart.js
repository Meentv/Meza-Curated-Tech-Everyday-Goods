/* ==========================================================================
   cart.js (page) — the cart page. All state lives in utils/cart.js
   (localStorage); this file only RENDERS it and re-renders whenever the
   cart changes (onCartChange also fires from other tabs).

   Out-of-stock lines stay visible but are flagged and EXCLUDED from the
   subtotal/total (the math lives in utils/cart.js), and checkout is
   disabled while no available items remain.
   ========================================================================== */

import { h, icon, $ } from '../utils/dom.js';
import { money, num } from '../utils/format.js';
import { qtyStepper } from '../components/qty.js';
import {
  getCartEntries, getCartCount, getSubtotal,
  setQty, removeFromCart, onCartChange, shippingFor,
} from '../utils/cart.js';

export function init() {
  $('[data-checkout]').addEventListener('click', () => {
    if (getSubtotal() > 0) location.href = 'checkout.html';  // guard: nothing chargeable → stay
  });
  render();
  onCartChange(render);   // live updates when qty/remove happens (also cross-tab)
}

function render() {
  const entries = getCartEntries();
  const count = getCartCount();
  const hasItems = entries.length > 0;

  $('[data-cart-layout]').hidden = !hasItems;
  $('[data-empty]').hidden = hasItems;
  $('[data-count]').textContent = `${num(count)} item${count === 1 ? '' : 's'}`;

  $('[data-items]').replaceChildren(...entries.map(lineItem));

  const subtotal = getSubtotal();
  const shipping = hasItems ? shippingFor(subtotal) : 0;
  $('[data-subtotal]').textContent = money(subtotal);
  $('[data-shipping]').textContent = shipping === 0 ? 'Free' : money(shipping);
  $('[data-total]').textContent = money(subtotal + shipping);

  const canCheckout = subtotal > 0;
  $('[data-checkout]').disabled = !canCheckout;
  $('[data-checkout-hint]').hidden = canCheckout;
}

/* One cart line: image, meta, qty stepper, remove, line total. */
function lineItem({ product, qty }) {
  const out = product.availability !== 'in-stock';
  const detailHref = `product.html?id=${encodeURIComponent(product.slug)}`;

  // Out-of-stock lines are locked (min = max = current qty → both buttons disabled)
  const stepper = qtyStepper({
    value: qty,
    min: out ? qty : 1,
    max: out ? qty : undefined,
    label: `Quantity of ${product.name}`,
    onChange: (v) => setQty(product.id, v),
  });

  const removeBtn = h('button', {
    class: 'icon-btn', type: 'button',
    'aria-label': `Remove ${product.name} from cart`,
    html: icon('trash'),
    on: { click: () => removeFromCart(product.id) },
  });

  return h('article', { class: `cart-item${out ? ' cart-item--out' : ''}`, dataset: { id: product.id } },
    h('a', { class: 'cart-item__media', href: detailHref, tabindex: '-1', 'aria-hidden': 'true' },
      h('img', { src: product.images[0], alt: '', width: '200', height: '200', loading: 'lazy', decoding: 'async' })),
    h('div', { class: 'cart-item__info' },
      h('p', { class: 'card__meta muted' }, `${product.brand} · ${product.category}`),
      h('h3', { class: 'cart-item__name' }, h('a', { href: detailHref }, product.name)),
      out ? h('p', { class: 'cart-item__flag', role: 'note' }, 'Currently unavailable — excluded from totals') : null,
      h('div', { class: 'cart-item__controls' }, stepper, removeBtn)),
    h('div', { class: 'cart-item__right' },
      h('p', { class: 'cart-item__line' }, out ? '—' : money(product.price * qty)),
      h('p', { class: 'muted cart-item__unit' }, `${money(product.price)} each`)));
}
