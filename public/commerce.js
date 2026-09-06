import { products, formats, money, getLang, t } from './catalog.js';

const STORAGE_KEY = 'hubb.cart.v1';
const MAX_QUANTITY = 99;
const dialogs = {};
const returnFocus = new WeakMap();
let initialized = false;
let cart = [];
let productState = { id: '', format: 'cup', quantity: 1 };
let searchQuery = '';
let previewReady = false;
let announcement;

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const localized = (value) => typeof value === 'object' && value ? value[getLang()] || value.en || value.ar || '' : value || '';
const productFor = (id) => products.find((product) => product.id === id);
const formatFor = (id) => formats.find((format) => format.id === id);
const allowedFormats = (id) => formats.filter((format) => id === 'family-mix' ? format.id === 'family' : ['sachet', 'cup', 'case'].includes(format.id));
const validPair = (id, format) => Boolean(productFor(id) && allowedFormats(id).some((item) => item.id === format));
const priceFor = (item) => Number(formatFor(item.format)?.price) || 0;
const quantityFor = (quantity) => Math.min(MAX_QUANTITY, Math.max(1, Math.floor(Number(quantity) || 1)));
const total = () => cart.reduce((sum, item) => sum + priceFor(item) * item.quantity, 0);
const count = () => cart.reduce((sum, item) => sum + item.quantity, 0);
const keyFor = (item) => `${item.id}:${item.format}`;
const priceNote = () => t('أسعار مقترحة · لن يتم تحصيل أي مبلغ', 'Proposed prices · no payment collected');
const iconClose = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const iconBag = '<svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true"><path d="M12 16h24l3 26H9l3-26Zm6 0v-5a6 6 0 0 1 12 0v5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const closeButton = (label = t('إغلاق', 'Close')) => `<button class="hc-icon-button hc-close" type="button" data-action="close" aria-label="${escape(label)}">${iconClose}</button>`;

function readCart(raw) {
  try {
    const stored = JSON.parse(raw || '[]');
    if (!Array.isArray(stored)) return [];
    const clean = [];
    for (const entry of stored.slice(0, 100)) {
      if (!entry || typeof entry !== 'object' || !validPair(entry.id, entry.format)) continue;
      if (!Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > MAX_QUANTITY) continue;
      const existing = clean.find((item) => keyFor(item) === keyFor(entry));
      if (existing) existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + entry.quantity);
      else clean.push({ id: entry.id, format: entry.format, quantity: entry.quantity });
    }
    return clean;
  } catch { return []; }
}

function announce(message) {
  if (!announcement) return;
  announcement.textContent = '';
  requestAnimationFrame(() => { announcement.textContent = message; });
}

function syncCart({ persist = true } = {}) {
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* A private browser still supports a cart for this visit. */ }
  }
  document.querySelectorAll('[data-cart-count]').forEach((element) => { element.textContent = String(count()); });
  window.dispatchEvent(new CustomEvent('hubb:cart', { detail: { count: count(), total: total() } }));
  if (dialogs.cart?.open) renderCart();
  if (dialogs.checkout?.open) {
    previewReady = false;
    renderCheckout(readCheckoutFields());
  }
}

function makeDialog(name, className) {
  const dialog = document.createElement('dialog');
  dialog.className = `hc-dialog ${className}`;
  dialog.dataset.commerceDialog = name;
  dialog.setAttribute('aria-labelledby', `hc-${name}-title`);
  document.body.append(dialog);
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (name === 'checkout') {
      previewReady = false;
      dialog.querySelector('form')?.reset();
      dialog.replaceChildren();
    }
    requestAnimationFrame(() => {
      if (Object.values(dialogs).some((item) => item.open)) return;
      document.documentElement.classList.remove('hc-modal-open');
      const target = returnFocus.get(dialog);
      if (target?.isConnected && typeof target.focus === 'function') target.focus({ preventScroll: true });
    });
  });
  dialog.addEventListener('click', handleClick);
  dialogs[name] = dialog;
  return dialog;
}

