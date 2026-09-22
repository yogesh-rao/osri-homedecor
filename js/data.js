/* ============================================================
   OSRI — store configuration and catalog.
   This file is the one you edit most. Everything below marked
   TODO needs your real details before the site goes live.
   ============================================================ */

const STORE = {
  name: 'OSRI',
  // From your own logo artwork / marketing collage.
  tagline: 'Everyday Living, Beautifully Yours',
  site: 'theosri.in',
  currency: '₹',
  freeShipOver: 999,
  shippingFlat: 79,                 // charged when the order is below freeShipOver
  promo: { code: 'OSRI10', percent: 10 }
};

/* Used by the footer and contact page. Blank fields render as
   "to be added" so you can see at a glance what is still missing. */
const BUSINESS = {
  legalName: 'OSRI',
  email: 'care@theosri.in',
  phone: '+91 94610 44224',
  whatsapp: '919461044224',         // country code + number, digits only
  addressLines: ['Fresco-701, SJR Fiesta Homes', 'Doddanagamangla, Electronic City Phase 2'],
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560100',
  gstin: '',                        // awaiting registration — required on invoices in India
  hours: 'Monday to Saturday, 10am to 6pm IST',
  instagram: '',                    // account not created yet — full URL when it is
  facebook: ''                      // optional — full URL
};

/* ------------------------------------------------------------
   INTERIM PAYMENTS — UPI QR + WhatsApp ordering.

   This is the stop-gap until a payment gateway is live (which needs
   your GSTIN). The customer places the order over WhatsApp and pays
   by scanning your UPI QR. Nothing is charged automatically, so you
   must confirm each payment in your own bank app before dispatching.

   Set `upiId` to your BUSINESS UPI (current account), not a personal
   one. Until it is set, the site quietly hides the QR and offers
   WhatsApp ordering only — nothing looks broken.
   ------------------------------------------------------------ */
const PAYMENT = {
  upiId: 'itengg.anita@oksbi',      // interim — move to a business UPI on a current account
  upiName: 'OSRI',                  // name shown inside the customer's UPI app
  codAvailable: true,               // show Cash on Delivery as an option
  // Shown to the customer before they pay.
  dispatchNote: 'Orders are dispatched once payment shows in our bank account, usually within a few hours on working days.'
};

/* ------------------------------------------------------------
   CONTACT FORM DELIVERY.

   A static site cannot send email by itself, so the enquiry form posts to
   Web3Forms, which emails it to you. Free tier is 250 submissions a month.

   To switch it on:
     1. Go to web3forms.com and enter care@theosri.in
     2. They email you an Access Key — paste it below
   Until a key is set the form still works: it opens WhatsApp with the
   enquiry filled in, so nothing is lost.

   Separately, every enquiry is offered to you on WhatsApp as well, so you
   get an instant ping rather than only an email you might not check.
   ------------------------------------------------------------ */
const CONTACT = {
  // Public by design — it only accepts submissions, it cannot read anything.
  web3formsKey: 'fc051eff-e1a9-4c6c-8ba9-0832717ef7c8',
  alsoNotifyWhatsApp: true,         // open WhatsApp with the enquiry after sending
  subject: 'New enquiry from theosri.in'
};

/* ------------------------------------------------------------
   HOMEPAGE ARTWORK.

   Which real photograph fills the hero and the two story panels. Values
   are product ids — the photo is pulled from that product, so there is no
   second copy of the image to keep in sync. Anything left blank, or
   pointing at a product without photos, falls back to the generated
   block-print art rather than breaking the layout.

   Category tiles use each category's first photographed product.
   ------------------------------------------------------------ */
const HOME = {
  heroFrom:   'osri-211',   // wide bedroom shot reads well behind the headline
  storyAFrom: 'osri-301',   // fabric close-up, next to the "how it is made" copy
  storyBFrom: 'osri-512',   // cushions on a sofa, next to the "a room shifts" copy
  // Use a later photo from that product rather than its first, where the
  // first is a plain pack shot and a later one is the lifestyle image.
  storyAIndex: 2            // the detail shot of the fitted sheet
};

/* Categories drive the menu, the homepage tiles and the collection filters.
   Delete what you do not sell, rename freely. `motif` and `palette` only
   control the placeholder artwork until real photos exist. */
