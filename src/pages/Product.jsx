/* ==========================================================================
   Product — product detail page. Route: /product/:slug

   Unknown slug → the 404 page. Everything renders from the single products
   data file: breadcrumbs, gallery (thumbs + prev/next + arrow keys), price,
   availability, description, specs, qty, add-to-cart, wishlist and related
   products (same category).
   ========================================================================== */

import { Fragment, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Crumbs from '../components/Crumbs.jsx';
import QtyStepper from '../components/QtyStepper.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { PRODUCTS, getProductBySlug } from '../data/products.js';
import { money } from '../lib/format.js';
import { asset } from '../lib/asset.js';
import { addToCart, MAX_QTY } from '../lib/cart.js';
import { toggleWishlist } from '../lib/wishlist.js';
import { useWishlist } from '../hooks/useWishlist.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function Product() {
  const { slug = '' } = useParams();
  const product = getProductBySlug(slug);

  usePageMeta(
    product ? `${product.name} — Meza` : 'Product — Meza',
    'Product details on Meza — a fictional demo storefront.',
  );

  if (!product) return <Navigate to="/404" replace />;

  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product: p }) {
  const toast = useToast();
  const wished = useWishlist().some((item) => item.id === p.id);
  const [imageIndex, setImageIndex] = useState(0);
  const [qty, setQty] = useState(1);

  const out = p.availability !== 'in-stock';
  const flagText = out ? 'Out of stock' : p.isNew ? 'New' : p.previousPrice ? 'Sale' : null;
  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  const show = (n) => setImageIndex((n + p.images.length) % p.images.length);

  const onGalleryKeyDown = (e) => {
    if (p.images.length < 2) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(imageIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(imageIndex + 1); }
  };

  const onWishlist = () => {
    const r = toggleWishlist(p.id);
    if (!r.ok) return;
    toast(
      r.wished ? `Saved “${p.name}” to your wishlist` : `Removed “${p.name}” from your wishlist`,
      r.wished ? 'success' : 'info',
    );
  };

  const onAdd = () => {
    const r = addToCart(p.id, qty);
    if (!r.ok) {
      toast(`Sorry — “${p.name}” is currently out of stock`, 'error');
      return;
    }
    toast(`Added ${qty} × “${p.name}” to your cart`, 'success');
  };

  return (
    <div className="container">
      <Crumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: p.category, to: `/shop?cat=${encodeURIComponent(p.category)}` },
          { label: p.name },
        ]}
      />

      <div className="pdp">
        {/* Gallery */}
        <div
          className="pdp__gallery"
          tabIndex={p.images.length > 1 ? 0 : undefined}
          aria-label="Product image gallery — use left and right arrow keys"
          onKeyDown={onGalleryKeyDown}
        >
          <div className="pdp__stage">
            <img
              src={asset(p.images[imageIndex])}
              alt={`${p.name} — image ${imageIndex + 1} of ${p.images.length}`}
              width="1200"
              height="1200"
              fetchPriority="high"
            />
            <span className="badge--flag" hidden={!flagText}>{flagText}</span>
            <button
              className="pdp__nav pdp__nav--prev icon-btn"
              type="button"
              aria-label="Previous image"
              hidden={p.images.length < 2}
              onClick={() => show(imageIndex - 1)}
            >
              <Icon name="chevron-left" />
            </button>
            <button
              className="pdp__nav pdp__nav--next icon-btn"
              type="button"
              aria-label="Next image"
              hidden={p.images.length < 2}
              onClick={() => show(imageIndex + 1)}
            >
              <Icon name="chevron-right" />
            </button>
          </div>

          <div className="pdp__thumbs" role="group" aria-label="Choose image" hidden={p.images.length < 2}>
            {p.images.map((src, ti) => (
              <button
                key={src}
                className="pdp__thumb"
                type="button"
                aria-current={ti === imageIndex ? 'true' : 'false'}
                aria-label={`Show image ${ti + 1} of ${p.images.length}`}
                onClick={() => show(ti)}
              >
                <img src={asset(src)} alt="" width="200" height="200" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="pdp__info">
          <p className="card__meta muted">{p.brand} · {p.category}</p>
          <h1>{p.name}</h1>

          <p className="pdp__price">
            {p.previousPrice ? <s className="card__price-old">{money(p.previousPrice)}</s> : null}
            <span className="pdp__price-now">{money(p.price)}</span>
          </p>

          <p className={`pdp__avail ${out ? 'pdp__avail--out' : 'pdp__avail--in'}`}>
            {out ? 'Out of stock' : 'In stock'}
          </p>

          <p className="pdp__desc">{p.description}</p>

          <div className="pdp__buy">
            <QtyStepper value={qty} max={MAX_QTY} onChange={setQty} />
            <button className="btn btn--primary" type="button" disabled={out} onClick={onAdd}>
              Add to cart
              <Icon name="bag" />
            </button>
            <button
              className={`icon-btn pdp__wish${wished ? ' is-active' : ''}`}
              type="button"
              aria-pressed={wished}
              aria-label={wished ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
              onClick={onWishlist}
            >
              <Icon name="heart" />
            </button>
          </div>

          <details className="acc" open>
            <summary>
              Specifications
              <Icon name="chevron-down" />
            </summary>
            <dl className="specs acc__body">
              {p.specs.map((spec) => (
                <Fragment key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </Fragment>
              ))}
            </dl>
          </details>

          <details className="acc">
            <summary>
              Shipping &amp; demo note
              <Icon name="chevron-down" />
            </summary>
            <div className="acc__body">
              <p className="muted">
                Meza is a demo storefront: checkout is simulated and no payment is
                collected. A flat demo shipping fee applies at checkout, free above ₦150,000.
              </p>
            </div>
          </details>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="section" aria-labelledby="related-title">
          <div className="section-head"><h2 id="related-title">Related products</h2></div>
          <div className="product-grid">
            {related.map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
