
// وظائف عامة
async function loadProducts() {
  const res = await fetch('data/products.json');
  return await res.json();
}

function formatPrice(p, cur='USD') {
  return new Intl.NumberFormat('ar-MA', { style:'currency', currency: cur }).format(p);
}

function createProductCard(p) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <img src="${p.image}" alt="${p.name}">
    <div class="info">
      <div class="title">${p.name}</div>
      <div class="muted">${p.category} • ⭐ ${p.rating} (${p.reviewsCount})</div>
      <div class="price">${formatPrice(p.price, p.currency)}</div>
    </div>
    <div class="actions">
      <a class="button" href="product.html?id=${p.id}">تفاصيل</a>
      <a class="button secondary" href="${p.aliUrl}" target="_blank" rel="noopener">على AliExpress</a>
    </div>
  `;
  return div;
}

async function renderGrid(containerSelector, opts={}) {
  const el = document.querySelector(containerSelector);
  if (!el) return;
  const products = await loadProducts();
  const q = new URLSearchParams(location.search).get('q');
  const cat = opts.category || new URLSearchParams(location.search).get('category');
  let filtered = products;
  if (cat) filtered = filtered.filter(p => p.category === cat);
  if (q) filtered = filtered.filter(p => p.name.includes(q));
  el.innerHTML = '';
  filtered.forEach(p => el.appendChild(createProductCard(p)));
  if (filtered.length === 0) {
    el.innerHTML = '<div class="muted">لا توجد نتائج مطابقة.</div>';
  }
}

// صفحة المنتج
async function renderProductPage() {
  const el = document.querySelector('#product');
  if (!el) return;
  const id = new URLSearchParams(location.search).get('id');
  const products = await loadProducts();
  const p = products.find(x => x.id === id);
  if (!p) { el.innerHTML = '<div class="muted">المنتج غير موجود.</div>'; return; }
  el.innerHTML = `
    <div class="breadcrumbs"><a href="index.html">الرئيسية</a> / <a href="products.html?category=${encodeURIComponent(p.category)}">${p.category}</a> / ${p.name}</div>
    <div class="hero">
      <img src="${p.image}" alt="${p.name}" style="width:50%; border-radius:10px;">
      <div style="flex:1">
        <div class="title">${p.name}</div>
        <p class="muted">⭐ ${p.rating} (${p.reviewsCount} مراجعة)</p>
        <p class="price">${formatPrice(p.price, p.currency)}</p>
        <p>${p.description}</p>
        <div style="display:flex; gap:8px;">
          <a class="button" href="${p.aliUrl}" target="_blank" rel="noopener">اشتريه عبر AliExpress</a>
          <button class="button secondary" onclick="addToWishlist('${p.id}')">إضافة للمفضلة</button>
        </div>
      </div>
    </div>
  `;
  // إضافة JSON-LD للمنتج
  const ld = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: p.name,
    image: p.image,
    description: p.description,
    category: p.category,
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: p.currency,
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: p.rating,
      reviewCount: p.reviewsCount
    }
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);
}

function addToWishlist(id) {
  const key = 'wishlist';
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  if (!arr.includes(id)) arr.push(id);
  localStorage.setItem(key, JSON.stringify(arr));
  alert('تمت الإضافة إلى المفضلة');
}

// بحث بسيط
function initSearch() {
  const input = document.querySelector('#search-input');
  const btn = document.querySelector('#search-btn');
  if (!input || !btn) return;
  btn.addEventListener('click', () => {
    const q = input.value.trim();
    const base = location.pathname.endsWith('products.html') ? 'products.html' : 'products.html';
    location.href = `${base}?q=${encodeURIComponent(q)}`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderGrid('#grid');
  renderProductPage();
  initSearch();
});