const CATEGORIES = [
  { slug: 'bedsheets-king',   name: 'King Bedsheets',     blurb: 'Generous drop for larger beds',              motif: 'jaali',   palette: 'indigo' },
  { slug: 'bedsheets-fitted', name: 'Fitted Bedsheets',   blurb: 'Elasticated corners, no tugging at night',   motif: 'stripe',  palette: 'espresso' },
  { slug: 'cushions-linen',   name: 'Cushions & Table Linen', blurb: 'Change a room without moving furniture', motif: 'bloom',   palette: 'saffron' },
  { slug: 'bags',             name: 'Bags & Accessories', blurb: 'Printed cotton totes, laptop and travel bags', motif: 'vine',  palette: 'olive' }
];

/* ------------------------------------------------------------
   YOUR PRODUCTS GO HERE.

   One array row per product, in this exact order:

     [ id, title, category, price, mrp, motif, palette, badge ]

     id       unique, no spaces           'osri-001'
     title    shown everywhere            'Indigo Buti Double Bedsheet'
     category must match a slug above     'double-bedsheets'
     price    what you charge, a number    1299
     mrp      struck-through price         1899   (discount % is calculated)
     motif    placeholder art pattern      buti | vine | jaali | chevron | bloom | stripe
     palette  placeholder art colour       terracotta | indigo | saffron | teal
                                           olive | rose | espresso | sand
     badge    corner label or empty        'bestseller' | 'new' | 'premium' | ''
     stock    units you have on hand       6     (0 shows "Sold out")

   Set mrp to 0 when there is no struck-through price — the discount badge
   is then hidden rather than showing a meaningless 0% off.

   Prices and stock below come from OSRI_Stall_Profit_Tracker.xlsx.
   Stock = "Qty Bought" minus "Qty Sold" from the Stall 2 sheet.
   ------------------------------------------------------------ */

