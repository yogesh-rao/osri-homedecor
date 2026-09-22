/* Cart page: line items, totals, promo code and a mock checkout. */

const SHIPPING_FLAT = STORE.shippingFlat;
let appliedPromo = readPromo();   // survives a reload and carries into checkout

function renderLines() {
  const lines = Cart.lines();
  const host = qs('#cartLines');
  const summary = qs('#cartSummary');

  // Hide the summary rather than replacing the layout — the page script binds
  // to nodes inside it, so they have to survive an empty cart.
  summary.hidden = !lines.length;
  qs('#cartLayout').style.gridTemplateColumns = lines.length ? '' : '1fr';

  if (!lines.length) {
    host.innerHTML = `
      <div class="empty-state" style="border-bottom:1px solid var(--line)">
        <h3>Your cart is empty</h3>
        <p>Once you add a print it will show up here with the running total.</p>
        <a class="btn btn--primary" href="collection.html?c=all">Start shopping</a>
      </div>`;
    return;
  }

  host.innerHTML = lines.map(l => `
    <div class="cart-line">
      <img class="cart-line__img" src="${productImage(l.product, { w: 260, h: 325 })}" alt="">
      <div>
        <h3><a href="product.html?id=${l.product.id}">${esc(l.product.title)}</a></h3>
        <div class="cart-line__sub">${esc(l.product.categoryName)} · ${esc(l.product.size)}</div>
        <div class="cart-line__sub">${money(l.product.price)} each</div>
        <div class="cart-line__ctl">
          <div class="qty">
            <button class="js-dec" data-id="${l.product.id}" aria-label="Decrease quantity">&minus;</button>
            <input class="js-qty" type="number" min="0" value="${l.qty}" data-id="${l.product.id}" aria-label="Quantity">
            <button class="js-inc" data-id="${l.product.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="text-btn js-remove" data-id="${l.product.id}">Remove</button>
        </div>
      </div>
      <div class="cart-line__right">${money(l.total)}</div>
    </div>`).join('');
}

function renderSummary() {
  const subtotal = Cart.subtotal();
  if (!subtotal) return;

  const discount = appliedPromo ? Math.round(subtotal * appliedPromo.percent / 100) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= STORE.freeShipOver ? 0 : SHIPPING_FLAT;
  const total = afterDiscount + shipping;
  const remaining = STORE.freeShipOver - afterDiscount;

  qs('#summaryBody').innerHTML = `
    <div class="summary__row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    ${discount ? `<div class="summary__row"><span>Discount (${esc(appliedPromo.code)})</span>
        <span class="free">&minus;${money(discount)}</span></div>` : ''}
    <div class="summary__row">
      <span>Shipping</span>
      <span class="${shipping ? '' : 'free'}">${shipping ? money(shipping) : 'Free'}</span>
    </div>
    <div class="summary__row summary__row--total"><span>Total</span><span>${money(total)}</span></div>
    ${remaining > 0
      ? `<div class="ship-bar" style="margin-top:14px">
           <div class="ship-bar__text">Add ${money(remaining)} more for free shipping</div>
           <div class="ship-bar__track">
             <div class="ship-bar__fill" style="width:${Math.min(100, afterDiscount / STORE.freeShipOver * 100)}%"></div>
           </div>
         </div>`
      : ''}`;
}

function renderAll() {
  renderLines();
  renderSummary();
}

/* ui.js calls this hook whenever cart state changes. */
function onCartChange() { renderAll(); }

document.addEventListener('DOMContentLoaded', () => {
  renderAll();

  const grid = qs('#relatedGrid');
  if (grid) grid.innerHTML = byBadge('bestseller', 4).map(productCard).join('');

  document.addEventListener('click', e => {
    const rm = e.target.closest('.js-remove');
    if (rm) {
      const p = getProduct(rm.dataset.id);
      Cart.remove(rm.dataset.id);
      toast((p ? p.title : 'Item') + ' removed');
    }
  });

  qs('#promoForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = qs('#promoInput');
    const note = qs('#promoNote');
    const code = input.value.trim().toUpperCase();

    if (code === STORE.promo.code) {
      appliedPromo = { code: code, percent: STORE.promo.percent };
      savePromo(appliedPromo);
      note.className = 'note note--ok';
      note.textContent = `${code} applied — ${STORE.promo.percent}% off your order.`;
      input.value = '';
    } else {
      appliedPromo = null;
      savePromo(null);
      note.className = 'note note--err';
      note.textContent = code ? `${code} is not a valid code.` : 'Enter a code first.';
    }
    renderSummary();
  });

  qs('#checkoutBtn').addEventListener('click', () => {
    if (!Cart.count()) return;
    location.href = 'order.html';
  });

  // Quick path: skip the form and just message us.
  const waBtn = qs('#whatsappBtn');
  if (waBtn) {
    if (BUSINESS.whatsapp) {
      waBtn.addEventListener('click', () => {
        if (!Cart.count()) return;
        window.open(whatsappHref(orderSummaryText()), '_blank', 'noopener');
      });
    } else {
      waBtn.remove();   // no number configured — don't show a dead button
    }
  }
});
