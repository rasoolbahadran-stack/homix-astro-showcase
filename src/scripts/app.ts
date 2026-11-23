// اسکریپت سمت کلاینت فروشگاه هومیکس
// سبد خرید (localStorage)، انیمیشن‌های اسکرول، منوی موبایل، جستجو، Toast
// این ماژول یک‌بار در Layout بارگذاری می‌شود و در همه صفحات اجرا می‌شود.

const BASE = import.meta.env.BASE_URL || '/';
const STORAGE_KEY = 'homix_cart_v1';

export interface CartLine {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  qty: number;
  maxQty: number;
}

/* ---------------- Cart store ---------------- */
export function getCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {}
  document.dispatchEvent(new CustomEvent('cart:change', { detail: lines }));
}

export function addToCart(line: Omit<CartLine, 'qty'>, qty = 1) {
  const cart = getCart();
  const existing = cart.find((l) => l.id === line.id);
  if (existing) {
    existing.qty = Math.min(existing.maxQty, existing.qty + qty);
  } else {
    cart.push({ ...line, qty: Math.min(line.maxQty || 99, qty) });
  }
  saveCart(cart);
}

export function removeFromCart(id: string) {
  saveCart(getCart().filter((l) => l.id !== id));
}

export function setQty(id: string, qty: number) {
  const cart = getCart();
  const l = cart.find((x) => x.id === id);
  if (l) {
    l.qty = Math.max(1, Math.min(l.maxQty, qty));
    saveCart(cart);
  }
}

export function cartCount(): number {
  return getCart().reduce((s, l) => s + l.qty, 0);
}

export function cartTotal(): number {
  return getCart().reduce((s, l) => s + l.qty * l.price, 0);
}

/* ---------------- Persian number helpers (client) ---------------- */
const FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
function toFa(s: string | number): string {
  return String(s).replace(/[0-9]/g, (d) => FA[+d]);
}
export function formatPrice(n: number): string {
  return toFa(Math.round(n).toLocaleString('en-US').replace(/,/g, '٬'));
}

/* ---------------- UI: cart badge ---------------- */
function updateBadges() {
  const count = cartCount();
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
    el.textContent = toFa(String(count));
    el.style.display = count > 0 ? '' : 'none';
  });
  const total = cartTotal();
  document.querySelectorAll<HTMLElement>('[data-cart-total]').forEach((el) => {
    el.textContent = formatPrice(total);
  });
}

/* ---------------- UI: toast ---------------- */
function ensureToastHost(): HTMLElement {
  let host = document.getElementById('toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast-host';
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  return host;
}

export function toast(message: string, kind: 'success' | 'info' = 'success') {
  const host = ensureToastHost();
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.innerHTML = `<span class="toast-icon">${kind === 'success' ? '✓' : 'ℹ'}</span><span>${message}</span>`;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

/* ---------------- UI: bounce cart icon ---------------- */
function bounceCartIcon() {
  document.querySelectorAll<HTMLElement>('[data-cart-icon]').forEach((el) => {
    el.classList.remove('cart-bounce');
    void el.offsetWidth;
    el.classList.add('cart-bounce');
  });
}

/* ---------------- Add-to-cart wiring ---------------- */
function wireAddButtons() {
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-add]');
    if (!target) return;
    e.preventDefault();
    const raw = target.getAttribute('data-add');
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      addToCart({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.image,
        maxQty: p.maxQty ?? 99,
      });
      toast('به سبد خرید اضافه شد');
      bounceCartIcon();
    } catch {}
  });
}

/* ---------------- Reveal on scroll ---------------- */
function wireReveal() {
  const els = document.querySelectorAll<HTMLElement>('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => {
    const idx = el.getAttribute('data-stagger');
    if (idx !== null) (el as HTMLElement).style.setProperty('--i', idx);
    io.observe(el);
  });
}