const RAW = [
  // --- King bedsheets ---
  // Five block-print king designs, named by their print.
  // NOTE: stock 1 per design — the tracker showed 4 units against 5 designs,
  // so confirm which of these you actually hold and how many.
  ['osri-211', 'Olive Sprig King Bedsheet',      'bedsheets-king', 1199, 0, 'vine',  'olive',      'new', 1],
  ['osri-212', 'Teal Leaf King Bedsheet',        'bedsheets-king', 1199, 0, 'vine',  'teal',       'new', 1],
  ['osri-213', 'Rose Medallion King Bedsheet',   'bedsheets-king', 1199, 0, 'bloom', 'rose',       'new', 1],
  ['osri-214', 'Seafoam Buti King Bedsheet',     'bedsheets-king', 1199, 0, 'buti',  'teal',       'new', 1],
  ['osri-215', 'Terracotta Paisley King Bedsheet','bedsheets-king',1199, 0, 'bloom', 'terracotta', 'new', 1],

  // Woven stripe king sets. NOT block print, so they carry their own copy.
  // Price and 300 TC confirmed. TODO: fibre composition still unconfirmed —
  // see the note in DESC_BY_ID before claiming cotton or a mercerised finish.
  ['osri-221', 'Sand Stripe King Bedsheet',       'bedsheets-king', 1899, 0, 'stripe', 'sand',       'premium', 1],
  ['osri-222', 'Coral Stripe King Bedsheet',      'bedsheets-king', 1899, 0, 'stripe', 'terracotta', 'premium', 1],
  ['osri-223', 'Almond Stripe King Bedsheet',     'bedsheets-king', 1899, 0, 'stripe', 'sand',       'premium', 1],
  ['osri-224', 'Sage Stripe King Bedsheet',       'bedsheets-king', 1899, 0, 'stripe', 'olive',      'premium', 1],
  ['osri-225', 'Slate Blue Stripe King Bedsheet', 'bedsheets-king', 1899, 0, 'stripe', 'indigo',     'premium', 1],
  ['osri-226', 'Pebble Stripe King Bedsheet',     'bedsheets-king', 1899, 0, 'stripe', 'espresso',   'premium', 1],

  // --- Fitted ---
  ['osri-301', 'Calico Fitted Bedsheet',        'bedsheets-fitted', 1799, 0, 'stripe',  'sand',       'new',        10],

  // --- Cushions & table linen ---
  // Block-print cushion covers sold as a set of five.
  ['osri-511', 'Rose Bouquet Cushion Covers, Set of 5', 'cushions-linen', 799, 0, 'bloom', 'rose',   'new', 1],
  ['osri-512', 'Bird & Vine Cushion Covers, Set of 5',  'cushions-linen', 799, 0, 'vine',  'olive',  'new', 1],

  // --- Bags & accessories ---
  ['osri-651', 'Forest Bloom Laptop Bag',       'bags',              549, 0, 'bloom',   'olive',      'new',         1],
  ['osri-652', 'Teal Buti Laptop Bag',          'bags',              549, 0, 'buti',    'teal',       'new',         1],

  // --- Tote bags 16 x 16 ---
  // NOTE: the file numbers were design indexes, not sizes, so each print is
  // its own product. Stock set to 1 per design — correct if you hold more.
  ['osri-631', 'Rose Vine Tote 16 x 16',        'bags',              549, 0, 'bloom',   'rose',       'new',         1],
  ['osri-632', 'Scarlet Patchwork Tote 16 x 16','bags',              549, 0, 'jaali',   'terracotta', 'new',         1],
  ['osri-633', 'Teal Buti Tote 16 x 16',        'bags',              549, 0, 'buti',    'teal',       'new',         1],
  ['osri-634', 'Coral Sunflower Tote 16 x 16',  'bags',              549, 0, 'bloom',   'terracotta', 'new',         1],
  ['osri-635', 'Azure Bird Tote 16 x 16',       'bags',              549, 0, 'vine',    'indigo',     'new',         1],

  // --- Tote bags 18 x 18 ---
  ['osri-641', 'Emerald Paisley Tote 18 x 18',  'bags',              599, 0, 'vine',    'olive',      'new',         1],
  ['osri-642', 'Golden Elephant Tote 18 x 18',  'bags',              599, 0, 'buti',    'saffron',    'new',         1],
  ['osri-643', 'Rose Buti Tote 18 x 18',        'bags',              599, 0, 'buti',    'rose',       'new',         1],

  // --- Toiletry sets: ten block-print designs, each a set of 3 pouches ---
  // NOTE: stock is set to 1 per design as a safe assumption (the tracker showed
  // 10 toiletry sets in total). Correct these if you hold more of any design.
  ['osri-611', 'Indigo Bloom Toiletry Set',     'bags',              449, 0, 'bloom',   'indigo',     'new',         1],
  ['osri-612', 'Amber Medallion Toiletry Set',  'bags',              449, 0, 'jaali',   'terracotta', 'new',         1],
  ['osri-613', 'Mustard Marigold Toiletry Set', 'bags',              449, 0, 'buti',    'saffron',    'new',         1],
  ['osri-614', 'Rose Garden Toiletry Set',      'bags',              449, 0, 'bloom',   'rose',       'new',         1],
  ['osri-615', 'Scarlet Poppy Toiletry Set',    'bags',              449, 0, 'bloom',   'terracotta', 'new',         1],
  ['osri-616', 'Forest Fern Toiletry Set',      'bags',              449, 0, 'vine',    'teal',       'new',         1],
  ['osri-617', 'Olive Marigold Toiletry Set',   'bags',              449, 0, 'buti',    'olive',      'new',         1],
  ['osri-618', 'Saffron Stripe Toiletry Set',   'bags',              449, 0, 'stripe',  'saffron',    'new',         1],
  ['osri-619', 'Blush Rose Toiletry Set',       'bags',              449, 0, 'bloom',   'rose',       'new',         1],
  ['osri-620', 'Midnight Vine Toiletry Set',    'bags',              449, 0, 'vine',    'espresso',   'new',         1]
];

/* ------------------------------------------------------------
   SAMPLE CATALOG — for previewing the site only.

   These are invented products with invented prices. They exist so you
   can see every page working before your real stock is photographed.

   The moment you add a single row to RAW above, this is ignored
   automatically. To go back to an empty pre-launch site right now,
   set the flag below to false.
   ------------------------------------------------------------ */

const USE_SAMPLE_CATALOG = false;   // real catalogue is live; sample kept below for reference only