function showDialog(name) {
  const dialog = dialogs[name];
  if (dialog.open) return;
  const previous = Object.values(dialogs).find((item) => item.open);
  const opener = previous ? returnFocus.get(previous) : document.activeElement;
  returnFocus.set(dialog, opener);
  previous?.close();
  document.documentElement.classList.add('hc-modal-open');
  dialog.showModal();
}

function replaceDialog(dialog, html) {
  const focused = dialog.contains(document.activeElement) ? document.activeElement.dataset.focus : null;
  dialog.innerHTML = html;
  if (focused && dialog.open) {
    let target = dialog.querySelector(`[data-focus="${CSS.escape(focused)}"]`);
    if (target?.disabled) target = target.parentElement.querySelector('button:not(:disabled)');
    target?.focus({ preventScroll: true });
  }
}

function formatDetails(format) {
  if (format.count === 1) return t(`${format.grams} غرام`, `${format.grams} g`);
  const sachetWeight = format.grams / format.count;
  return t(`${format.count} × ${sachetWeight} غرام · ${format.grams} غرام إجمالاً`, `${format.count} × ${sachetWeight} g · ${format.grams} g total`);
}

function quantityControl(quantity, context, key = '') {
  return `<div class="hc-quantity" role="group" aria-label="${escape(t('الكمية', 'Quantity'))}">
    <button type="button" data-action="quantity" data-context="${context}" data-key="${escape(key)}" data-delta="-1" data-focus="${context}-${escape(key)}-minus" aria-label="${escape(t('تقليل الكمية', 'Decrease quantity'))}" ${quantity <= 1 ? 'disabled' : ''}>−</button>
    <span class="hc-quantity-value" aria-live="polite" aria-atomic="true">${quantity}</span>
    <button type="button" data-action="quantity" data-context="${context}" data-key="${escape(key)}" data-delta="1" data-focus="${context}-${escape(key)}-plus" aria-label="${escape(t('زيادة الكمية', 'Increase quantity'))}" ${quantity >= MAX_QUANTITY ? 'disabled' : ''}>+</button>
  </div>`;
}

