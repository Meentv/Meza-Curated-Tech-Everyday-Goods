/* ==========================================================================
   Cart — renders the cart state from lib/cart.js (localStorage) and
   re-renders whenever it changes (also from other tabs).

   Out-of-stock lines stay visible but are flagged and EXCLUDED from the
   subtotal/total, and checkout is disabled while no available items remain.
   ========================================================================== */

import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Crumbs from '../components/Crumbs.jsx';
import QtyStepper from '../components/QtyStepper.jsx';
import { money, num } from '../lib/format.js';
import { asset } from '../lib/asset.js';
import { setQty, removeFromCart } from '../lib/cart.js';
import { useCartSummary } from '../hooks/useCart.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

/* One cart line: image, meta, qty stepper, remove, line total. */
function CartLine({ product, qty }) {
  const out = product.availability !== 'in-stock';
  const detailHref = `/product/${encodeURIComponent(product.slug)}`;

  return (
    <article className={`cart-item${out ? ' cart-item--out' : ''}`} data-id={product.id}>
      <Link className="cart-item__media" to={detailHref} tabIndex={-1} aria-hidden="true">
        <img
          src={asset(product.images[0])}
          alt=""
          width="200"
          height="200"
          loading="lazy"
          decoding="async"
        />
      </Link>

      <div className="cart-item__info">
        <p className="card__meta muted">{product.brand} · {product.category}</p>
        <h3 className="cart-item__name"><Link to={detailHref}>{product.name}</Link></h3>
        {out && (
          <p className="cart-item__flag" role="note">
            Currently unavailable — excluded from totals
          </p>
        )}
        <div className="cart-item__controls">
          {/* Out-of-stock lines are locked (min = max = current qty) */}
          <QtyStepper
            value={qty}
            min={out ? qty : 1}
            max={out ? qty : undefined}
            label={`Quantity of ${product.name}`}
            onChange={(v) => setQty(product.id, v)}
          />
          <button
            className="icon-btn"
            type="button"
            aria-label={`Remove ${product.name} from cart`}
            onClick={() => removeFromCart(product.id)}
          >
            <Icon name="trash" />
          </button>
        </div>
      </div>

      <div className="cart-item__right">
        <p className="cart-item__line">{out ? '—' : money(product.price * qty)}</p>
        <p className="muted cart-item__unit">{money(product.price)} each</p>
      </div>
    </article>
  );
}

export default function Cart() {
  usePageMeta(
    'Your cart — Meza',
    'Your Meza cart — a fictional demo storefront.',
  );

  const navigate = useNavigate();
  const { entries, count, subtotal, shipping, total, hasItems } = useCartSummary();
  const canCheckout = subtotal > 0;

  return (
    <div className="container">
      <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: 'Cart' }]} />

      <div className="page-head">
        <h1>Your cart</h1>
        <p className="muted" data-count aria-live="polite">
          {num(count)} item{count === 1 ? '' : 's'}
        </p>
      </div>

      <div className="cart-layout" hidden={!hasItems}>
        <section className="cart-items" aria-label="Cart items">
          {entries.map((e) => (
            <CartLine key={e.product.id} product={e.product} qty={e.qty} />
          ))}
        </section>

        <aside className="summary" aria-label="Order summary">
          <h2>Order summary</h2>
          <div className="summary__row"><span className="muted">Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="summary__row">
            <span className="muted">Shipping (demo)</span>
            <span>{shipping === 0 ? 'Free' : money(shipping)}</span>
          </div>
          <div className="summary__row summary__total"><span>Total</span><span>{money(total)}</span></div>
          <p className="field__hint">
            Demo storefront — no payment is collected. Shipping is a simulated flat fee, free
            over ₦150,000.
          </p>
          <button
            className="btn btn--primary btn--block"
            type="button"
            style={{ marginTop: 'var(--space-3)' }}
            disabled={!canCheckout}
            onClick={() => { if (canCheckout) navigate('/checkout'); }}
          >
            Proceed to checkout
            <Icon name="arrow-right" />
          </button>
          <p className="field__hint" hidden={canCheckout}>
            Remove unavailable items to continue.
          </p>
          <p style={{ marginTop: 'var(--space-3)', textAlign: 'center' }}>
            <Link className="link-arrow" to="/shop">
              Continue shopping
              <Icon name="arrow-right" />
            </Link>
          </p>
        </aside>
      </div>

      <div className="empty" hidden={hasItems}>
        <Icon name="bag" />
        <h3>Your cart is empty</h3>
        <p>Explore the collection and add something you love.</p>
        <Link className="btn btn--primary" to="/shop">Continue shopping</Link>
      </div>
    </div>
  );
}
