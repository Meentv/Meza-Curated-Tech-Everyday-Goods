const header = document.querySelector('.site-header');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const searchToggle = document.getElementById('searchToggle');
const searchPanel = document.getElementById('searchPanel');
const productSearch = document.getElementById('productSearch');
const closeSearch = document.getElementById('closeSearch');
const productCards = [...document.querySelectorAll('.product-card')];
const filterPills = [...document.querySelectorAll('.filter-pill')];
const resultsLabel = document.getElementById('resultsLabel');
const cartBadge = document.getElementById('cartBadge');
const toast = document.getElementById('toast');
let cartCount = 0;
let activeCategory = 'all';
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function refreshProducts() {
  const query = (productSearch?.value || '').trim().toLowerCase();
  let visible = 0;
  productCards.forEach(card => {
    const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
    const matchesSearch = !query || card.textContent.toLowerCase().includes(query);
    const show = matchesCategory && matchesSearch;
    card.classList.toggle('is-hidden', !show);
    if (show) visible++;
  });
  if (resultsLabel) resultsLabel.textContent = `${visible} product${visible === 1 ? '' : 's'}`;
}

filterPills.forEach(pill => pill.addEventListener('click', () => {
  filterPills.forEach(item => item.classList.remove('active'));
  pill.classList.add('active');
  activeCategory = pill.dataset.category;
  refreshProducts();
}));
productSearch?.addEventListener('input', refreshProducts);

function toggleMenu() {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuToggle?.addEventListener('click', toggleMenu);
navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

function toggleSearch(open) {
  searchPanel.classList.toggle('open', open);
  searchPanel.setAttribute('aria-hidden', String(!open));
  searchToggle.setAttribute('aria-expanded', String(open));
  if (open) setTimeout(() => productSearch?.focus(), 120);
  if (!open && productSearch) { productSearch.value = ''; refreshProducts(); }
}
searchToggle?.addEventListener('click', () => toggleSearch(!searchPanel.classList.contains('open')));
closeSearch?.addEventListener('click', () => toggleSearch(false));

// Quick-add interaction: intentionally local until a real checkout/cart backend is connected.
document.querySelectorAll('.quick-add').forEach(button => button.addEventListener('click', event => {
  event.stopPropagation();
  cartCount++;
  cartBadge.textContent = cartCount;
  showToast(`${button.closest('.product-card').querySelector('h3').textContent} added to your bag`);
}));
document.getElementById('cartButton')?.addEventListener('click', () => showToast(cartCount ? `${cartCount} item${cartCount === 1 ? '' : 's'} in your bag` : 'Your bag is ready for your next pick'));

document.querySelector('.subscribe')?.addEventListener('submit', event => {
  event.preventDefault();
  const input = event.currentTarget.querySelector('input');
  if (input.value.trim()) { showToast('You’re on the list — welcome to Meza'); input.value = ''; }
});

addEventListener('scroll', () => header?.classList.toggle('is-scrolled', scrollY > 8), { passive: true });

// Gentle pointer parallax on the hero product image.
const heroVisual = document.querySelector('.hero-visual');
const heroImg = document.querySelector('.hero-img');
if (heroVisual && heroImg && matchMedia('(pointer:fine)').matches) {
  heroVisual.addEventListener('pointermove', event => {
    const r = heroVisual.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - .5;
    const y = (event.clientY - r.top) / r.height - .5;
    heroImg.style.transform = `rotate(${x * 2}deg) translate(${x * 4}px, ${y * -4}px)`;
  });
  heroVisual.addEventListener('pointerleave', () => { heroImg.style.transform = ''; });
}

refreshProducts();
