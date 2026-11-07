/* ==========================================================================
   Footer — shared site footer. Category links deep-link into the shop
   filters (?cat=…), so the footer doubles as a sitemap.
   ========================================================================== */

import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { CATEGORIES } from '../data/products.js';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link className="footer__logo" to="/">
            Meza<span className="nav__logo-dot">.</span>
          </Link>
          <p className="footer__tag">
            Curated tech &amp; everyday goods. A fictional demo storefront built to demonstrate a
            complete vanilla-JS shopping experience — no real orders are ever placed.
          </p>
          <p className="footer__demo">
            <Icon name="shield" /> Demo checkout: no payment is collected.
          </p>
        </div>

        <nav aria-label="Shop categories">
          <h4>Shop</h4>
          <ul className="footer__links">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link to={`/shop?cat=${encodeURIComponent(c)}`}>{c}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Store">
          <h4>Store</h4>
          <ul className="footer__links">
            <li><Link to="/shop">All products</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/about">About Meza</Link></li>
          </ul>
        </nav>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© {year} Meza — fictional demo store</span>
          <span>Built with vanilla HTML, CSS &amp; JavaScript ES modules</span>
        </div>
      </div>
    </footer>
  );
}
