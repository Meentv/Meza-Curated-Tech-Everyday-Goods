/* ==========================================================================
   Checkout — SIMULATED checkout.

   - Renders the order summary from the cart (available items only).
   - Validates the contact/shipping form locally (required fields, email
     format, phone digit count). Errors show inline + in a summary box;
     the first invalid field is focused. Invalid submit never navigates.
   - On valid submit: builds a demo order (lib/order.js), stores it in
     localStorage["meza:v1:lastOrder"], CLEARS THE CART, and goes to the
     order-success route. No payment fields exist; nothing is transmitted.
   ========================================================================== */

import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Crumbs from '../components/Crumbs.jsx';
import { money } from '../lib/format.js';
import { asset } from '../lib/asset.js';
import { write } from '../lib/storage.js';
import { getCartEntries, getSubtotal, shippingFor, clearCart } from '../lib/cart.js';
import { buildDemoOrder } from '../lib/order.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useCartEntries } from '../hooks/useCart.js';

/* Demo list of countries for the select (kept short on purpose). */
const COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Canada', 'Germany'];

/* Validation rules: key → stored field + test + message. */
const RULES = {
  name:    { test: (v) => v.trim().length >= 2,  msg: 'Enter your full name' },
  email:   { test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: 'Enter a valid email address (e.g. you@example.com)' },
  phone:   { test: (v) => /^[+()\-.\s\d]+$/.test(v.trim()) && (v.match(/\d/g) || []).length >= 7, msg: 'Enter a valid phone number (at least 7 digits)' },
  address: { test: (v) => v.trim().length >= 6,  msg: 'Enter your street address' },
  city:    { test: (v) => v.trim().length >= 2,  msg: 'Enter your city' },
  state:   { test: (v) => v.trim().length >= 2,  msg: 'Enter your state / region' },
  country: { test: (v) => v !== '',              msg: 'Select your country' },
};

const EMPTY_FORM = { name: '', email: '', phone: '', address: '', city: '', state: '', country: '' };

