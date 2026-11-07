# Meza — Curated Tech & Everyday Goods

**Meza** is a fictional premium e-commerce storefront built as a portfolio
project: product discovery, search/filter/sort, product details, cart,
wishlist and a **clearly-labeled demo checkout**.

> **Demo notice:** Meza is a demonstration storefront. Checkout is simulated —
> no payment is collected, no order is transmitted, and all products,
> brands and prices are fictional.

## Tech stack

- **React 19** + **React Router 7** (client-side routes)
- **Vite 8** for the dev server and production build
- Plain CSS (unchanged design system: tokens, components, pages, responsive)
- Data-driven rendering from one centralized data file (`src/data/products.js`)
- `localStorage` for cart / wishlist / demo-order persistence
- Layout with Flexbox & Grid; mobile-first, tested at 375 / 390 / 768 / 1024 / 1440px

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Project structure

```
meza/
├── index.html             ← Vite entry (title, favicon, meta, #root)
├── vite.config.js
├── public/
│   └── assets/            ← icons/icons.svg sprite + images/ (all local)
└── src/
    ├── main.jsx           ← mounts <BrowserRouter> + <ToastProvider> + <App>
    ├── App.jsx            ← route table (incl. redirects from the old .html URLs)
    ├── data/
    │   └── products.js    ← the single source of truth for all products
    ├── lib/               ← framework-free logic (same APIs as before)
    │   ├── storage.js · cart.js · wishlist.js
    │   ├── catalog.js     ← PURE search/filter/sort
    │   ├── format.js      ← currency (NGN) & date formatting — one place to change
    │   ├── order.js       ← demo-order builder
    │   ├── asset.js       ← resolves data paths against the deploy base path
    │   └── categories.js  ← category → sprite icon mapping
    ├── hooks/             ← useCart · useWishlist · usePageMeta · useDebouncedCallback
    ├── components/
    │   ├── Layout.jsx     ← skip link, navbar, <main>, footer
    │   ├── Navbar.jsx  Footer.jsx  Crumbs.jsx  Icon.jsx
    │   ├── ProductCard.jsx  QtyStepper.jsx  ToastProvider.jsx
    └── pages/
        └── Home.jsx  Shop.jsx  Product.jsx  Cart.jsx  Wishlist.jsx
            Checkout.jsx  OrderSuccess.jsx  About.jsx  NotFound.jsx
```

## Routes

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Announcement bar, hero, shop-by-category, featured, new arrivals, editorial showcase, Why-Meza, newsletter, footer |
| `/shop` | Shop | Grid + count + search + category/brand/price-range/availability filters + sort + clear-all + empty state. State synced to the URL (`?q=&cat=&brand=&min=&max=&avail=&sort=`) |
| `/product/:slug` | Product | Gallery, brand, price/previous price, description, specs, availability, qty, add-to-cart, wishlist, related, breadcrumbs. Unknown slug → 404 |
| `/cart` | Cart | Line items, qty steppers, remove, subtotal/total, empty state, checkout CTA |
| `/wishlist` | Wishlist | Saved items, remove, move-to-cart, empty state |
| `/checkout` | Checkout | Validated contact/shipping form + order summary + **Place demo order** |
| `/order-success` | Confirmation | Demo reference, items, total — labeled as a demonstration |
| `/about` | About | Brand story (fictional, no fake social-proof claims) |
| `*` / `/404` | 404 | Unknown page / invalid product id |

Old links keep working: `/index.html`, `/shop.html`, `/cart.html`,
`/product.html?id=<slug>` … redirect to their React routes.

## Features

- [x] Data-driven product catalog (15 fictional products, 5 categories, 5 fictional brands)
- [x] Search across name / brand / category / description
- [x] Composable filters: category, brand, min/max price, availability
- [x] Sorting: featured, newest, price ↑, price ↓ (URL-synced, refresh/share restores state)
- [x] Product detail pages with gallery, specs, qty selector, related products, breadcrumbs
- [x] Cart: add / remove / qty / totals, persisted in localStorage, badge count, out-of-stock handling
- [x] Wishlist: toggle / remove / add-to-cart from card, persisted, badge count
- [x] Demo checkout with validation + order confirmation (simulated, labeled, no payment fields)
- [x] Newsletter form with email validation (simulated, stored locally)
- [x] Responsive mobile navigation, active-page indication, breadcrumbs
- [x] Accessibility: semantic HTML, skip link, focus states, aria labels/errors, keyboard support

## Simulated functionality (read before demoing)

| Feature | What actually happens |
|---|---|
| Checkout / "Place demo order" | Validates the form, generates a local demo reference (e.g. `MZA-DEMO-XXXXXX`), saves the order to `localStorage["meza:v1:lastOrder"]`, clears the cart, shows the order-success route. **No payment, no network call, no real order.** |
| Shipping cost | Fixed demo rule: flat ₦2,500, free over ₦150,000 subtotal (constant in `src/lib/cart.js`). |
| Newsletter | Validates the email and stores it in `localStorage["meza:v1:newsletter"]`. Nothing is sent anywhere. |

## Adding / editing products

Edit `src/data/products.js` only — every page (home, shop, product, cart,
wishlist, related) renders from that file. Give each product a unique
`slug` (used in `/product/<slug>`), at least one image in
`public/assets/images/products/`, and keep copy fictional with no review/sales/
warranty claims. See the schema comment at the top of that file.

## Deployment

The build output in `dist/` is a single-page app, so the host must serve
`index.html` for unknown paths (SPA history fallback):

- **Netlify:** `public/_redirects` (`/*  /index.html  200`) is included.
- **Vercel:** framework preset "Vite" handles the fallback automatically.
- **GitHub Pages:** works at a project sub-path when built with
  `BASE_PATH=/<repo-name>/ npm run build` (the router and asset paths pick the
  base up automatically). Add a 404 redirect if you need deep links to resolve
  directly on Pages.

## Limitations

- Demo storefront: fictional products/prices, no backend, no real payments.
- Product/hero imagery is AI-generated and stored locally so every reference
  works offline; swap in real photography by replacing files under
  `public/assets/images/` (keep the filenames referenced in `products.js`).
- Cart/wishlist live in the visitor's browser only.

## Versioning note

Version 1 was the framework-free build (static HTML + ES modules).
This is **Version 2**: the same content, markup structure and CSS, ported to
React with React Router — `data/` + `lib/` are the data/state layers,
`components/` are React components, and `pages/` map 1:1 to routes.
