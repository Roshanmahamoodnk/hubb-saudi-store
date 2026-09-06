import fs from 'node:fs/promises';
import path from 'node:path';
import {packImage} from './catalog.js';
import { pathToFileURL } from 'node:url';
import { renderSkuUgcSection } from './ugc-posts.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const rootAsset = value => '/' + String(value).replace(/^\.\//, '').replace(/^\/+/, '');
const fonts = 'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap';

const flavourCopy = {
  'sea-salt': {
    en: 'Some favourites need no introduction. Sea salt, a small crack, and the people you feel at home with. Keep a cup for the familiar moments, or bring a carton when the gathering grows. Each contains sealed sachets of the same flavour.',
    ar: 'فيه نكهات نحسّ معها إننا في بيتنا. ملح بحري، طقّة صغيرة، وناس نرتاح معهم. كوب للحظات اليومية، وكرتون للّمة إذا كبرت. كل عبوة فيها أكياس مغلقة من النكهة نفسها.'
  },
  'garlic-salt': {
    en: 'There is always someone at the table who loves garlic. Pass this their way. A savoury garlic-and-salt flavour, five sealed packs in a cup, and an easy reason to pull up a chair and stay a little longer.',
    ar: 'أكيد تعرف أحد يحب الثوم. مرّر له هالنكهة. ثوم وملح، وخمسة أكياس مغلقة في كوب، وسبب بسيط نقرّب الكراسي ونطوّل الجلسة.'
  },
  'pepper-lime': {
    en: 'Pepper Lime is the pepper-and-lime choice in the four-flavour HUBB range. Bring one flavour for the group or compare your favourites across several cups. The cup contains five sealed sachets of Pepper Lime; a Family Mix includes five Pepper Lime sachets alongside five of each of the other three flavours.',
    ar: 'فلفل ولايم هو خيار الفلفل واللايم ضمن نكهات حُبّ الأربع. أحضر نكهة واحدة للمجموعة، أو قارنوا النكهات المفضّلة عبر عدّة أكواب. يحتوي الكوب على خمسة أكياس مغلقة من فلفل ولايم، وتضم خلطة العائلة خمسة أكياس منها مع خمسة من كل نكهة من النكهات الثلاث الأخرى.'
  },
  'fire-salt': {
    en: 'Fire Salt is the hot-salt flavour in the HUBB range. The flavour name tells you the direction; your tasting experience tells us the rest. Notice how the heat and kernel taste together, and share an honest impression. Choose this flavour in a five-sachet cup or a 24-sachet same-flavour retail case.',
    ar: 'ملح حار هو النكهة الحارّة في تشكيلة حُبّ. اسم النكهة يوضح اتجاهها، وتجربتك تكمل الحكاية. انتبه إلى إحساس الحرارة مع طعم اللبّ، وشاركنا انطباعك بصراحة. اختَر هذه النكهة في كوب من خمسة أكياس أو كرتون تجزئة من ٢٤ كيسًا من النكهة نفسها.'
  }
};

