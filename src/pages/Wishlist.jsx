/* ==========================================================================
   Wishlist — renders saved products as standard product cards (the card
   already has remove-from-wishlist + add-to-cart actions), and re-renders
   on any wishlist change. Empty state when nothing is saved.
   ========================================================================== */

import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Crumbs from '../components/Crumbs.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { num } from '../lib/format.js';
import { useWishlist } from '../hooks/useWishlist.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function Wishlist() {
  usePageMeta(
    'Wishlist — Meza',
    'Your saved products on Meza — a fictional demo storefront.',
  );

  const items = useWishlist();

  return (
    <div className="container">
      <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />

      <div className="page-head">
        <h1>Wishlist</h1>
        <p className="muted" data-count aria-live="polite">{num(items.length)} saved</p>
      </div>

      <div className="product-grid" hidden={items.length === 0}>
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      <div className="empty" hidden={items.length > 0}>
        <Icon name="heart" />
        <h3>Nothing saved yet</h3>
        <p>Tap the heart on any product to save it here for later.</p>
        <Link className="btn btn--primary" to="/shop">Browse the collection</Link>
      </div>
    </div>
  );
}
