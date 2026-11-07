/* ==========================================================================
   OrderSuccess — reads the demo order stored by the checkout page
   (localStorage["meza:v1:lastOrder"]) and renders the confirmation:
   demo reference, items, totals, customer summary. If there is no stored
   order (direct visit / cleared storage), shows a fallback state instead.
   The order is never deleted here, so refreshing the page still works.
   ========================================================================== */

import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { money, dateLong } from '../lib/format.js';
import { read } from '../lib/storage.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function OrderSuccess() {
  const order = read('lastOrder', null);
  const hasOrder = Boolean(order && Array.isArray(order.items) && order.items.length > 0);

  usePageMeta(
    hasOrder ? `Demo order ${order.ref} — Meza` : 'Demo order placed — Meza',
    'Demo order confirmation on Meza — a fictional storefront. No real order was placed.',
  );

  return (
    <div className="container">
      {/* Filled from localStorage lastOrder */}
      {hasOrder ? (
        <div className="success">
          <div className="success__icon" aria-hidden="true">
            <Icon name="check" />
          </div>
          <p className="eyebrow">Demo order placed</p>
          <h1>Thank you — this is a demonstration.</h1>
          <p className="muted" style={{ margin: 'var(--space-2) auto var(--space-3)' }}>
            No payment was processed and no order was sent anywhere — this confirmation exists
            only in your browser.
          </p>
          <p className="muted" style={{ fontSize: 'var(--text-sm)' }}>Demo order reference</p>
          <p className="success__ref">{order.ref}</p>
          <p className="muted" style={{ fontSize: 'var(--text-xs)' }}>
            Placed {dateLong(order.placedAt)} · demonstration only
          </p>

          <div className="order-box">
            <h2>Items</h2>
            <div className="order-items">
              {order.items.map((item) => (
                <div className="order-item" key={item.id}>
                  <span>{item.name} × {item.qty}</span>
                  <span>{money(item.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="summary__row"><span className="muted">Subtotal</span><span>{money(order.subtotal)}</span></div>
            <div className="summary__row">
              <span className="muted">Shipping (demo)</span>
              <span>{order.shipping === 0 ? 'Free' : money(order.shipping)}</span>
            </div>
            <div className="summary__row summary__total"><span>Total</span><span>{money(order.total)}</span></div>
            <p className="muted" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-3)' }}>
              Demo "ship-to": {order.customer.name}, {order.customer.address},{' '}
              {order.customer.city}, {order.customer.state}, {order.customer.country} ·{' '}
              {order.customer.email}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="btn btn--primary" to="/">Return to home</Link>
            <Link className="btn btn--outline" to="/shop">Continue shopping</Link>
          </div>
        </div>
      ) : (
        <div className="empty" style={{ marginBlock: 'var(--space-8)' }}>
          <Icon name="package" />
          <h3>No recent demo order</h3>
          <p>
            There's no demo order stored in this browser. Place one from the (simulated) checkout.
          </p>
          <Link className="btn btn--primary" to="/shop">Browse the collection</Link>
        </div>
      )}
    </div>
  );
}
