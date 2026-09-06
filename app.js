import { products, formats, onlinePolicy, money, getLang, t, bulkUnitPrice } from './catalog.js';
import { initCommerce, openProduct, addToCart, openCart, openSearch } from './commerce.js';
import { initStory } from './story.js';

const WHATSAPP_NUMBER = '966553127999';
let selectedFormat = 'cup';
let toastTimer;
let dialogOpener;
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (value) => new Intl.NumberFormat(getLang() === 'ar' ? 'ar-SA' : 'en-SA').format(value);
const flavours = () => products.filter((product) => product.id !== 'family-mix');
const localized = (value) => value[getLang()];
const asset = (path) => `/${String(path).replace(/^\.\//, '').replace(/^\/+/, '')}`;
const dialog = $('#editorial-dialog');
const content = $('#editorial-content');

function toast(message) {
  const element = $('#toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 3400);
}

function renderProducts() {
  const grid = $('#product-grid');
  if (!grid) return;
  const format = formats.find((item) => item.id === selectedFormat);
  if (!format) return;
  grid.innerHTML = flavours().map((p) => `<article class="product-card" style="--flavour:${esc(p.color)};--tint:${esc(p.pale)}"><button class="product-image-button" data-product="${esc(p.id)}" aria-label="${esc(t(`تفاصيل ${p.name.ar}`, `${p.name.en} details`))}"><span class="product-note">${esc(localized(p.note))}</span><img src="${esc(asset(p.image))}" alt="${esc(localized(p.name) + t(' — تصميم النكهة للتوضيح', ' — flavour artwork for illustration'))}" width="1086" height="1448" loading="lazy"><span class="product-open" aria-hidden="true">↗</span></button><h3><a href="/${getLang()}/products/${encodeURIComponent(p.id)}/">${esc(localized(p.name))}</a></h3><div class="product-meta"><span>${esc(localized(format.name))} · ${num(format.count)} × ${num(30)} ${t('غ', 'g')}</span><span>${num(format.grams)} ${t('غ إجمالي', 'g total')}</span></div><button class="product-add" data-add="${esc(p.id)}" aria-label="${esc(t(`أضف ${p.name.ar} إلى السلة`, `Add ${p.name.en} to bag`))}"><span>${money(format.price)}</span><span>${t('أضف للسلة', 'Add to bag')} +</span></button></article>`).join('');
  if ($('#format-explanation')) $('#format-explanation').textContent = selectedFormat === 'cup'
    ? t('كوب الرحلة: ٥ أكياس مغلقة من نكهة واحدة + كيس منفصل للقشور. الصورة تعرض تصميم النكهة؛ شاهد محتويات الكوب في التفاصيل.', 'Journey Cup: five sealed same-flavour sachets + a separate shell bag. Flavour artwork shown; see cup contents in product details.')
    : t('كرتون التجزئة: ٢٤ كيسًا مغلقًا من نكهة واحدة. الصور تعرض تصميم النكهة للتوضيح.', 'Retail case: 24 sealed sachets of one flavour. Images show flavour artwork for illustration.');
  if ($('#family-price')) $('#family-price').textContent = money(formats.find((item) => item.id === 'family').price);
}

function updateBulk() {
  const input = $('#bulk-quantity');
  if (!input) return;
  const quantity = Number(input.value);
  if ($('#bulk-nudge')) $('#bulk-nudge').textContent = '';
  if (!Number.isInteger(quantity) || quantity < 4 || quantity > 10000) {
    if ($('#bulk-total')) $('#bulk-total').textContent = '—';
    if ($('#bulk-count')) $('#bulk-count').textContent = t('أدخل عددًا صحيحًا من ٤ إلى ١٠٬٠٠٠.', 'Enter a whole number from 4 to 10,000.');
    return;
  }
  if ($('#bulk-total')) $('#bulk-total').textContent = money(quantity * bulkUnitPrice(quantity));
  if ($('#bulk-count')) $('#bulk-count').textContent = `${num(quantity * 24)} ${t('كيس', 'sachets')} · ${num(quantity * .72)} ${t('كغ إجمالي', 'kg total')}`;
  let nudge = $('#bulk-nudge');
  if (!nudge && $('#bulk-count')) { nudge = document.createElement('div'); nudge.id = 'bulk-nudge'; nudge.className = 'bulk-nudge'; $('#bulk-count').after(nudge); }
  const saving = quantity * bulkUnitPrice(quantity) - (quantity + 1) * bulkUnitPrice(quantity + 1);
  if (nudge && saving > 0) nudge.textContent = t(`أضف كرتونًا واحدًا ووفّر ${money(saving)} في إجمالي المنتجات المقترح.`, `Add one case and save ${money(saving)} on the proposed goods subtotal.`);
  document.querySelectorAll('.bulk-table tbody tr').forEach((row, index) => { row.dataset.active = String(index === (quantity >= 24 ? 2 : quantity >= 12 ? 1 : 0)); });
}

function renderBulkOptions() {
  const select = $('#bulk-flavour');
  if (!select) return;
  const value = select.value;
  select.innerHTML = flavours().map((p) => `<option value="${esc(p.id)}">${esc(localized(p.name))}</option>`).join('');
  if (flavours().some((p) => p.id === value)) select.value = value;
  updateBulk();
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-ar][data-en]').forEach((element) => { element.textContent = element.dataset[lang]; });
  document.querySelectorAll('[data-alt-ar]').forEach((element) => { element.alt = element.dataset[lang === 'ar' ? 'altAr' : 'altEn']; });
  if ($('#language-toggle')) { $('#language-toggle').textContent = lang === 'ar' ? 'EN' : 'عربي'; $('#language-toggle').setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'); }
  document.title = lang === 'ar' ? 'حُبّ | عامان. وقرمشة تستاهل.' : 'HUBB | Two years. One good crack.';
  renderProducts();
  renderBulkOptions();
  window.dispatchEvent(new Event('hubb:language'));
}

function showDialog(html) {
  if (!dialog || !content) return;
  if (!dialog.open) dialogOpener = document.activeElement;
  content.innerHTML = html;
  if (!dialog.open) dialog.showModal();
}
function closeDialog() { dialog?.close(); if (content) content.innerHTML = ''; if (dialogOpener?.isConnected) dialogOpener.focus?.(); }

function preparedMessageLink(body) {
  return `<a class="button primary" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}" target="_blank" rel="noopener noreferrer">${t('افتح مسودة واتساب', 'Open WhatsApp draft')} ↗</a><p class="small-text" style="margin-top:12px">${t('يفتح الرابط رسالة جاهزة في واتساب عند الضغط عليه. راجعها واضغط إرسال هناك؛ لا تُرسل تلقائيًا.', 'Clicking the link opens a prepared message in WhatsApp. Review it and press Send there; nothing is sent automatically.')}</p>`;
}

function showMoment(id) {
  const moment = {
    majlis: { title: t('سوالف ما تخلص', 'One more story'), body: t('قهوة على الطاولة، كيس ينفتح، وسالفة تجرّ سالفة. تصوّر لحملة حُبّ في المجلس السعودي.', 'Coffee on the table. A pack opens. One story becomes another. A HUBB campaign concept set in a Saudi majlis.'), product: 'sea-salt' },
    roadtrip: { title: t('الطريق له رفيق', 'Take the long way'), body: t('وقفة هادئة على الطريق. افتح كوب الرحلة، خذ كيسًا وخلّ الباقي مغلقًا. مشهد تصوّري في استراحة آمنة والسيارة متوقفة.', 'A quiet stop along the way. Open a Journey Cup, take one sachet and keep the others sealed. A concept scene at a safe stop with the car parked.'), product: 'pepper-lime' },
    game: { title: t('باقي جولة', 'Just one more round'), body: t('كل واحد له نكهته، وباقي جولة تجمعنا. تصوّر لحملة حُبّ حول جلسة لعب ومشاركة.', 'Everyone has a flavour. There’s still one more round. A HUBB campaign concept around a shared game-night table.'), product: 'family-mix' },
  }[id];
  if (!moment) return;
  showDialog(`<p class="eyebrow">${t('مشهد حملة مولّد بالذكاء الاصطناعي', 'AI-GENERATED CAMPAIGN CONCEPT')}</p><h2>${moment.title}</h2><img src="/assets/ugc-${id}.webp" alt="${esc(moment.title)}"><p style="margin-top:20px">${moment.body}</p><button class="button primary" id="moment-shop">${t('تسوّق هذه اللحظة', 'Shop this moment')} ↗</button>`);
  $('#moment-shop')?.addEventListener('click', () => { closeDialog(); openProduct(moment.product, moment.product === 'family-mix' ? 'family' : 'cup'); });
}

const info = {
  delivery: () => `<h2>${t('التوصيل والاسترجاع', 'Delivery & returns')}</h2><p>${t(`سياسة المتجر المقترحة: الحد الأدنى للمنتجات ${money(onlinePolicy.minimumOrder)}، والتوصيل ${money(onlinePolicy.shippingFee)}، مع توصيل مجاني للمنتجات بقيمة ${money(onlinePolicy.freeShippingThreshold)} فأكثر. هذه أرقام تجريبية بانتظار التأكيد وليست تعرفة معتمدة من شركة شحن.`, `Proposed store policy: a ${money(onlinePolicy.minimumOrder)} product minimum, ${money(onlinePolicy.shippingFee)} delivery, and free delivery when products total ${money(onlinePolicy.freeShippingThreshold)} or more. These preview amounts await confirmation and are not an approved carrier tariff.`)}</p><p>${t('مناطق التوصيل ومواعيده وسياسة الاسترجاع والمعالجة الضريبية النهائية تُؤكّد قبل فتح البيع. المعاينة لا ترسل طلب شراء ولا تحصّل أي مبلغ.', 'Delivery areas, delivery times, returns policy and final tax treatment will be confirmed before sales open. Checkout previews do not place orders or collect payments.')}</p><p>${t('للتوريد، جهّز طلب عرض سعر من حاسبة الجملة وافتح مسودته في واتساب للتواصل مع الفريق.', 'For trade supply, prepare a quote request in the wholesale calculator and open its WhatsApp draft to contact the team.')}</p>`,
  privacy: () => `<h2>${t('الخصوصية والشروط', 'Privacy & terms')}</h2><p>${t('تُحفظ محتويات السلّة فقط في هذا المتصفح. تحدد لغة الصفحة من عنوانها. لا تُحفظ بيانات الاسم أو العنوان أو الهاتف أو ملاحظات النماذج في التخزين المحلي، وتُزال من الصفحة عند إغلاق النموذج.', 'Only bag contents are stored in this browser. The page address determines its language. Names, addresses, phone numbers and form notes are not saved to local storage and are removed from the page when the form closes.')}</p><p>${t('تظهر ملاحظات التذوق والتعاون وطلبات التوريد في معاينة محلية أولًا. رابط واتساب يفتح نصًا جاهزًا عند الضغط عليه فقط؛ ستراجع الرسالة وتضغط إرسال داخل واتساب. عند فتح الرابط، يُشارك النص المدرج مع واتساب.', 'Tasting feedback, partnership inquiries and trade requests first appear in a local preview. A WhatsApp link opens prepared text only when clicked; you review the message and press Send in WhatsApp. Opening that link shares the included text with WhatsApp.')}</p><p>${t('ملف عرض السعر يُنزّل عند اختيارك. الخطوط من Google Fonts، والخرائط أو روابط المواقع قد تستخدم Google Maps؛ تتصل هذه الخدمات بجهاتها الخارجية عند التحميل أو الفتح. تخضع المواقع الخارجية لسياسات الخصوصية الخاصة بها.', 'Quote-request files download when you choose. Fonts come from Google Fonts, and maps or location links may use Google Maps; these services contact their external providers when loaded or opened. External sites have their own privacy policies.')}</p><p>${t('الشروط التجارية وسياسة الخصوصية النهائية تحتاج اعتماد المنشأة قبل استقبال طلبات شراء فعلية.', 'Final commercial terms and privacy policy require business approval before live purchase orders are accepted.')}</p>`,
  creators: () => `<p class="eyebrow">HUBB / CREATOR CORNER</p><h2>${t('حكايتك، بطريقتك.', 'Your story. Your way.')}</h2><p>${t('نطوّر مساحة لحكايات حُبّ من صنّاع المحتوى في السعودية: جلسة مجلس، استراحة رحلة والسيارة متوقفة، أو ليلة لعب.', 'We’re developing a space for HUBB stories by Saudi creators: a majlis gathering, a road-trip break with the car parked, or a game night.')}</p><h3>${t('تفاصيل تحكي المنتج', 'Let the product tell the story')}</h3><p>${t('أظهر الكيس المغلق والنكهة وطريقة المشاركة. عند الأكل، افتح القشر وافصله، كُل النواة فقط واجمع القشور في الكيس المخصص.', 'Show the sealed sachet, the flavour and how it is shared. When eating, crack and separate the husk, eat only the kernel and collect husks in the separate shell bag.')}</p><p class="small-text">${t('المشاهد الحالية مفاهيم مولّدة، وليست شهادات صنّاع محتوى أو تجارب عملاء.', 'Current scenes are generated concepts, not creator endorsements or customer experiences.')}</p><button class="button primary" data-partner="creator">${t('جهّز فكرة تعاون', 'Prepare a collaboration idea')}</button>`,
};
function showInfo(id) { if (info[id]) showDialog(info[id]()); }

const sensoryFields = [
  { key: 'crack', label: ['فتح القشرة', 'Cracking the shell'], options: [['easy', 'سهلة الفتح', 'Easy to crack'], ['firm', 'تحتاج قوة أكثر', 'Needs more force'], ['uneven', 'تختلف بين الحبات', 'Varies between seeds']] },
  { key: 'texture', label: ['قوام النواة', 'Kernel texture'], options: [['crisp', 'مقرمش', 'Crisp'], ['soft', 'طري', 'Soft'], ['mixed', 'غير متجانس', 'Inconsistent']] },
  { key: 'roast', label: ['درجة التحميص', 'Roast level'], options: [['light', 'خفيفة', 'Light'], ['balanced', 'متوازنة', 'Balanced'], ['strong', 'قوية', 'Strong']] },
  { key: 'flavour', label: ['قوة النكهة', 'Flavour intensity'], options: [['mild', 'خفيفة', 'Mild'], ['balanced', 'متوازنة', 'Balanced'], ['intense', 'قوية', 'Intense']] },
];

function showReview() {
  showDialog(`<p class="eyebrow">${t('ملاحظاتك تساعدنا · لا تُنشر تلقائيًا', 'YOUR FEEDBACK HELPS · NEVER AUTO-PUBLISHED')}</p><h2>${t('وش رأيك؟', 'What do you think?')}</h2><p>${t('قل لنا أولًا إذا تذوقت المنتج الفعلي. نفصل ملاحظات التذوق عن الرأي في التصميم، ولا نعرض أي منها كتقييم شراء موثّق.', 'Tell us first whether you tasted the actual product. Tasting feedback and opinions on the concept are kept distinct; neither is presented as a verified purchase review.')}</p><form id="review-form"><label for="review-tried">${t('هل تذوقت منتج حُبّ الفعلي؟', 'Have you tasted the actual HUBB product?')}</label><select id="review-tried" name="tried" required><option value="" selected disabled>${t('اختر إجابتك', 'Choose your answer')}</option><option value="yes">${t('نعم، تذوقت المنتج', 'Yes, I tasted the product')}</option><option value="no">${t('لا، رأيي في التصوّر فقط', 'No, I am reviewing the concept only')}</option></select><label for="review-product">${t('النكهة', 'Flavour')}</label><select id="review-product" name="product" required>${flavours().map((p) => `<option value="${esc(p.id)}">${esc(localized(p.name))}</option>`).join('')}</select>${sensoryFields.map((field) => `<label for="review-${field.key}">${t(...field.label)}</label><select id="review-${field.key}" name="${field.key}" data-sensory disabled><option value="not-tried">${t('لم أجرّب / لا أستطيع الحكم', 'Not tried / unable to assess')}</option>${field.options.map(([value, ar, en]) => `<option value="${value}">${t(ar, en)}</option>`).join('')}</select>`).join('')}<p class="small-text" style="margin-top:12px">${t('تُفعّل أسئلة التذوق عند اختيار «نعم» فقط.', 'Sensory questions become available only when you select “Yes”.')}</p><label for="review-text">${t('ملاحظاتك', 'Your notes')}</label><textarea id="review-text" name="notes" required minlength="10" maxlength="1500" placeholder="${t('ما الذي أعجبك، وما الذي يمكن تحسينه؟', 'What worked for you, and what could improve?')}"></textarea><button type="submit" class="button primary">${t('عاين ملاحظاتك', 'Preview your feedback')}</button></form>`);
  $('#review-tried')?.addEventListener('change', (event) => {
    content.querySelectorAll('[data-sensory]').forEach((select) => { select.disabled = event.target.value !== 'yes'; if (select.disabled) select.value = 'not-tried'; });
  });
  $('#review-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!event.target.reportValidity()) return;
    const data = new FormData(event.target);
    const tried = data.get('tried') === 'yes';
    const product = flavours().find((p) => p.id === data.get('product'));
    if (!product || !['yes', 'no'].includes(data.get('tried'))) return;
    const category = tried ? t('ملاحظات تذوق فعلي — بحسب إفادة المشارك', 'Actual tasting feedback — self-reported') : t('رأي في التصوّر فقط — لم يتم تذوق المنتج', 'Concept feedback only — product not tasted');
    const responses = sensoryFields.map((field) => {
      const option = tried ? field.options.find(([key]) => key === data.get(field.key)) : null;
      return `${t(...field.label)}: ${option ? t(option[1], option[2]) : t('لم أجرّب / لا أستطيع الحكم', 'Not tried / unable to assess')}`;
    });
    const body = `HUBB — ${t('ملاحظات المنتج', 'Product feedback')}\n${category}\n${t('النكهة', 'Flavour')}: ${localized(product.name)}\n${responses.join('\n')}\n\n${t('ملاحظات', 'Notes')}: ${String(data.get('notes')).trim()}\n\n${t('مشاركة خاصة للنقاش؛ ليست مراجعة منشورة أو عملية شراء موثّقة.', 'Private feedback for discussion; not a published review or verified purchase.')}`;
    showDialog(`<p class="eyebrow">${t('معاينة فقط · لم تُرسل', 'PREVIEW ONLY · NOT SENT')}</p><h2>${t('ملاحظاتك جاهزة للمراجعة.', 'Your feedback is ready to review.')}</h2><div class="inline-success"><strong>${esc(category)}</strong><pre class="draft-output">${esc(body)}</pre></div><p style="margin:20px 0">${t('لم تُحفظ الملاحظات أو تُنشر أو تُضاف إلى تقييمات العملاء. يمكنك فتح المسودة في واتساب إذا رغبت في مشاركتها.', 'Nothing has been saved, published or added to customer reviews. You can open the WhatsApp draft if you choose to share it.')}</p>${preparedMessageLink(body)}`);
  });
}

