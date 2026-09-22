/* Interim checkout: collect delivery details, show a UPI QR for the exact
   amount, then hand the whole order to WhatsApp as a pre-filled message.

   There is no backend. Nothing here charges a card or reserves stock —
   the shop owner confirms each payment in their bank app before dispatch. */

const SHIPPING_FLAT = STORE.shippingFlat;

/* Set once the order has been handed to WhatsApp. Emptying the cart then
   fires cart:change, and without this the page would reload and replace the
   confirmation with the "your cart is empty" state. */
let orderPlaced = false;

function totals() {
  const subtotal = Cart.subtotal();
  const promo = readPromo();
  const discount = promo ? Math.round(subtotal * promo.percent / 100) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= STORE.freeShipOver ? 0 : SHIPPING_FLAT;
  return { subtotal, promo, discount, shipping, total: afterDiscount + shipping };
}

function renderSummary() {
  const { subtotal, promo, discount, shipping, total } = totals();
  const lines = Cart.lines();

  qs('#orderLines').innerHTML = lines.map(l => `
    <div class="mini-line">
      <img src="${productImage(l.product, { w: 200, h: 250 })}" alt="">
      <div>
        <div class="mini-line__title">${esc(l.product.title)}</div>
        <div class="mini-line__meta">${esc(l.product.size)} · qty ${l.qty}</div>
      </div>
      <div class="mini-line__price">${money(l.total)}</div>
    </div>`).join('');

  qs('#orderTotals').innerHTML = `
    <div class="summary__row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    ${discount ? `<div class="summary__row"><span>Discount (${esc(promo.code)})</span>
        <span class="free">&minus;${money(discount)}</span></div>` : ''}
    <div class="summary__row">
      <span>Shipping</span>
      <span class="${shipping ? '' : 'free'}">${shipping ? money(shipping) : 'Free'}</span>
    </div>
    <div class="summary__row summary__row--total"><span>To pay</span><span>${money(total)}</span></div>`;
}

/** Draw the UPI QR for the current total, or explain why there isn't one. */
function renderQR() {
  const panel = qs('#qrPanel');
  const { total } = totals();
  const ref = orderRef();
  const href = upiHref(total, STORE.name + ' ' + ref);

  if (!upiConfigured()) {
    // Owner hasn't set a UPI ID yet — don't show a broken QR to customers.
    panel.innerHTML = `
      <div class="warn-note" style="margin:0">
        <div><strong>UPI not set up yet.</strong> Add your business UPI ID to
        <code>PAYMENT.upiId</code> in <code>js/data.js</code> and the QR appears here.
        Until then, choose Cash on Delivery or send the order on WhatsApp and we
        will share payment details.</div>
      </div>`;
    return;
  }

  let qrMarkup = '';
  if (typeof qrcode === 'function') {
    const qr = qrcode(0, 'M');          // 0 = pick the smallest version that fits
    qr.addData(href);
    qr.make();
    qrMarkup = `<img src="${qr.createDataURL(6, 2)}" alt="UPI QR code for ${money(total)}">`;
  } else {
    qrMarkup = `<div class="note note--err">QR library did not load — use the UPI ID below.</div>`;
  }

  panel.innerHTML = `
    ${qrMarkup}
    <div class="qr-amount">${money(total)}</div>
    <div class="qr-vpa">${esc(PAYMENT.upiId)}</div>
    <div style="margin-top:14px">
      <a class="btn btn--primary" href="${href}">Open UPI app</a>
    </div>
    <div class="qr-note">
      Scan with any UPI app, or tap the button on a phone.<br>
      Reference <span class="order-ref">${esc(ref)}</span>
    </div>`;
}

function selectedMethod() {
  const el = qs('input[name="paymethod"]:checked');
  return el ? el.value : 'upi';
}

function syncMethodUI() {
  const method = selectedMethod();
  qsa('.pay-option').forEach(o => {
    o.classList.toggle('is-selected', o.querySelector('input').checked);
  });
  qs('#upiBlock').hidden = method !== 'upi';
  qs('#sendBtn').textContent = method === 'upi'
    ? 'I have paid — send order'
    : 'Place order on WhatsApp';
}

