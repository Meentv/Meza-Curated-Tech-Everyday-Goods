# Meza — Curated Tech & Everyday Goods

**Meza** is a fictional premium e-commerce storefront built as a portfolio
project: product discovery, search/filter/sort, product details, cart,
wishlist and a **clearly-labeled demo checkout**.

> **Demo notice:** Meza is a demonstration storefront. Checkout is simulated —
> no payment is collected, no order is transmitted, and all products,
> brands and prices are fictional.

## Tech stack

- HTML5, CSS3, Vanilla JavaScript (ES6+ modules)
- **No frameworks, no build tools, no runtime dependencies**
- Data-driven rendering from one centralized data file (`js/data/products.js`)
- `localStorage` for cart / wishlist / demo-order persistence
- Layout with Flexbox & Grid; mobile-first, tested at 375 / 390 / 768 / 1024 / 1440px

## Quick start (important)

ES modules **cannot run from `file://`** — browsers block them over the file
protocol. Always serve the folder over HTTP:

```bash
cd meza
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static host works for deployment (GitHub Pages, Vercel, Netlify) — see
**Deployment** below.

## Project structure

```
meza/
├── index.html  shop.html  product.html  cart.html  wishlist.html
├── checkout.html  order-success.html  about.html  404.html
├── README.md            ← this file
├── STATUS.md            ← phase-by-phase build log
├── .gitignore
├── css/
│   ├── styles.css       ← design tokens (:root), reset, base, utilities, .icon
│   ├── components.css   ← navbar, cards, buttons, forms, drawer, toast… (mobile-first)
│   └── responsive.css   ← ALL min-width media queries, grouped by breakpoint
├── js/
│   ├── main.js          ← shared entry on every page; mounts navbar/footer/toasts into
│   │                      [data-mount] placeholders, then dynamic-imports the current
│   │                      page module via <body data-page="…">
│   ├── data/products.js ← the single source of truth for all products
│   ├── utils/
│   │   ├── storage.js   ← safe JSON localStorage wrapper (versioned keys)
│   │   ├── cart.js      ← cart logic + totals + change events
│   │   ├── wishlist.js  ← wishlist logic + change events
│   │   ├── catalog.js   ← PURE search/filter/sort functions (no DOM; unit-tested)
│   │   ├── format.js    ← currency (NGN) & date formatting — one place to change
│   │   └── dom.js       ← $, $$, element builder, escapeHtml
│   ├── components/
│   │   ├── navbar.js  footer.js  product-card.js  toast.js
│   │   └── …mounted by main.js into <div data-mount="navbar|footer"> placeholders on each page
│   └── pages/
│       └── home.js  shop.js  product.js  cart.js  wishlist.js
│           checkout.js  order-success.js
├── assets/
│   ├── icons/icons.svg  ← inline icon sprite (usage documented inside)
│   └── images/          ← hero, editorial, products/ (all local, no hotlinks)
└── tests/               ← dev-only Node tests (node:test, zero dependencies)
```

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Announcement bar, hero, shop-by-category, featured, new arrivals, editorial showcase, Why-Meza, newsletter, footer |
| `shop.html` | Grid + count + search + category/brand/price-range/availability filters + sort + clear-all + empty state. State synced to the URL (`?q=&cat=&brand=&min=&max=&avail=&sort=`) |
| `product.html?id=<slug>` | Gallery, brand, price/previous price, description, specs, availability, qty, add-to-cart, wishlist, related, breadcrumbs |
| `cart.html` | Line items, qty steppers, remove, subtotal/total, empty state, checkout CTA |
| `wishlist.html` | Saved items, remove, move-to-cart, empty state |
| `checkout.html` | Validated contact/shipping form + order summary (subtotal, demo shipping, total) + **Place demo order** |
| `order-success.html` | Demo confirmation: reference, items, total — labeled as a demonstration |
| `about.html` | Brand story (fictional, no fake social-proof claims) |
| `404.html` | Unknown page / invalid product id |

## Features

<!-- [TODO Phase 3+] tick off as implemented & tested; see STATUS.md / TESTING.md -->

- [x] Data-driven product catalog (15 fictional products, 5 categories, 5 fictional brands)
- [x] Search across name / brand / category / description
- [x] Composable filters: category, brand, min/max price, availability
- [x] Sorting: featured, newest, price ↑, price ↓ (URL-synced, refresh/share restores state)
- [x] Product detail pages with gallery, specs, qty selector, related products, breadcrumbs
- [x] Cart: add / remove / qty / totals, persisted in localStorage, badge count, out-of-stock handling
- [x] Wishlist: toggle / remove / add-to-cart from card, persisted, badge count
- [x] Demo checkout with validation + order confirmation (simulated, labeled, no payment fields)
- [x] Newsletter form with email validation (simulated, stored locally)
- [ ] Responsive mobile navigation, active-page indication, breadcrumbs
- [ ] Accessibility: semantic HTML, skip link, focus states, aria labels/errors, keyboard support

## Simulated functionality (read before demoing)

| Feature | What actually happens |
|---|---|
| Checkout / "Place demo order" | Validates the form, generates a local demo reference (e.g. `MZA-DEMO-XXXXXX`), saves the order to `localStorage["meza:v1:lastOrder"]`, clears the cart, shows `order-success.html`. **No payment, no network call, no real order.** |
| Shipping cost | Fixed demo rule: flat ₦2,500, free over ₦150,000 subtotal (constant in `js/pages/checkout.js`). |
| Newsletter | Validates the email and stores it in `localStorage["meza:v1:newsletter"]`. Nothing is sent anywhere. |

## Adding / editing products

Edit `js/data/products.js` only — every page (home, shop, product, cart,
wishlist, related) renders from that file. Give each product a unique
`slug` (used in `product.html?id=`), at least one image in
`assets/images/products/`, and keep copy fictional with no review/sales/
warranty claims. See the schema comment at the top of that file.

## Testing

```bash
cd meza
python3 -m http.server 8000     # serve the site (ES modules require HTTP)
npm test                        # unit tests — plain `node --test` (no args: portable across
                                # Node versions & shells, scans for *.test.* automatically)
