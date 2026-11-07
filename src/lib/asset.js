/* asset.js — resolve a path from the (unchanged) data files against the
   deployed base path, so the same data works at "/" and under a sub-path
   such as GitHub Pages' "/meza/". */
const BASE = import.meta.env.BASE_URL || '/';

export const asset = (path) => BASE + String(path).replace(/^\/+/, '');
