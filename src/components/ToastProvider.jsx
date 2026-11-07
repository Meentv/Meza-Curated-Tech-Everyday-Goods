/* ==========================================================================
   ToastProvider — small non-blocking notifications ("Added to cart…").
   A single aria-live region is rendered once; toasts stack (max 3) and
   remove themselves after ~3s. Use the `useToast()` hook to fire one.
   ========================================================================== */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

const ToastContext = createContext(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);
  const timers = useRef(new Set());

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  /** toast('Added to cart', 'success' | 'info' | 'error') */
  const toast = useCallback((message, type = 'info') => {
    const id = (seq.current += 1);
    setToasts((list) => [...list, { id, message, type }].slice(-3));
    const out = setTimeout(
      () => setToasts((list) => list.map((t) => (t.id === id ? { ...t, out: true } : t))),
      2800,
    );
    const gone = setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3000);
    timers.current.add(out);
    timers.current.add(gone);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}${t.out ? ' toast--out' : ''}`}>
            <Icon name={t.type === 'error' ? 'alert' : t.type === 'success' ? 'check' : 'sparkle'} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
