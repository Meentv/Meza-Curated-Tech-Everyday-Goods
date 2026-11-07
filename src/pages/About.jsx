/* About — brand story. All copy is static. */

import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function About() {
  usePageMeta(
    'About Meza — Curated Tech & Everyday Goods',
    'The story behind Meza, a fictional demo storefront for curated tech and everyday goods.',
  );

  return (
    <div className="container about">
      <div className="page-head">
        <p className="eyebrow">About Meza</p>
        <h1>Curated tech &amp; everyday goods.</h1>
      </div>

      <div className="about__grid">
        <div>
          <h2>Fewer, better things</h2>
          <p>
            Meza started with a simple idea: most catalogs are noise. We keep a short
            list of technology and everyday essentials and give each one room to be
            understood — real specifications, honest availability and a clear price.
          </p>
          <p>
            Every product page tells you what the item is, what it does and what it
            is made of. There are no countdown timers, no invented review scores and
            no inflated "best seller" badges — just the details you'd want before
            deciding.
          </p>
        </div>
        <div>
          <h2>A demo storefront, honestly labeled</h2>
          <p>
            Meza is a fictional store built as a frontend portfolio project. Products,
            brands and prices are invented; the cart and wishlist live in your browser's
            localStorage; and checkout is a simulation — no payment is collected and
            no order is ever transmitted.
          </p>
          <p>
            This site is built with vanilla HTML, CSS and JavaScript ES modules — no
            frameworks, no build step — so the code stays readable and maintainable.
          </p>
          <p style={{ marginTop: 'var(--space-5)' }}>
            <Link className="btn btn--primary" to="/shop">
              Browse the collection
              <Icon name="arrow-right" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
