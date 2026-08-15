// Simple localStorage-backed cart shared across pages.
const CART_KEY = "osri_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  saveCart(cart);
  showCartNotification(productId);
}

function removeFromCart(productId) {
  saveCart(getCart().filter((item) => item.id !== productId));
}

function updateQty(productId, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  if (qty <= 0) {
    saveCart(cart.filter((i) => i.id !== productId));
  } else {
    item.qty = qty;
    saveCart(cart);
  }
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal() {
  return getCart().reduce((sum, item) => {
    const p = getProductById(item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function updateCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = cartCount();
  });
}

function showCartNotification(productId) {
  const p = getProductById(productId);
  const note = document.getElementById("cart-notification");
  if (!note || !p) return;
  note.querySelector("[data-note-name]").textContent = p.name;
  note.querySelector("[data-note-img]").src = p.image;
  note.classList.add("is-visible");
  clearTimeout(showCartNotification._t);
  showCartNotification._t = setTimeout(() => {
    note.classList.remove("is-visible");
  }, 3000);
}

document.addEventListener("DOMContentLoaded", updateCartCount);
