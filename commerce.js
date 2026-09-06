import { products, formats, onlinePolicy, money, getLang, t, packImage } from './catalog.js';
import { renderProductPosts } from './ugc-posts.js';

const STORAGE_KEY = 'hubb.cart.v1';
const MAX_QUANTITY = 99;
const dialogs = {};
const returnFocus = new WeakMap();
let initialized = false;
let cart = [];
let productState = { id: '', format: 'cup', quantity: 1 };
let searchQuery = '';
let previewReady = false;
let availabilitySnapshot = null;
let announcement;
let removedRetailSachets = false;

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const localized = (value) => typeof value === 'object' && value ? value[getLang()] || value.en || value.ar || '' : value || '';
const productFor = (id) => products.find((product) => product.id === id);
const formatFor = (id) => formats.find((format) => format.id === id);
const allowedFormats = (id) => formats.filter((format) => id === 'family-mix' ? format.id === 'family' : ['cup', 'case'].includes(format.id));
const validPair = (id, format) => Boolean(productFor(id) && allowedFormats(id).some((item) => item.id === format));
const priceFor = (item) => Number(formatFor(item.format)?.price) || 0;
const quantityFor = (quantity) => Math.min(MAX_QUANTITY, Math.max(1, Math.floor(Number(quantity) || 1)));
const total = () => cart.reduce((sum, item) => sum + priceFor(item) * item.quantity, 0);
const count = () => cart.reduce((sum, item) => sum + item.quantity, 0);
const keyFor = (item) => `${item.id}:${item.format}`;
const priceNote = () => t('أسعار مقترحة · لن يتم تحصيل أي مبلغ', 'Proposed prices · no payment collected');
const policyNote = () => t('سياسة الطلب والتوصيل مقترحة وقيد التأكيد.', 'Order and delivery policy is proposed and pending confirmation.');
const iconClose = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const iconBag = '<svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true"><path d="M12 16h24l3 26H9l3-26Zm6 0v-5a6 6 0 0 1 12 0v5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const closeButton = (label = t('إغلاق', 'Close')) => `<button class="hc-icon-button hc-close" type="button" data-action="close" aria-label="${escape(label)}">${iconClose}</button>`;

function parseStoredCart(raw) {
  try {
    const stored = JSON.parse(raw || '[]');
    if (!Array.isArray(stored)) return { items: [], removedSachets: false };
    const clean = [];
    let removedSachets = false;
    for (const entry of stored.slice(0, 100)) {
      if (entry?.format === 'sachet') removedSachets = true;
      if (!entry || typeof entry !== 'object' || !validPair(entry.id, entry.format)) continue;
      if (!Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > MAX_QUANTITY) continue;
      const existing = clean.find((item) => keyFor(item) === keyFor(entry));
      if (existing) existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + entry.quantity);
      else clean.push({ id: entry.id, format: entry.format, quantity: entry.quantity });
    }
    return { items: clean, removedSachets };
  } catch { return { items: [], removedSachets: false }; }
}

const readCart = (raw) => parseStoredCart(raw).items;

function restoreCart(raw) {
  const result = parseStoredCart(raw);
  cart = result.items;
  removedRetailSachets ||= result.removedSachets;
}

function orderAmounts(subtotal) {
  const cents = (value) => Math.round(Number(value) * 100);
  const rawSubtotalCents = cents(subtotal);
  const subtotalCents = Number.isSafeInteger(rawSubtotalCents) ? Math.max(0, rawSubtotalCents) : 0;
  const minimumCents = cents(onlinePolicy.minimumOrder);
  const freeShippingCents = cents(onlinePolicy.freeShippingThreshold);
  const minimumMet = subtotalCents >= minimumCents;
  const freeShipping = minimumMet && subtotalCents >= freeShippingCents;
  const shippingCents = minimumMet ? (freeShipping ? 0 : cents(onlinePolicy.shippingFee)) : null;
  return {
    subtotal: subtotalCents / 100,
    minimumMet,
    minimumRemaining: Math.max(0, minimumCents - subtotalCents) / 100,
    freeShipping,
    freeShippingRemaining: Math.max(0, freeShippingCents - subtotalCents) / 100,
    shipping: shippingCents === null ? null : shippingCents / 100,
    grandTotal: shippingCents === null ? null : (subtotalCents + shippingCents) / 100,
  };
}

