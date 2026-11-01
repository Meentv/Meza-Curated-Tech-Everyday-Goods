/* ==========================================================================
   footer.js — shared site footer, mounted by main.js into
   <div data-mount="footer">. Category links deep-link into shop.html
   filters (?cat=…), so the footer doubles as a sitemap.
   ========================================================================== */

import { h, icon } from '../utils/dom.js';
import { CATEGORIES } from '../data/products.js';

export function mountFooter(mount) {
  if (!mount) return;

  const year = new Date().getFullYear();

  const footer = h('footer', { class: 'footer' },
    h('div', { class: 'container footer__inner' },
      h('div', { class: 'footer__brand' },
        h('a', { class: 'footer__logo', href: 'index.html' }, 'Meza', h('span', { class: 'nav__logo-dot' }, '.')),
        h('p', { class: 'footer__tag' },
          'Curated tech & everyday goods. A fictional demo storefront built to demonstrate a complete vanilla-JS shopping experience — no real orders are ever placed.'),
        h('p', { class: 'footer__demo' }, h('span', { html: icon('shield') }), ' Demo checkout: no payment is collected.')),
      h('nav', { 'aria-label': 'Shop categories' },
        h('h4', {}, 'Shop'),
        h('ul', { class: 'footer__links' },
          CATEGORIES.map((c) =>
            h('li', {}, h('a', { href: `shop.html?cat=${encodeURIComponent(c)}` }, c))))),
      h('nav', { 'aria-label': 'Store' },
        h('h4', {}, 'Store'),
        h('ul', { class: 'footer__links' },
          h('li', {}, h('a', { href: 'shop.html' }, 'All products')),
          h('li', {}, h('a', { href: 'wishlist.html' }, 'Wishlist')),
          h('li', {}, h('a', { href: 'cart.html' }, 'Cart')),
          h('li', {}, h('a', { href: 'about.html' }, 'About Meza'))))),
    h('div', { class: 'footer__bottom' },
      h('div', { class: 'container footer__bottom-inner' },
        h('span', {}, `© ${year} Meza — fictional demo store`),
        h('span', {}, 'Built with vanilla HTML, CSS & JavaScript ES modules'))));

  mount.replaceWith(footer);
}
