import { sitePath } from './paths.js';

export const skuPosts = [
  {
    id: 'sea-salt',
    product: 'sea-salt',
    format: 'cup',
    image: '/assets/ugc-sku-sea-salt.webp',
    flavour: { ar: 'ملح بحري', en: 'Classic Sea Salt' },
    place: { ar: 'على البلكونة', en: 'ON THE BALCONY' },
    title: { ar: 'النكهة اللي نرجع لها.', en: 'The flavour we know by heart.' },
    body: { ar: 'صباح هادي، وكأس شاي، وكوب الملح البحري على الطاولة. كيس لسه مغلق، واللحظة تكفي.', en: 'A quiet morning, a glass of tea, and the Classic Sea Salt cup on the table. One sachet still sealed. That’s enough.' },
    alt: { ar: 'تصوّر لرجل بالغ على بلكونة يحمل كيس حُبّ ملح بحري المغلق بجانب كوب الرحلة', en: 'Concept of an adult on a balcony holding a sealed HUBB Classic Sea Salt sachet beside the Journey Cup' }
  },
  {
    id: 'garlic-salt',
    product: 'garlic-salt',
    format: 'cup',
    image: '/assets/ugc-sku-garlic-salt.webp',
    flavour: { ar: 'ملح بالثوم', en: 'Garlic Salt' },
    place: { ar: 'بعد الغدا', en: 'AFTER LUNCH' },
    title: { ar: 'حقّ اللي يحب الثوم.', en: 'For the garlic person at the table.' },
    body: { ar: 'خلص الأكل، وانمرّر كيس الملح بالثوم. نكهة مالحة يعرفها أهل البيت.', en: 'Lunch is finished, and the Garlic Salt sachet gets passed across the counter. A savoury favourite the household already knows.' },
    alt: { ar: 'تصوّر لعائلة بالغة في المطبخ تمرّر كيس حُبّ ملح بالثوم المغلق بجانب كوب الرحلة', en: 'Concept of adults in a kitchen passing a sealed HUBB Garlic Salt sachet beside the Journey Cup' }
  },
  {
    id: 'pepper-lime',
    product: 'pepper-lime',
    format: 'cup',
    image: '/assets/ugc-sku-pepper-lime.webp',
    flavour: { ar: 'فلفل ولايم', en: 'Pepper Lime' },
    place: { ar: 'على السطح', en: 'ON THE ROOF' },
    title: { ar: 'غيّر جوّك شوي.', en: 'A brighter turn of flavour.' },
    body: { ar: 'نهاية الأسبوع بين الأصحاب. كوب فلفل ولايم، وكيس ينتقل من يد ليد.', en: 'End of the week, up on the roof. A Pepper Lime cup, and a sealed sachet passing from hand to hand.' },
    alt: { ar: 'تصوّر لصديقين بالغين على سطح منزل يتشاركان كوب حُبّ فلفل ولايم', en: 'Concept of two adult friends on a rooftop sharing a HUBB Pepper Lime Journey Cup' }
  },
  {
    id: 'fire-salt',
    product: 'fire-salt',
    format: 'cup',
    image: '/assets/ugc-sku-fire-salt.webp',
    flavour: { ar: 'ملح حار', en: 'Fire Salt' },
    place: { ar: 'قدام الشاشة', en: 'MATCH NIGHT' },
    title: { ar: 'للنكهة اللي فيها حرارة.', en: 'For the friend who wants heat.' },
    body: { ar: 'المباراة شغّالة في البيت. كوب ملح حار على الطاولة، وكيس يتنقّل بين الأصحاب.', en: 'The match is on at home. A Fire Salt cup on the table, and a sealed sachet moving between friends.' },
    alt: { ar: 'تصوّر لصديقين بالغين في المجلس يتشاركان كوب حُبّ ملح حار أثناء مشاهدة مباراة', en: 'Concept of two adult friends sharing a HUBB Fire Salt cup while watching a match at home' }
  },
  {
    id: 'family-mix',
    product: 'family-mix',
    format: 'family',
    image: '/assets/ugc-sku-family-mix.webp',
    flavour: { ar: 'خلطة العائلة', en: 'Family Mix' },
    place: { ar: 'في الحديقة', en: 'IN THE PARK' },
    title: { ar: 'لكل واحد نكهته.', en: 'Everyone picks their own.' },
    body: { ar: 'عبوة العائلة وسط البطانية. واحد يمدّ للأزرق، والثاني للأحمر، واللمّة تكمل.', en: 'The family bucket sits in the middle of the blanket. One reaches for blue, another for red, and the gathering carries on.' },
    alt: { ar: 'تصوّر لعائلة بالغة من أجيال مختلفة تتشارك عبوة حُبّ العائلية في نزهة', en: 'Concept of an adult family across generations sharing a HUBB Family Mix bucket at a park picnic' }
  }
];

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export const skuPostFor = (productId) => skuPosts.find((post) => post.product === productId);
export const flavourSkuPosts = () => skuPosts.filter((post) => post.product !== 'family-mix');
export const skuPostImage = (post) => sitePath(post.image);

