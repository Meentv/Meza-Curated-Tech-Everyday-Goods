import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

/** Shared page shell: skip link, navbar, main landmark, footer. */
export default function Layout() {
  const { pathname } = useLocation();

  // Multi-page sites reset scroll on navigation; keep that behaviour in the SPA.
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
