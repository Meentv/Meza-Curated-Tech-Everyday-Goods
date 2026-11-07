/* ==========================================================================
   format.js — the ONE place where currency and dates are formatted.
   Prices in the data file are whole naira (e.g. 189000). To switch the
   whole store to another currency, change CURRENCY below.
   ========================================================================== */

export const CURRENCY = 'NGN';

const moneyFmt = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0, // ₦189,000 — no kobo in this demo
});

/** 189000 → "₦189,000" */
export const money = (amount) => moneyFmt.format(amount);

/** 12000 → "12,000" (counts, etc.) */
export const num = (n) => new Intl.NumberFormat('en-NG').format(n);

/** '2026-10-18' → "18 October 2026" */
export const dateLong = (iso) =>
  new Intl.DateTimeFormat('en-NG', { dateStyle: 'long' }).format(new Date(iso));
