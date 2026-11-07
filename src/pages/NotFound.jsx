/* NotFound — unknown route / invalid product id. */

import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function NotFound() {
  usePageMeta(
    'Page not found — Meza',
    'This page does not exist on Meza (a fictional demo storefront).',
  );

  return (
    <div className="container">
      <div className="empty" style={{ marginBlock: 'var(--space-8)' }}>
        <p className="eyebrow">404</p>
        <h1 style={{ fontSize: 'var(--text-3xl)' }}>This page doesn’t exist</h1>
        <p>The link may be broken, or the product you were looking for is not in the collection.</p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn--primary" to="/">Back to home</Link>
          <Link className="btn btn--outline" to="/shop">Browse the shop</Link>
        </div>
      </div>
    </div>
  );
}
