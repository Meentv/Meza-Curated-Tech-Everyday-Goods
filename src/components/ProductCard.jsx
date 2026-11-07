/* ==========================================================================
   ProductCard — the ONE product card component, reused by the homepage,
   shop grid, wishlist and "related products". Keeping it in one place is
   what guarantees product info looks identical on every page.

   Card anatomy: image (links to detail page) + flag badge + brand/category
   meta + name (link) + tagline + price row (previous price, add-to-cart,
   wishlist heart). Out-of-stock cards are dimmed and cannot be added.
   ========================================================================== */

import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useToast } from './ToastProvider.jsx';
import { money } from '../lib/format.js';
import { asset } from '../lib/asset.js';
import { addToCart } from '../lib/cart.js';
import { toggleWishlist } from '../lib/wishlist.js';
import { useWishlist } from '../hooks/useWishlist.js';

export default function ProductCard({ product: p }) {
  const toast = useToast();
  const wished = useWishlist().some((item) => item.id === p.id);
  const out = p.availability !== 'in-stock';
  const detailHref = `/product/${encodeURIComponent(p.slug)}`;
  const badgeText = out ? 'Out of stock' : p.isNew ? 'New' : p.previousPrice ? 'Sale' : null;

  const onWishlist = (e) => {
    e.preventDefault(); // card media/name links must not trigger
    const r = toggleWishlist(p.id);
    if (!r.ok) return;
    toast(
      r.wished ? `Saved “${p.name}” to your wishlist` : `Removed “${p.name}” from your wishlist`,
      r.wished ? 'success' : 'info',
    );
  };

  const onAdd = (e) => {
    e.preventDefault();
    const r = addToCart(p.id, 1);
    if (!r.ok) {
      toast(
        r.reason === 'unavailable'
          ? `Sorry — “${p.name}” is currently out of stock`
          : 'Could not add that item',
        'error',
      );
      return;
    }
    toast(`Added “${p.name}” to your cart`, 'success');
  };

  return (
    <article className={`card${out ? ' card--out' : ''}`} data-id={p.id}>
      <Link className="card__media" to={detailHref} tabIndex={-1} aria-hidden="true">
        <img
          src={asset(p.images[0])}
          alt=""
          width="1200"
          height="1200"
          loading="lazy"
          decoding="async"
        />
        {badgeText && <span className="badge--flag">{badgeText}</span>}
      </Link>

      <div className="card__body">
        <p className="card__meta muted">{p.brand} · {p.category}</p>
        <h3 className="card__name"><Link to={detailHref}>{p.name}</Link></h3>
        <p className="card__tagline muted">{p.tagline}</p>

        <div className="card__row">
          <p className="card__price">
            {p.previousPrice ? <s className="card__price-old">{money(p.previousPrice)}</s> : null}
            <span className="card__price-now">{money(p.price)}</span>
          </p>

          <div className="card__actions">
            <button
              className={`icon-btn card__wish${wished ? ' is-active' : ''}`}
              type="button"
              aria-pressed={wished}
              aria-label={wished ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
              onClick={onWishlist}
            >
              <Icon name="heart" />
            </button>
            <button
              className="btn btn--outline btn--sm card__add"
              type="button"
              disabled={out}
              onClick={onAdd}
            >
              {out ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