const partnerKinds = { retailer: ['متجر تجزئة', 'Retailer'], distributor: ['موزّع', 'Distributor'], creator: ['صانع محتوى / تعاون', 'Creator / collaboration'] };
const inputField = (id, name, label, extra = '') => `<label for="${id}">${label}</label><input id="${id}" name="${name}" required minlength="2" maxlength="200" ${extra}>`;
function showPartner(rawKind) {
  const kind = ({ distribution: 'distributor', collaboration: 'creator', retail: 'retailer' })[rawKind] || rawKind;
  if (!partnerKinds[kind]) return;
  const creator = kind === 'creator';
  const label = t(...partnerKinds[kind]);
  showDialog(`<p class="eyebrow">${t('ابدأ المحادثة', 'START A CONVERSATION')} / ${esc(label)}</p><h2>${t('خلّنا نتعرّف عليك.', 'Let’s get to know you.')}</h2><p>${t('جهّز رسالة للفريق، راجعها ثم افتحها في واتساب باختيارك. هذا استفسار وليس اتفاقًا أو طلبًا مؤكدًا.', 'Prepare a message for the team, review it, then choose to open it in WhatsApp. This is an inquiry, not an agreement or confirmed order.')}</p><form id="partner-form">${inputField('partner-business', 'business', creator ? t('الاستوديو أو اسم الحساب', 'Studio or account name') : t('اسم المنشأة', 'Business name'), 'autocomplete="organization"')}${inputField('partner-name', 'name', t('اسمك', 'Your name'), 'autocomplete="name"')}${inputField('partner-city', 'city', t('المدينة', 'City'), 'autocomplete="address-level2"')}${inputField('partner-channel', 'channel', creator ? t('المنصة أو قناة المحتوى', 'Platform or content channel') : t('قناة البيع / مناطق التغطية', 'Sales channel / coverage'))}${inputField('partner-volume', 'volume', creator ? t('فكرة التعاون ونطاقه', 'Collaboration idea and scope') : t('الحجم المتوقع أو عدد الفروع', 'Expected volume or number of outlets'))}<label for="partner-notes">${t('ملاحظات إضافية (اختياري)', 'Additional notes (optional)')}</label><textarea id="partner-notes" name="notes" maxlength="1500"></textarea><button type="submit" class="button primary">${t('جهّز معاينة الرسالة', 'Prepare message preview')}</button></form>`);
  $('#partner-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!event.target.reportValidity()) return;
    const data = new FormData(event.target);
    if (['business', 'name', 'city', 'channel', 'volume'].some((key) => String(data.get(key)).trim().length < 2)) { toast(t('يرجى إكمال الحقول المطلوبة.', 'Please complete the required fields.')); return; }
    const body = `HUBB — ${label}\n${t('استفسار مبدئي للنقاش', 'Initial inquiry for discussion')}\n\n${t('المنشأة / الحساب', 'Business / account')}: ${String(data.get('business')).trim()}\n${t('الاسم', 'Name')}: ${String(data.get('name')).trim()}\n${t('المدينة', 'City')}: ${String(data.get('city')).trim()}\n${t('القناة / التغطية', 'Channel / coverage')}: ${String(data.get('channel')).trim()}\n${creator ? t('الفكرة والنطاق', 'Idea and scope') : t('الحجم / الفروع', 'Volume / outlets')}: ${String(data.get('volume')).trim()}\n${t('ملاحظات', 'Notes')}: ${String(data.get('notes') || '—').trim()}\n\n${t('نرغب بالتواصل لمناقشة التفاصيل؛ لا يتضمن هذا الاستفسار اتفاقًا أو التزامًا تجاريًا.', 'We would like to discuss the details; this inquiry does not establish an agreement or commercial commitment.')}`;
    showDialog(`<p class="eyebrow">${t('مسودة استفسار · لم تُرسل', 'INQUIRY DRAFT · NOT SENT')}</p><h2>${t('جاهزين نبدأ المحادثة.', 'Ready to start the conversation.')}</h2><pre class="draft-output">${esc(body)}</pre>${preparedMessageLink(body)}`);
  });
}