function at(post, key, lang) {
  return escape(post[key][lang] || post[key].en);
}

export function renderSkuPostCard(post, lang = 'ar', featured = false) {
  const tr = (ar, en) => (lang === 'ar' ? ar : en);
  return `<article class="sku-post${featured ? ' is-featured' : ''}">
    <header class="sku-post-head"><span>HUBB</span><span>${escape(tr('منشور تصوّري', 'CONCEPT POST'))}</span></header>
    <div class="sku-post-photo">
      <img src="${escape(post.image)}" width="1024" height="1536" loading="lazy" alt="${at(post, 'alt', lang)}">
      <span class="concept-label">${escape(tr('مشهد تصوّري · مولّد بالذكاء الاصطناعي', 'CONCEPT SCENE · AI GENERATED'))}</span>
    </div>
    <div class="sku-post-body">
      <p class="sku-post-kicker"><b>${at(post, 'flavour', lang)}</b><span>${at(post, 'place', lang)}</span></p>
      <h3>${at(post, 'title', lang)}</h3>
      <p>${at(post, 'body', lang)}</p>
      <button type="button" class="sku-post-shop" data-product="${escape(post.product)}" data-product-format="${escape(post.format)}">${escape(tr('تسوّق هالعبوة', 'Shop this pack'))} <span aria-hidden="true">↗</span></button>
    </div>
  </article>`;
}

export function renderSkuPosts(lang = 'ar') {
  const tr = (ar, en) => (lang === 'ar' ? ar : en);
  const family = skuPostFor('family-mix');
  return `<section id="sku-moments" class="sku-posts-section section">
    <div class="wrap">
    <div class="section-heading">
      <div>
        <p class="eyebrow">${escape(tr('كل عبوة، ولها لحظة', 'EACH PACK. ITS OWN LITTLE MOMENT.'))}</p>
        <h2>${escape(tr('نكهة بنكهة. منشور نتخيّله.', 'Flavour by flavour. A post we imagine.'))}</h2>
      </div>
      <p class="section-aside">${escape(tr('مو منشورات عملاء، ولا تقييمات شراء. تصوّرات لحملة حُبّ، مربوطة بنفس العبوة اللي في المتجر.', 'These are not customer posts or purchase reviews. They are HUBB campaign concepts, tied to the same packs in the shop.'))}</p>
    </div>
    <div class="sku-posts-grid">${flavourSkuPosts().map((post) => renderSkuPostCard(post, lang)).join('')}</div>
    ${family ? `<div class="sku-post-feature">${renderSkuPostCard(family, lang, true)}</div>` : ''}
    <p class="sku-posts-note">${escape(tr('مشاهد تخيّلية مولّدة بالذكاء الاصطناعي. الأكياس في الصور تبقى مغلقة، والنص المكتوب على الصفحة هو المرجع لعدد الأكياس والوزن.', 'AI-generated imagined scenes. Sachets in the pictures stay sealed; on-page copy is the source for pack counts and weights.'))}</p>
    </div>
  </section>`;
}

export function renderProductSkuPost(productId, lang = 'ar') {
  const post = skuPostFor(productId);
  if (!post) return '';
  const tr = (ar, en) => (lang === 'ar' ? ar : en);
  return `<section id="sku-moment" class="seo-section seo-wrap seo-sku-moment">
    <div class="seo-section-title">
      <p class="seo-kicker">${escape(tr('منشور تصوّري لهذه العبوة', 'A CONCEPT POST FOR THIS PACK'))}</p>
      <h2>${escape(tr('هالنكهة، في لحظة.', 'This flavour, in a little moment.'))}</h2>
    </div>
    <div class="seo-sku-post">${renderSkuPostCard(post, lang, true)}</div>
    <p class="seo-image-note">${escape(tr('تصوّر إبداعي مولّد بالذكاء الاصطناعي؛ ليس منشور عميل أو تقييم شراء موثّق.', 'AI-generated creative concept; not a customer post or a verified purchase review.'))}</p>
  </section>`;
}
