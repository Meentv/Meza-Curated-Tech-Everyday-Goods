/* ==========================================================================
   main.js — shared entry point, loaded as <script type="module"> on EVERY
   page. It does two things:

   1. Mounts the shared chrome (navbar, footer, toast region) into the
      placeholder elements each page provides:
          <div data-mount="navbar"></div> … <div data-mount="footer"></div>
      (This keeps the header/footer markup in exactly one place — the same
      role a layout component plays in the future React version.)

   2. Loads the page-specific module named by <body data-page="…">:
          <body data-page="shop">  →  import('./pages/shop.js') → mod.init()
   ========================================================================== */

import { mountNavbar } from './components/navbar.js';
import { mountFooter } from './components/footer.js';
import { initToasts } from './components/toast.js';

mountNavbar(document.querySelector('[data-mount="navbar"]'));
mountFooter(document.querySelector('[data-mount="footer"]'));
initToasts();

const page = document.body.dataset.page || '';
if (/^[a-z0-9-]+$/.test(page)) {
  import(`./pages/${page}.js`)
    .then((mod) => mod.init?.())
    .catch((err) => console.error(`[meza] failed to load page module "${page}":`, err));
} else {
  console.warn('[meza] <body data-page> missing or invalid — page module not loaded');
}
