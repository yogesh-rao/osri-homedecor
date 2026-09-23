/* Shared chrome: header, footer, cart state, drawer, product cards.
   Loaded on every page after data.js and patterns.js. */

/* ---------------- helpers ---------------- */

const money = n => STORE.currency + Number(n).toLocaleString('en-IN');
/** A product only has an MRP worth showing if it is above the selling price. */
const hasMrp = p => Number(p.mrp) > Number(p.price);
const discountPct = p => Math.round((1 - p.price / p.mrp) * 100);
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const param = name => new URLSearchParams(location.search).get(name);

function stars(rating) {
  const full = Math.round(Number(rating));
  return '<span class="stars"><span class="stars__glyph">' +
    '★'.repeat(full) + '☆'.repeat(5 - full) +
    '</span>' + rating + '</span>';
}

/* ---------------- cart state (localStorage) ---------------- */

const CART_KEY = 'osri.cart.v1';

const Cart = {
  read() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items : [];
    } catch (e) {
      return [];   // private mode, blocked storage, corrupt JSON
    }
  },
  write(items) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) { /* non-fatal */ }
    document.dispatchEvent(new CustomEvent('cart:change', { detail: items }));
  },
  add(id, qty = 1) {
    const items = Cart.read();
    const line = items.find(i => i.id === id);
    if (line) line.qty += qty; else items.push({ id, qty });
    Cart.write(items);
  },
  setQty(id, qty) {
    let items = Cart.read();
    if (qty <= 0) items = items.filter(i => i.id !== id);
    else {
      const line = items.find(i => i.id === id);
      if (line) line.qty = qty;
    }
    Cart.write(items);
  },
  remove(id) { Cart.setQty(id, 0); },
  clear() { Cart.write([]); },
  count() { return Cart.read().reduce((n, i) => n + i.qty, 0); },
  /** Join stored ids against the catalog; silently drops ids no longer sold. */
  lines() {
    return Cart.read()
      .map(i => {
        const p = getProduct(i.id);
        return p ? { product: p, qty: i.qty, total: p.price * i.qty } : null;
      })
      .filter(Boolean);
  },
  subtotal() { return Cart.lines().reduce((s, l) => s + l.total, 0); }
};

/* ---------------- interim ordering (WhatsApp + UPI) ----------------
   No backend exists yet, so an "order" is a WhatsApp message the customer
   sends you, and payment is a UPI transfer you verify in your bank app. */

const ORDER_REF_KEY = 'osri.orderref.v1';

/** A short human-quotable reference, e.g. OSRI-260920-4821.
    Kept in localStorage so a reload does not renumber the same order. */
function orderRef() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORDER_REF_KEY) || 'null');
    // Reuse today's reference; start a new one on a new day.
    if (saved && saved.day === new Date().toDateString()) return saved.ref;
  } catch (e) { /* storage blocked — fall through and generate */ }

  const d = new Date();
  const stamp = String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
  const ref = STORE.name + '-' + stamp + '-' + Math.floor(1000 + Math.random() * 9000);
  try {
    localStorage.setItem(ORDER_REF_KEY, JSON.stringify({ day: d.toDateString(), ref: ref }));
  } catch (e) { /* non-fatal */ }
  return ref;
}

function clearOrderRef() {
  try { localStorage.removeItem(ORDER_REF_KEY); } catch (e) { /* non-fatal */ }
}

