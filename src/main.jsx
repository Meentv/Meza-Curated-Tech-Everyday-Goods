import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './components/ToastProvider.jsx';

/* Styles load in the same order as the original <head>, so the cascade
   (tokens/base → components → pages → responsive overrides) is unchanged. */
import './styles/styles.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/responsive.css';

const basename = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || '/';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