function renderProduct() {
  const product = productFor(productState.id);
  if (!product) return;
  const format = formatFor(productState.format);
  const available = allowedFormats(product.id);
  const selectedPackCaption = t(
    `${product.id === 'family-mix' ? 'تصميم المنتج' : 'تصميم النكهة'} معروض للتوضيح. العبوة المختارة: ${localized(format.name)} · عدد الأكياس المغلقة: ${format.count}.`,
    `${product.id === 'family-mix' ? 'Product' : 'Flavour'} artwork shown; selected pack: ${localized(format.name)} · ${format.count} sealed ${format.count === 1 ? 'sachet' : 'sachets'}.`
  );
  replaceDialog(dialogs.product, `<div class="hc-product-layout">
    ${closeButton()}
    <div class="hc-product-visual ${format.id === 'cup' ? 'hc-has-pack-preview' : ''}" style="--hc-product-color:${escape(product.color || '#9b3b2b')}">
      <span class="hc-visual-label">${escape(t('حبّ · من السعودية', 'HUBB · FROM SAUDI'))}</span>
      <div class="hc-product-orbit" aria-hidden="true"></div>
      <img class="hc-product-image" src="${escape(product.image)}" alt="${escape(localized(product.name))}" width="640" height="800">
      ${format.id === 'cup' ? `<figure class="hc-pack-preview"><img src="./assets/cup-unpacked.webp" alt="${escape(t('مثال لتجهيز كوب الرحلة بنكهة الفلفل واللايم، مع خمسة أكياس مغلقة وكيس منفصل للقشور', 'Journey Cup packing example in Pepper Lime, with five sealed sachets and a separate shell bag'))}" width="1536" height="1024"><figcaption>${escape(t('مثال لترتيب العبوة · الصورة بنكهة الفلفل واللايم', 'Pack structure example · Pepper Lime shown'))}</figcaption></figure>` : ''}
      <p class="hc-art-caption">${escape(selectedPackCaption)}<small>${escape(t('تصوّر للتغليف · التفاصيل النهائية قيد الاعتماد', 'Packaging concept · final details pending approval'))}</small></p>
    </div>
    <div class="hc-product-copy">
      <p class="hc-eyebrow">${escape(t('تسوّق حبّ', 'THE HUBB SHOP'))}</p>
      <h2 id="hc-product-title">${escape(localized(product.name))}</h2>
      <p class="hc-description">${escape(localized(product.description))}</p>
      <fieldset class="hc-fieldset"><legend>${escape(t('اختر المنتج', 'Choose a product'))}</legend>
        <div class="hc-flavours">${products.map((item) => `<button type="button" class="hc-flavour ${item.id === product.id ? 'is-selected' : ''}" data-action="flavour" data-id="${escape(item.id)}" data-focus="flavour-${escape(item.id)}" aria-pressed="${item.id === product.id}"><span style="background:${escape(item.color || '#9b3b2b')}" aria-hidden="true"></span>${escape(localized(item.name))}</button>`).join('')}</div>
      </fieldset>
      <fieldset class="hc-fieldset"><legend>${escape(t('اختر العبوة', 'Choose your pack'))}</legend>
        <div class="hc-formats">${available.map((item) => `<button type="button" class="hc-format ${item.id === format.id ? 'is-selected' : ''}" data-action="format" data-format="${escape(item.id)}" data-focus="format-${escape(item.id)}" aria-pressed="${item.id === format.id}"><span><strong>${escape(localized(item.name))}</strong><small>${escape(formatDetails(item))}</small></span><b>${escape(money(item.price))}</b></button>`).join('')}</div>
      </fieldset>
      ${format.id === 'cup' ? `<p class="hc-pack-note"><span aria-hidden="true">+</span>${escape(t('يتضمن كيسًا منفصلًا للقشور، مع خمسة أكياس مغلقة من البذور.', 'A separate shell bag is included with the five sealed seed sachets.'))}</p>` : ''}
      <div class="hc-product-total"><div><span class="hc-small-label">${escape(t('الإجمالي للمنتجات', 'Product total'))}</span><strong>${escape(money(format.price * productState.quantity))}</strong></div>${quantityControl(productState.quantity, 'product')}</div>
      <button class="hc-button hc-button-primary" type="button" data-action="add-product">${escape(t('أضف للسلة', 'Add to bag'))}<span aria-hidden="true">↗</span></button>
      <p class="hc-price-note">${escape(priceNote())}</p>
      <p class="hc-fine-print">${escape(t('تُحدّد رسوم الشحن عند تفعيل الدفع. هذه تجربة تسوّق تجريبية.', 'Shipping is calculated when checkout is activated. This is a shopping preview.'))}</p>
    </div>
  </div>`);
}

