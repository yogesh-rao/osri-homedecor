/* Product detail page. Reads ?id= and renders gallery, buy box and related items. */

/* Colourway options are generated from the print itself so every product has
   something to switch between until real photography exists. Read straight from
   the palette table in patterns.js so the two can never drift apart. */
const COLOURWAYS = Object.keys(PALETTES);

function galleryViews(product, palette) {
  // Real photography always wins over the generated stand-in.
  if (product.images && product.images.length) {
    return product.images.map((src, i) => ({ label: 'View ' + (i + 1), src: src }));
  }
  // Four looks at the same print: full sheet, close weave, folded stack, detail.
  return [
    { motif: product.motif, unit: 100, label: 'Full print' },
    { motif: product.motif, unit: 190, label: 'Close-up' },
    { motif: 'stripe',      unit: 120, label: 'Reverse side' },
    { motif: product.motif, unit: 60,  label: 'Pillow cover' }
  ].map(v => ({
    label: v.label,
    src: patternDataURI(v.motif, palette, { w: 900, h: 1125, unit: v.unit })
  }));
}

/** Colourway swatches regenerate the placeholder art, so they are meaningless
    — and misleading — once a product has real photographs of one colourway. */
function showSwatches(product) {
  return !(product.images && product.images.length);
}

document.addEventListener('DOMContentLoaded', () => {
  const product = getProduct(param('id'));
  const root = qs('#pdpRoot');

  if (!product) {
    root.innerHTML = `
      <div class="empty-state">
        <h3>We could not find that product</h3>
        <p>It may have been renamed or sold out for good.</p>
        <a class="btn btn--primary" href="collection.html?c=all">Back to shop</a>
      </div>`;
    return;
  }

  document.title = product.title + ' — ' + STORE.name;
  qs('#crumbCat').textContent = product.categoryName;
  qs('#crumbCat').href = 'collection.html?c=' + product.category;
  qs('#crumbProduct').textContent = product.title;

  let palette = product.palette;
  let views = galleryViews(product, palette);
  let activeView = 0;
  const out = product.stock === 0;

  root.innerHTML = `
    <div class="gallery">
      <div class="gallery__main${product.images.length ? ' gallery__main--photo' : ''}">
        <img id="galleryMain" src="${views[0].src}" alt="${esc(product.title)}">
      </div>
      <div class="gallery__thumbs" id="galleryThumbs"></div>
    </div>

    <div class="pdp__info">
      <div class="card__cat">${esc(product.categoryName)}</div>
      <h1>${esc(product.title)}</h1>
      ${product.reviews ? `<div>${stars(product.rating)}
        <span style="color:var(--muted);font-size:.82rem">${product.reviews} reviews</span></div>` : ''}

      <div class="pdp__price">
        <span class="price__now">${money(product.price)}</span>
        ${hasMrp(product) ? `<span class="price__was">${money(product.mrp)}</span>
        <span class="price__off">${discountPct(product)}% off</span>` : ''}
      </div>
      <div class="pdp__tax">Inclusive of all taxes. Free shipping over ${money(STORE.freeShipOver)}.</div>

      <p style="color:var(--ink-soft);margin-top:18px">${esc(product.description)}</p>

      ${showSwatches(product) ? `<span class="field-label">Colourway</span>
      <div class="swatches" id="swatches"></div>` : ''}

      <span class="field-label">Quantity</span>
      <div class="qty">
        <button id="pdpDec" aria-label="Decrease quantity">&minus;</button>
        <input id="pdpQty" type="number" value="1" min="1" max="${Math.max(1, product.stock)}" aria-label="Quantity">
        <button id="pdpInc" aria-label="Increase quantity">+</button>
      </div>
      ${product.stock > 0 && product.stock <= 3
        ? `<div class="note note--err" style="margin-top:8px">Only ${product.stock} left</div>` : ''}

      <div class="buy-row">
        <button class="btn btn--primary" id="pdpAdd" ${out ? 'disabled' : ''}>
          ${out ? 'Sold out' : 'Add to cart'}
        </button>
        <button class="btn btn--dark" id="pdpBuy" ${out ? 'disabled' : ''}>Buy it now</button>
      </div>

      <div class="pdp__meta">
        <div><strong>Availability</strong>
          <span>${out ? 'Out of stock' : product.stock + ' in stock, ships in 24 hours'}</span></div>
        <div><strong>Size</strong><span>${esc(product.size)}</span></div>
        <div><strong>Material</strong><span>${esc(product.material)}</span></div>
        <div><strong>SKU</strong><span>${esc(product.id.toUpperCase())}</span></div>
      </div>

      <div class="accordion">
        <details open>
          <summary>Product details</summary>
          <div class="acc-body"><ul>${product.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>
        </details>
        <details>
          <summary>Care instructions</summary>
          <div class="acc-body">${esc(product.care)}</div>
        </details>
        <details>
          <summary>Shipping &amp; returns</summary>
          <div class="acc-body">
            Dispatched within one working day. Delivery takes two to six days depending
            on the pin code. Returns accepted within seven days of delivery, unwashed
            and with the original packaging. Reverse pickup is arranged for you.
          </div>
        </details>
      </div>
    </div>`;

  /* ---- gallery ---- */
  function paintGallery() {
    qs('#galleryMain').src = views[activeView].src;
    qs('#galleryThumbs').innerHTML = views.map((v, i) => `
      <button class="gallery__thumb${i === activeView ? ' is-active' : ''}" data-i="${i}"
              aria-label="${esc(v.label)}">
        <img src="${v.src}" alt="">
      </button>`).join('');
  }
  paintGallery();

  qs('#galleryThumbs').addEventListener('click', e => {
    const thumb = e.target.closest('.gallery__thumb');
    if (!thumb) return;
    activeView = Number(thumb.dataset.i);
    paintGallery();
  });

  /* ---- colourways (placeholder-art products only) ---- */
  function paintSwatches() {
    if (!showSwatches(product)) return;
    qs('#swatches').innerHTML = COLOURWAYS.map(c => `
      <button class="swatch${c === palette ? ' is-active' : ''}" data-p="${c}"
              title="${c}" aria-label="Colourway ${c}">
        <img src="${patternDataURI(product.motif, c, { w: 120, h: 120, unit: 40, border: false })}" alt="">
      </button>`).join('');
  }
  paintSwatches();

  qs('#swatches')?.addEventListener('click', e => {
    const sw = e.target.closest('.swatch');
    if (!sw) return;
    palette = sw.dataset.p;
    views = galleryViews(product, palette);
    activeView = 0;
    paintSwatches();
    paintGallery();
  });

  /* ---- quantity + buy ---- */
  const qtyInput = qs('#pdpQty');
  const maxQty = Math.max(1, product.stock);   // never offer more than is on hand
  const clampQty = () => {
    let v = parseInt(qtyInput.value, 10);
    if (!Number.isFinite(v) || v < 1) v = 1;
    qtyInput.value = Math.min(maxQty, v);
  };
  qs('#pdpInc').addEventListener('click', () => { qtyInput.value = Math.min(maxQty, Number(qtyInput.value) + 1); });
  qs('#pdpDec').addEventListener('click', () => { qtyInput.value = Math.max(1, Number(qtyInput.value) - 1); });
  qtyInput.addEventListener('change', clampQty);

  qs('#pdpAdd').addEventListener('click', () => {
    clampQty();
    Cart.add(product.id, Number(qtyInput.value));
    toast(product.title + ' added to cart');
    openCart();
  });
  qs('#pdpBuy').addEventListener('click', () => {
    clampQty();
    Cart.add(product.id, Number(qtyInput.value));
    location.href = 'cart.html';
  });

  /* ---- related ---- */
  const related = productsIn(product.category)
    .filter(p => p.id !== product.id)
    .concat(PRODUCTS.filter(p => p.motif === product.motif && p.category !== product.category))
    .slice(0, 4);
  qs('#relatedGrid').innerHTML = related.map(productCard).join('');
});
