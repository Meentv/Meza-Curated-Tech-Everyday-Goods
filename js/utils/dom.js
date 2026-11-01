/* ==========================================================================
   dom.js — tiny DOM helpers shared by every component/page.
   Design rule: strings passed as children become TEXT nodes, never HTML,
   so user-influenced values (search queries, form input) can never inject
   markup. The `html` attribute exists only for trusted, pre-built strings
   such as the icon sprite.
   ========================================================================== */

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape a string for safe insertion into innerHTML (rarely needed — see above). */
export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/**
 * h('button', { class: 'btn', type: 'button', on: { click: fn } }, 'Label', node)
 * attrs: class | dataset | on{event:fn} | html (trusted only) | any attribute
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key === 'on') for (const [evt, fn] of Object.entries(value)) el.addEventListener(evt, fn);
    else if (key === 'html') el.innerHTML = value; // trusted markup only (icons)
    else el.setAttribute(key, value === true ? '' : String(value));
  }
  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false || child === true) continue;
    el.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
}

/** Inline SVG icon from the sprite: icon('bag') → <svg class="icon">…#i-bag…</svg> */
export const icon = (name, cls = 'icon') =>
  `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="assets/icons/icons.svg#i-${name}"></use></svg>`;
