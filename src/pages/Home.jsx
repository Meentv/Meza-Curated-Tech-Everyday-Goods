/* ==========================================================================
   Home — hero, shop-by-category, featured, editorial, new arrivals,
   why-Meza values and the (simulated) newsletter form. All grids render
   from the single products data file.
   ========================================================================== */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { categoryIcon } from '../lib/categories.js';
import { asset } from '../lib/asset.js';
import { read, write } from '../lib/storage.js';
import { num } from '../lib/format.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

/* Newsletter — SIMULATED: validates the email, stores it in localStorage
   under meza:v1:newsletter, shows a success message. Nothing is sent. */
function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const value = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    if (!valid) {
      setError('Please enter a valid email address, e.g. you@example.com');
      return;
    }
    setError('');
    const list = read('newsletter', []);
    if (Array.isArray(list) && !list.includes(value)) write('newsletter', [...list, value]);
    setDone(`You're on the list — welcome! (Demo: “${value}” was stored locally only; nothing was sent.)`);
  };

  return (
    <section className="section newsletter" aria-labelledby="news-title">
      <div className="container newsletter__inner">
        <h2 id="news-title">Get the Meza letter</h2>
        <p>
          One thoughtful email a month: new arrivals and editor picks. Demo only — your address is
          stored in this browser and never sent anywhere.
        </p>
        {!done && (
          <form className="newsletter__form" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label className="field__label visually-hidden" htmlFor="nl-email">Email address</label>
              <input
                className="field__input"
                id="nl-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
                aria-describedby="nl-error"
                aria-invalid={error ? 'true' : undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className={`field__error${error ? ' is-visible' : ''}`} id="nl-error" role="alert">
                {error}
              </p>
            </div>
            <button className="btn btn--dark" type="submit">Subscribe</button>
          </form>
        )}
        {done && <p className="newsletter__ok">{done}</p>}
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta(
    'Meza — Curated Tech & Everyday Goods',
    'Meza is a fictional demo storefront for thoughtfully selected technology and everyday essentials. Vanilla HTML/CSS/JS portfolio project.',
  );

  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 8);
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 8);

  return (
    <>
      {/* 1 · HERO */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__inner">
          <div className="hero__copy">
            <p className="eyebrow">New season · New arrivals</p>
            <h1 id="hero-title">Tech that feels <em>worth it.</em></h1>
            <p className="hero__sub">
              Thoughtfully selected technology and everyday essentials, made for the way you live.
            </p>
            <div className="hero__cta">
              <Link className="btn btn--primary" to="/shop">
                Explore the collection
                <Icon name="arrow-right" />
              </Link>
              <Link className="btn btn--outline" to="/shop?sort=newest">See what’s new</Link>
            </div>
          </div>
          <div className="hero__media">
            <img
              src={asset('assets/images/products/aura-headphones.jpg')}
              alt="Silver over-ear wireless headphones photographed on a soft grey studio background"
            />
          </div>
        </div>
      </section>

      {/* 2 · SHOP BY CATEGORY */}
      <section className="section" id="categories" aria-labelledby="categories-title">
        <div className="container">
          <div className="section-head">
            <h2 id="categories-title">Shop by category</h2>
            <Link className="link-arrow" to="/shop">
              View all
              <Icon name="arrow-right" />
            </Link>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((category) => {
              const count = PRODUCTS.filter((p) => p.category === category).length;
              return (
                <Link
                  key={category}
                  className="cat-tile"
                  to={`/shop?cat=${encodeURIComponent(category)}`}
                >
                  <span className="cat-tile__icon"><Icon name={categoryIcon(category)} /></span>
                  <span className="cat-tile__name">{category}</span>
                  <span className="cat-tile__count muted">
                    {num(count)} product{count === 1 ? '' : 's'}
                  </span>
                  <span className="cat-tile__go"><Icon name="arrow-right" /> Shop</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3 · FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="section section--tight" id="featured" aria-labelledby="featured-title">
          <div className="container">
            <div className="section-head">
              <h2 id="featured-title">Featured</h2>
              <Link className="link-arrow" to="/shop?sort=featured">
                Shop featured
                <Icon name="arrow-right" />
              </Link>
            </div>
            <ProductGrid products={featured} />
          </div>
        </section>
      )}

      {/* 4 · EDITORIAL SHOWCASE (dark band) */}
      <section className="section band-dark editorial" aria-labelledby="editorial-title">
        <div className="container editorial__inner">
          <div className="editorial__media">
            <img
              src={asset('assets/images/products/roam-speaker.jpg')}
              alt="A compact black portable speaker photographed on a clean white studio background"
              width="1200"
              height="800"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="editorial__copy">
            <p className="eyebrow eyebrow--dark">The Meza edit</p>
            <h2 id="editorial-title">Fewer, better things.</h2>
            <p>
              We keep the catalog short on purpose. Every item earns its place — real specs,
              honest availability and prices you can read at a glance. No countdown timers,
              no invented reviews, no clutter.
            </p>
            <Link className="btn btn--primary" to="/about">Read our story</Link>
          </div>
        </div>
      </section>

      {/* 5 · NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="section" id="new" aria-labelledby="new-title">
          <div className="container">
            <div className="section-head">
              <h2 id="new-title">New arrivals</h2>
              <Link className="link-arrow" to="/shop?sort=newest">
                Shop new
                <Icon name="arrow-right" />
              </Link>
            </div>
            <ProductGrid products={newArrivals} />
          </div>
        </section>
      )}

      {/* 6 · WHY MEZA */}
      <section className="section section--tight" aria-labelledby="why-title">
        <div className="container">
          <div className="section-head"><h2 id="why-title">Why Meza</h2></div>
          <div className="values">
            <div className="value">
              <Icon name="sparkle" />
              <div>
                <h3>Curated, not cluttered</h3>
                <p>
                  A short list where every product was chosen deliberately — and can be removed
                  just as deliberately.
                </p>
              </div>
            </div>
            <div className="value">
              <Icon name="check" />
              <div>
                <h3>Transparent by default</h3>
                <p>
                  Full specs, real availability and clear prices on every page. No fake ratings
                  or sales figures.
                </p>
              </div>
            </div>
            <div className="value">
              <Icon name="shield" />
              <div>
                <h3>Honest demo storefront</h3>
                <p>
                  Checkout is clearly labeled as a simulation — no payment is collected and no
                  real order is placed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 · NEWSLETTER (simulated) */}
      <Newsletter />
    </>
  );
}
