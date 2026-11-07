/* ==========================================================================
   order.js — PURE helpers for the demo order (no DOM). Checkout is a
   SIMULATION: buildDemoOrder() creates a plain object that is stored in
   localStorage and shown on the order-success route. No payment data exists
   anywhere in this app.
   ========================================================================== */

/** "MZA-DEMO-X7K2QP" — unambiguous alphabet (no 0/O/1/I), clearly a demo ref. */
export function makeOrderRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint32Array(6);
  if (globalThis.crypto?.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < 6; i++) bytes[i] = Math.floor(Math.random() * 2 ** 32);
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[bytes[i] % chars.length];
  return `MZA-DEMO-${s}`;
}

/**
 * Build the demo order object.
 * entries: [{ product, qty }] (already filtered to available items)
 */
export function buildDemoOrder({ entries, customer, subtotal, shipping }) {
  const items = entries.map(({ product, qty }) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    price: product.price,
    qty,
    lineTotal: product.price * qty,
  }));
  return {
    demo: true,                       // hard flag: this is never a real order
    ref: makeOrderRef(),
    placedAt: new Date().toISOString(),
    customer: { ...customer },        // name/email/phone/address/city/state/country
    items,
    itemCount: items.reduce((n, i) => n + i.qty, 0),
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}
