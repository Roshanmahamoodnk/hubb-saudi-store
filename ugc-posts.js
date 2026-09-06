import { products } from './catalog.js';
import { sitePath } from './paths.js';

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export const skuPosts = [
  {
    id: 'sea-salt-balcony',
    product: 'sea-salt',
    format: 'cup',
    featured: true,
    image: '/assets/ugc-sku-sea-salt-balcony.webp',
    place: { ar: 'على الشرفة', en: 'On the balcony' },
    caption: {
      ar: 'آخر ضوء النهار، وشاهي، والكوب الأزرق. ملح بحري لوقفة بسيطة في البيت.',
      en: 'Late light, tea, and the familiar blue cup. Classic Sea Salt for a small pause at home.'
    },
    alt: {
      ar: 'تصوّر ليد بالغة تمسك كوب حُبّ ملح بحري على شرفة في الرياض',
      en: 'Concept of an adult hand holding a HUBB Classic Sea Salt cup on a Riyadh balcony'
    }
  },
  {
    id: 'sea-salt-sofa',
    product: 'sea-salt',
    format: 'cup',
    image: '/assets/ugc-sku-sea-salt-sofa.webp',
    place: { ar: 'على الكنب', en: 'On the sofa' },
    caption: {
      ar: 'كيس مغلق في اليد، والكوب على الطاولة. النكهة الكلاسيكية جاهزة لما تطول السالفة.',
      en: 'A sealed sachet in hand, the cup on the table. The classic flavour, ready when the story runs long.'
    },
    alt: {
      ar: 'تصوّر ليد تمسك كيس حُبّ ملح بحري المغلق في مجلس منزل',
      en: 'Concept of a hand holding a sealed HUBB Classic Sea Salt sachet in a living room'
    }
  },
  {
    id: 'garlic-salt-kitchen',
    product: 'garlic-salt',
    format: 'cup',
    featured: true,
    image: '/assets/ugc-sku-garlic-salt-kitchen.webp',
    place: { ar: 'بعد الغدا', en: 'After lunch' },
    caption: {
      ar: 'خلص الأكل، وبقي الكوب الأصفر في المطبخ. ملح بالثوم للي يحب النكهة المالحة.',
      en: 'Lunch is finished. The saffron cup stays in the kitchen. Garlic Salt for the savoury-snack person.'
    },
    alt: {
      ar: 'تصوّر لامرأة بالغة تمسك كوب حُبّ ملح بالثوم في مطبخ منزلي بعد الغداء',
      en: 'Concept of an adult woman holding a HUBB Garlic Salt cup in a home kitchen after lunch'
    }
  },
  {
    id: 'garlic-salt-coffee',
    product: 'garlic-salt',
    format: 'cup',
    image: '/assets/ugc-sku-garlic-salt-coffee.webp',
    place: { ar: 'قهوة وتمور', en: 'Coffee and dates' },
    caption: {
      ar: 'قهوة عربية، وتمور، وكوب الثوم على الطاولة. لمّة بسيطة بعد الضيافة.',
      en: 'Arabic coffee, dates, and the garlic cup on the table. A quiet gathering after the welcome.'
    },
    alt: {
      ar: 'تصوّر لكوب حُبّ ملح بالثوم على طاولة مع قهوة عربية وتمور',
      en: 'Concept of a HUBB Garlic Salt cup on a table with Arabic coffee and dates'
    }
  },
  {
    id: 'pepper-lime-cafe',
    product: 'pepper-lime',
    format: 'cup',
    featured: true,
    image: '/assets/ugc-sku-pepper-lime-cafe.webp',
    place: { ar: 'في الكافيه', en: 'At the cafe' },
    caption: {
      ar: 'طاولة صغيرة، وخيوط ضوء، والكوب الأخضر. فلفل ولايم لسهرة خفيفة برا.',
      en: 'A small table, string lights, and the green cup. Pepper Lime for an easy evening out.'
    },
    alt: {
      ar: 'تصوّر لرجل بالغ يمسك كوب حُبّ فلفل ولايم في كافيه مسائي',
      en: 'Concept of an adult man holding a HUBB Pepper Lime cup at an evening cafe'
    }
  },
  {
    id: 'pepper-lime-desk',
    product: 'pepper-lime',
    format: 'cup',
    image: '/assets/ugc-sku-pepper-lime-desk.webp',
    place: { ar: 'على المكتب', en: 'At the desk' },
    caption: {
      ar: 'بعد الشغل، كيس أخضر جنب الدفتر. غيّر جوّك بنكهة الفلفل واللايم.',
      en: 'After the work, a green sachet beside the notebook. Pepper Lime for a change of mood.'
    },
    alt: {
      ar: 'تصوّر لمكتب ليلي مع كوب حُبّ فلفل ولايم وكيس مغلق بجانب دفتر',
      en: 'Concept of a night desk with a HUBB Pepper Lime cup and a sealed sachet beside a notebook'
    }
  },
  {
    id: 'fire-salt-evening',
    product: 'fire-salt',
    format: 'cup',
    featured: true,
    image: '/assets/ugc-sku-fire-salt-evening.webp',
    place: { ar: 'سهرة البيت', en: 'A night in' },
    caption: {
      ar: 'اللمبة دافية، والكوب الأحمر يدور. ملح حار للّمة اللي تحب التغيير.',
      en: 'Warm lamp, and the red cup going around. Fire Salt for the gathering that likes a little heat.'
    },
    alt: {
      ar: 'تصوّر لصديقين بالغين يتشاركان كوب حُبّ ملح حار في مجلس مسائي',
      en: 'Concept of two adult friends sharing a HUBB Fire Salt cup in an evening living room'
    }
  },
  {
    id: 'fire-salt-hand',
    product: 'fire-salt',
    format: 'cup',
    image: '/assets/ugc-sku-fire-salt-hand.webp',
    place: { ar: 'نكهة أقرب', en: 'A closer look' },
    caption: {
      ar: 'كيس الملح الحار في اليد، والكوب ورا. للنكهة اللي تمدّ يدك لها لما تبي حرارة أكثر.',
      en: 'Fire Salt in hand, the cup behind. For the flavour you reach for when you want a little more.'
    },
    alt: {
      ar: 'تصوّر ليد تمسك كيس حُبّ ملح حار المغلق والكوب في الخلفية',
      en: 'Concept of a hand holding a sealed HUBB Fire Salt sachet with the cup in the background'
    }
  },
  {
    id: 'family-mix-table',
    product: 'family-mix',
    format: 'family',
    featured: true,
    image: '/assets/ugc-sku-family-mix-table.webp',
    place: { ar: 'بعد الأكل', en: 'After the meal' },
    caption: {
      ar: 'كل واحد يمدّ يده لنكهته. عشرون كيسًا مغلقًا، وأربع نكهات في وسط الطاولة.',
      en: 'Everyone reaches for their flavour. Twenty sealed sachets, four moods in the middle of the table.'
    },
    alt: {
      ar: 'تصوّر لطاولة غداء منزلية وعبوة حُبّ العائلية وأيدٍ بالغة تختار أكياسًا مغلقة',
      en: 'Concept of a home dining table with a HUBB Family Mix bucket and adult hands choosing sealed sachets'
    }
  }
];