npm install                     # ONLY for the browser e2e suites (playwright, dev-only)
node tests/e2e.smoke.mjs        # homepage + shop interactions
node tests/e2e.pages.mjs        # product / cart / wishlist / 404 / about
node tests/e2e.checkout.mjs     # demo checkout + order confirmation
node tests/e2e.links.mjs        # full link crawl + image load + a11y audit
```

- Unit tests (`npm test`, 33 tests) cover the pure logic: catalog search/filter/sort,
  cart/wishlist math with a localStorage mock, NGN formatting, demo-order builder,
  plus audits that every product field is valid, every referenced asset exists on disk,
  and no banned claim vocabulary appears in product copy.
- The e2e suites drive real headless Chromium against the local server and save
  screenshots to `tests/shots/`. Full results mapped to the spec's checklist: **TESTING.md**.
- Last run (2026-11-01): **33/33 unit tests pass; all four e2e suites pass** (shop
  interactions, PDP/cart/wishlist, checkout flow, 30-page link/image/a11y crawl),
  zero console errors, no horizontal overflow at 375/390/768/1024/1440.

## Deployment

<!-- [TODO Phase 9] -->

The site is plain static files — deploy the `meza/` folder as-is:

- **GitHub Pages:** push to a repo, Settings → Pages → deploy from `main`
  (root). ES modules work fine over Pages' HTTPS.
- **Vercel / Netlify:** import the repo, no build command needed
  (or `python3 -m http.server` style static output).

## Limitations

- Demo storefront: fictional products/prices, no backend, no real payments.
- Product/hero imagery is AI-generated and stored locally so every reference
  works offline; swap in real photography by replacing files under
  `assets/images/` (keep the filenames referenced in `products.js`).
- Cart/wishlist live in the visitor's browser only.

## Versioning note

Version 1 is intentionally framework-free and modular so it can be compared
side-by-side with a future React rebuild (Version 2): `data/` + `utils/`
map to data/state layers, `components/` to React components, `pages/` to
routes.
