// Product catalog for the OSRI site clone.
// NOTE: items 9-11 use placeholder imagery (marked below) — swap in real
// product photos for Wooden Crockery / Kids Toy Blankets / Rugs when ready.
const CATEGORIES = [
  { slug: "all-products", name: "All Products" },
  { slug: "sofa-covers", name: "Sofa Throws & Sofa Covers" },
  { slug: "cushion-covers", name: "Cushion Covers" },
  { slug: "table-placemats", name: "Table Placemats" },
  { slug: "wooden-crockery", name: "Wooden Crockery" },
  { slug: "kids-toy-blankets", name: "Kids Toy Blankets" },
  { slug: "rugs", name: "Rugs" },
];

const PRODUCTS = [
  {
    id: "floral-embroidered-cushion-cover",
    name: "Floral Embroidered Cushion Cover",
    category: "cushion-covers",
    price: 249,
    compareAt: 799,
    image: "assets/img/SJVV6572.png",
    description:
      "A classic vibe on sofa, couch, bench, bed or car. Bright, hand-embroidered florals create one-of-a-kind decor that never fails to catch the eye. Natural cotton provides a soft, breathable feel. Set of 1 cover, 16x16 inches, cotton, zipper closure. Product includes 1 piece (cushion cover without filler).",
  },
  {
    id: "printed-beige-white-jute-placemats",
    name: "Printed Beige/White Jute Placemats",
    category: "table-placemats",
    price: 199,
    compareAt: 349,
    image: "assets/img/SNM07780.jpg",
    description:
      "Hand-woven jute placemats in a soft beige and white weave that bring texture and warmth to any table setting. Durable, eco-friendly jute construction that's easy to wipe clean. Sold as a set, ideal for everyday dining or festive spreads.",
  },
  {
    id: "yellow-floral-embroidery-cushion-cover",
    name: "Multi-Color Floral Embroidered Cushion Cover",
    category: "cushion-covers",
    price: 249,
    compareAt: 799,
    image: "assets/img/KKDP3368.jpg",
    description:
      "A vibrant multi-color floral embroidery on natural cotton, perfect for adding a pop of color to sofas and beds. Serene palette combining off-white with earthen tones. Sized at 16x16 inches, zipper closure, cover only (no filler).",
  },
  {
    id: "bohemian-beige-cushion-cover-with-fringes",
    name: "Bohemian Beige Cushion Cover with fringes",
    category: "cushion-covers",
    price: 333,
    compareAt: 799,
    image: "assets/img/SNM07282.jpg",
    description:
      "A Classic vibe on sofa, couch, bench, bed or car. With bright colors create one-of-a-kind decor that never fails to catch the eye. Elevate your space with our accent Cushion Cover — where nature meets comfort in a stylish blend of tranquility. Natural cotton provides a soft and breathable relaxation experience. Serene color palette combining off-white with earthen colors. Ideally sized at 16\"x16\", this cushion cover seamlessly integrates into your decor. Good combination with different interior concepts: Bohemian, rustic, retro, vintage and others. Set of 1 Cover, 16 Inches, Cotton, Zipper. Product includes 1 piece (cushion cover without filler).",
  },
  {
    id: "printed-green-round-placemats",
    name: "Woven Beige and White Placemats",
    category: "table-placemats",
    price: 199,
    compareAt: 349,
    image: "assets/img/SNM07828.jpg",
    description:
      "Round, hand-woven placemats in a natural beige and white pattern. Adds an artisanal, coastal touch to breakfast and dinner tables alike. Lightweight, durable weave that's easy to maintain.",
  },
  {
    id: "bohemian-cotton-tufted-yellow-orange-cushion-cover",
    name: "Blue Wave Boho Cushion Cover",
    category: "cushion-covers",
    price: 299,
    compareAt: 699,
    image: "assets/img/IWEW8226.png",
    description:
      "A tufted boho-style cushion cover in a soothing blue wave pattern on natural cotton. Brings a relaxed, calming, coastal-inspired feel to any living room. 16x16 inches, zipper closure, cover only.",
  },
  {
    id: "red-maroon-waffle-sofa-throw",
    name: "Red Maroon Solid Color Waffle Sofa Throw",
    category: "sofa-covers",
    price: 1499,
    compareAt: 2399,
    image: "assets/img/SNM07732.jpg",
    description:
      "A rich, solid maroon waffle-weave throw that drapes beautifully over sofas, beds or armchairs. Soft cotton waffle texture adds depth without pattern overload — a versatile statement piece for any interior style.",
  },
  {
    id: "boho-yellow-grey-sofa-cover-with-tassels",
    name: "Boho Yellow Grey Sofa Cover with Decorative Tassels",
    category: "sofa-covers",
    price: 499,
    compareAt: 799,
    image: "assets/img/BMPH0870.jpg",
    description:
      "A bohemian yellow and grey sofa cover finished with hand-tied decorative tassels along the edge. Instantly refreshes a couch or bench with texture and color. Available in multiple sizes to fit your furniture.",
  },
  {
    id: "wooden-serving-bowl-set",
    name: "Handcrafted Wooden Serving Bowl Set",
    category: "wooden-crockery",
    price: 899,
    compareAt: 1299,
    image: "assets/img/leaf1.jpg",
    description:
      "PLACEHOLDER LISTING — swap in real product photography. Hand-carved wooden serving bowls, sustainably sourced and finished by local artisans. A natural, earthy addition to any dining table.",
  },
  {
    id: "pink-unicorn-kids-toy-blanket",
    name: "Pink Unicorn Kids Toy Blanket",
    category: "kids-toy-blankets",
    price: 599,
    compareAt: 899,
    image: "assets/img/PinkUnicorn.jpg",
    description:
      "A soft, playful unicorn-print blanket sized for little ones. Doubles as a cozy nap-time throw or a snuggly toy companion. Machine washable, soft-touch cotton blend.",
  },
  {
    id: "handwoven-jute-rug",
    name: "Handwoven Jute Rug",
    category: "rugs",
    price: 1299,
    compareAt: 1899,
    image: "assets/img/IMG_1930.jpg",
    description:
      "PLACEHOLDER LISTING — swap in real product photography. A durable, hand-woven jute rug that grounds a room with natural texture. Eco-friendly, sustainably sourced fibers.",
  },
];

function formatINR(n) {
  return "Rs. " + n.toLocaleString("en-IN") + ".00";
}

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function getProductsByCategory(slug) {
  if (!slug || slug === "all-products") return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === slug);
}