export const postsFor = (productId) => skuPosts.filter((post) => post.product === productId);
export const skuPostImages = skuPosts.map((post) => post.image);

function productName(productId, lang) {
  const product = products.find((item) => item.id === productId);
  return product ? product.name[lang] : productId;
}

export function renderSkuPost(post, lang = 'ar', { shoppable = false, compact = false } = {}) {
  const tr = (ar, en) => (lang === 'ar' ? ar : en);
  const flavour = productName(post.product, lang);
  const image = sitePath(post.image);
  const tag = compact ? 'article' : shoppable ? 'button' : 'article';
  const type = tag === 'button' ? ' type="button"' : '';
  const label = shoppable ? ` aria-label="${escape(tr(`تسوّق ${flavour}`, `Shop ${flavour}`))}"` : '';
  const shopAttrs = shoppable ? ` data-product="${escape(post.product)}" data-product-format="${escape(post.format)}"` : '';
  const className = `sku-ugc-post${compact ? ' is-compact' : ''}${shoppable ? ' is-shoppable' : ''}`;
  return `<${tag} class="${className}"${type}${label}${shopAttrs}>
    <header class="sku-ugc-head">
      <span class="sku-ugc-avatar" lang="ar" aria-hidden="true">حُبّ</span>
      <span class="sku-ugc-who"><strong>HUBB</strong><small>${escape(tr('الرياض · منشور متخيّل', 'Riyadh · imagined post'))}</small></span>
      <span class="sku-ugc-badge">${escape(tr('تصوّر', 'CONCEPT'))}</span>
    </header>
    <figure class="sku-ugc-photo">
      <img src="${escape(image)}" width="1024" height="1536" loading="lazy" alt="${escape(post.alt[lang])}">
    </figure>
    <div class="sku-ugc-body">
      <p class="sku-ugc-flavour">${escape(flavour)}</p>
      <p class="sku-ugc-place">${escape(post.place[lang])}</p>
      ${compact ? '' : `<p class="sku-ugc-caption">${escape(post.caption[lang])}</p>`}
      <p class="sku-ugc-note">${escape(tr('مشهد تصوّري مولّد بالذكاء الاصطناعي · ليس منشور عميل', 'AI-generated scene concept · not a customer post'))}</p>
    </div>
  </${tag}>`;
}