/** Plain-text order summary used in the WhatsApp message and the UPI note. */
function orderSummaryText(extra) {
  const lines = Cart.lines();
  if (!lines.length) return '';
  const rows = lines.map(l =>
    `• ${l.product.title} (${l.product.size}) × ${l.qty} — ${money(l.total)}`);

  // Mirror the checkout maths exactly, so the message and the QR agree.
  const subtotal = Cart.subtotal();
  const promo = readPromo();
  const discount = promo ? Math.round(subtotal * promo.percent / 100) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= STORE.freeShipOver ? 0 : STORE.shippingFlat;

  // The opening line has to match what actually happened: a browse-and-ask
  // from the cart is an enquiry, but a completed checkout is a placed order.
  let lead;
  if (!extra || !extra.method) {
    lead = `Hello ${STORE.name}, I would like to order:`;
  } else if (extra.utr) {
    lead = `Hello ${STORE.name}, I have placed an order and paid by UPI:`;
  } else {
    lead = `Hello ${STORE.name}, I have placed an order (Cash on Delivery):`;
  }

  let text = lead + `\n\n` +
    rows.join('\n') +
    `\n\nSubtotal: ${money(subtotal)}` +
    (discount ? `\nDiscount (${promo.code}): -${money(discount)}` : '') +
    `\nShipping: ${shipping ? money(shipping) : 'Free'}` +
    `\nTotal: ${money(afterDiscount + shipping)}` +
    `\nReference: ${orderRef()}`;

  if (extra && extra.name)    text += `\n\nName: ${extra.name}`;
  if (extra && extra.phone)   text += `\nPhone: ${extra.phone}`;
  if (extra && extra.address) text += `\nAddress: ${extra.address}`;
  if (extra && extra.method)  text += `\nPayment: ${extra.method}`;
  if (extra && extra.utr)     text += `\nUPI reference (UTR): ${extra.utr}`;
  return text;
}

/* The applied promo has to outlive the cart page, otherwise the checkout
   would show a UPI QR for the undiscounted amount. */
const PROMO_KEY = 'osri.promo.v1';

function savePromo(promo) {
  try {
    if (promo) localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
    else localStorage.removeItem(PROMO_KEY);
  } catch (e) { /* non-fatal */ }
}

function readPromo() {
  try {
    const p = JSON.parse(localStorage.getItem(PROMO_KEY) || 'null');
    // Only honour a code that still matches the current campaign.
    return (p && p.code === STORE.promo.code) ? p : null;
  } catch (e) {
    return null;
  }
}

function whatsappHref(text) {
  if (!BUSINESS.whatsapp) return '';
  return 'https://wa.me/' + BUSINESS.whatsapp + '?text=' + encodeURIComponent(text);
}

/** UPI deep link. Tapping it on a phone opens the UPI app with the amount
    already filled in; on desktop it does nothing, so a QR is shown too. */
function upiHref(amount, note) {
  if (!PAYMENT.upiId) return '';
  const p = new URLSearchParams({
    pa: PAYMENT.upiId,
    pn: PAYMENT.upiName || STORE.name,
    am: Number(amount).toFixed(2),
    cu: 'INR',
    tn: (note || '').slice(0, 50)      // UPI notes are short; keep it safe
  });
  return 'upi://pay?' + p.toString();
}

function upiConfigured() { return Boolean(PAYMENT.upiId); }

/* ---------------- toast ---------------- */