const SAMPLE = [
  ['s-101', 'Sanganeri Buti Double Bedsheet',    'double-bedsheets', 1299, 1899, 'buti',    'terracotta', 'bestseller'],
  ['s-102', 'Bagru Vine Double Bedsheet',        'double-bedsheets', 1349, 1999, 'vine',    'espresso',   ''],
  ['s-103', 'Jaipur Bloom Double Bedsheet',      'double-bedsheets', 1399, 2099, 'bloom',   'rose',       ''],
  ['s-104', 'Indigo Jaali Double Bedsheet',      'double-bedsheets', 1449, 2199, 'jaali',   'indigo',     'new'],
  ['s-105', 'Marigold Buti Double Bedsheet',     'double-bedsheets', 1249, 1799, 'buti',    'saffron',    ''],
  ['s-106', 'Anar Vine Double Bedsheet',         'double-bedsheets', 1379, 1999, 'vine',    'olive',      'bestseller'],

  ['s-201', 'Sanganeri Buti Single Bedsheet',    'single-bedsheets',  849, 1299, 'buti',    'rose',       ''],
  ['s-202', 'Bagru Stripe Single Bedsheet',      'single-bedsheets',  799, 1199, 'stripe',  'espresso',   'bestseller'],
  ['s-203', 'Neem Vine Single Bedsheet',         'single-bedsheets',  899, 1349, 'vine',    'olive',      ''],
  ['s-204', 'Chevron Single Bedsheet',           'single-bedsheets',  879, 1299, 'chevron', 'indigo',     ''],

  ['s-301', 'Heritage Jaali King Bedsheet','king-bedsheets',   1899, 2799, 'jaali',   'indigo',     'premium'],
  ['s-302', 'Sanganeri Bloom King Bedsheet',     'king-bedsheets',   1799, 2599, 'bloom',   'terracotta', ''],
  ['s-303', 'Bagru Buti King Bedsheet',    'king-bedsheets',   1949, 2899, 'buti',    'espresso',   'premium'],
  ['s-304', 'Amber Vine King Bedsheet',          'king-bedsheets',   1749, 2499, 'vine',    'saffron',    'bestseller'],

  ['s-401', 'Sanganer 4-Piece Bedding Set',      'bedding-sets',     3499, 4999, 'bloom',   'terracotta', 'premium'],
  ['s-402', 'Indigo Nights 4-Piece Bedding Set', 'bedding-sets',     3699, 5299, 'jaali',   'indigo',     'bestseller'],
  ['s-403', 'Bagru Earth 4-Piece Bedding Set',   'bedding-sets',     3299, 4799, 'buti',    'espresso',   ''],
  ['s-404', 'Rose Court 4-Piece Bedding Set',    'bedding-sets',     3599, 5099, 'bloom',   'rose',       'new'],

  ['s-501', 'Reversible Cotton Dohar',           'quilts',           2199, 3199, 'buti',    'terracotta', 'bestseller'],
  ['s-502', 'Jaipuri Razai Winter Quilt',        'quilts',           2899, 3999, 'bloom',   'indigo',     'premium'],
  ['s-503', 'Summer Muslin Dohar',               'quilts',           1799, 2599, 'vine',    'olive',      ''],
  ['s-504', 'Bagru Block Print Razai',           'quilts',           2499, 3599, 'jaali',   'espresso',   ''],

  ['s-601', 'Sanganeri Buti Cushion Covers, Set of 2', 'cushions',    699,  999, 'buti',    'saffron',    'bestseller'],
  ['s-602', 'Bagru Jaali Cushion Covers, Set of 2',    'cushions',    749, 1099, 'jaali',   'espresso',   ''],
  ['s-603', 'Bloom Cushion Covers, Set of 4',          'cushions',   1299, 1899, 'bloom',   'rose',       'new'],
  ['s-604', 'Indigo Stripe Cushion Covers, Set of 2',  'cushions',    649,  949, 'stripe',  'indigo',     ''],

  ['s-701', 'Little Buti Kids Bedsheet',         'kids',              899, 1299, 'buti',    'saffron',    ''],
  ['s-702', 'Garden Friends Kids Bedsheet',      'kids',              949, 1399, 'bloom',   'teal',       'bestseller'],
  ['s-703', 'Kite Sky Kids Bedsheet',            'kids',              849, 1249, 'chevron', 'indigo',     ''],

  ['s-801', 'Sanganeri Table Runner',            'runners',           649,  949, 'vine',    'olive',      ''],
  ['s-802', 'Festive Bloom Table Runner',        'runners',           749, 1099, 'bloom',   'terracotta', 'new'],
  ['s-803', 'Bagru Jaali Table Mats, Set of 6',  'runners',           899, 1299, 'jaali',   'espresso',   ''],

  ['s-901', 'Waffle Cotton Bath Towel',          'bath',              599,  899, 'stripe',  'teal',       ''],
  ['s-902', 'Block Print Cotton Bathrobe',       'bath',             1699, 2399, 'buti',    'indigo',     'premium'],
  ['s-903', 'Hand Towels, Set of 4',             'bath',              699,  999, 'chevron', 'terracotta', ''],

  ['s-a01', 'Sanganeri Buti Curtain Panel',      'curtains',         1199, 1799, 'buti',    'sand',       ''],
  ['s-a02', 'Indigo Jaali Curtain Panel',        'curtains',         1299, 1899, 'jaali',   'indigo',     'new'],
  ['s-a03', 'Bagru Vine Curtain Panel',          'curtains',         1249, 1849, 'vine',    'olive',      '']
];

