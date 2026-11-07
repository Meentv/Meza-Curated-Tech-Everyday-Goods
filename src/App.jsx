import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';

/** Routes mirror the pages of the original multi-page site. */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:slug" element={<Product />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-success" element={<OrderSuccess />} />
        <Route path="about" element={<About />} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/shop.html" element={<Navigate to="/shop" replace />} />
      <Route path="/about.html" element={<Navigate to="/about" replace />} />
      <Route path="/cart.html" element={<Navigate to="/cart" replace />} />
      <Route path="/wishlist.html" element={<Navigate to="/wishlist" replace />} />
      <Route path="/checkout.html" element={<Navigate to="/checkout" replace />} />
      <Route path="/order-success.html" element={<Navigate to="/order-success" replace />} />
      <Route path="/404.html" element={<Navigate to="/404" replace />} />
      <Route path="/product.html" element={<LegacyProductRedirect />} />
    </Routes>
  );
}

/** Old product.html?id=<slug> links → /product/<slug>. */
function LegacyProductRedirect() {
  const slug = new URLSearchParams(window.location.search).get('id');
  return <Navigate to={slug ? `/product/${encodeURIComponent(slug)}` : '/shop'} replace />;
}
