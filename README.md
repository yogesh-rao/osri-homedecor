# OSRI — storefront

A static storefront for OSRI home textiles: homepage, collection listing,
product detail, cart, plus About, Contact and Policies. No build step, no
dependencies, no server required.

## Run it

Open `index.html` in a browser, or serve the folder:

```
python -m http.server 8080
```

then visit <http://localhost:8080>.

## Current state

The catalog is **empty on purpose** — you add products when they are ready.
While it is empty the site runs in a pre-launch mode:

- the homepage shows a "collection coming soon" band and hides the empty rails
- category tiles read "Coming soon" instead of a product count
- the shop page explains that nothing is listed yet
- an orange setup note on the homepage reminds you where products go

All of that disappears on its own as soon as you add the first product.

## Adding products

Open `js/data.js` and fill in the `RAW` array. One row per product:

```js
['osri-001', 'Indigo Buti Double Bedsheet', 'double-bedsheets', 1299, 1899, 'buti', 'indigo', 'new'],
```

| position | field | notes |
|---|---|---|
| 1 | `id` | unique, no spaces |
| 2 | `title` | shown everywhere |
| 3 | `category` | must match a slug in `CATEGORIES` |
| 4 | `price` | what you actually charge |
| 5 | `mrp` | struck-through price; discount % is calculated |
| 6 | `motif` | placeholder art: `buti` `vine` `jaali` `chevron` `bloom` `stripe` |
| 7 | `palette` | placeholder art: `terracotta` `indigo` `saffron` `teal` `olive` `rose` `espresso` `sand` |
| 8 | `badge` | `bestseller`, `new`, `premium` or `''` |

Every page updates automatically — homepage rails, menus, filters, counts.

### Real photographs

Until you have photos, the site draws a tiled print from the `motif` and
`palette` above so nothing looks broken. To use a real image, drop the file in
`assets/products/` and set the product's `image` field in `js/data.js`:

```js
image: 'assets/products/indigo-buti.jpg'
```

That overrides the placeholder art everywhere — cards, gallery, cart, drawer.
Shoot roughly 4:5 portrait for the best fit.

## Your business details

`BUSINESS` at the top of `js/data.js` holds email, phone, address, GSTIN and
social links. Everything there is blank and marked `TODO`. Blank fields show a
visible **"to be added"** marker on the contact page and are simply omitted from
the footer, so you can always see what is still outstanding.

`STORE` in the same file holds the name, tagline, currency, free-shipping
threshold and discount code.

## Brand

Colours and type live in the `:root` block at the top of `css/styles.css`:

- warm ivory ground `#FAF7F2`, espresso text `#2A211C`
- terracotta accent `#A84A26`
- teal `#1F6B63` for success states, muted red for errors
- Cormorant Garamond headings, Inter body

Change those tokens and the whole site follows. If you have real brand colours
or a logo, they go here.

## Files

```
index.html        homepage — hero, categories, rails, story bands, newsletter
collection.html   listing with category chips, search and sort (state in the URL)
product.html      detail — gallery, colourways, quantity, related products
cart.html         cart lines, promo code, totals, mock checkout
about.html        brand story  (PLACEHOLDER COPY — rewrite before launch)
contact.html      details, enquiry form, common questions
policies.html     shipping, returns, care, FAQ, privacy, terms (DRAFTS)
css/styles.css    all styling; design tokens at the top
js/data.js        store config, business details, categories, YOUR PRODUCTS
js/patterns.js    generates the placeholder print artwork
js/ui.js          header, footer, cart state, cart drawer, product cards
js/home.js        homepage wiring and pre-launch behaviour
js/collection.js  filtering, search, sorting
js/product.js     detail page wiring
js/cart.js        cart page wiring
js/contact.js     contact details and form
assets/products/  your product photos go here
```

## Before you launch — still to do

1. **Rewrite `about.html`.** The copy there is a placeholder written to show the
   layout. It describes a generic small-batch textile brand, not OSRI's actual
   story. Replace it.
2. **Review `policies.html` properly.** Shipping timelines, return windows and
   the privacy and terms sections are drafts based on typical Indian D2C
   practice. Check them against your real courier terms and get qualified advice
   before taking money.
3. **Fill in `BUSINESS`** in `js/data.js` — a real address, phone and GSTIN are
   expected by most Indian payment gateways.
4. **Check the claims on the homepage.** Statements like "pure cotton, no
   polyester blends", "dispatched within one working day" and "7-day returns"
   are currently assumptions. Make them true or change them.
5. **Connect the forms.** The newsletter and contact form are front-end only.
   The contact form deliberately says so rather than pretending to send.
6. **Add checkout.** There is no payment gateway and no order storage.

## What is not real yet

Front end only. The cart persists in `localStorage` under `osri.cart.v1`. There
are no accounts, no payments and no orders. The `OSRI10` code takes 10% off in
the cart purely client-side — treat it as a UI demo, not as pricing logic you
can trust.

The folder is still named `mint_pillow` from the initial build. Renaming it is
safe — nothing references the folder name.