/* ---------------- Mobile menu ---------------- */
function wireMenu() {
  const btn = document.querySelector<HTMLElement>('[data-menu-toggle]');
  const drawer = document.querySelector<HTMLElement>('[data-menu-drawer]');
  const overlay = document.querySelector<HTMLElement>('[data-menu-overlay]');
  if (!btn || !drawer) return;
  const open = () => {
    drawer.classList.add('open');
    overlay?.classList.add('show');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    drawer.classList.remove('open');
    overlay?.classList.remove('show');
    document.body.style.overflow = '';
  };
  btn.addEventListener('click', open);
  overlay?.addEventListener('click', close);
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

/* ---------------- Search ---------------- */
function wireSearch() {
  document.querySelectorAll<HTMLFormElement>('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector<HTMLInputElement>('[data-search-input]');
      const q = (input?.value || '').trim();
      const url = `${BASE}products${q ? `?q=${encodeURIComponent(q)}` : ''}`;
      window.location.href = url;
    });
  });
  // دکمه جستجوی هدر (باز کردن نوار)
  document.querySelectorAll<HTMLElement>('[data-search-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bar = document.querySelector<HTMLElement>('[data-search-bar]');
      if (!bar) return;
      bar.classList.toggle('open');
      if (bar.classList.contains('open')) {
        bar.querySelector<HTMLInputElement>('input')?.focus();
      }
    });
  });
}

/* ---------------- Cart page rendering ---------------- */
function renderCartPage() {
  const root = document.getElementById('cart-root');
  if (!root) return;
  const render = () => {
    const cart = getCart();
    const emptyEl = document.getElementById('cart-empty');
    const contentEl = document.getElementById('cart-content');

    if (cart.length === 0) {
      if (emptyEl) emptyEl.style.display = '';
      if (contentEl) contentEl.style.display = 'none';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    if (contentEl) contentEl.style.display = '';

    const tbody = document.getElementById('cart-rows');
    if (tbody) {
      tbody.innerHTML = cart
        .map(
          (l) => `
        <tr data-line="${l.id}">
          <td data-label="محصول">
            <a class="cart-prod" href="${BASE}products/${l.slug}">
              <img src="${l.image}" alt="${l.name}" loading="lazy" width="64" height="64">
              <span>${l.name}</span>
            </a>
          </td>
          <td data-label="قیمت">${formatPrice(l.price)} <span class="toman">تومان</span></td>
          <td data-label="تعداد">
            <div class="qty-stepper">
              <button data-qty-dec="${l.id}" aria-label="کاهش">−</button>
              <span data-qty-val="${l.id}">${toFa(String(l.qty))}</span>
              <button data-qty-inc="${l.id}" aria-label="افزایش">+</button>
            </div>
          </td>
          <td data-label="مجموع" class="cart-subtotal">${formatPrice(l.qty * l.price)} <span class="toman">تومان</span></td>
          <td data-label="حذف">
            <button class="cart-remove" data-remove="${l.id}" aria-label="حذف از سبد">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
            </button>
          </td>
        </tr>`
        )
        .join('');
    }

    const subtotal = cart.reduce((s, l) => s + l.qty * l.price, 0);
    const shipping = subtotal > 5_000_000 || subtotal === 0 ? 0 : 350_000;
    const total = subtotal + shipping;
    const set = (id: string, val: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('cart-subtotal', formatPrice(subtotal));
    set('cart-shipping', shipping === 0 ? 'رایگان' : formatPrice(shipping));
    set('cart-total', formatPrice(total));
    const countEl = document.getElementById('cart-items-count');
    if (countEl) countEl.textContent = toFa(String(cart.reduce((s, l) => s + l.qty, 0)));
  };

  render();
  document.addEventListener('cart:change', render);

  // کنترل‌های داخل جدول (event delegation)
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const inc = t.closest('[data-qty-inc]') as HTMLElement | null;
    const dec = t.closest('[data-qty-dec]') as HTMLElement | null;
    const rm = t.closest('[data-remove]') as HTMLElement | null;
    if (inc) setQty(inc.getAttribute('data-qty-inc')!, (getCart().find((l) => l.id === inc.getAttribute('data-qty-inc'))!.qty || 1) + 1);
    if (dec) setQty(dec.getAttribute('data-qty-dec')!, (getCart().find((l) => l.id === dec.getAttribute('data-qty-dec'))!.qty || 1) - 1);
    if (rm) {
      removeFromCart(rm.getAttribute('data-remove')!);
      toast('محصول از سبد حذف شد', 'info');
    }
  });
}

/* ---------------- Init ---------------- */
function init() {
  updateBadges();
  document.addEventListener('cart:change', updateBadges);
  wireAddButtons();
  wireReveal();
  wireMenu();
  wireSearch();
  renderCartPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
