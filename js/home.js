/* Homepage. Everything here adapts to how full the catalog is: rails with no
   products hide themselves, and an empty catalog switches the page into a
   pre-launch state instead of showing rows of nothing. */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- artwork: real photographs, with generated art only as a fallback ---- */

  /** Nth photo of a product, or '' if that product has none. */
  function photoOf(productId, index) {
    const p = productId && getProduct(productId);
    if (!p || !p.images.length) return '';
    return p.images[Math.min(index || 0, p.images.length - 1)];
  }

  const art = [
    ['heroArt',   photoOf(HOME.heroFrom, 0),
      ['bloom', 'terracotta', { w: 1600, h: 900, unit: 150, border: false }]],
    ['storyArtA', photoOf(HOME.storyAFrom, HOME.storyAIndex),
      ['vine', 'olive', { w: 900, h: 720, unit: 120, border: false }]],
    ['storyArtB', photoOf(HOME.storyBFrom, 0),
      ['jaali', 'indigo', { w: 900, h: 720, unit: 110, border: false }]]
  ];
  art.forEach(([id, photo, fallback]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.src = photo || patternDataURI(fallback[0], fallback[1], fallback[2]);
  });

  /* ---- shop by category ---- */
  const catGrid = document.getElementById('catGrid');
  if (catGrid) {
    catGrid.innerHTML = CATEGORIES.map(c => {
      const items = productsIn(c.slug);
      const n = items.length;
      // Lead with a real photo from the category; fall back to the print art.
      const lead = items.find(p => p.image) || items.find(p => p.images.length);
      const src = lead
        ? (lead.image || lead.images[0])
        : patternDataURI(c.motif, c.palette, { w: 400, h: 400, unit: 66 });
      return `
      <a class="cat-card" href="collection.html?c=${c.slug}">
        <div class="cat-card__img">
          <img src="${src}" alt="${esc(c.name)}" loading="lazy">
        </div>
        <h3>${esc(c.name)}</h3>
        <span>${n ? n + (n === 1 ? ' product' : ' products') : 'Coming soon'}</span>
      </a>`;
    }).join('');
  }

  /* ---- product rails ---- */
  const rails = [
    ['railBestsellers', byBadge('bestseller', 8)],
    ['railNew',         byBadge('new', 4)],
    ['railBedding',     productsIn('bedsheets-fitted').slice(0, 4)],
    ['railQuilts',      productsIn('bedsheets-king').slice(0, 4)],
    ['railCushions',    productsIn('cushions-linen').concat(productsIn('bags')).slice(0, 4)]
  ];

  rails.forEach(([id, list]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const section = el.closest('section');
    if (list.length) {
      el.innerHTML = list.map(productCard).join('');
    } else if (section) {
      section.hidden = true;   // nothing to show yet — drop the whole band
    }
  });

  /* ---- pre-launch / preview state ---- */
  const note = document.getElementById('setupNote');

  if (catalogEmpty()) {
    const preLaunch = document.getElementById('preLaunch');
    if (preLaunch) preLaunch.hidden = false;

    if (note) {
      note.hidden = false;
      note.innerHTML = `
        <div>
          <strong>Setup:</strong> no products yet. Add them to the
          <code>RAW</code> array in <code>js/data.js</code> and this page fills in
          automatically.
        </div>`;
    }
  } else if (usingSampleCatalog() && note) {
    // Must be impossible to mistake preview data for real stock.
    note.hidden = false;
    note.innerHTML = `
      <div>
        <strong>Preview mode:</strong> these are sample products with invented
        prices, shown so you can see every page working. Add your real items to
        <code>RAW</code> in <code>js/data.js</code> and they replace this
        automatically — or set <code>USE_SAMPLE_CATALOG = false</code> to empty
        the site again.
      </div>`;
  }

  /* ---- newsletter ---- */
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        toast('Please enter a valid email address');
        return;
      }
      // Without a key there is nowhere to send it, so do not pretend.
      if (!CONTACT.web3formsKey) {
        toast('Sign-ups are not connected yet — please email ' + BUSINESS.email);
        return;
      }
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: CONTACT.web3formsKey,
            subject: 'New launch-list sign-up from theosri.in',
            from_name: 'theosri.in sign-up',
            email: email,
            message: 'Wants to hear when the collection goes live.'
          })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          toast('Thank you — we will let you know');
          form.reset();
        } else {
          toast('Could not sign you up just now, sorry');
        }
      } catch (err) {
        toast('Could not sign you up — you may be offline');
      }
    });
  }
});
