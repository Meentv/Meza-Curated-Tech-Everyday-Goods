/* ==========================================================================
   storage.js — safe JSON wrapper around localStorage.
   All Meza keys are namespaced "meza:v1:" (versioned, easy to find/clear).
   Every read/write is wrapped so corrupt data or disabled storage can
   never crash the app — it just falls back to a clean default.
   ========================================================================== */

const PREFIX = 'meza:v1:';

export const storageKey = (key) => PREFIX + key;

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback; // invalid JSON → start clean
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false; // storage full or blocked → fail quietly
  }
}

export function remove(key) {
  try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
}