function checkoutAllowed() {
  return cart.length > 0 && cart.every((item) => validPair(item.id, item.format) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= MAX_QUANTITY) && orderAmounts(total()).minimumMet;
}

function minimumMessage(amounts = orderAmounts(total())) {
  return t(`أضف منتجات بقيمة ${money(amounts.minimumRemaining)} للوصول إلى الحد الأدنى للطلب ${money(onlinePolicy.minimumOrder)}.`, `Add ${money(amounts.minimumRemaining)} in products to reach the ${money(onlinePolicy.minimumOrder)} order minimum.`);
}

function shippingProgress(amounts = orderAmounts(total())) {
  const progress = Math.min(100, Math.max(0, amounts.subtotal / onlinePolicy.freeShippingThreshold * 100));
  const message = amounts.freeShipping ? t('شحن مجاني لهذا الطلب في المعاينة', 'Free delivery for this order in the preview') : t(`باقي ${money(amounts.freeShippingRemaining)} للشحن المجاني.`, `${money(amounts.freeShippingRemaining)} away from free delivery.`);
  return `<div class="hc-shipping-progress ${amounts.freeShipping ? 'is-complete' : ''}"><p>${escape(message)}</p><div class="hc-progress-track" role="progressbar" aria-label="${escape(t('التقدم نحو الشحن المجاني', 'Progress toward free delivery'))}" aria-valuemin="0" aria-valuemax="${onlinePolicy.freeShippingThreshold}" aria-valuenow="${Math.min(amounts.subtotal, onlinePolicy.freeShippingThreshold)}" aria-valuetext="${escape(message)}"><span style="width:${progress}%"></span></div><small>${escape(t(`شحن مجاني من ${money(onlinePolicy.freeShippingThreshold)} · سياسة مقترحة`, `Free delivery from ${money(onlinePolicy.freeShippingThreshold)} · proposed policy`))}</small></div>`;
}

function minimumSuggestions(amounts = orderAmounts(total())) {
  if (amounts.minimumMet) return '';
  const cup = formatFor('cup');
  const family = formatFor('family');
  const cupProduct = productFor(cart.find((item) => item.id !== 'family-mix')?.id) || products.find((product) => product.id !== 'family-mix');
  const cupQuantity = Math.max(1, Math.ceil(amounts.minimumRemaining / cup.price));
  const familyQuantity = Math.max(1, Math.ceil(amounts.minimumRemaining / family.price));
  return `<div class="hc-minimum-guidance"><p id="hc-minimum-message">${escape(minimumMessage(amounts))}</p><div class="hc-suggestions"><button type="button" data-action="add-recommendation" data-id="family-mix" data-format="family" data-quantity="${familyQuantity}"><span>${escape(t(`أضف ${familyQuantity > 1 ? `${familyQuantity} × ` : ''}خلطة العائلة`, `Add ${familyQuantity > 1 ? `${familyQuantity} × ` : ''}Family Mix`))}</span><strong>${escape(money(family.price * familyQuantity))}</strong></button><button type="button" data-action="add-recommendation" data-id="${escape(cupProduct.id)}" data-format="cup" data-quantity="${cupQuantity}"><span>${escape(t(`أضف ${cupQuantity} × كوب ${localized(cupProduct.name)}`, `Add ${cupQuantity} × ${localized(cupProduct.name)} cup`))}</span><strong>${escape(money(cup.price * cupQuantity))}</strong></button></div></div>`;
}

function migrationNotice() {
  if (!removedRetailSachets) return '';
  return `<div class="hc-cart-notice" role="status"><p>${escape(t('الأكياس الفردية مخصصة للتجزئة، لذلك أزلناها من سلّتك الإلكترونية. يمكنك اختيار كوب أو كرتون أو خلطة العائلة؛ لم نضف أي عبوة بديلة.', 'Single sachets are retail-only, so we removed them from your online bag. Choose cups, cases or Family Mix; no replacement pack was added.'))}</p><button type="button" class="hc-icon-button" data-action="dismiss-notice" aria-label="${escape(t('إخفاء التنبيه', 'Dismiss notice'))}">${iconClose}</button></div>`;
}