function renderCart() {
  replaceDialog(dialogs.cart, `<div class="hc-drawer-layout">
    <header class="hc-dialog-header"><div><p class="hc-eyebrow">${escape(t('جهّز جمعتك', 'MAKE ROOM FOR THE GATHERING'))}</p><h2 id="hc-cart-title">${escape(t('سلّتك', 'Your bag'))} <span class="hc-title-count">${count()}</span></h2></div>${closeButton()}</header>
    ${cart.length ? `<div class="hc-cart-items">${cart.map((item) => {
      const product = productFor(item.id);
      const format = formatFor(item.format);
      const key = keyFor(item);
      return `<article class="hc-cart-item"><div class="hc-cart-image" style="--hc-product-color:${escape(product.color || '#9b3b2b')}"><img src="${escape(product.image)}" alt="${escape(localized(product.name))}" width="100" height="130"></div><div class="hc-cart-item-copy"><h3>${escape(localized(product.name))}</h3><p>${escape(localized(format.name))} · ${escape(formatDetails(format))}</p><p class="hc-unit-price">${escape(money(format.price))} ${escape(t('للعبوة', 'each'))}</p><div class="hc-cart-item-controls">${quantityControl(item.quantity, 'cart', key)}<button type="button" class="hc-remove" data-action="remove" data-key="${escape(key)}" aria-label="${escape(t(`إزالة ${localized(product.name)}`, `Remove ${localized(product.name)}`))}">${escape(t('إزالة', 'Remove'))}</button></div></div><strong class="hc-line-price">${escape(money(format.price * item.quantity))}</strong></article>`;
    }).join('')}</div><footer class="hc-cart-footer"><div class="hc-summary-row"><span>${escape(t('إجمالي المنتجات', 'Product subtotal'))}</span><strong>${escape(money(total()))}</strong></div><div class="hc-summary-row hc-shipping-row"><span>${escape(t('الشحن', 'Shipping'))}</span><span>${escape(t('يُحدّد عند تفعيل الدفع', 'Calculated at live checkout'))}</span></div><p class="hc-price-note">${escape(priceNote())}</p><button type="button" class="hc-button hc-button-primary" data-action="checkout">${escape(t('معاينة الطلب', 'Preview checkout'))}<span aria-hidden="true">↗</span></button><button type="button" class="hc-button hc-button-text" data-action="close">${escape(t('أكمل التسوّق', 'Keep shopping'))}</button></footer>` : `<div class="hc-empty">${iconBag}<h3>${escape(t('جمعتك تبدأ من هنا', 'Your gathering starts here'))}</h3><p>${escape(t('اختر نكهتك وأضف أول عبوة إلى السلّة.', 'Pick your flavour and put a little HUBB in your bag.'))}</p><button type="button" class="hc-button hc-button-primary" data-action="close">${escape(t('استكشف النكهات', 'Explore the flavours'))}</button></div>`}
  </div>`);
}

function readCheckoutFields() {
  const form = dialogs.checkout?.querySelector('form');
  if (!form) return {};
  return Object.fromEntries(new FormData(form));
}

function checkoutSummary() {
  return `<aside class="hc-checkout-summary"><p class="hc-eyebrow">${escape(t('في سلّتك', 'IN YOUR BAG'))}</p><div class="hc-checkout-lines">${cart.map((item) => {
    const product = productFor(item.id);
    const format = formatFor(item.format);
    return `<div class="hc-checkout-line"><img src="${escape(product.image)}" alt="" width="52" height="66"><div><strong>${escape(localized(product.name))}</strong><small>${escape(localized(format.name))} × ${item.quantity}</small></div><b>${escape(money(format.price * item.quantity))}</b></div>`;
  }).join('')}</div><div class="hc-summary-row"><span>${escape(t('إجمالي المنتجات', 'Product subtotal'))}</span><strong>${escape(money(total()))}</strong></div><div class="hc-summary-row hc-shipping-row"><span>${escape(t('الشحن', 'Shipping'))}</span><span>${escape(t('غير محسوب في المعاينة', 'Not included in preview'))}</span></div><p class="hc-fine-print">${escape(t('السعر النهائي والضرائب ورسوم التوصيل تُؤكّد قبل إتمام أي شراء فعلي.', 'Final pricing, taxes and delivery charges must be confirmed before any live purchase.'))}</p></aside>`;
}