function pageHtml({ product, products, formats, onlinePolicy, retailReferencePrice, lang, origin }) {
  const ar = lang === 'ar';
  const tr = (arabic, english) => ar ? arabic : english;
  const name = product.name[lang];
  const main = `/${lang}/`;
  const route = `${main}products/${product.id}/`;
  const canonical = origin + route;
  const arUrl = `${origin}/ar/products/${product.id}/`;
  const enUrl = `${origin}/en/products/${product.id}/`;
  const otherUrl = `/${ar ? 'en' : 'ar'}/products/${product.id}/`;
  const fmt = new Intl.NumberFormat(ar ? 'ar-SA' : 'en-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = value => fmt.format(value);
  const cup = formats.find(item => item.id === 'cup');
  const caseFormat = formats.find(item => item.id === 'case');
  const title = tr(`حُبّ ${name} — حب دوار الشمس بقشره`, `HUBB ${name} — In-Shell Sunflower Seeds`);
  const description = tr(`اكتشف حُبّ ${name}: عبوة خمسة أكياس وكرتون ٢٤ كيسًا، صناعة سعودية للحظات المشاركة، مع تفاصيل العبوة والطلب. الكيس الفردي لا يُباع منفردًا عبر الموقع.`, `Explore HUBB ${name}, its five-sachet cup and 24-sachet case. Saudi-made flavour for the moments you share. See pack contents and online order details.`);
  const image = packImage(product,'cup');
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name: title, description, inLanguage: ar ? 'ar-SA' : 'en-SA', mainEntity: { '@id': canonical + '#product' }, breadcrumb: { '@id': canonical + '#breadcrumb' } },
      { '@type': 'Product', '@id': canonical + '#product', name: `HUBB ${name}`, description: product.description[lang], image: origin + image, brand: { '@type': 'Brand', name: 'HUBB' }, category: tr('حب دوار الشمس بقشره', 'In-shell sunflower seeds') },
      { '@type': 'BreadcrumbList', '@id': canonical + '#breadcrumb', itemListElement: [
        { '@type': 'ListItem', position: 1, name: tr('حُبّ', 'HUBB'), item: origin + main },
        { '@type': 'ListItem', position: 2, name, item: canonical }
      ] }
    ]
  };
  const formatCards = [cup, caseFormat].map(format => `<article class="seo-pack-card"><img class="seo-pack-format-image" src="${packImage(product,format.id)}" width="1024" height="1536" loading="lazy" alt="${escape(name+' · '+format.name[lang])}"><span class="seo-kicker">${escape(tr('عبوة الموقع', 'ONLINE PACK'))}</span><h3>${escape(format.name[lang])}</h3><p>${escape(tr(`${format.count} أكياس × ٣٠ غ من نكهة ${name}. الوزن الصافي ${format.grams} غ.`, `${format.count} × 30 g sachets of ${name}. Net contents ${format.grams} g.`))}</p>${format.id === 'cup' ? `<p>${escape(tr('خمسة أكياس مغلقة من نكهة واحدة، مع كيس ورقي منفصل للقشور. افتح واحدًا واترك البقية مغلقة.', 'Five sealed sachets of one flavour, with a separate paper shell bag. Open one and keep the rest sealed.'))}</p>` : `<p>${escape(tr('كرتون عرض مفتوح يحتوي على ٢٤ كيسًا مغلقًا من نكهة واحدة. السعر الظاهر للكرتون الكامل.', 'An open counter-display carton with 24 sealed sachets of one flavour. The displayed price is for the complete carton.'))}</p>`}<div class="seo-pack-action"><strong>${escape(money(format.price))}</strong><button type="button" class="button primary" data-seo-product="${escape(product.id)}" data-seo-format="${escape(format.id)}">${escape(tr('اختَر العبوة', 'Choose this pack'))}<span aria-hidden="true">${ar ? '←' : '→'}</span></button></div></article>`).join('');
  const related = products.filter(item => item.id !== product.id && item.id !== 'family-mix').map(item => `<a href="${main}products/${escape(item.id)}/" class="seo-related-link"><span>${escape(item.name[lang])}</span><span aria-hidden="true">${ar ? '←' : '→'}</span></a>`).join('');
  return `<!doctype html>
<html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f7f2e8"><meta name="robots" content="noindex,nofollow">
<title>${escape(title)}</title><meta name="description" content="${escape(description)}">
<link rel="canonical" href="${escape(canonical)}"><link rel="alternate" hreflang="ar-SA" href="${escape(arUrl)}"><link rel="alternate" hreflang="en-SA" href="${escape(enUrl)}"><link rel="alternate" hreflang="x-default" href="${escape(origin + '/')}">
<meta property="og:type" content="website"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(canonical)}"><meta property="og:image" content="${escape(origin + image)}"><meta property="og:locale" content="${ar ? 'ar_SA' : 'en_SA'}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${escape(fonts)}" rel="stylesheet">
<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/commerce.css"><link rel="stylesheet" href="/sku-ugc.css"><link rel="stylesheet" href="/seo-page.css"><link rel="preload" as="image" href="${escape(image)}">
<script type="application/ld+json">${json(schema)}</script><script type="module" src="/seo-page.js"></script></head>
<body class="seo-page" data-product-id="${escape(product.id)}"><a class="skip-link" href="#main">${escape(tr('تجاوز إلى المحتوى', 'Skip to content'))}</a>
<div class="seo-preview">${escape(tr('معاينة المتجر · الأسعار وسياسة الطلب والتصاميم مقترحة · لا يتم تحصيل مبالغ', 'Store preview · proposed pricing, order policy and designs · no payment collected'))}</div>
<header class="seo-header seo-wrap"><a class="brand" href="${main}" aria-label="${escape(tr('حُبّ — الرئيسية', 'HUBB home'))}"><span class="brand-ar" lang="ar">حُبّ</span><span class="brand-en">H U B B</span></a><nav class="seo-nav" aria-label="${escape(tr('التنقّل الرئيسي', 'Main navigation'))}"><a href="${main}#shop">${escape(tr('النكهات', 'The flavours'))}</a><a href="${main}#story">${escape(tr('حكايتنا', 'Our story'))}</a><a href="${main}#wholesale">${escape(tr('الجملة', 'Wholesale'))}</a></nav><div class="seo-tools"><a class="seo-language" href="${escape(otherUrl)}" lang="${ar ? 'en' : 'ar'}" hreflang="${ar ? 'en-SA' : 'ar-SA'}">${ar ? 'EN' : 'العربية'}</a><button type="button" data-seo-search aria-label="${escape(tr('بحث', 'Search'))}">⌕</button><button type="button" data-seo-cart aria-label="${escape(tr('السلة', 'Shopping bag'))}"><span>${escape(tr('السلة', 'Bag'))}</span> <span data-cart-count>0</span></button></div></header>
<main id="main"><nav class="seo-breadcrumb seo-wrap" aria-label="${escape(tr('مسار الصفحة', 'Breadcrumb'))}"><a href="${main}">${escape(tr('حُبّ', 'HUBB'))}</a><span aria-hidden="true">/</span><span aria-current="page">${escape(name)}</span></nav>
<section class="seo-hero seo-wrap"><div class="seo-hero-image"><img data-seo-hero-image src="${escape(image)}" width="1024" height="1536" fetchpriority="high" alt="${escape(tr(`تصميم كوب حُبّ ${name} — خمسة أكياس مغلقة`, `HUBB ${name} Journey Cup — five sealed sachets`))}"><div class="seo-gallery-controls" role="group" aria-label="${escape(tr('عرض العبوة','View pack format'))}"><button data-gallery-format="cup" aria-pressed="true">${escape(tr('كوب · ٥ أكياس','Cup · 5 sachets'))}</button><button data-gallery-format="case" aria-pressed="false">${escape(tr('كرتون · ٢٤ كيس','Carton · 24 sachets'))}</button></div><p class="seo-image-note">${escape(tr('تصوّر عبوة حُبّ · اختر الكوب أو الكرتون لمشاهدة التصميم.', 'HUBB pack concept · choose cup or carton to view its design.'))}</p></div><div class="seo-hero-copy"><p class="seo-kicker">${escape(tr('حُبّ / حب دوار الشمس بقشره', 'HUBB / IN-SHELL SUNFLOWER SEEDS'))}</p><h1>${escape(name)}</h1><p class="seo-lead">${escape(product.description[lang])}</p><p>${escape(flavourCopy[product.id][lang])}</p><a class="button primary" href="#online-packs">${escape(tr('اكتشف عبوات الموقع', 'Explore the online packs'))}<span aria-hidden="true">${ar ? '←' : '→'}</span></a><p class="seo-caption">${escape(tr('واحدة من أربع نكهات. خلطة العائلة تجمعها كلها في عبوة واحدة.', 'One of four flavours. The Family Mix brings all four together.'))}</p></div></section>
<section id="sku-moments" class="seo-section seo-wrap sku-ugc-page">${renderSkuUgcSection(product.id, lang, { headingLevel: 2 })}</section>
<section id="online-packs" class="seo-section seo-wrap"><div class="seo-section-title"><p class="seo-kicker">${escape(tr('اختَر الكمية المناسبة', 'A PACK FOR YOUR GATHERING'))}</p><h2>${escape(tr('النكهة نفسها. أكثر من طريقة للمشاركة.', 'Your flavour. More ways to share.'))}</h2></div><div class="seo-pack-grid">${formatCards}<aside class="seo-retail-note"><h3>${escape(tr('الكيس الفردي: مرجع للتجزئة', 'The single sachet: retail reference'))}</h3><p>${escape(tr(`٣٠ غ · سعر تجزئة مقترح ${money(retailReferencePrice)}. لا يمكن إضافة الكيس الفردي للسلة أو طلبه منفردًا عبر الموقع.`, `30 g · proposed retail reference ${money(retailReferencePrice)}. Individual sachets cannot be added to the bag or ordered separately online.`))}</p></aside></div>
<div class="seo-policy" role="note"><h3>${escape(tr('سياسة طلب واضحة', 'Know your online order'))}</h3><p>${escape(tr(`الحد الأدنى للمنتجات ${money(onlinePolicy.minimumOrder)}. رسوم الشحن المقترحة ${money(onlinePolicy.shippingFee)}، والشحن مجاني من ${money(onlinePolicy.freeShippingThreshold)} إلى المناطق المشمولة. حدّ الطلب وحدّ الشحن المجاني يُحسبان على قيمة المنتجات، دون رسوم الشحن.`, `Minimum merchandise order ${money(onlinePolicy.minimumOrder)}. Proposed delivery ${money(onlinePolicy.shippingFee)}, free from ${money(onlinePolicy.freeShippingThreshold)} to eligible areas. Order minimum and free delivery are based on merchandise value, excluding shipping.`))}</p><p>${escape(tr('هذه معاينة؛ لا يُرسل طلب فعلي ولا يُحصّل مبلغ. التغطية والسعر النهائي والضرائب تُؤكّد قبل أي بيع فعلي.', 'This is a preview: no live order is placed and no payment is collected. Coverage, final prices and taxes must be confirmed before live sales.'))}</p></div></section>
<section class="seo-story"><div class="seo-wrap seo-story-grid"><div><p class="seo-kicker">${escape(tr('سنتان وراء هذه اللحظة', 'TWO YEARS BEHIND THE LITTLE MOMENT'))}</p><h2>${escape(tr('اهتمام منّا، ولمّة منكم.', 'Care you can share.'))}</h2></div><div><p>${escape(tr('العادة اللي نحبّها تستاهل اهتمام. من مصنعنا في حريملاء، أخذنا سنتين نجمع بين الحبّة، وطقّتها، والتحميص، والنكهة اللي توصل للنواة. عشان لحظة بسيطة تفتحها وتشاركها.', 'A familiar ritual deserves care. From our factory in Huraymila, we spent two years bringing together the seed, the crack, the roast and flavour inside. All for a little moment you can open and share.'))}</p><p>${escape(tr('جرّبه مع ناسك. وبعدها قل لنا أي نكهة اخترت، وش حبيت، وش نقدر نحسّنه. نسمعك بحُبّ.', 'Try it with your people. Then tell us which flavour you reached for, what you loved, and what could be better. We are listening.'))}</p><a class="seo-text-link" href="${main}#story">${escape(tr('اكتشف الحكاية كاملة', 'Discover the full story'))} <span aria-hidden="true">${ar ? '←' : '→'}</span></a></div></div></section>
<section class="seo-section seo-wrap seo-info-grid"><article><p class="seo-kicker">${escape(tr('من القشرة إلى اللبّ', 'FROM SHELL TO KERNEL'))}</p><h2>${escape(tr('استمتع باللبّ. واجمع القشور.', 'Enjoy the kernel. Collect the shells.'))}</h2><ol><li>${escape(tr('افتح كيسًا واحدًا واترك بقية الأكياس مغلقة.', 'Open one sachet and keep the remaining sachets sealed.'))}</li><li>${escape(tr('خذ حبّة واحدة واكسر قشرتها بعضّة خفيفة، ثم افصل القشرة عن اللبّ.', 'Take one seed, crack the husk with a small bite and separate it from the kernel.'))}</li><li>${escape(tr('كُل اللبّ فقط. أخرج القشرة واجمعها في كيس منفصل، بعيدًا عن الطعام.', 'Eat only the kernel. Remove the husk and collect it in a separate bag, away from food.'))}</li></ol></article><article><p class="seo-kicker">${escape(tr('معلومات قبل الطلب', 'BEFORE YOU ORDER'))}</p><h2>${escape(tr('أربع نكهات. ومعلومات واضحة.', 'Four flavours. Clear details.'))}</h2><p>${escape(tr(`تضم خلطة العائلة ٢٠ كيسًا بوزن ٣٠ غ: خمسة من ${name} وخمسة من كل نكهة أخرى. الوزن الصافي ٦٠٠ غ. هي تشكيلة تجمع النكهات الأربع، وليست نكهة خامسة.`, `Family Mix contains twenty 30 g sachets: five of ${name} and five of each other flavour. Net contents 600 g. It is an assortment of the four flavours, not a fifth flavour.`))}</p><p>${escape(tr('ستُضاف المكوّنات ومسبّبات الحساسية والقيم الغذائية وظروف التخزين من بيانات المنتج النهائية قبل بدء البيع. صور التصميم لا تحلّ محل الملصق النهائي.', 'Ingredients, allergens, nutrition and storage details will be added from final product data before sales open. Design images do not replace the final label.'))}</p><a class="seo-text-link" href="${main}#gathering">${escape(tr('اكتشف خلطة العائلة', 'Meet the Family Mix'))} <span aria-hidden="true">${ar ? '←' : '→'}</span></a></article></section>
<section class="seo-section seo-wrap seo-related"><p class="seo-kicker">${escape(tr('كمّل التشكيلة', 'MEET THE REST OF THE GATHERING'))}</p><h2>${escape(tr('لكل واحد نكهته.', 'Everyone has a favourite.'))}</h2><div class="seo-related-grid">${related}</div></section></main>
<footer class="seo-footer"><div class="seo-wrap"><a class="brand" href="${main}"><span class="brand-ar" lang="ar">حُبّ</span><span class="brand-en">H U B B</span></a><p>${escape(tr('منّا الاهتمام بالحبّة. ومنكم اللمّة.', 'We put care into the seed. You bring the company.'))}</p><nav aria-label="${escape(tr('روابط المساعدة', 'Helpful links'))}"><a href="${main}#wholesale">${escape(tr('الجملة والتوزيع', 'Wholesale & distribution'))}</a><a href="${main}#faq">${escape(tr('الأسئلة الشائعة', 'Good to know'))}</a><a class="seo-language" href="${escape(otherUrl)}" lang="${ar ? 'en' : 'ar'}">${ar ? 'English' : 'العربية'}</a></nav><small>${escape(tr('© ٢٠٢٦ حُبّ · معاينة المتجر · النص العربي بانتظار مراجعة مختص سعودي.', '© 2026 HUBB · store preview · Arabic draft pending Saudi specialist review.'))}</small></div></footer></body></html>`;
}

