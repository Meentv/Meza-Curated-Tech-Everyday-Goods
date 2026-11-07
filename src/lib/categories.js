/* Which sprite icon represents each category (add a mapping here if you add
   a category to products.js). */
export const CATEGORY_ICONS = {
  Audio: 'headphones',
  Accessories: 'sparkle',
  'Smart devices': 'bolt',
  Workspace: 'desk',
  'Everyday essentials': 'bag',
};

export const categoryIcon = (category) => CATEGORY_ICONS[category] ?? 'package';