function downloadDraft(body, name) {
  const url = URL.createObjectURL(new Blob(['\ufeff' + body], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showBulkRequest() {
  const quantity = Number($('#bulk-quantity')?.value);
  const product = flavours().find((p) => p.id === $('#bulk-flavour')?.value);
  if (!Number.isInteger(quantity) || quantity < 4 || quantity > 10000 || !product) return;
  showDialog(`<p class="eyebrow">${t('طلب عرض سعر · مسودة', 'QUOTE REQUEST · DRAFT')}</p><h2>${t('حُبّ لأعمالك.', 'HUBB for your business.')}</h2><p>${esc(localized(product.name))} · ${num(quantity)} ${t('كرتون', 'cases')} · ${num(quantity * 24)} ${t('كيس', 'sachets')}<br>${t('إجمالي المنتجات المقترح:', 'Proposed goods subtotal:')} ${money(quantity * bulkUnitPrice(quantity))}</p><form id="quote-form">${inputField('quote-company', 'company', t('اسم المنشأة', 'Business name'), 'autocomplete="organization"')}${inputField('quote-city', 'city', t('المدينة', 'City'), 'autocomplete="address-level2"')}<label for="quote-notes">${t('ملاحظات التوريد (اختياري)', 'Supply notes (optional)')}</label><textarea id="quote-notes" name="notes" maxlength="1200"></textarea><p class="small-text" style="margin-top:15px">${t('راجع المسودة ثم نزّلها أو افتح رسالتها الجاهزة في واتساب. البيانات لا تُحفظ في المتصفح. الأسعار والشحن والضرائب وشروط التوريد تحتاج تأكيدًا في العرض النهائي.', 'Review the draft, then download it or open the prepared WhatsApp message. Details are not saved in this browser. Pricing, freight, tax and supply terms require confirmation in the final quote.')}</p><button type="submit" class="button primary">${t('جهّز طلب عرض السعر', 'Prepare quote request')}</button></form>`);
  $('#quote-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!event.target.reportValidity()) return;
    const data = new FormData(event.target);
    if (['company', 'city'].some((key) => String(data.get(key)).trim().length < 2)) { toast(t('يرجى إكمال اسم المنشأة والمدينة.', 'Please complete the business name and city.')); return; }
    const body = `HUBB — ${t('مسودة طلب عرض سعر', 'Draft quote request')}\n${t('للنقاش — ليس طلب شراء مؤكدًا', 'FOR DISCUSSION — NOT A CONFIRMED PURCHASE ORDER')}\n\n${t('المنشأة', 'Business')}: ${String(data.get('company')).trim()}\n${t('المدينة', 'City')}: ${String(data.get('city')).trim()}\n${t('المنتج', 'Product')}: ${product.name.en} / ${product.name.ar}\n${t('الكمية', 'Quantity')}: ${quantity} cases × 24 sachets × 30 g\n${t('الإجمالي', 'Total')}: ${quantity * 24} sachets / ${(quantity * .72).toFixed(2)} kg\n${t('سعر الكرتون المقترح', 'Proposed case price')}: SAR ${bulkUnitPrice(quantity).toFixed(2)}\n${t('إجمالي المنتجات المقترح', 'Proposed goods subtotal')}: SAR ${(quantity * bulkUnitPrice(quantity)).toFixed(2)}\n\n${t('ملاحظات', 'Notes')}: ${String(data.get('notes') || '—').trim()}\n\n${t('الأسعار مقترحة وتحتاج تأكيد المصنع. الضرائب والشحن والمخزون وشروط الدفع والتوريد غير مشمولة أو مؤكدة. لا تُحصّل مبالغ ولا يُرسل هذا الطلب تلقائيًا.', 'Prices are proposed and require factory confirmation. Tax, shipping, stock, payment and supply terms are not included or confirmed. No payment is collected and this draft is not sent automatically.')}\n`;
    showDialog(`<p class="eyebrow">${t('مسودة جاهزة · لم تُرسل', 'DRAFT READY · NOT SENT')}</p><h2>${t('طلبك جاهز للمراجعة.', 'Ready for a conversation.')}</h2><p>${t('راجع النص أدناه. استخدم واتساب للتواصل مع الفريق، أو نزّل نسخة مطابقة من طلب عرض السعر.', 'Review the text below. Open WhatsApp to contact the team, or download an identical copy of your quote request.')}</p><pre class="draft-output">${esc(body)}</pre>${preparedMessageLink(body)}<button type="button" class="button secondary" id="quote-download" style="margin-top:14px">${t('تنزيل طلب عرض السعر', 'Download quote request')} ↓</button>`);
    $('#quote-download')?.addEventListener('click', () => downloadDraft(body, `HUBB-quote-request-${quantity}-cases.txt`));
  });
}

$('.dialog-close')?.addEventListener('click', closeDialog);
dialog?.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
});
dialog?.addEventListener('close', () => { if (content) content.innerHTML = ''; });

