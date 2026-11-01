/* ==========================================================================
   navbar.js — announcement bar + sticky header + mobile menu.
   Mounted once per page by main.js into <div data-mount="navbar">.
   Cart/wishlist badges update live via the change events from utils/.
   ========================================================================== */

import { h, icon } from '../utils/dom.js';
import { money } from '../utils/format.js';
import { getCartCount, onCartChange, SHIPPING_RULE } from '../utils/cart.js';
import { getWishlistCount, onWishlistChange } from '../utils/wishlist.js';

const LINKS = [
  { page: 'home',  label: 'Home',  href: 'index.html' },
  { page: 'shop',  label: 'Shop',  href: 'shop.html' },
  { page: 'about', label: 'About', href: 'about.html' },
];

export function mountNavbar(mount) {
  if (!mount) return;
  const current = document.body.dataset.page || '';

  // --- badges -------------------------------------------------------------
  const cartBadge = h('span', { class: 'badge', hidden: true });
  const wishBadge = h('span', { class: 'badge', hidden: true });
  const cartLink = h('a', { class: 'icon-btn', href: 'cart.html', 'aria-label': 'Cart, 0 items', html: icon('bag') }, cartBadge);
  const wishLink = h('a', { class: 'icon-btn', href: 'wishlist.html', 'aria-label': 'Wishlist, 0 items', html: icon('heart') }, wishBadge);

  function updateBadges() {
    const c = getCartCount(), w = getWishlistCount();
    cartBadge.textContent = c; cartBadge.hidden = c === 0;
    cartLink.setAttribute('aria-label', `Cart, ${c} item${c === 1 ? '' : 's'}`);
    wishBadge.textContent = w; wishBadge.hidden = w === 0;
    wishLink.setAttribute('aria-label', `Wishlist, ${w} item${w === 1 ? '' : 's'}`);
  }
  onCartChange(updateBadges);
  onWishlistChange(updateBadges);
  updateBadges();

  // --- links (desktop inline, mobile in the dropdown) ---------------------
  const linkEl = (l, cls) => h('a', {
    class: cls, href: l.href,
    ...(l.page === current ? { 'aria-current': 'page' } : {}),
  }, l.label);

  // --- mobile menu ----------------------------------------------------------
  const burger = h('button', {
    class: 'icon-btn nav__burger', type: 'button',
    'aria-label': 'Open menu', 'aria-expanded': 'false', 'aria-controls': 'mobile-menu',
    html: icon('menu'),
  });
  const mobileMenu = h('nav', {
    class: 'nav__mobile', id: 'mobile-menu', 'aria-label': 'Mobile', hidden: true,
  }, LINKS.map((l) => linkEl(l, 'nav__mobile-link')));

  function setMenu(open) {
    mobileMenu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burger.innerHTML = icon(open ? 'close' : 'menu');
  }
  burger.addEventListener('click', () => setMenu(mobileMenu.hidden));
  mobileMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mobileMenu.hidden) { setMenu(false); burger.focus(); } });

  // --- assemble -------------------------------------------------------------
  const header = h('div', { class: 'nav-wrap' },
    h('div', { class: 'announce' },
      `Free shipping over ${money(SHIPPING_RULE.freeAbove)} — demo store`),
    h('header', { class: 'nav' },
      h('div', { class: 'container nav__inner' },
        h('a', { class: 'nav__logo', href: 'index.html', 'aria-label': 'Meza — home' }, 'Meza', h('span', { class: 'nav__logo-dot' }, '.')),
        h('nav', { class: 'nav__links', 'aria-label': 'Primary' }, LINKS.map((l) => linkEl(l, 'nav__link'))),
        h('div', { class: 'nav__actions' },
          h('a', { class: 'icon-btn', href: 'shop.html', 'aria-label': 'Search the shop', html: icon('search') }),
          wishLink,
          cartLink,
          burger))),
    mobileMenu);

  // replace the placeholder so the real <header> lands in the document
  mount.replaceWith(header);
}
