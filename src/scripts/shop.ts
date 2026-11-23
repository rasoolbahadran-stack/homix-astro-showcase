// اسکریپت فیلتر/مرتب‌سازی/جستجوی فروشگاه (سمت کلاینت، روی DOM)
// روی صفحاتی که عنصر [data-shop] دارند اجرا می‌شود.

const FA = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
function toFa(s: string | number) { return String(s).replace(/[0-9]/g, d => FA[+d]); }

function initShop() {
  const shop = document.querySelector<HTMLElement>('[data-shop]');
  if (!shop) return;

  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-product-card]'));
  const countEl = document.querySelector<HTMLElement>('[data-count]');
  const emptyEl = document.querySelector<HTMLElement>('[data-empty]');
  const sortSel = document.querySelector<HTMLSelectElement>('[data-sort]');
  const searchInput = document.querySelector<HTMLInputElement>('[data-search]');
  const catBoxes = Array.from(document.querySelectorAll<HTMLInputElement>('[data-f-cat]'));
  const brandBoxes = Array.from(document.querySelectorAll<HTMLInputElement>('[data-f-brand]'));
  const discountBox = document.querySelector<HTMLInputElement>('[data-f-discount]');
  const minInput = document.querySelector<HTMLInputElement>('[data-f-min]');
  const maxInput = document.querySelector<HTMLInputElement>('[data-f-max]');
  const clearBtn = document.querySelector<HTMLElement>('[data-clear]');
  const activeTagsEl = document.querySelector<HTMLElement>('[data-active-tags]');
  const hideCat = shop.getAttribute('data-hide-cat') === 'true';

  const params = new URLSearchParams(window.location.search);

  function applyFromUrl() {
    const q = params.get('q') || '';
    if (searchInput && q) searchInput.value = q;
    const cats = params.getAll('cat');
    const brands = params.getAll('brand');
    catBoxes.forEach(b => { if (cats.includes(b.value)) b.checked = true; });
    brandBoxes.forEach(b => { if (brands.includes(b.value)) b.checked = true; });
    if (discountBox && params.get('filter') === 'discount') discountBox.checked = true;
    if (minInput && params.get('min')) minInput.value = params.get('min')!;
    if (maxInput && params.get('max')) maxInput.value = params.get('max')!;
    const sort = params.get('sort');
    if (sortSel && sort) sortSel.value = sort;
  }

  function currentSort(): string {
    // اگر URL sort دارد از آن، وگرنه پیش‌فرض
    return sortSel?.value || params.get('sort') || 'bestseller';
  }

  function filter() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const cats = catBoxes.filter(b => b.checked).map(b => b.value);
    const brands = brandBoxes.filter(b => b.checked).map(b => b.value);
    const onlyDiscount = discountBox?.checked;
    const min = minInput?.value ? +minInput.value : 0;
    const max = maxInput?.value ? +maxInput.value : Infinity;

    let visible: { card: HTMLElement; sortKey: number }[] = [];

    cards.forEach(card => {
      const name = (card.getAttribute('data-name') || '').toLowerCase();
      const cat = card.getAttribute('data-cat') || '';
      const brand = card.getAttribute('data-brand') || '';
      const price = +(card.getAttribute('data-price') || 0);
      const hasDiscount = card.getAttribute('data-discount') === 'true';
      const created = card.getAttribute('data-created') || '';
      const sold = +(card.getAttribute('data-sold') || 0);
      const rating = +(card.getAttribute('data-rating') || 0);

      const matchQ = !q || name.includes(q);
      const matchCat = hideCat || !cats.length || cats.includes(cat);
      const matchBrand = !brands.length || brands.includes(brand);
      const matchDisc = !onlyDiscount || hasDiscount;
      const matchPrice = price >= min && price <= max;

      if (matchQ && matchCat && matchBrand && matchDisc && matchPrice) {
        let sortKey = 0;
        switch (currentSort()) {
          case 'newest': sortKey = -Date.parse(created); break;
          case 'price-asc': sortKey = price; break;
          case 'price-desc': sortKey = -price; break;
          case 'rating': sortKey = -rating; break;
          case 'bestseller':
          default: sortKey = -sold; break;
        }
        visible.push({ card, sortKey });
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });

    visible.sort((a, b) => a.sortKey - b.sortKey);
    const grid = cards[0]?.parentElement;
    if (grid) {
      visible.forEach(v => grid.appendChild(v.card));
    }

    if (countEl) countEl.textContent = toFa(String(visible.length));
    if (emptyEl) emptyEl.style.display = visible.length ? 'none' : '';
    renderActiveTags();
  }

  function syncUrl() {
    const p = new URLSearchParams();
    const q = (searchInput?.value || '').trim();
    if (q) p.set('q', q);
    catBoxes.filter(b => b.checked).forEach(b => p.append('cat', b.value));
    brandBoxes.filter(b => b.checked).forEach(b => p.append('brand', b.value));
    if (discountBox?.checked) p.set('filter', 'discount');
    if (minInput?.value) p.set('min', minInput.value);
    if (maxInput?.value) p.set('max', maxInput.value);
    if (sortSel?.value && sortSel.value !== 'bestseller') p.set('sort', sortSel.value);
    const qs = p.toString();
    history.replaceState(null, '', `${window.location.pathname}${qs ? '?' + qs : ''}`);
  }

  function renderActiveTags() {
    if (!activeTagsEl) return;
    const tags: string[] = [];
    const q = (searchInput?.value || '').trim();
    if (q) tags.push(`جستجو: «${q}»`);
    catBoxes.filter(b => b.checked).forEach(b => tags.push(b.dataset.label || b.value));
    brandBoxes.filter(b => b.checked).forEach(b => tags.push(b.dataset.label || b.value));
    if (discountBox?.checked) tags.push('فقط تخفیف‌دار');
    if (minInput?.value || maxInput?.value) tags.push(`قیمت ${minInput?.value || '۰'} تا ${maxInput?.value || '∞'}`);
    activeTagsEl.innerHTML = tags.map(t => `<span class="active-tag">${t}</span>`).join('');
  }

  function onChange() {
    filter();
    syncUrl();
  }

  // wire events
  searchInput?.addEventListener('input', onChange);
  sortSel?.addEventListener('change', onChange);
  discountBox?.addEventListener('change', onChange);
  minInput?.addEventListener('input', onChange);
  maxInput?.addEventListener('input', onChange);
  [...catBoxes, ...brandBoxes].forEach(b => b.addEventListener('change', onChange));
  clearBtn?.addEventListener('click', () => {
    searchInput && (searchInput.value = '');
    catBoxes.forEach(b => (b.checked = false));
    brandBoxes.forEach(b => (b.checked = false));
    discountBox && (discountBox.checked = false);
    minInput && (minInput.value = '');
    maxInput && (maxInput.value = '');
    if (sortSel) sortSel.value = 'bestseller';
    onChange();
  });

  // 초기 적용
  applyFromUrl();
  filter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShop);
} else {
  initShop();
}