function renderCheckout(values = {}) {
  const field = (name, label, attrs = '', full = false) => `<label class="hc-input-label ${full ? 'hc-input-full' : ''}"><span>${escape(label)}</span><input name="${name}" value="${escape(values[name] || '')}" ${attrs}></label>`;
  replaceDialog(dialogs.checkout, `<div class="hc-checkout-layout"><header class="hc-dialog-header"><div><p class="hc-eyebrow">${escape(t('تجربة المتجر', 'STORE PREVIEW'))}</p><h2 id="hc-checkout-title">${escape(t(previewReady ? 'معاينة طلبك جاهزة' : 'معاينة الطلب', previewReady ? 'Your order preview is ready' : 'Preview your order'))}</h2></div>${closeButton()}</header>
    <div class="hc-preview-banner" role="note"><span aria-hidden="true">◌</span><p>${escape(t('معاينة فقط. لن يتم إرسال طلب أو تحصيل مبلغ. بياناتك لا تُرسل ولا تُحفظ.', 'Preview only. No order is placed and no payment is collected. Your details are not sent or saved.'))}</p></div>
    ${!cart.length ? `<div class="hc-empty"><h3>${escape(t('السلّة فارغة', 'Your bag is empty'))}</h3><button type="button" class="hc-button hc-button-primary" data-action="close">${escape(t('تابع التسوّق', 'Continue shopping'))}</button></div>` : `<div class="hc-checkout-columns">${previewReady ? `<div class="hc-preview-success" role="status"><span class="hc-success-mark" aria-hidden="true">✓</span><h3>${escape(t('معاينة الطلب جاهزة', 'Order preview ready'))}</h3><p>${escape(t('لم يتم تقديم أي طلب أو تحصيل أي مبلغ.', 'No order has been placed and no payment has been collected.'))}</p><p>${escape(t('يمكنك العودة إلى السلّة لتعديل النكهات والكميات.', 'You can return to your bag to adjust flavours and quantities.'))}</p><button type="button" class="hc-button hc-button-primary" data-action="back-cart">${escape(t('العودة إلى السلّة', 'Back to your bag'))}</button><button type="button" class="hc-button hc-button-text" data-action="close">${escape(t('أكمل الاستكشاف', 'Keep exploring'))}</button></div>` : `<form class="hc-checkout-form" novalidate><p class="hc-form-intro">${escape(t('جرّب تفاصيل التوصيل داخل المملكة.', 'Try the delivery form for Saudi Arabia.'))}</p><div class="hc-input-grid">
      ${field('fullName', t('الاسم الكامل', 'Full name'), 'autocomplete="name" required minlength="2" maxlength="100"', true)}
      ${field('mobile', t('رقم الجوال السعودي', 'Saudi mobile number'), `type="tel" inputmode="tel" autocomplete="tel" placeholder="05XXXXXXXX" required maxlength="20" aria-describedby="hc-mobile-help"`, true)}
      <small class="hc-input-help hc-input-full" id="hc-mobile-help">${escape(t('يبدأ بـ 05 أو ‎+9665', 'Starts with 05 or +9665'))}</small>
      ${field('email', t('البريد الإلكتروني (اختياري)', 'Email (optional)'), 'type="email" autocomplete="email" maxlength="150"', true)}
      ${field('city', t('المدينة', 'City'), 'autocomplete="address-level2" required minlength="2" maxlength="80"')}
      ${field('postcode', t('الرمز البريدي', 'Postal code'), 'inputmode="numeric" autocomplete="postal-code" required pattern="[0-9٠-٩]{5}" minlength="5" maxlength="5" placeholder="12345"')}
      ${field('street', t('الحي والشارع', 'District and street'), 'autocomplete="street-address" required minlength="3" maxlength="200"', true)}
    </div><p class="hc-price-note">${escape(priceNote())}</p><button type="submit" class="hc-button hc-button-primary">${escape(t('إنشاء معاينة الطلب', 'Preview order'))}<span aria-hidden="true">↗</span></button><button type="button" class="hc-button hc-button-text" data-action="back-cart">${escape(t('العودة إلى السلّة', 'Back to bag'))}</button></form>`}${checkoutSummary()}</div>`}
  </div>`);
}

function normalizeSearch(value) {
  return value.toLocaleLowerCase().normalize('NFKD').replace(/[\u0640\u064B-\u065F\u0670]/g, '').replace(/[إأآ]/g, 'ا').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
}