export function renderProductPosts(productId, lang = 'ar', { compact = false, heading = true } = {}) {
  const posts = postsFor(productId);
  if (!posts.length) return '';
  const tr = (ar, en) => (lang === 'ar' ? ar : en);
  return `<div class="sku-ugc-product${compact ? ' is-compact' : ''}">
    ${heading ? `<p class="sku-ugc-kicker">${escape(tr('هالنكهة، في لحظة', 'THIS FLAVOUR IN A MOMENT'))}</p>` : ''}
    <div class="sku-ugc-product-grid">${posts.map((post) => renderSkuPost(post, lang, { compact })).join('')}</div>
  </div>`;
}

export function renderHomepageUgc(lang = 'ar') {
  const tr = (ar, en) => (lang === 'ar' ? ar : en);
  const flavourPosts = skuPosts.filter((post) => post.featured && post.product !== 'family-mix');
  const familyPost = skuPosts.find((post) => post.id === 'family-mix-table');
  return `<section id="flavour-posts" class="sku-ugc-section">
    <div class="wrap sku-ugc-intro">
      <div>
        <p class="eyebrow">${escape(tr('كل نكهة، ولها منشور', 'EACH FLAVOUR HAS A POST'))}</p>
        <h2>${escape(tr('حُبّ كما يظهر في اليوم.', 'HUBB, as it might show up.'))}</h2>
      </div>
      <p class="section-aside">${escape(tr('منشورات متخيّلة لكل عبوة: كوب الرحلة بالنكهات الأربع، وخلطة العائلة. مشاهد مولّدة، وليست تقييمات عملاء.', 'An imagined post for each pack: the Journey Cup in four flavours, and Family Mix. Generated scenes, not customer reviews.'))}</p>
    </div>
    <div class="wrap sku-ugc-grid">${flavourPosts.map((post) => renderSkuPost(post, lang, { shoppable: true })).join('')}</div>
    ${familyPost ? `<div class="wrap sku-ugc-family">${renderSkuPost(familyPost, lang, { shoppable: true })}<p class="sku-ugc-family-note">${escape(tr('خلطة العائلة: عشرون كيسًا مغلقًا، خمسة من كل نكهة.', 'Family Mix: twenty sealed sachets, five of each flavour.'))}</p></div>` : ''}
    <div class="wrap sku-ugc-foot"><p class="small-text">${escape(tr('تصوّرات لحملة حُبّ مولّدة بالذكاء الاصطناعي؛ ليست منشورات أو تقييمات عملاء.', 'AI-generated HUBB campaign concepts; these are not customer posts or reviews.'))}</p></div>
  </section>`;
}