export default function Checkout() {
  usePageMeta(
    'Checkout (demo) — Meza',
    'Demo checkout on Meza — a fictional storefront. No payment is collected.',
  );

  // Only AVAILABLE items can be checked out.
  const available = useCartEntries().filter((e) => e.product.availability === 'in-stock');
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const attempted = useRef(false);
  const summaryRef = useRef(null);
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const shipping = shippingFor(subtotal);
  const hasItems = available.length > 0;

  const setField = (key) => (e) => {
    const { value } = e.target;
    setForm((f) => ({ ...f, [key]: value }));
    if (attempted.current) {
      setErrors((errs) => ({ ...errs, [key]: RULES[key].test(value) ? undefined : RULES[key].msg }));
    }
  };

  const validateAll = () => {
    const next = {};
    for (const key of Object.keys(RULES)) {
      if (!RULES[key].test(form[key])) next[key] = RULES[key].msg;
    }
    return next;
  };

  const onSubmit = (e) => {
    e.preventDefault(); // always handle submission ourselves
    attempted.current = true;

    const found = validateAll();
    setErrors(found);

    const keys = Object.keys(found);
    if (keys.length > 0) {
      // Scroll the summary box into view, then move focus to the first
      // invalid field — the same order of operations as before.
      requestAnimationFrame(() => {
        summaryRef.current?.scrollIntoView({ block: 'center' });
        document.getElementById(`co-${keys[0]}`)?.focus();
      });
      return; // stop — do NOT place an order
    }

    placeDemoOrder();
  };

  /** Build + store the demo order, clear the cart, go to the confirmation page. */
  const placeDemoOrder = () => {
    const customer = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country,
    };
    const order = buildDemoOrder({ entries: available, customer, subtotal, shipping });
    write('lastOrder', order);   // meza:v1:lastOrder
    clearCart();                 // cart empties after "placing" the demo order
    navigate('/order-success');
  };

  const errorKeys = Object.keys(errors).filter((k) => errors[k]);

  return (
    <div className="container">
      <Crumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: 'Cart', to: '/cart' },
          { label: 'Checkout' },
        ]}
      />

      <div className="page-head">
        <h1>Checkout</h1>
        <p className="muted">Demo checkout — nothing you enter leaves this browser.</p>
      </div>

      {/* Prominent demo notice */}
      <div className="demo-note" role="note">
        <Icon name="shield" />
        <p>
          <strong>Demo checkout.</strong> Meza is a fictional storefront: this form is validated
          locally, <strong>No payment details are collected</strong> (there are no payment
          fields), and the "order" is stored only in this browser's localStorage. Nothing is
          transmitted.
        </p>
      </div>

      <div className="checkout-layout" hidden={!hasItems}>
        {/* Form */}
        <form id="checkout-form" onSubmit={onSubmit} noValidate>
          <div className="form-errors" role="alert" hidden={errorKeys.length === 0} ref={summaryRef}>
            <h2>Please fix the following:</h2>
            <ul style={{ display: 'grid', gap: 'var(--space-1)', paddingLeft: 'var(--space-4)', listStyle: 'disc' }}>
              {errorKeys.map((key) => (
                <li key={key}>
                  <a href={`#co-${key}`}>
                    {key.replace('-', ' ')}: {errors[key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <h2 className="checkout__section">Contact</h2>
          <div className="form-grid">
            <Field
              id="co-name" label="Full name" name="name" autoComplete="name"
              value={form.name} onChange={setField('name')} error={errors.name}
            />
            <Field
              id="co-email" label="Email" name="email" type="email" autoComplete="email"
              value={form.email} onChange={setField('email')} error={errors.email}
            />
            <Field
              id="co-phone" label="Phone" name="phone" type="tel" autoComplete="tel"
              inputMode="tel" placeholder="+234…"
              value={form.phone} onChange={setField('phone')} error={errors.phone}
            />
          </div>

          <h2 className="checkout__section">Shipping address</h2>
          <div className="form-grid">
            <Field
              id="co-address" label="Street address" name="address" autoComplete="street-address"
              full value={form.address} onChange={setField('address')} error={errors.address}
            />
            <Field
              id="co-city" label="City" name="city" autoComplete="address-level2"
              value={form.city} onChange={setField('city')} error={errors.city}
            />
            <Field
              id="co-state" label="State / region" name="state" autoComplete="address-level1"
              value={form.state} onChange={setField('state')} error={errors.state}
            />
            <div className="field">
              <label className="field__label" htmlFor="co-country">
                Country <span className="field__req" aria-hidden="true">*</span>
              </label>
              <select
                className="field__input field__select"
                id="co-country"
                name="country"
                autoComplete="country-name"
                required
                aria-describedby="co-country-error"
                aria-invalid={errors.country ? 'true' : undefined}
                value={form.country}
                onChange={setField('country')}
              >
                <option value="">Select country…</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className={`field__error${errors.country ? ' is-visible' : ''}`} id="co-country-error">
                {errors.country}
              </p>
            </div>
          </div>

          <button
            className="btn btn--primary btn--block"
            type="submit"
            style={{ marginTop: 'var(--space-2)' }}
          >
            Place demo order
            <Icon name="arrow-right" />
          </button>
          <p className="field__hint" style={{ marginTop: 'var(--space-2)', textAlign: 'center' }}>
            Simulated checkout — no payment is processed.{' '}
            <Link className="link-arrow" to="/cart">Back to cart</Link>
          </p>
        </form>

        {/* Summary */}
        <aside className="summary" aria-label="Order summary">
          <h2>Order summary</h2>
          <div className="summary__items">
            {available.map(({ product, qty }) => (
              <div className="sum-item" key={product.id}>
                <img
                  src={asset(product.images[0])}
                  alt=""
                  width="96"
                  height="96"
                  loading="lazy"
                />
                <div>
                  <p className="sum-item__name">{product.name}</p>
                  <p className="sum-item__qty muted">Qty {qty} × {money(product.price)}</p>
                </div>
                <span className="sum-item__total">{money(product.price * qty)}</span>
              </div>
            ))}
          </div>
          <div className="summary__row"><span className="muted">Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="summary__row">
            <span className="muted">Shipping (demo)</span>
            <span>{shipping === 0 ? 'Free' : money(shipping)}</span>
          </div>
          <div className="summary__row summary__total"><span>Total</span><span>{money(subtotal + shipping)}</span></div>
        </aside>
      </div>

      {/* Empty cart guard */}
      <div className="empty" hidden={hasItems}>
        <Icon name="bag" />
        <h3>Nothing to check out</h3>
        <p>Your cart is empty (or everything in it is currently unavailable).</p>
        <Link className="btn btn--primary" to="/shop">Browse the collection</Link>
      </div>
    </div>
  );
}

/** One labelled text input + its inline error, matching the original markup. */
function Field({ id, label, name, type = 'text', autoComplete, inputMode, placeholder, value, onChange, error, full = false }) {
  return (
    <div className={`field${full ? ' field--full' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label} <span className="field__req" aria-hidden="true">*</span>
      </label>
      <input
        className="field__input"
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        required
        aria-describedby={`${id}-error`}
        aria-invalid={error ? 'true' : undefined}
        value={value}
        onChange={onChange}
      />
      <p className={`field__error${error ? ' is-visible' : ''}`} id={`${id}-error`}>{error}</p>
    </div>
  );
}
