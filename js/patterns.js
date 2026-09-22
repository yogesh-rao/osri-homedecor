/* Generates hand-block-print style SVG placeholders so the store looks
   complete before real photography exists. Drop a real image path into a
   product's `image` field and it takes over automatically. */

const PALETTES = {
  terracotta: { bg: '#F8EFE8', ink: '#A84A26', alt: '#DFA383' },
  indigo:     { bg: '#EEF0F6', ink: '#33447A', alt: '#8C9BC4' },
  saffron:    { bg: '#FBF3E2', ink: '#B07A16', alt: '#E3C077' },
  teal:       { bg: '#EAF3F2', ink: '#1F6B63', alt: '#8CBDB6' },
  olive:      { bg: '#F1F2E8', ink: '#5F6B36', alt: '#A9B583' },
  rose:       { bg: '#F9EDF0', ink: '#93405A', alt: '#D3A0B0' },
  espresso:   { bg: '#F2EFEA', ink: '#4A3B32', alt: '#A8968A' },
  sand:       { bg: '#F6F1E7', ink: '#8A7444', alt: '#CFBE96' }
};

const MOTIFS = {
  buti(p, u) {
    return `
      <circle cx="${u / 2}" cy="${u / 2}" r="${u * 0.09}" fill="${p.ink}"/>
      <g fill="${p.alt}">
        <ellipse cx="${u / 2}" cy="${u * 0.28}" rx="${u * 0.055}" ry="${u * 0.11}"/>
        <ellipse cx="${u / 2}" cy="${u * 0.72}" rx="${u * 0.055}" ry="${u * 0.11}"/>
        <ellipse cx="${u * 0.28}" cy="${u / 2}" rx="${u * 0.11}" ry="${u * 0.055}"/>
        <ellipse cx="${u * 0.72}" cy="${u / 2}" rx="${u * 0.11}" ry="${u * 0.055}"/>
      </g>
      <circle cx="0" cy="0" r="${u * 0.045}" fill="${p.ink}" opacity=".55"/>
      <circle cx="${u}" cy="0" r="${u * 0.045}" fill="${p.ink}" opacity=".55"/>
      <circle cx="0" cy="${u}" r="${u * 0.045}" fill="${p.ink}" opacity=".55"/>
      <circle cx="${u}" cy="${u}" r="${u * 0.045}" fill="${p.ink}" opacity=".55"/>`;
  },
  vine(p, u) {
    return `
      <path d="M0 ${u * 0.75} Q ${u * 0.25} ${u * 0.35} ${u * 0.5} ${u * 0.75} T ${u} ${u * 0.75}"
            fill="none" stroke="${p.ink}" stroke-width="${u * 0.035}" stroke-linecap="round"/>
      <path d="M0 ${u * 0.25} Q ${u * 0.25} ${u * -0.15} ${u * 0.5} ${u * 0.25} T ${u} ${u * 0.25}"
            fill="none" stroke="${p.ink}" stroke-width="${u * 0.035}" stroke-linecap="round"/>
      <g fill="${p.alt}">
        <ellipse cx="${u * 0.25}" cy="${u * 0.44}" rx="${u * 0.07}" ry="${u * 0.12}" transform="rotate(-28 ${u * 0.25} ${u * 0.44})"/>
        <ellipse cx="${u * 0.75}" cy="${u * 0.44}" rx="${u * 0.07}" ry="${u * 0.12}" transform="rotate(28 ${u * 0.75} ${u * 0.44})"/>
        <ellipse cx="${u * 0.5}" cy="${u * 0.92}" rx="${u * 0.06}" ry="${u * 0.1}"/>
      </g>`;
  },
  jaali(p, u) {
    return `
      <g fill="none" stroke="${p.ink}" stroke-width="${u * 0.028}">
        <path d="M${u / 2} 0 L${u} ${u / 2} L${u / 2} ${u} L0 ${u / 2} Z"/>
        <path d="M0 0 L${u} ${u}" opacity=".35"/>
        <path d="M${u} 0 L0 ${u}" opacity=".35"/>
      </g>
      <circle cx="${u / 2}" cy="${u / 2}" r="${u * 0.11}" fill="${p.alt}"/>
      <circle cx="${u / 2}" cy="${u / 2}" r="${u * 0.045}" fill="${p.ink}"/>`;
  },
  chevron(p, u) {
    return `
      <g fill="none" stroke="${p.ink}" stroke-width="${u * 0.07}" stroke-linecap="square">
        <path d="M0 ${u * 0.38} L${u / 2} ${u * 0.08} L${u} ${u * 0.38}"/>
      </g>
      <g fill="none" stroke="${p.alt}" stroke-width="${u * 0.07}" stroke-linecap="square">
        <path d="M0 ${u * 0.88} L${u / 2} ${u * 0.58} L${u} ${u * 0.88}"/>
      </g>`;
  },
  bloom(p, u) {
    let petals = '';
    for (let i = 0; i < 6; i++) {
      petals += `<ellipse cx="${u / 2}" cy="${u * 0.26}" rx="${u * 0.075}" ry="${u * 0.17}"
                  fill="${p.alt}" transform="rotate(${i * 60} ${u / 2} ${u / 2})"/>`;
    }
    return `${petals}
      <circle cx="${u / 2}" cy="${u / 2}" r="${u * 0.1}" fill="${p.ink}"/>
      <g fill="${p.ink}" opacity=".5">
        <circle cx="0" cy="0" r="${u * 0.05}"/><circle cx="${u}" cy="0" r="${u * 0.05}"/>
        <circle cx="0" cy="${u}" r="${u * 0.05}"/><circle cx="${u}" cy="${u}" r="${u * 0.05}"/>
      </g>`;
  },
  stripe(p, u) {
    return `
      <rect x="${u * 0.1}" y="0" width="${u * 0.1}" height="${u}" fill="${p.ink}"/>
      <rect x="${u * 0.34}" y="0" width="${u * 0.04}" height="${u}" fill="${p.alt}"/>
      <rect x="${u * 0.56}" y="0" width="${u * 0.1}" height="${u}" fill="${p.alt}"/>
      <g fill="${p.ink}">
        <circle cx="${u * 0.83}" cy="${u * 0.25}" r="${u * 0.05}"/>
        <circle cx="${u * 0.83}" cy="${u * 0.75}" r="${u * 0.05}"/>
      </g>`;
  }
};

/** Build a tiled block-print SVG as a data URI. */
function patternDataURI(motif, palette, opts = {}) {
  const p = PALETTES[palette] || PALETTES.indigo;
  const draw = MOTIFS[motif] || MOTIFS.buti;
  const w = opts.w || 800;
  const h = opts.h || 800;
  const u = opts.unit || 100;
  const id = `t${motif}${palette}`.replace(/[^a-z0-9]/gi, '');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><pattern id="${id}" width="${u}" height="${u}" patternUnits="userSpaceOnUse">` +
    `${draw(p, u)}</pattern></defs>` +
    `<rect width="${w}" height="${h}" fill="${p.bg}"/>` +
    `<rect width="${w}" height="${h}" fill="url(#${id})"/>` +
    (opts.border === false ? '' :
      `<rect x="14" y="14" width="${w - 28}" height="${h - 28}" fill="none" ` +
      `stroke="${p.ink}" stroke-width="6" opacity=".45"/>`) +
    `</svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/** Image source for a product: real photo if present, generated print if not. */
function productImage(product, opts) {
  if (product.image) return product.image;
  return patternDataURI(product.motif, product.palette, opts);
}