let toastTimer;
function toast(message) {
  let el = qs('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2400);
}

/* ---------------- product card ---------------- */

function productCard(p) {
  const img = productImage(p, { w: 640, h: 800 });
  const out = p.stock === 0;
  const badge = out ? '<span class="badge badge--out">Sold out</span>'
    : p.badge ? `<span class="badge badge--${p.badge}">${p.badge === 'bestseller' ? 'Bestseller' : esc(p.badge)}</span>`
    : '';

  return `
    <article class="card">
      <div class="card__media">
        ${badge}
        <a href="product.html?id=${p.id}" aria-label="${esc(p.title)}">
          <img src="${img}" alt="${esc(p.title)} — ${esc(p.material)}" loading="lazy">
        </a>
        <div class="card__add">
          <button class="btn btn--light btn--sm btn--block js-add" data-id="${p.id}" ${out ? 'disabled' : ''}>
            ${out ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
      <div class="card__cat">${esc(p.categoryName)}</div>
      <h3 class="card__title"><a href="product.html?id=${p.id}">${esc(p.title)}</a></h3>
      <div class="price">
        <span class="price__now">${money(p.price)}</span>
        ${hasMrp(p) ? `<span class="price__was">${money(p.mrp)}</span>
        <span class="price__off">${discountPct(p)}% off</span>` : ''}
      </div>
      ${p.reviews ? `<div style="margin-top:6px">${stars(p.rating)}
        <span style="color:var(--muted);font-size:.78rem">(${p.reviews})</span></div>` : ''}
    </article>`;
}

/* ---------------- header / footer ---------------- */

const ICONS = {
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  cart:   '<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
  user:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"/></svg>',
  menu:   '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close:  '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>'
};

/* Menu grouping. Every slug here must exist in CATEGORIES (js/data.js);
   any that does not is skipped rather than breaking the header. */
const NAV = [
  { label: 'Bedsheets',  children: ['bedsheets-double', 'bedsheets-king', 'bedsheets-fitted'] },
  { label: 'Bedcovers',  children: ['bedcovers'] },
  { label: 'Home',       children: ['cushions-linen'] },
  { label: 'Bags',       children: ['bags'] }
];

/** Nav children that actually resolve to a real category. */
function navChildren(group) {
  return group.children.filter(getCategory);
}

function catLink(slug) {
  const c = getCategory(slug);
  if (!c) return '';
  const n = productsIn(slug).length;
  return `<a href="collection.html?c=${c.slug}">${esc(c.name)}<span>${n ? n : 'soon'}</span></a>`;
}

function headerHTML() {
  const nav = NAV.map(group => {
    const kids = navChildren(group);
    if (!kids.length) return '';
    return `
    <li class="nav__item">
      <a class="nav__link" href="collection.html?c=${kids[0]}">
        ${esc(group.label)}
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
      </a>
      <div class="dropdown">${kids.map(catLink).join('')}</div>
    </li>`;
  }).join('');

  return `
    <div class="announce">
      Free shipping over <b>${money(STORE.freeShipOver)}</b><span class="announce__more"> across India
      &nbsp;·&nbsp; Use code <b>${STORE.promo.code}</b> for ${STORE.promo.percent}% off</span>
    </div>
    <header class="site-header">
      <div class="wrap header-bar">
        <button class="icon-btn hamburger js-menu-open" aria-label="Open menu">${ICONS.menu}</button>
        <a class="brand" href="index.html" aria-label="${esc(STORE.name)} — home">
          <img class="brand__logo" src="assets/brand/osri-logo-compact.png"
               alt="${esc(STORE.name)}" width="292" height="140">
        </a>
        <nav aria-label="Main">
          <ul class="nav" style="list-style:none;margin:0;padding:0">${nav}</ul>
        </nav>
        <div class="header-actions">
          <a class="icon-btn" href="collection.html?c=all" aria-label="Search products">${ICONS.search}</a>
          <button class="icon-btn" aria-label="Account" onclick="toast('Accounts are not set up yet')">${ICONS.user}</button>
          <button class="icon-btn js-cart-open" aria-label="Open cart">
            ${ICONS.cart}<span class="cart-count" hidden>0</span>
          </button>
        </div>
      </div>
    </header>

    <div class="mobile-nav" id="mobileNav">
      <div class="overlay is-open js-menu-close"></div>
      <div class="mobile-nav__panel" role="dialog" aria-label="Menu">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <img class="brand__logo" src="assets/brand/osri-logo-compact.png"
               alt="${esc(STORE.name)}" width="292" height="140">
          <button class="icon-btn js-menu-close" aria-label="Close menu">${ICONS.close}</button>
        </div>
        ${NAV.map(g => {
          const kids = navChildren(g);
          if (!kids.length) return '';
          return `<div class="m-head">${esc(g.label)}</div>` +
            kids.map(s => `<a href="collection.html?c=${s}">${esc(getCategory(s).name)}</a>`).join('');
        }).join('')}
        <div class="m-head">More</div>
        <a href="collection.html?c=all">Shop all</a>
        <a href="about.html">About OSRI</a>
        <a href="contact.html">Contact</a>
        <a href="policies.html">Shipping &amp; returns</a>
        <a href="cart.html">Cart</a>
      </div>
    </div>`;
}

/** Renders a business detail, or a visible marker if it is not filled in yet. */
function orTodo(value, label) {
  return value ? esc(value) : `<span class="todo">${esc(label)} to be added</span>`;
}

function footerHTML() {
  const col = (title, links) => `
    <div>
      <h4>${title}</h4>
      <ul>${links.map(l => `<li><a href="${l[1]}">${esc(l[0])}</a></li>`).join('')}</ul>
    </div>`;

  const contactBits = [
    BUSINESS.email ? `<li><a href="mailto:${esc(BUSINESS.email)}">${esc(BUSINESS.email)}</a></li>` : '',
    BUSINESS.phone ? `<li><a href="tel:${esc(BUSINESS.phone.replace(/\s/g, ''))}">${esc(BUSINESS.phone)}</a></li>` : '',
    BUSINESS.city ? `<li>${esc([BUSINESS.city, BUSINESS.state].filter(Boolean).join(', '))}</li>` : ''
  ].join('');

  return `
    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-grid">
          <div class="footer-about">
            <a class="brand" href="index.html" aria-label="${esc(STORE.name)} — home">
              <img class="footer__logo" src="assets/brand/osri-primary-white.png"
                   alt="${esc(STORE.name)} — Home, Décor, Lifestyle" width="720" height="422">
            </a>
            <p>${esc(STORE.tagline)}. Made in small batches and sent straight to you.</p>
          </div>
          ${col('Shop', CATEGORIES.slice(0, 5).map(c => [c.name, 'collection.html?c=' + c.slug]))}
          ${col('Help', [
            ['Shipping & delivery', 'policies.html#shipping'],
            ['Returns & exchanges', 'policies.html#returns'],
            ['Care instructions', 'policies.html#care'],
            ['FAQ', 'policies.html#faq']])}
          <div>
            <h4>${esc(STORE.name)}</h4>
            <ul>
              <li><a href="about.html">Our story</a></li>
              <li><a href="contact.html">Contact</a></li>
              <li><a href="policies.html#privacy">Privacy policy</a></li>
              <li><a href="policies.html#terms">Terms of service</a></li>
              ${contactBits}
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>
            &copy; ${new Date().getFullYear()} ${BUSINESS.legalName ? esc(BUSINESS.legalName) : esc(STORE.name)}.
            ${BUSINESS.gstin ? 'GSTIN ' + esc(BUSINESS.gstin) + '.' : ''}
          </span>
          <div class="pay-row">
            <span>UPI</span><span>Visa</span><span>Mastercard</span><span>RuPay</span><span>Net banking</span><span>COD</span>
          </div>
        </div>
      </div>
    </footer>`;
}

/* Ordering happens over WhatsApp, so a persistent way to reach it matters
   more here than on a shop with a real checkout. Rendered only when a
   number is configured. */
function whatsappFabHTML() {
  if (!BUSINESS.whatsapp) return '';
  const text = `Hello ${STORE.name}, I have a question about`;
  return `
    <a class="wa-fab" href="${whatsappHref(text)}" target="_blank" rel="noopener"
       aria-label="Message us on WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z"/>
      </svg>
    </a>`;
}

function cartDrawerHTML() {
  return `
    <div class="overlay js-cart-close" id="cartOverlay"></div>
    <aside class="cart-drawer" id="cartDrawer" role="dialog" aria-label="Shopping cart" aria-hidden="true">
      <div class="cart-drawer__head">
        <h3>Your cart</h3>
        <button class="icon-btn js-cart-close" aria-label="Close cart">${ICONS.close}</button>
      </div>
      <div class="cart-drawer__body" id="cartDrawerBody"></div>
      <div class="cart-drawer__foot" id="cartDrawerFoot"></div>
    </aside>`;
}

/* ---------------- drawer rendering ---------------- */

function renderCartDrawer() {
  const body = qs('#cartDrawerBody');
  const foot = qs('#cartDrawerFoot');
  if (!body || !foot) return;

  const lines = Cart.lines();

  if (!lines.length) {
    body.innerHTML = `
      <div class="empty-state">
        <h3>Nothing here yet</h3>
        <p>Anything you add shows up in this drawer.</p>
        <a class="btn btn--primary" href="collection.html?c=all">Browse the shop</a>
      </div>`;
    foot.innerHTML = '';
    return;
  }

  body.innerHTML = lines.map(l => `
    <div class="mini-line">
      <img src="${productImage(l.product, { w: 200, h: 250 })}" alt="">
      <div>
        <div class="mini-line__title">${esc(l.product.title)}</div>
        <div class="mini-line__meta">${esc(l.product.categoryName)}</div>
        <div class="cart-line__ctl" style="margin-top:8px">
          <div class="qty">
            <button class="js-dec" data-id="${l.product.id}" aria-label="Decrease quantity">&minus;</button>
            <input type="number" value="${l.qty}" min="0" data-id="${l.product.id}" class="js-qty" aria-label="Quantity">
            <button class="js-inc" data-id="${l.product.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
      </div>
      <div class="mini-line__price">${money(l.total)}</div>
    </div>`).join('');

  const subtotal = Cart.subtotal();
  const remaining = STORE.freeShipOver - subtotal;
  const pct = Math.min(100, (subtotal / STORE.freeShipOver) * 100);

  foot.innerHTML = `
    <div class="ship-bar">
      <div class="ship-bar__text">${remaining > 0
        ? `Add ${money(remaining)} more for free shipping`
        : 'Free shipping unlocked'}</div>
      <div class="ship-bar__track"><div class="ship-bar__fill" style="width:${pct}%"></div></div>
    </div>
    <div class="summary__row" style="padding-top:0">
      <span>Subtotal</span><strong>${money(subtotal)}</strong>
    </div>
    <a class="btn btn--primary btn--block" href="cart.html" style="margin-top:10px">View cart &amp; checkout</a>`;
}

function openCart() {
  renderCartDrawer();
  qs('#cartDrawer')?.classList.add('is-open');
  qs('#cartDrawer')?.setAttribute('aria-hidden', 'false');
  qs('#cartOverlay')?.classList.add('is-open');
}
function closeCart() {
  qs('#cartDrawer')?.classList.remove('is-open');
  qs('#cartDrawer')?.setAttribute('aria-hidden', 'true');
  qs('#cartOverlay')?.classList.remove('is-open');
}

function updateCartCount() {
  const n = Cart.count();
  qsa('.cart-count').forEach(el => {
    el.textContent = n;
    el.hidden = n === 0;
  });
}

/* ---------------- boot ---------------- */

function mountChrome() {
  const header = qs('#site-header');
  const footer = qs('#site-footer');
  if (header) header.innerHTML = headerHTML();
  if (footer) footer.innerHTML = footerHTML();
  document.body.insertAdjacentHTML('beforeend', cartDrawerHTML() + whatsappFabHTML());
  updateCartCount();

  // One delegated listener covers every add / qty control on the page.
  document.addEventListener('click', e => {
    const add = e.target.closest('.js-add');
    if (add && !add.disabled) {
      const p = getProduct(add.dataset.id);
      Cart.add(add.dataset.id, 1);
      toast(`${p ? p.title : 'Item'} added to cart`);
      openCart();
      return;
    }
    if (e.target.closest('.js-cart-open')) { openCart(); return; }
    if (e.target.closest('.js-cart-close')) { closeCart(); return; }
    if (e.target.closest('.js-menu-open')) { qs('#mobileNav')?.classList.add('is-open'); return; }
    if (e.target.closest('.js-menu-close')) { qs('#mobileNav')?.classList.remove('is-open'); return; }

    const inc = e.target.closest('.js-inc');
    const dec = e.target.closest('.js-dec');
    if (inc || dec) {
      const btn = inc || dec;
      const id = btn.dataset.id;
      const line = Cart.read().find(i => i.id === id);
      if (line) Cart.setQty(id, line.qty + (inc ? 1 : -1));
    }
  });

  document.addEventListener('change', e => {
    const input = e.target.closest('.js-qty');
    if (input) Cart.setQty(input.dataset.id, Math.max(0, parseInt(input.value, 10) || 0));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCart(); qs('#mobileNav')?.classList.remove('is-open'); }
  });

  document.addEventListener('cart:change', () => {
    updateCartCount();
    renderCartDrawer();
    if (typeof onCartChange === 'function') onCartChange();
  });
}

document.addEventListener('DOMContentLoaded', mountChrome);
