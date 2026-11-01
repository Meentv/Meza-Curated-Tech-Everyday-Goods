/* ==========================================================================
   checkout.js (page) — SIMULATED checkout.

   - Renders the order summary from the cart (available items only).
   - Validates the contact/shipping form locally (required fields, email
     format, phone digit count). Errors show inline + in a summary box;
     the first invalid field is focused. Invalid submit never navigates.
   - On valid submit: builds a demo order (utils/order.js), stores it in
     localStorage["meza:v1:lastOrder"], CLEARS THE CART, and navigates to
     order-success.html. No payment fields exist; nothing is transmitted.
   ========================================================================== */

import { h, icon, $, $$ } from '../utils/dom.js';
import { money } from '../utils/format.js';
import { write } from '../utils/storage.js';
import { getCartEntries, getSubtotal, shippingFor, clearCart } from '../utils/cart.js';
import { buildDemoOrder } from '../utils/order.js';

/* Demo list of countries for the select (kept short on purpose). */
const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Canada', 'Germany'];

/* Validation rules: key → input selector + test + message. */
const RULES = {
  name:    { sel: '#co-name',    test: (v) => v.trim().length >= 2,  msg: 'Enter your full name' },
  email:   { sel: '#co-email',   test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: 'Enter a valid email address (e.g. you@example.com)' },
  phone:   { sel: '#co-phone',   test: (v) => /^[+()\-.\s\d]+$/.test(v.trim()) && (v.match(/\d/g) || []).length >= 7, msg: 'Enter a valid phone number (at least 7 digits)' },
  address: { sel: '#co-address', test: (v) => v.trim().length >= 6,  msg: 'Enter your street address' },
  city:    { sel: '#co-city',    test: (v) => v.trim().length >= 2,  msg: 'Enter your city' },
  state:   { sel: '#co-state',   test: (v) => v.trim().length >= 2,  msg: 'Enter your state / region' },
  country: { sel: '#co-country', test: (v) => v !== '',              msg: 'Select your country' },
};

export function init() {
  // Country options
  const select = $('[data-countries]');
  for (const c of COUNTRIES) select.append(h('option', { value: c }, c));

  // Only AVAILABLE items can be checked out
  const entries = getCartEntries().filter((e) => e.product.availability === 'in-stock');
  if (entries.length === 0) {
    $('[data-checkout-layout]').hidden = true;
    $('[data-empty]').hidden = false;
    return;
  }
  renderSummary(entries);
  wireForm(entries);
}

function renderSummary(entries) {
  const subtotal = getSubtotal();
  const shipping = shippingFor(subtotal);
  $('[data-summary-items]').replaceChildren(...entries.map(({ product, qty }) =>
    h('div', { class: 'sum-item' },
      h('img', { src: product.images[0], alt: '', width: '96', height: '96', loading: 'lazy' }),
      h('div', {},
        h('p', { class: 'sum-item__name' }, product.name),
        h('p', { class: 'sum-item__qty muted' }, `Qty ${qty} × ${money(product.price)}`)),
      h('span', { class: 'sum-item__total' }, money(product.price * qty)))));
  $('[data-subtotal]').textContent = money(subtotal);
  $('[data-shipping]').textContent = shipping === 0 ? 'Free' : money(shipping);
  $('[data-total]').textContent = money(subtotal + shipping);
}

/* Validate one field; returns error message or null. */
function validateField(key) {
  const rule = RULES[key];
  const input = $(rule.sel);
  const value = input.value;
  return rule.test(value) ? null : rule.msg;
}

function paintFieldError(key, msg) {
  const input = $(RULES[key].sel);
  const error = $(`${RULES[key].sel}-error`);
  if (msg) {
    error.textContent = msg;
    error.classList.add('is-visible');
    input.setAttribute('aria-invalid', 'true');
  } else {
    error.textContent = '';
    error.classList.remove('is-visible');
    input.removeAttribute('aria-invalid');
  }
}

function wireForm(entries) {
  const form = $('[data-checkout-form]');
  let attempted = false; // only live-revalidate after the first submit attempt

  // Live: once the user tried to submit, re-validate a field as they fix it
  for (const key of Object.keys(RULES)) {
    $(RULES[key].sel).addEventListener('input', () => { if (attempted) paintFieldError(key, validateField(key)); });
    $(RULES[key].sel).addEventListener('change', () => { if (attempted) paintFieldError(key, validateField(key)); });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // always handle submission ourselves
    attempted = true;

    const errors = Object.keys(RULES)
      .map((key) => ({ key, msg: validateField(key) }))
      .filter((x) => x.msg);

    for (const { key, msg } of errors) paintFieldError(key, msg);

    const summaryBox = $('[data-form-errors]');
    if (errors.length > 0) {
      // Error summary with anchor links to each invalid field
      const list = $('[data-form-errors-list]');
      list.replaceChildren(...errors.map(({ key, msg }) =>
        h('li', {}, h('a', { href: RULES[key].sel }, `${RULES[key].sel.replace('#co-', '').replace('-', ' ')}: ${msg}`))));
      summaryBox.hidden = false;
      summaryBox.scrollIntoView({ block: 'center' });
      $(RULES[errors[0].key].sel).focus(); // move focus to first invalid field
      return; // stop — do NOT place an order
    }

    summaryBox.hidden = true;
    placeDemoOrder(entries);
  });
}

/** Build + store the demo order, clear the cart, go to the confirmation page. */
function placeDemoOrder(entries) {
  const customer = {
    name: $('#co-name').value.trim(),
    email: $('#co-email').value.trim(),
    phone: $('#co-phone').value.trim(),
    address: $('#co-address').value.trim(),
    city: $('#co-city').value.trim(),
    state: $('#co-state').value.trim(),
    country: $('#co-country').value,
  };
  const subtotal = getSubtotal();
  const shipping = shippingFor(subtotal);
  const order = buildDemoOrder({ entries, customer, subtotal, shipping });
  write('lastOrder', order);   // meza:v1:lastOrder
  clearCart();                 // cart empties after "placing" the demo order
  location.href = 'order-success.html';
}