/* Your products always win; the sample only fills in while RAW is empty. */
const CATALOG_SOURCE = RAW.length ? RAW : (USE_SAMPLE_CATALOG ? SAMPLE : []);

/* Per-product detail. Override any of these on a single product by adding
   the field to the object in the map below. */
const SIZE_BY_CATEGORY = {
  'bedsheets-double': '90 x 100 in (228 x 254 cm), with 2 pillow covers',
  'bedsheets-king':   '100 x 100 in, with 2 pillow covers',
  'bedsheets-fitted': 'Fitted, with elasticated corners',   // TODO: confirm exact size
  'bedcovers':        'Bedcover set',                       // TODO: confirm exact size
  'cushions-linen':   'Cover only, filler not included',
  'bags':             'One size'
};

/* ------------------------------------------------------------
   REAL PRODUCT PHOTOS.

   List a product's photos here, best one first — it becomes the
   thumbnail everywhere. Anything not listed falls back to the
   generated block-print placeholder, so the grid never has holes.

   Shoot or crop roughly 4:5 or square; the layout crops to fit.
   Keep files under ~400 KB so pages stay quick on mobile data.
   ------------------------------------------------------------ */
const IMAGES_BY_ID = {
  'osri-301': [
    'assets/products/osri-301/1-on-bed.jpg',
    'assets/products/osri-301/2-corner.jpg',
    'assets/products/osri-301/3-detail.jpg',
    'assets/products/osri-301/4-overview.jpg'
  ]
};

/* Optional card thumbnail, when the gallery image is not the best crop for a
   grid tile. Falls back to the first gallery image when absent. */
const THUMB_BY_ID = {};

/* The ten toiletry sets share a filename pattern, so they are filled in by
   loop rather than twenty near-identical lines. One gallery image each (the
   collage), with the three-bag panel cropped out of it for the card. */
for (let n = 611; n <= 620; n++) {
  IMAGES_BY_ID['osri-' + n] = ['assets/products/osri-' + n + '/collage.jpg'];
  THUMB_BY_ID['osri-' + n]  = 'assets/products/osri-' + n + '/thumb.jpg';
}

/* Cushion sets and laptop bags: one shot each. */
[511, 512, 651, 652].forEach(n => {
  IMAGES_BY_ID['osri-' + n] = ['assets/products/osri-' + n + '/1-main.jpg'];
});

/* ------------------------------------------------------------
   WOVEN STRIPE KING SETS (osri-221..226).

   Six colourways of the same 300 TC woven stripe, so the copy is built from
   one template rather than six near-identical blocks that could drift apart.
   Only the colour phrase differs.

   Price and 300 TC are confirmed. Fibre composition and a mercerised finish
   are deliberately NOT claimed: the supplier notes hedged between pure cotton
   and a cotton-poly blend, and the homepage promises "no polyester blends".
   Once the supplier confirms, add it to STRIPE_MATERIAL below and every one
   of the six updates at once.
   ------------------------------------------------------------ */