function amountRows(amounts = orderAmounts(total())) {
  return `<div class="hc-summary-row hc-subtotal-row"><span>${escape(t('إجمالي المنتجات', 'Product subtotal'))}</span><strong>${escape(money(amounts.subtotal))}</strong></div><div class="hc-summary-row hc-shipping-row"><span>${escape(t('التوصيل المقترح', 'Proposed delivery'))}</span><span>${escape(amounts.shipping === null ? t('بعد بلوغ الحد الأدنى', 'Once minimum is reached') : amounts.freeShipping ? t('مجاني', 'Free') : money(amounts.shipping))}</span></div><div class="hc-summary-row hc-grand-total"><span>${escape(t('إجمالي المعاينة', 'Preview total'))}</span><strong>${escape(amounts.grandTotal === null ? '—' : money(amounts.grandTotal))}</strong></div>`;
}

function announce(message) {
  if (!announcement) return;
  announcement.textContent = '';
  requestAnimationFrame(() => { announcement.textContent = message; });
}

function syncCart({ persist = true } = {}) {
  restoreCart(JSON.stringify(cart));
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* A private browser still supports a cart for this visit. */ }
  }
  document.querySelectorAll('[data-cart-count]').forEach((element) => { element.textContent = String(count()); });
  window.dispatchEvent(new CustomEvent('hubb:cart', { detail: { count: count(), total: total() } }));
  if (dialogs.cart?.open) renderCart();
  if (dialogs.checkout?.open) {
    previewReady = false;
    availabilitySnapshot = null;
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
      availabilitySnapshot = null;
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
  if (name === 'checkout' && !checkoutAllowed()) {
    openCart();
    announce(minimumMessage());
    return;
  }
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
  const productChoice = (item) => `<button type="button" class="hc-flavour ${item.id === product.id ? 'is-selected' : ''}" data-action="flavour" data-id="${escape(item.id)}" data-focus="flavour-${escape(item.id)}" aria-pressed="${item.id === product.id}"><span style="background:${escape(item.color || '#9b3b2b')}" aria-hidden="true"></span>${escape(localized(item.name))}</button>`;
  const selectedPackCaption = t(
    `${product.id === 'family-mix' ? 'تصميم المنتج' : 'تصميم النكهة'} معروض للتوضيح. العبوة المختارة: ${localized(format.name)} · عدد الأكياس المغلقة: ${format.count}.`,
    `${product.id === 'family-mix' ? 'Product' : 'Flavour'} artwork shown; selected pack: ${localized(format.name)} · ${format.count} sealed ${format.count === 1 ? 'sachet' : 'sachets'}.`
  );
  replaceDialog(dialogs.product, `<div class="hc-product-layout">
    ${closeButton()}
    <div class="hc-product-visual ${product.id !== 'family-mix' ? 'hc-has-pack-preview' : ''}" style="--hc-product-color:${escape(product.color || '#9b3b2b')}">
      <span class="hc-visual-label">${escape(t('حبّ · من السعودية', 'HUBB · FROM SAUDI'))}</span>
      <div class="hc-product-orbit" aria-hidden="true"></div>
      <img class="hc-product-image" src="${escape(packImage(product,format.id))}" alt="${escape(localized(product.name))}" width="640" height="800">
      ${product.id !== 'family-mix' ? `<figure class="hc-pack-preview hc-inside-sachet"><img src="${escape(product.image)}" alt="${escape(localized(product.name)+t(' — كيس مغلق ٣٠ غ من داخل العبوة',' — one sealed 30 g sachet inside the pack'))}" width="1086" height="1448"><figcaption>${escape(t(`بداخلها ${format.count} أكياس مغلقة من النكهة نفسها · ٣٠ غ للكيس`,`${format.count} same-flavour sealed sachets inside · 30 g each`))}</figcaption></figure>` : ''}
      <p class="hc-art-caption">${escape(selectedPackCaption)}<small>${escape(t('تصوّر للتغليف · التفاصيل النهائية قيد الاعتماد', 'Packaging concept · final details pending approval'))}</small></p>
    </div>
    <div class="hc-product-copy">
      <p class="hc-eyebrow">${escape(t('تسوّق حبّ', 'THE HUBB SHOP'))}</p>
      <h2 id="hc-product-title">${escape(localized(product.name))}</h2>
      <p class="hc-description">${escape(localized(product.description))}</p>
      <div class="hc-ugc-slot">${renderProductPosts(product.id, getLang(), { compact: true })}</div>
      <fieldset class="hc-fieldset"><legend>${escape(t('اختر المنتج', 'Choose a product'))}</legend>
        <div class="hc-product-choice-group"><span class="hc-choice-label">${escape(t('أربع نكهات', 'Four flavours'))}</span><div class="hc-flavours">${products.filter((item) => item.id !== 'family-mix').map(productChoice).join('')}</div></div>
        <div class="hc-product-choice-group hc-mix-choice"><span class="hc-choice-label">${escape(t('عبوة مشتركة · النكهات الأربع معًا', 'Mixed pack · all four flavours together'))}</span><div class="hc-flavours">${products.filter((item) => item.id === 'family-mix').map(productChoice).join('')}</div></div>
      </fieldset>
      <fieldset class="hc-fieldset"><legend>${escape(t('اختر العبوة', 'Choose your pack'))}</legend>
        <div class="hc-formats">${available.map((item) => `<button type="button" class="hc-format ${item.id === format.id ? 'is-selected' : ''}" data-action="format" data-format="${escape(item.id)}" data-focus="format-${escape(item.id)}" aria-pressed="${item.id === format.id}"><span><strong>${escape(localized(item.name))}</strong><small>${escape(formatDetails(item))}</small></span><b>${escape(money(item.price))}</b></button>`).join('')}</div>
      </fieldset>
      ${format.id === 'cup' ? `<p class="hc-pack-note"><span aria-hidden="true">+</span>${escape(t('يتضمن كيسًا منفصلًا للقشور، مع خمسة أكياس مغلقة من البذور.', 'A separate shell bag is included with the five sealed seed sachets.'))}</p>` : ''}
      <div class="hc-product-total"><div><span class="hc-small-label">${escape(t('الإجمالي للمنتجات', 'Product total'))}</span><strong>${escape(money(format.price * productState.quantity))}</strong></div>${quantityControl(productState.quantity, 'product')}</div>
      <button class="hc-button hc-button-primary" type="button" data-action="add-product">${escape(t('أضف للسلة', 'Add to bag'))}<span aria-hidden="true">↗</span></button>
      <p class="hc-price-note">${escape(priceNote())}</p>
      <p class="hc-fine-print">${escape(t(`الحد الأدنى ${money(onlinePolicy.minimumOrder)} · التوصيل ${money(onlinePolicy.shippingFee)}، ومجاني من ${money(onlinePolicy.freeShippingThreshold)}. سياسة مقترحة.`, `Minimum order ${money(onlinePolicy.minimumOrder)} · delivery ${money(onlinePolicy.shippingFee)}, free from ${money(onlinePolicy.freeShippingThreshold)}. Proposed policy.`))}</p>
    </div>
  </div>`);
}

