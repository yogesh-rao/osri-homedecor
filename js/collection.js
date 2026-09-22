/* Collection listing: category filter, text search and sorting, all driven
   from the URL so links and the back button keep working. */

const SORTS = {
  featured:   (a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0),
  'price-asc':  (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  discount:   (a, b) => discountPct(b) - discountPct(a),
  rating:     (a, b) => Number(b.rating) - Number(a.rating)
};

const view = {
  cat:  param('c') || 'all',
  q:    param('q') || '',
  sort: param('sort') || 'featured'
};

function syncURL() {
  const p = new URLSearchParams();
  p.set('c', view.cat);
  if (view.q) p.set('q', view.q);
  if (view.sort !== 'featured') p.set('sort', view.sort);
  history.replaceState(null, '', 'collection.html?' + p.toString());
}

function currentProducts() {
  let list = view.cat === 'all' ? PRODUCTS.slice() : productsIn(view.cat);
  if (view.q) {
    const needle = view.q.toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(needle) ||
      p.categoryName.toLowerCase().includes(needle) ||
      p.motif.includes(needle) ||
      p.palette.includes(needle));
  }
  return list.sort(SORTS[view.sort] || SORTS.featured);
}

function renderHead() {
  const cat = getCategory(view.cat);
  qs('#collTitle').textContent = view.q
    ? `Results for “${view.q}”`
    : cat ? cat.name : 'Shop all prints';
  qs('#collBlurb').textContent = cat
    ? cat.blurb
    : 'Everything we make, in one place.';
  qs('#crumbCurrent').textContent = cat ? cat.name : 'Shop all';
}

function renderChips() {
  const all = [{ slug: 'all', name: 'All products' }].concat(CATEGORIES);
  qs('#chips').innerHTML = all.map(c =>
    `<button class="chip${c.slug === view.cat ? ' is-active' : ''}" data-cat="${c.slug}">${esc(c.name)}</button>`
  ).join('');
}

function render() {
  const list = currentProducts();
  renderHead();
  renderChips();
  qs('#resultCount').textContent =
    `${list.length} ${list.length === 1 ? 'product' : 'products'}`;

  const grid = qs('#collGrid');
  if (list.length) {
    grid.innerHTML = list.map(productCard).join('');
  } else if (catalogEmpty()) {
    // Nothing is stocked yet — a filter reset would not help, so do not offer it.
    grid.innerHTML = `
      <div class="coming-soon">
        <h3>Pieces arriving soon</h3>
        <p>We are photographing and listing the first ${esc(STORE.name)} collection now.
           Leave your email on the homepage and we will tell you the day it goes live.</p>
        <a class="btn btn--primary" href="index.html">Back to homepage</a>
      </div>`;
  } else {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <h3>No products matched</h3>
        <p>Try a different name, colour or category.</p>
        <button class="btn btn--primary" id="clearFilters">Clear filters</button>
      </div>`;
  }
  syncURL();
}

document.addEventListener('DOMContentLoaded', () => {
  qs('#sortSelect').value = view.sort;
  qs('#searchInput').value = view.q;
  render();

  qs('#chips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    view.cat = chip.dataset.cat;
    render();
  });

  qs('#sortSelect').addEventListener('change', e => {
    view.sort = e.target.value;
    render();
  });

  let searchTimer;
  qs('#searchInput').addEventListener('input', e => {
    clearTimeout(searchTimer);
    const value = e.target.value.trim();
    searchTimer = setTimeout(() => { view.q = value; render(); }, 200);
  });

  qs('#collGrid').addEventListener('click', e => {
    if (e.target.id === 'clearFilters') {
      view.cat = 'all'; view.q = ''; view.sort = 'featured';
      qs('#searchInput').value = '';
      qs('#sortSelect').value = 'featured';
      render();
    }
  });
});