/** Basic client-side checks. Nothing sensitive is submitted anywhere. */
function validate() {
  const fields = [
    ['#fName', v => v.trim().length >= 2, 'Please enter your name'],
    ['#fPhone', v => /^[6-9]\d{9}$/.test(v.replace(/\D/g, '').slice(-10)), 'Enter a 10-digit mobile number'],
    ['#fAddress', v => v.trim().length >= 10, 'Please enter the full delivery address'],
    ['#fPincode', v => /^\d{6}$/.test(v.trim()), 'Enter a 6-digit PIN code']
  ];
  if (selectedMethod() === 'upi') {
    fields.push(['#fUtr', v => v.trim().length >= 6,
      'Enter the UPI reference / UTR shown in your payment app']);
  }

  for (const [sel, ok, msg] of fields) {
    const el = qs(sel);
    if (!ok(el.value)) {
      qs('#orderNote').className = 'note note--err';
      qs('#orderNote').textContent = msg;
      el.focus();
      return null;
    }
  }
  qs('#orderNote').textContent = '';
  return {
    name: qs('#fName').value.trim(),
    phone: qs('#fPhone').value.trim(),
    address: qs('#fAddress').value.trim() + ', PIN ' + qs('#fPincode').value.trim(),
    method: selectedMethod() === 'upi' ? 'Paid by UPI' : 'Cash on Delivery',
    utr: selectedMethod() === 'upi' ? qs('#fUtr').value.trim() : ''
  };
}

/** Once the order has gone, the checkout must stop looking like a form that
    still wants paying. Replace the whole thing with a confirmation. */
function showConfirmation(ref, amount, text, method) {
  const wa = whatsappHref(text);
  const resend = wa
    ? `<a class="btn btn--light" href="${wa}" target="_blank" rel="noopener">Send the message again</a>`
    : '';

  qs('#checkoutRoot').innerHTML = `
    <div class="coming-soon" style="grid-column:1/-1">
      <span class="eyebrow">Order sent</span>
      <h3>Thank you — we have your order</h3>
      <p>
        Your reference is <span class="order-ref">${esc(ref)}</span> for
        <strong>${money(amount)}</strong>.
        ${method === 'upi'
          ? 'We will confirm on WhatsApp as soon as the payment shows in our account.'
          : 'We will confirm on WhatsApp and send it out for cash on delivery.'}
      </p>
      <p style="font-size:.85rem">
        If the WhatsApp message did not go through, send it again below —
        we only see your order once that message arrives.
      </p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:6px">
        ${resend}
        <a class="btn btn--primary" href="collection.html?c=all">Continue shopping</a>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sendOrder() {
  const details = validate();
  if (!details) return;

  // Capture everything before the cart is emptied — the confirmation and the
  // resend link must still work once the cart is gone.
  const text = orderSummaryText(details);
  const ref = orderRef();
  const amount = totals().total;
  const method = selectedMethod();
  const wa = whatsappHref(text);

  if (wa) {
    window.open(wa, '_blank', 'noopener');
  } else {
    // No WhatsApp number configured — fall back to email.
    location.href = 'mailto:' + BUSINESS.email +
      '?subject=' + encodeURIComponent('New order ' + ref) +
      '&body=' + encodeURIComponent(text);
  }

  // Stop onCartChange from reloading the page out from under the confirmation.
  orderPlaced = true;
  Cart.clear();
  clearOrderRef();          // the next order gets its own reference
  showConfirmation(ref, amount, text, method);
}

document.addEventListener('DOMContentLoaded', () => {
  if (!Cart.count()) {
    qs('#checkoutRoot').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <h3>Your cart is empty</h3>
        <p>Add something first and the checkout will appear here.</p>
        <a class="btn btn--primary" href="collection.html?c=all">Start shopping</a>
      </div>`;
    return;
  }

  // Hide the COD option if the owner has switched it off.
  if (!PAYMENT.codAvailable) {
    const cod = qs('#codOption');
    if (cod) cod.remove();
  }

  qs('#dispatchNote').textContent = PAYMENT.dispatchNote || '';
  renderSummary();
  renderQR();
  syncMethodUI();

  qsa('input[name="paymethod"]').forEach(r =>
    r.addEventListener('change', syncMethodUI));
  qs('#sendBtn').addEventListener('click', sendOrder);
});

/* Keep the QR and totals correct if the cart changes in another tab. */
function onCartChange() {
  if (orderPlaced) return;              // confirmation is showing — leave it alone
  if (!Cart.count()) { location.reload(); return; }
  renderSummary();
  renderQR();
}