function renderSearchResults() {
  const query = normalizeSearch(searchQuery);
  const matches = products.filter((product) => {
    const words = [product.name?.ar, product.name?.en, product.description?.ar, product.description?.en].join(' ');
    return normalizeSearch(words).includes(query);
  });
  const results = dialogs.search.querySelector('.hc-search-results');
  if (!results) return;
  results.innerHTML = matches.length ? matches.map((product) => `<button type="button" class="hc-search-result" data-action="search-product" data-id="${escape(product.id)}"><span class="hc-search-image" style="--hc-product-color:${escape(product.color || '#9b3b2b')}"><img src="${escape(product.image)}" alt="" width="72" height="86"></span><span><strong>${escape(localized(product.name))}</strong><small>${escape(localized(product.description))}</small></span><span aria-hidden="true">↗</span></button>`).join('') : `<div class="hc-search-empty"><h3>${escape(t('لم نجد هذا المنتج', 'No products found'))}</h3><p>${escape(t('جرّب اسم منتج آخر أو امسح البحث لتصفح جميع المنتجات.', 'Try another product name or clear your search to see everything.'))}</p><button type="button" class="hc-button hc-button-text" data-action="clear-search">${escape(t('مسح البحث', 'Clear search'))}</button></div>`;
  const status = dialogs.search.querySelector('.hc-search-status');
  status.textContent = t(`${matches.length} منتجات`, `${matches.length} ${matches.length === 1 ? 'product' : 'products'}`);
}

function renderSearch() {
  replaceDialog(dialogs.search, `<div class="hc-search-layout"><header class="hc-dialog-header"><div><p class="hc-eyebrow">${escape(t('استكشف منتجات حبّ', 'EXPLORE THE COLLECTION'))}</p><h2 id="hc-search-title">${escape(t('وش خاطرك فيه؟', 'What are you craving?'))}</h2></div>${closeButton()}</header><label class="hc-search-label"><span class="hc-sr-only">${escape(t('البحث في المنتجات', 'Search products'))}</span><input type="search" class="hc-search-input" data-focus="search" placeholder="${escape(t('ابحث عن منتج…', 'Search a product…'))}" value="${escape(searchQuery)}" autocomplete="off" autofocus></label><p class="hc-search-status" role="status" aria-live="polite"></p><div class="hc-search-results"></div></div>`);
  renderSearchResults();
}

function handleClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action } = button.dataset;
  if (action === 'close') return button.closest('dialog').close();
  if (action === 'flavour') {
    const id = button.dataset.id;
    if (!productFor(id)) return;
    productState.id = id;
    if (!validPair(id, productState.format)) productState.format = allowedFormats(id)[0]?.id;
    return renderProduct();
  }
  if (action === 'format' && validPair(productState.id, button.dataset.format)) {
    productState.format = button.dataset.format;
    return renderProduct();
  }
  if (action === 'quantity') {
    const delta = Number(button.dataset.delta);
    if (![1, -1].includes(delta)) return;
    if (button.dataset.context === 'product') {
      productState.quantity = quantityFor(productState.quantity + delta);
      renderProduct();
    } else {
      const item = cart.find((entry) => keyFor(entry) === button.dataset.key);
      if (!item) return;
      item.quantity = quantityFor(item.quantity + delta);
      syncCart();
    }
    return;
  }
  if (action === 'remove') {
    const removed = cart.find((item) => keyFor(item) === button.dataset.key);
    cart = cart.filter((item) => keyFor(item) !== button.dataset.key);
    syncCart();
    if (removed) announce(t('تمت إزالة المنتج من السلّة', 'Item removed from your bag'));
    dialogs.cart.querySelector('.hc-remove, [data-action="close"]')?.focus({ preventScroll: true });
    return;
  }
  if (action === 'add-product') {
    addToCart(productState.id, productState.format, productState.quantity);
    return openCart();
  }
  if (action === 'checkout') {
    previewReady = false;
    renderCheckout();
    return showDialog('checkout');
  }
  if (action === 'back-cart') return openCart();
  if (action === 'search-product') return openProduct(button.dataset.id);
  if (action === 'clear-search') {
    searchQuery = '';
    dialogs.search.querySelector('input').value = '';
    renderSearchResults();
    return dialogs.search.querySelector('input').focus();
  }
}

