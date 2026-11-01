/* ==========================================================================
   home.js — homepage logic (loaded by main.js because <body data-page="home">).
   Renders the category tiles and the two product grids from products.js,
   and wires the (simulated) newsletter form.
   ========================================================================== */

import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { productCard } from '../components/product-card.js';
import { h, icon, $ } from '../utils/dom.js';
import { read, write } from '../utils/storage.js';
import { num } from '../utils/format.js';

/* Which sprite icon represents each category (add a mapping here if you
   add a category to products.js). */
const CATEGORY_ICONS = {
  'Audio': 'headphones',
  'Accessories': 'sparkle',
  'Smart devices': 'bolt',
  'Workspace': 'desk',
  'Everyday essentials': 'bag',
};

export function init() {
  renderCategories();
  renderGrid('[data-grid="featured"]', PRODUCTS.filter((p) => p.featured).slice(0, 8));
  renderGrid('[data-grid="new"]', PRODUCTS.filter((p) => p.isNew).slice(0, 8));
  initNewsletter();
}

/* Category tiles: icon + name + live product count, deep-linking into the
   shop page's category filter (?cat=…). */
function renderCategories() {
  const mount = $('[data-categories]');
  if (!mount) return;
  for (const category of CATEGORIES) {
    const count = PRODUCTS.filter((p) => p.category === category).length;
    mount.append(h('a', {
      class: 'cat-tile',
      href: `shop.html?cat=${encodeURIComponent(category)}`,
    },
      h('span', { class: 'cat-tile__icon', html: icon(CATEGORY_ICONS[category] ?? 'package') }),
      h('span', { class: 'cat-tile__name' }, category),
      h('span', { class: 'cat-tile__count muted' }, `${num(count)} product${count === 1 ? '' : 's'}`),
      h('span', { class: 'cat-tile__go', html: `${icon('arrow-right')} Shop` })));
  }
}

/* Render product cards into a grid hook; hide the section if empty. */
function renderGrid(selector, products) {
  const grid = $(selector);
  if (!grid) return;
  if (products.length === 0) {
    grid.closest('section')?.setAttribute('hidden', '');
    return;
  }
  grid.append(...products.map(productCard));
}

/* Newsletter — SIMULATED: validates the email, stores it in localStorage
   under meza:v1:newsletter, shows a success message. Nothing is sent. */
function initNewsletter() {
  const form = $('[data-newsletter]');
  if (!form) return;
  const input = form.querySelector('input[type="email"]');
  const error = $('#nl-error');
  const ok = $('[data-newsletter-ok]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!valid) {
      error.textContent = 'Please enter a valid email address, e.g. you@example.com';
      error.classList.add('is-visible');
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    error.classList.remove('is-visible');
    input.removeAttribute('aria-invalid');
    const list = read('newsletter', []);
    if (Array.isArray(list) && !list.includes(email)) write('newsletter', [...list, email]);
    form.hidden = true;
    ok.textContent = `You're on the list — welcome! (Demo: “${email}” was stored locally only; nothing was sent.)`;
    ok.hidden = false;
  });
}