const initialLanguage = location.pathname.split('/').filter(Boolean)[0] === 'en' ? 'en' : 'ar';
applyLanguage(initialLanguage);
initCommerce();
initStory();
$('#language-toggle')?.addEventListener('click', () => location.assign(`/${getLang() === 'ar' ? 'en' : 'ar'}/`));
$('#search-button')?.addEventListener('click', openSearch);
$('#cart-button')?.addEventListener('click', openCart);
$('#review-button')?.addEventListener('click', showReview);

document.addEventListener('click', (event) => {
  const product = event.target.closest('[data-product]');
  if (product) openProduct(product.dataset.product, product.dataset.productFormat || selectedFormat);
  const add = event.target.closest('[data-add]');
  if (add && addToCart(add.dataset.add, selectedFormat, 1)) toast(t('انضاف للسلة. جاهز للّمة.', 'Added to your bag. A little more HUBB.'));
  const infoButton = event.target.closest('[data-info]'); if (infoButton) showInfo(infoButton.dataset.info);
  const moment = event.target.closest('[data-moment]'); if (moment) showMoment(moment.dataset.moment);
  const partner = event.target.closest('[data-partner]'); if (partner) showPartner(partner.dataset.partner);
  const change = event.target.closest('[data-bulk-change]');
  if (change && $('#bulk-quantity')) { const current = Number($('#bulk-quantity').value) || 4; $('#bulk-quantity').value = Math.min(10000, Math.max(4, current + Number(change.dataset.bulkChange))); updateBulk(); }
});
document.querySelectorAll('[data-format]').forEach((button) => button.addEventListener('click', () => {
  if (!['cup', 'case'].includes(button.dataset.format)) return;
  selectedFormat = button.dataset.format;
  document.querySelectorAll('[data-format]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  renderProducts();
}));
$('#bulk-quantity')?.addEventListener('input', updateBulk);
$('#bulk-form')?.addEventListener('submit', (event) => { event.preventDefault(); if (event.target.reportValidity()) showBulkRequest(); });
$('#mobile-toggle')?.addEventListener('click', () => { const nav = $('#mobile-nav'); if (!nav) return; const open = nav.hidden; nav.hidden = !open; $('#mobile-toggle').setAttribute('aria-expanded', String(open)); });
$('#mobile-nav')?.addEventListener('click', (event) => { if (event.target.closest('a')) { $('#mobile-nav').hidden = true; $('#mobile-toggle')?.setAttribute('aria-expanded', 'false'); } });