const STRIPE_COLOURS = {
  'osri-221': 'soft sand',
  'osri-222': 'warm coral',
  'osri-223': 'warm almond',
  'osri-224': 'soft sage',
  'osri-225': 'slate blue',
  'osri-226': 'pebble grey'
};
const STRIPE_MATERIAL = '300 TC woven stripe';   // add fibre once confirmed

/* The loop that fills in their copy lives further down, after DESC_BY_ID,
   FEATURES_BY_ID, SIZE_BY_ID and MATERIAL_BY_ID are all declared — `const`
   is not hoisted, so running it here would throw before the page loads. */

/* Block-print king bedsheets: one lifestyle shot each. */
for (let n = 211; n <= 215; n++) {
  IMAGES_BY_ID['osri-' + n] = ['assets/products/osri-' + n + '/1-main.jpg'];
}

/* Totes: one product shot each. Two designs also have a multi-view sheet
   (front, top zip, inside), which is listed second. */
[631, 632, 633, 634, 635, 641, 642, 643].forEach(n => {
  IMAGES_BY_ID['osri-' + n] = ['assets/products/osri-' + n + '/1-main.jpg'];
});
[634, 635].forEach(n => {
  IMAGES_BY_ID['osri-' + n].push('assets/products/osri-' + n + '/2-views.jpg');
});

/* Per-product sizes, where they differ from the category default above.
   Anything not listed here falls back to SIZE_BY_CATEGORY. */
const SIZE_BY_ID = {
  'osri-511': 'Set of 5 covers, fillers not included',  // TODO: confirm cover size
  'osri-512': 'Set of 5 covers, fillers not included',  // TODO: confirm cover size
  'osri-651': 'Laptop bag with two outside pockets',    // TODO: confirm laptop size it fits
  'osri-652': 'Laptop bag with two outside pockets',    // TODO: confirm laptop size it fits
};

/* Per-product description, where the default block-print copy is not accurate.
   Everything OSRI sells is hand block printed EXCEPT the Calico fitted sheet,
   so that one gets its own honest description rather than the default. */
const DESC_BY_ID = {
  'osri-301':
    'A printed pure cotton fitted sheet with elasticated corners, finished with ' +
    'an eyelet lace border and matching pillow covers. Pre-shrunk and washed soft, ' +
    'so it holds the mattress without tugging loose overnight.'
};

/* Per-product feature bullets, where the defaults do not describe the item. */
const FEATURES_BY_ID = {
  'osri-301': [
    'Elasticated corners for a snug fit',
    'Printed pure cotton with an eyelet lace border',
    'Comes with matching pillow covers',
    'Pre-shrunk, so it holds its size'
  ],
  'osri-651': ['Two outside pockets', 'Block printed cotton', 'Padded and quilted', 'Carry handles'],
  'osri-652': ['Two outside pockets', 'Block printed cotton', 'Padded and quilted', 'Carry handles'],
  'osri-511': ['Set of five covers', 'Block printed cotton', 'Covers only — fillers not included'],
  'osri-512': ['Set of five covers', 'Block printed cotton', 'Covers only — fillers not included']
};

/* Toiletry sets, totes and the block-print king bedsheets each share a size and
   fabric description within their run. */
const MATERIAL_BY_ID = {};
for (let n = 211; n <= 215; n++) {
  SIZE_BY_ID['osri-' + n] = '108 x 100 in (king), with 2 pillow covers';
  MATERIAL_BY_ID['osri-' + n] = '100% cotton, block print';
}
for (let n = 611; n <= 620; n++) {
  SIZE_BY_ID['osri-' + n] = 'Set of 3 — large, medium and slim pouch';
  MATERIAL_BY_ID['osri-' + n] = 'Quilted cotton, printed';
}
for (let n = 631; n <= 635; n++) {
  SIZE_BY_ID['osri-' + n] = '16 x 16 in';
  MATERIAL_BY_ID['osri-' + n] = 'Quilted cotton, printed';
}
for (let n = 641; n <= 643; n++) {
  SIZE_BY_ID['osri-' + n] = '18 x 18 in';
  MATERIAL_BY_ID['osri-' + n] = 'Quilted cotton, printed';
}
[511, 512, 651, 652].forEach(n => {
  MATERIAL_BY_ID['osri-' + n] = '100% cotton, block print';
});
/* All six stripe colourways, built from one template. Placed here because it
   writes into every one of the maps above, so they must exist first. */