export async function generateSeoPages({ root, out, origin }) {
  if (!root || !out || !origin) throw new Error('generateSeoPages requires root, out and origin');
  const parsedOrigin = new URL(origin);
  if (!['https:', 'http:'].includes(parsedOrigin.protocol)) throw new Error('SEO origin must be an HTTP(S) URL');
  const base = parsedOrigin.origin + parsedOrigin.pathname.replace(/\/+$/, '');
  const { products, formats, onlinePolicy, retailReferencePrice } = await import(`${pathToFileURL(path.join(root, 'catalog.js')).href}?seo=${Date.now()}`);
  const flavours = products.filter(product => Object.hasOwn(flavourCopy, product.id));
  if (flavours.length !== 4) throw new Error('SEO pages require the current four HUBB flavours');
  if (!onlinePolicy || !['minimumOrder', 'freeShippingThreshold', 'shippingFee'].every(key => Number.isFinite(onlinePolicy[key]))) throw new Error('SEO pages require the shared online order policy');
  if (!Number.isFinite(retailReferencePrice)) throw new Error('SEO pages require the single-sachet retail reference price');
  for (const [id, count, grams] of [['cup', 5, 150], ['case', 24, 720], ['sachet', 1, 30], ['family', 20, 600]]) {
    const format = formats.find(item => item.id === id);
    if (!format || format.count !== count || format.grams !== grams) throw new Error(`Unexpected HUBB contents for ${id}`);
  }
  const routes = [];
  for (const lang of ['ar', 'en']) {
    for (const product of flavours) {
      const relative = `${lang}/products/${product.id}/index.html`;
      const destination = path.join(out, relative);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, pageHtml({ product, products, formats, onlinePolicy, retailReferencePrice, lang, origin: base }));
      routes.push('/' + relative.replace(/index\.html$/, ''));
    }
  }
  await fs.mkdir(out, { recursive: true });
  for (const name of ['seo-page.css', 'seo-page.js', 'sku-ugc.css']) await fs.copyFile(path.join(root, name), path.join(out, name));
  const sitemapRoutes = ['/ar/', '/en/', ...routes];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemapRoutes.map(route => {
    const suffix = route.replace(/^\/(ar|en)\//, '');
    return `  <url><loc>${escape(base + route)}</loc><xhtml:link rel="alternate" hreflang="ar-SA" href="${escape(base + '/ar/' + suffix)}"/><xhtml:link rel="alternate" hreflang="en-SA" href="${escape(base + '/en/' + suffix)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${escape(base + '/')}"/></url>`;
  }).join('\n')}\n</urlset>\n`;
  await fs.writeFile(path.join(out, 'sitemap.xml'), xml);
  return { pageCount: routes.length, routes, sitemapPath: path.join(out, 'sitemap.xml'), origin: base };
}