function normalizeDigits(value) {
  return value.replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632));
}

function validateCheckout(form) {
  const mobile = form.elements.namedItem('mobile');
  const digits = normalizeDigits(mobile.value).replace(/[\s()\-\u200e\u200f]/g, '');
  mobile.setCustomValidity(/^(?:05\d{8}|(?:\+966|00966|966)5\d{8})$/.test(digits) ? '' : t('أدخل رقم جوال سعودي صحيح يبدأ بـ 05 أو ‎+9665.', 'Enter a valid Saudi mobile number beginning with 05 or +9665.'));
  for (const name of ['fullName', 'city', 'street']) {
    const input = form.elements.namedItem(name);
    input.setCustomValidity(input.value.trim().length >= Number(input.minLength) ? '' : t('يرجى إكمال هذا الحقل.', 'Please complete this field.'));
  }
  return form.reportValidity();
}

export function initCommerce() {
  if (initialized) return;
  initialized = true;
  try { cart = readCart(localStorage.getItem(STORAGE_KEY)); } catch { cart = []; }
  announcement = document.createElement('div');
  announcement.className = 'hc-sr-only';
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  document.body.append(announcement);
  makeDialog('product', 'hc-product-dialog');
  makeDialog('cart', 'hc-cart-dialog');
  makeDialog('checkout', 'hc-checkout-dialog');
  makeDialog('search', 'hc-search-dialog');
  dialogs.search.addEventListener('input', (event) => {
    if (!event.target.matches('.hc-search-input')) return;
    searchQuery = event.target.value;
    renderSearchResults();
  });
  dialogs.checkout.addEventListener('input', (event) => {
    if (event.target instanceof HTMLInputElement) event.target.setCustomValidity('');
  });
  dialogs.checkout.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!cart.length || !validateCheckout(event.target)) return;
    event.target.reset();
    previewReady = true;
    renderCheckout();
    const heading = dialogs.checkout.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus();
  });
  window.addEventListener('hubb:language', () => {
    if (dialogs.product.open) renderProduct();
    if (dialogs.cart.open) renderCart();
    if (dialogs.search.open) renderSearch();
    if (dialogs.checkout.open) renderCheckout(readCheckoutFields());
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    cart = readCart(event.newValue);
    syncCart({ persist: false });
  });
  syncCart({ persist: false });
}

export function openProduct(id, format = 'cup') {
  initCommerce();
  if (!productFor(id)) return false;
  const actualFormat = validPair(id, format) ? format : allowedFormats(id)[0]?.id;
  if (!actualFormat) return false;
  productState = { id, format: actualFormat, quantity: 1 };
  renderProduct();
  showDialog('product');
  return true;
}

export function addToCart(id, format, quantity = 1) {
  initCommerce();
  if (!validPair(id, format) || !Number.isFinite(Number(quantity)) || Number(quantity) < 1) return false;
  const existing = cart.find((item) => item.id === id && item.format === format);
  if (existing) existing.quantity = quantityFor(existing.quantity + Number(quantity));
  else cart.push({ id, format, quantity: quantityFor(quantity) });
  syncCart();
  announce(t('أُضيف المنتج إلى السلّة', 'Added to your bag'));
  return true;
}

export function openCart() {
  initCommerce();
  renderCart();
  showDialog('cart');
}

export function openSearch() {
  initCommerce();
  searchQuery = '';
  renderSearch();
  showDialog('search');
}