Object.keys(STRIPE_COLOURS).forEach(id => {
  IMAGES_BY_ID[id] = ['assets/products/' + id + '/1-main.jpg'];
  SIZE_BY_ID[id] = '108 x 100 in (king), with 2 pillow covers';
  MATERIAL_BY_ID[id] = STRIPE_MATERIAL;
  DESC_BY_ID[id] =
    'A 300 thread count woven stripe in ' + STRIPE_COLOURS[id] + ' on a cream ' +
    'ground, with two matching pillow covers. Generous king proportions so it ' +
    'sits flat with an even drop on both sides, and a close, smooth weave that ' +
    'presses crisp and softens with every wash.';
  FEATURES_BY_ID[id] = [
    '300 thread count',
    'King size, 108 x 100 in',
    'Comes with two matching pillow covers',
    'Woven stripe, not a printed one'
  ];
});

/* Applied to every product unless overridden. Check these claims match what
   your printers actually do before launch — they appear on every listing. */
const DEFAULT_COPY = {
  description:
    'Hand block printed in Rajasthan on pure cotton, then washed soft before it ' +
    'reaches you. Each length is printed one block at a time, so slight shifts in ' +
    'the repeat and small variations in colour are part of how it is made.',
  care: 'Machine wash cold and separately for the first two washes. Dry in shade, warm iron.',
  features: [
    'Hand block printed by artisans in Rajasthan',
    'Pure cotton, no polyester blend',
    'Pre-shrunk so it holds its size',
    'Printed in small batches, not mass produced'
  ]
};

const PRODUCTS = CATALOG_SOURCE.map(function (row) {
  const id = row[0], title = row[1], category = row[2];
  const cat = CATEGORIES.find(function (c) { return c.slug === category; });
  // Stable pseudo-random rating/stock so numbers do not jump between reloads.
  // Replace with real values once you have them.
  const seed = id.split('').reduce(function (a, ch) { return a + ch.charCodeAt(0); }, 0);

  return {
    id: id,
    title: title,
    category: category,
    categoryName: cat ? cat.name : category,
    price: row[3],
    mrp: row[4],
    motif: row[5],
    palette: row[6],
    badge: row[7],
    images: IMAGES_BY_ID[id] || [],  // gallery photos, best first; empty = placeholder art
    image: THUMB_BY_ID[id] || (IMAGES_BY_ID[id] || [])[0] || '',   // card thumbnail
    size: SIZE_BY_ID[id] || SIZE_BY_CATEGORY[category] || 'Standard',
    material: MATERIAL_BY_ID[id] || (category === 'bags' ? 'Cotton canvas' : '100% cotton'),
    care: DEFAULT_COPY.care,
    // No invented ratings on a real catalogue — stars stay hidden until you
    // have genuine reviews. Set these per product once customers leave them.
    rating: 0,
    reviews: 0,
    stock: typeof row[8] === 'number' ? row[8] : 0,
    description: DESC_BY_ID[id] || DEFAULT_COPY.description,
    features: FEATURES_BY_ID[id] || DEFAULT_COPY.features
  };
});

/* ---------------- lookups ---------------- */

function getProduct(id) {
  return PRODUCTS.find(function (p) { return p.id === id; });
}
function productsIn(slug) {
  return PRODUCTS.filter(function (p) { return p.category === slug; });
}
function getCategory(slug) {
  return CATEGORIES.find(function (c) { return c.slug === slug; });
}
function byBadge(badge, limit) {
  const list = PRODUCTS.filter(function (p) { return p.badge === badge; });
  return limit ? list.slice(0, limit) : list;
}
/** True until the first product is added — pages use this to show
    "coming soon" states instead of looking broken. */
function catalogEmpty() {
  return PRODUCTS.length === 0;
}
/** True while the site is filled with preview data rather than your stock. */
function usingSampleCatalog() {
  return RAW.length === 0 && PRODUCTS.length > 0;
}
