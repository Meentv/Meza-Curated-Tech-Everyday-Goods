/* ==========================================================================
   Navbar — announcement bar + sticky header + mobile menu.
   Cart/wishlist badges update live via the storage-backed hooks.
   ========================================================================== */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import { money } from '../lib/format.js';
import { SHIPPING_RULE } from '../lib/cart.js';
import { useCartCount } from '../hooks/useCart.js';
import { useWishlistCount } from '../hooks/useWishlist.js';

const LINKS = [
  { page: 'home',  label: 'Home',  to: '/' },
  { page: 'shop',  label: 'Shop',  to: '/shop' },
  { page: 'about', label: 'About', to: '/about' },
];

const pageForPath = (pathname) => {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/shop')) return 'shop';
  if (pathname.startsWith('/about')) return 'about';
  return '';
};

export default function Navbar() {
  const { pathname } = useLocation();
  const current = pageForPath(pathname);
  const cartCount = useCartCount();
  const wishCount = useWishlistCount();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu when navigating and on Escape.
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        document.querySelector('.nav__burger')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const navLink = (l, cls) => (
    <Link
      key={l.page}
      className={cls}
      to={l.to}
      {...(l.page === current ? { 'aria-current': 'page' } : {})}
    >
      {l.label}
    </Link>
  );

  return (
    <div className="nav-wrap">
      <div className="announce">
        Free shipping over {money(SHIPPING_RULE.freeAbove)} — demo store
      </div>

      <header className="nav">
        <div className="container nav__inner">
          <Link className="nav__logo" to="/" aria-label="Meza — home">
            Meza<span className="nav__logo-dot">.</span>
          </Link>

          <nav className="nav__links" aria-label="Primary">
            {LINKS.map((l) => navLink(l, 'nav__link'))}
          </nav>

          <div className="nav__actions">
            <Link className="icon-btn" to="/shop" aria-label="Search the shop">
              <Icon name="search" />
            </Link>
            <Link
              className="icon-btn"
              to="/wishlist"
              aria-label={`Wishlist, ${wishCount} item${wishCount === 1 ? '' : 's'}`}
            >
              <Icon name="heart" />
              <span className="badge" hidden={wishCount === 0}>{wishCount}</span>
            </Link>
            <Link
              className="icon-btn"
              to="/cart"
              aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            >
              <Icon name="bag" />
              <span className="badge" hidden={cartCount === 0}>{cartCount}</span>
            </Link>
            <button
              className="icon-btn nav__burger"
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
      </header>

      <nav className="nav__mobile" id="mobile-menu" aria-label="Mobile" hidden={!menuOpen}>
        {LINKS.map((l) => navLink(l, 'nav__mobile-link'))}
      </nav>
    </div>
  );
}
