/* ==========================================================================
   order-success.js — reads the demo order stored by checkout.js
   (localStorage["meza:v1:lastOrder"]) and renders the confirmation:
   demo reference, items, totals, customer summary. If there is no stored
   order (direct visit / cleared storage), shows a fallback state instead.
   The order is never deleted here, so refreshing the page still works.
   ========================================================================== */

import { h, $ } from '../utils/dom.js';
import { money, dateLong } from '../utils/format.js';
import { read } from '../utils/storage.js';

export function init() {
  const order = read('lastOrder', null);
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    $('[data-no-order]').hidden = false;
    return;
  }
  document.title = `Demo order ${order.ref} — Meza`;
  $('[data-success]').hidden = false;

  $('[data-ref]').textContent = order.ref;
  $('[data-date]').textContent = `Placed ${dateLong(order.placedAt)} · demonstration only`;

  $('[data-items]').replaceChildren(...order.items.map((item) =>
    h('div', { class: 'order-item' },
      h('span', {}, `${item.name} × ${item.qty}`),
      h('span', {}, money(item.lineTotal)))));

  $('[data-subtotal]').textContent = money(order.subtotal);
  $('[data-shipping]').textContent = order.shipping === 0 ? 'Free' : money(order.shipping);
  $('[data-total]').textContent = money(order.total);
  $('[data-customer]').textContent =
    `Demo "ship-to": ${order.customer.name}, ${order.customer.address}, ${order.customer.city}, ${order.customer.state}, ${order.customer.country} · ${order.customer.email}`;
}