function renderCart() {
  const amounts = orderAmounts(total());
  replaceDialog(dialogs.cart, `<div class="hc-drawer-layout">
    <header class="hc-dialog-header"><div><p class="hc-eyebrow">${escape(t('جهّز جمعتك', 'MAKE ROOM FOR THE GATHERING'))}</p><h2 id="hc-cart-title">${escape(t('سلّتك', 'Your bag'))} <span class="hc-title-count">${count()}</span></h2></div>${closeButton()}</header>
    <div class="hc-cart-scroll">${migrationNotice()}${shippingProgress(amounts)}
    ${cart.length ? `<div class="hc-cart-items">${cart.map((item) => {
      const product = productFor(item.id);
      const format = formatFor(item.format);
      const key = keyFor(item);
      return `<article class="hc-cart-item"><div class="hc-cart-image" style="--hc-product-color:${escape(product.color || '#9b3b2b')}"><img src="${escape(packImage(product,format.id))}" alt="${escape(localized(product.name))}" width="100" height="130"></div><div class="hc-cart-item-copy"><h3>${escape(localized(product.name))}</h3><p>${escape(localized(format.name))} · ${escape(formatDetails(format))}</p><p class="hc-unit-price">${escape(money(format.price))} ${escape(t('للعبوة', 'each'))}</p><div class="hc-cart-item-controls">${quantityControl(item.quantity, 'cart', key)}<button type="button" class="hc-remove" data-action="remove" data-key="${escape(key)}" aria-label="${escape(t(`إزالة ${localized(product.name)}`, `Remove ${localized(product.name)}`))}">${escape(t('إزالة', 'Remove'))}</button></div></div><strong class="hc-line-price">${escape(money(format.price * item.quantity))}</strong></article>`;
    }).join('')}</div>` : `<div class="hc-empty hc-cart-empty">${iconBag}<h3>${escape(t('جمعتك تبدأ من هنا', 'Your gathering starts here'))}</h3><p>${escape(t(`الطلبات الإلكترونية من ${money(onlinePolicy.minimumOrder)}. ابدأ بخلطة العائلة، أو اجمع أكوابك ونكهاتك المفضلة.`, `Online orders start at ${money(onlinePolicy.minimumOrder)}. Start with Family Mix or build a bag of your favourite cups and cases.`))}</p></div>`}
    ${minimumSuggestions(amounts)}</div>
    <footer class="hc-cart-footer">${amountRows(amounts)}<p class="hc-price-note">${escape(priceNote())}<br>${escape(policyNote())}</p><button type="button" class="hc-button hc-button-primary" data-action="checkout" ${!checkoutAllowed() ? 'disabled aria-describedby="hc-minimum-message"' : ''}>${escape(t('معاينة الطلب', 'Preview checkout'))}<span aria-hidden="true">↗</span></button><button type="button" class="hc-button hc-button-text" data-action="close">${escape(t('أكمل التسوّق', 'Keep shopping'))}</button></footer>
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
    return `<div class="hc-checkout-line"><img src="${escape(packImage(product,format.id))}" alt="" width="52" height="66"><div><strong>${escape(localized(product.name))}</strong><small>${escape(localized(format.name))} × ${item.quantity}</small></div><b>${escape(money(format.price * item.quantity))}</b></div>`;
  }).join('')}</div>${amountRows()}${shippingProgress()}<p class="hc-fine-print">${escape(policyNote())} ${escape(t('السعر النهائي والمعالجة الضريبية يُؤكّدان قبل تفعيل الشراء الفعلي.', 'Final pricing and tax treatment will be confirmed before live checkout is activated.'))}</p></aside>`;
}

function availabilityMessage() {
  if (!previewReady || !availabilitySnapshot || !checkoutAllowed()) return '';
  const { city, items, amounts } = availabilitySnapshot;
  const lines = items.map((item) => {
    const product = productFor(item.id);
    const format = formatFor(item.format);
    return `${localized(product.name)} — ${localized(format.name)} × ${item.quantity} (${item.quantity * format.count} ${t('كيسًا مغلقًا', 'sealed sachets')})`;
  });
  return `HUBB — ${t('استفسار عن التوفر وعرض السعر', 'Availability and quote inquiry')}\n${t('المدينة', 'City')}: ${city}\n\n${lines.join('\n')}\n\n${t('إجمالي المنتجات المقترح', 'Proposed product subtotal')}: ${money(amounts.subtotal)}\n${t('رسوم التوصيل المقترحة', 'Proposed delivery')}: ${money(amounts.shipping)}\n${t('إجمالي المعاينة', 'Preview total')}: ${money(amounts.grandTotal)}\n\n${t('يرجى تأكيد التوفر والسعر النهائي والضرائب والتوصيل وشروط الدفع. هذا استفسار وليس طلبًا مؤكدًا؛ لم يتم تحصيل أي مبلغ.', 'Please confirm stock, final pricing, tax, delivery and payment terms. This is an inquiry, not a confirmed order; no payment has been collected.')}`;
}

function availabilityAction() {
  const message = availabilityMessage();
  if (!message) return '';
  return `<p>${escape(t('تواصل مع الفريق لتأكيد المخزون والأسعار النهائية وشروط التوصيل والدفع.', 'Contact the team to confirm stock, final prices, delivery and payment terms.'))}</p><a class="hc-button hc-button-primary" href="${escape(`https://wa.me/966553127999?text=${encodeURIComponent(message)}`)}" target="_blank" rel="noopener noreferrer">${escape(t('تحقّق من التوفر عبر واتساب', 'Check availability on WhatsApp'))} ↗</a><p class="hc-fine-print" style="margin-top:12px">${escape(t('يفتح الرابط مسودة تتضمن المنتجات والكميات والأسعار المقترحة والمدينة فقط. راجعها ثم اضغط إرسال داخل واتساب؛ لا تُرسل تلقائيًا.', 'The link opens a draft with items, quantities, proposed amounts and your city only. Review it and press Send in WhatsApp; nothing is sent automatically.'))}</p>`;
}

function renderCheckout(values = {}) {
  if (!checkoutAllowed()) { previewReady = false; availabilitySnapshot = null; }
  const field = (name, label, attrs = '', full = false) => `<label class="hc-input-label ${full ? 'hc-input-full' : ''}"><span>${escape(label)}</span><input name="${name}" value="${escape(values[name] || '')}" ${attrs}></label>`;
  replaceDialog(dialogs.checkout, `<div class="hc-checkout-layout"><header class="hc-dialog-header"><div><p class="hc-eyebrow">${escape(t('تجربة المتجر', 'STORE PREVIEW'))}</p><h2 id="hc-checkout-title">${escape(t(previewReady ? 'معاينة طلبك جاهزة' : 'معاينة الطلب', previewReady ? 'Your order preview is ready' : 'Preview your order'))}</h2></div>${closeButton()}</header>
    <div class="hc-preview-banner" role="note"><span aria-hidden="true">◌</span><p>${escape(t('معاينة فقط. لن يتم إرسال طلب أو تحصيل مبلغ. بياناتك لا تُرسل ولا تُحفظ.', 'Preview only. No order is placed and no payment is collected. Your details are not sent or saved.'))}</p></div>
    ${!checkoutAllowed() ? `<div class="hc-empty"><h3>${escape(t('أكمل الحد الأدنى للطلب', 'Complete your minimum order'))}</h3><p>${escape(minimumMessage())}</p><button type="button" class="hc-button hc-button-primary" data-action="back-cart">${escape(t('العودة إلى السلّة لإضافة المنتجات', 'Back to your bag to add products'))}</button></div>` : `<div class="hc-checkout-columns">${previewReady ? `<div class="hc-preview-success" role="status"><span class="hc-success-mark" aria-hidden="true">✓</span><h3>${escape(t('معاينة الطلب جاهزة', 'Order preview ready'))}</h3><p>${escape(t('لم يتم تقديم أي طلب أو تحصيل أي مبلغ.', 'No order has been placed and no payment has been collected.'))}</p>${availabilityAction()}<button type="button" class="hc-button hc-button-text" data-action="back-cart">${escape(t('العودة إلى السلّة', 'Back to your bag'))}</button><button type="button" class="hc-button hc-button-text" data-action="close">${escape(t('أكمل الاستكشاف', 'Keep exploring'))}</button></div>` : `<form class="hc-checkout-form" novalidate><p class="hc-form-intro">${escape(t('جرّب تفاصيل التوصيل داخل المملكة.', 'Try the delivery form for Saudi Arabia.'))}</p><div class="hc-input-grid">
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
  results.innerHTML = matches.length ? matches.map((product) => `<button type="button" class="hc-search-result" data-action="search-product" data-id="${escape(product.id)}"><span class="hc-search-image" style="--hc-product-color:${escape(product.color || '#9b3b2b')}"><img src="${escape(packImage(product,'cup'))}" alt="" width="72" height="86"></span><span><strong>${escape(localized(product.name))}</strong><small class="hc-search-kind">${escape(product.id === 'family-mix' ? t('عبوة مشتركة · أربع نكهات', 'Mixed pack · four flavours') : t('نكهة مستقلة · أكواب وكراتين', 'Single flavour · cups and cases'))}</small><small>${escape(localized(product.description))}</small></span><span aria-hidden="true">↗</span></button>`).join('') : `<div class="hc-search-empty"><h3>${escape(t('لم نجد هذا المنتج', 'No products found'))}</h3><p>${escape(t('جرّب اسم منتج آخر أو امسح البحث لتصفح جميع المنتجات.', 'Try another product name or clear your search to see everything.'))}</p><button type="button" class="hc-button hc-button-text" data-action="clear-search">${escape(t('مسح البحث', 'Clear search'))}</button></div>`;
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
  if (action === 'dismiss-notice') {
    removedRetailSachets = false;
    renderCart();
    dialogs.cart.querySelector('[data-action="close"]')?.focus({ preventScroll: true });
    return;
  }
  if (action === 'add-recommendation') {
    if (addToCart(button.dataset.id, button.dataset.format, Number(button.dataset.quantity))) {
      openCart();
      dialogs.cart.querySelector('[data-action="checkout"]:not(:disabled), .hc-suggestions button')?.focus({ preventScroll: true });
    }
    return;
  }
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
    if (!checkoutAllowed()) {
      syncCart();
      openCart();
      announce(minimumMessage());
      return;
    }
    previewReady = false;
    availabilitySnapshot = null;
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
  try { restoreCart(localStorage.getItem(STORAGE_KEY)); } catch { cart = []; }
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
    if (!checkoutAllowed()) {
      syncCart();
      openCart();
      announce(minimumMessage());
      return;
    }
    if (!validateCheckout(event.target)) return;
    availabilitySnapshot = { city: event.target.elements.namedItem('city').value.trim(), items: cart.map((item) => ({ ...item })), amounts: orderAmounts(total()) };
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
    restoreCart(event.newValue);
    syncCart({ persist: event.key === STORAGE_KEY && event.newValue !== JSON.stringify(cart) });
  });
  syncCart();
  if (removedRetailSachets) announce(t('أزلنا الأكياس الفردية من السلّة لأنها مخصصة للتجزئة. اختر كوبًا أو كرتونًا أو خلطة العائلة.', 'Single sachets were removed from your online bag because they are retail-only. Choose a cup, case or Family Mix.'));
}

export function openProduct(id, format = 'cup') {
  initCommerce();
  if (!productFor(id)) return false;
  if (format === 'sachet') {
    announce(t('الأكياس الفردية مخصصة للتجزئة. اختر كوبًا أو كرتونًا للطلب الإلكتروني.', 'Single sachets are retail-only. Choose a cup or case for an online order.'));
    return false;
  }
  const actualFormat = validPair(id, format) ? format : allowedFormats(id)[0]?.id;
  if (!actualFormat) return false;
  productState = { id, format: actualFormat, quantity: 1 };
  renderProduct();
  showDialog('product');
  return true;
}

export function addToCart(id, format, quantity = 1) {
  initCommerce();
  if (!validPair(id, format) || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) return false;
  const existing = cart.find((item) => item.id === id && item.format === format);
  if (existing) existing.quantity = quantityFor(existing.quantity + Number(quantity));
  else cart.push({ id, format, quantity: quantityFor(quantity) });
  syncCart();
  announce(t('أُضيف المنتج إلى السلّة', 'Added to your bag'));
  return true;
}

export function openCart() {
  initCommerce();
  restoreCart(JSON.stringify(cart));
  renderCart();
  showDialog('cart');
}

export function openSearch() {
  initCommerce();
  searchQuery = '';
  renderSearch();
  showDialog('search');
}
