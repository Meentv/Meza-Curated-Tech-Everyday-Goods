/* ==========================================================================
   toast.js — small non-blocking notifications ("Added to cart…").
   A single aria-live region is created once; toasts stack (max 3) and
   remove themselves after ~3s.
   ========================================================================== */

import { h, icon } from '../utils/dom.js';

let region = null;

export function initToasts() {
  if (region) return;
  region = h('div', { class: 'toast-region', role: 'status', 'aria-live': 'polite' });
  document.body.append(region);
}

/** toast('Added to cart', 'success' | 'info' | 'error') */
export function toast(message, type = 'info') {
  if (!region) initToasts();
  const iconName = type === 'error' ? 'alert' : type === 'success' ? 'check' : 'sparkle';
  const el = h(
    'div',
    { class: `toast toast--${type}`, html: icon(iconName) },
    h('span', {}, message)
  );
  region.append(el);
  while (region.children.length > 3) region.firstElementChild.remove();
  setTimeout(() => {
    el.classList.add('toast--out');
    setTimeout(() => el.remove(), 200);
  }, 2800);
}
