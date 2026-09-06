import { sitePath } from './paths.js';

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export const skuPosts = [
  {
    id: 'sea-salt-coffee',
    product: 'sea-salt',
    format: 'cup',
    featured: true,
    image: '/assets/ugc-sku-sea-salt-coffee.webp',
    place: { ar: 'بعد القهوة', en: 'AFTER COFFEE' },
    caption: {
      ar: 'بعد القهوة، والنكهة اللي نبدأ فيها باقية على الطاولة. كوب ملح بحري، وكيس مغلق، ووقت للسوالف.',
      en: 'After coffee, the familiar flavour stays on the table. A Classic Sea Salt cup, one sealed sachet, and time to talk.'
    },
    alt: {
      ar: 'تصوّر لامرأة بالغة تحمل كوب حُبّ ملح بحري بعد القهوة في مجلس منزلي',
      en: 'Concept of an adult woman holding a HUBB Classic Sea Salt cup after coffee at home'
    }
  },
  {
    id: 'sea-salt-parked',
    product: 'sea-salt',
    format: 'cup',
    image: '/assets/ugc-parked-v3.webp',
    place: { ar: 'وقفة الطريق', en: 'A PAUSE ON THE ROAD' },
    caption: {
      ar: 'السيارة واقفة. خذ وقتك في الاستراحة، وافتح كيسًا، وخلّ البقية مغلقة لبعدين.',
      en: 'The car is parked. Take your time at the stop, open one sachet, and keep the rest sealed for later.'
    },
    alt: {
      ar: 'تصوّر لاستراحة حُبّ ملح بحري بجانب سيارة متوقفة',
      en: 'Concept of a HUBB Classic Sea Salt break with a parked car'
    }
  },
  {
    id: 'garlic-salt-kitchen',
    product: 'garlic-salt',
    format: 'cup',
    image: '/assets/ugc-sku-garlic-salt-kitchen.webp',
    place: { ar: 'بعد الغداء', en: 'AFTER LUNCH' },
    caption: {
      ar: 'أكيد تعرف أحد يحب الثوم. بعد الغداء، الكوب ينفتح والكيس يمرّ للي يطلبه.',
      en: 'There is always someone who loves garlic. After lunch, the cup opens and a sachet goes their way.'
    },
    alt: {
      ar: 'تصوّر لرجل بالغ يمرّر كيس حُبّ ملح بالثوم في المطبخ بعد الغداء',
      en: 'Concept of an adult man passing a HUBB Garlic Salt sachet in a kitchen after lunch'
    }
  },
  {
    id: 'garlic-salt-share',
    product: 'garlic-salt',
    format: 'cup',
    featured: true,
    image: '/assets/ugc-sku-garlic-salt-share.webp',
    place: { ar: 'طاولة صغيرة', en: 'A SMALL TABLE' },
    caption: {
      ar: 'استراحة مالحة بين رفيقين. كوب ملح بالثوم في الوسط، والسوالف تكمل.',
      en: 'A savoury pause between friends. A Garlic Salt cup in the middle, and the conversation carries on.'
    },
    alt: {
      ar: 'تصوّر لصديقين بالغين يتشاركان كوب حُبّ ملح بالثوم على طاولة مقهى',
      en: 'Concept of two adult friends sharing a HUBB Garlic Salt cup at a café table'
    }
  },
  {
    id: 'pepper-lime-terrace',
    product: 'pepper-lime',
    format: 'cup',
    featured: true,
    image: '/assets/ugc-sku-pepper-lime-terrace.webp',
    place: { ar: 'على السطح', en: 'ON THE TERRACE' },
    caption: {
      ar: 'فلفل ولايم، ونكهة تغيّر جوّ السالفة. كوب ينتقل بين الأيادي مع غروب خفيف.',
      en: 'Pepper and lime, and a different turn in the conversation. A cup passing between hands at dusk.'
    },
    alt: {
      ar: 'تصوّر لأصدقاء بالغين يمرّرون كوب حُبّ فلفل ولايم على سطح عند الغروب',
      en: 'Concept of adult friends passing a HUBB Pepper Lime cup on a rooftop at dusk'
    }
  },
  {
    id: 'pepper-lime-workbreak',
    product: 'pepper-lime',
    format: 'cup',
    image: '/assets/ugc-workbreak-v3.webp',
    place: { ar: 'فسحة الدوام', en: 'A WORK BREAK' },
    caption: {
      ar: 'خلص الغدا، ولسه فيه وقت نتشارك نكهة. خمس دقايق، وكوب فلفل ولايم على الطاولة.',
      en: 'Lunch is finished. There is still time to pass a flavour around. Five minutes, and a Pepper Lime cup on the table.'
    },
    alt: {
      ar: 'تصوّر لزملاء بالغين يتشاركون كوب حُبّ فلفل ولايم في استراحة العمل',
      en: 'Concept of adult colleagues sharing a HUBB Pepper Lime cup in a work break room'
    }
  },
  {
    id: 'fire-salt-game',
    product: 'fire-salt',
    format: 'cup',
    featured: true,
    image: '/assets/ugc-sku-fire-salt-game.webp',
    place: { ar: 'ليلة اللعب', en: 'GAME NIGHT' },
    caption: {
      ar: 'اللي دايم يمدّ يده للنكهة الحارّة. كوب ملح حار على طرف الطاولة، وباقي جولة.',
      en: 'The friend who always reaches for the heat. A Fire Salt cup at the edge of the table, and one more round.'
    },
    alt: {
      ar: 'تصوّر لجلسة لعب بالغين مع كوب حُبّ ملح حار على الطاولة',
      en: 'Concept of adults at a game-night table with a HUBB Fire Salt cup'
    }
  },
  {
    id: 'fire-salt-evening',
    product: 'fire-salt',
    format: 'cup',
    image: '/assets/ugc-sku-fire-salt-evening.webp',
    place: { ar: 'لمّة المساء', en: 'AN EVENING GATHERING' },
    caption: {
      ar: 'لمسة حارّة للّمة اللي تحب تطوّل. كوب يتنقّل، والسوالف ما تخلص.',
      en: 'A little heat for a gathering that likes to stay. A cup is passed, and the stories keep going.'
    },
    alt: {
      ar: 'تصوّر لبالغين في فناء مسائي يتشاركون كوب حُبّ ملح حار',
      en: 'Concept of adults in an evening courtyard sharing a HUBB Fire Salt cup'
    }
  },
  {
    id: 'family-football',
    product: 'family-mix',
    format: 'family',
    image: '/assets/ugc-football-v3.webp',
    place: { ar: 'بين الشوطين', en: 'BETWEEN HALVES' },
    caption: {
      ar: 'استراحة على طرف الملعب. عبوة العائلة تنزل مع الفريق، وكل واحد يختار نكهته.',
      en: 'A pause on the sidelines. The family pack comes down the bench, and everyone picks a flavour.'
    },
    alt: {
      ar: 'تصوّر لأصدقاء بالغين يتشاركون عبوة حُبّ العائلية في استراحة كرة قدم',
      en: 'Concept of adult football friends sharing a HUBB Family Mix during a sideline break'
    }
  },
  {
    id: 'family-table',
    product: 'family-mix',
    format: 'family',
    image: '/assets/ugc-table-v3.webp',
    place: { ar: 'بعد الأكل', en: 'AFTER THE MEAL' },
    caption: {
      ar: 'خلص الغداء، وباقي السوالف. واحد يمدّ يده للأزرق، والثاني للأحمر.',
      en: 'The meal is over, and the stories are still going. One reaches for blue, another for red.'
    },
    alt: {
      ar: 'تصوّر لعائلة بالغة من أجيال مختلفة تتشارك حُبّ بعد الغداء',
      en: 'Concept of an adult family across generations sharing HUBB after a meal'
    }
  }
];

for (const post of skuPosts) post.image = sitePath(post.image);

export const postsFor = (productId) => skuPosts.filter((post) => post.product === productId);

const copy = (lang, ar, en) => (lang === 'en' ? en : ar);
const at = (value, lang) => escape(value[lang] || value.en || value.ar || '');

export function renderSkuPostCard(post, lang, { asButton = false } = {}) {
  const tag = asButton ? 'button' : 'article';
  const extra = asButton
    ? ` type="button" data-product="${escape(post.product)}" data-product-format="${escape(post.format)}"`
    : '';
  return `<${tag} class="sku-ugc-post"${extra}>
    <header class="sku-ugc-head"><span class="sku-ugc-brand" lang="ar">حُبّ</span><span class="sku-ugc-handle">HUBB</span><span class="sku-ugc-label">${copy(lang, 'تصوّر إبداعي', 'CONCEPT')}</span></header>
    <figure class="sku-ugc-photo"><img src="${escape(post.image)}" width="1024" height="1536" loading="lazy" alt="${at(post.alt, lang)}"></figure>
    <div class="sku-ugc-body"><p class="sku-ugc-place">${at(post.place, lang)}</p><p class="sku-ugc-caption">${at(post.caption, lang)}</p></div>
  </${tag}>`;
}

export function renderSkuUgcSection(productId, lang, { compact = false, headingLevel = 3 } = {}) {
  const posts = postsFor(productId);
  if (!posts.length) return '';
  const heading = copy(lang, 'حُبّ في يومهم. نتخيّلها لنكهتك.', 'HUBB in the day. Imagined for this flavour.');
  const note = copy(lang, 'مشاهد تصوّرية مولّدة بالذكاء الاصطناعي. ليست منشورات عملاء أو تقييمات.', 'AI-generated scene concepts. These are not customer posts or reviews.');
  const level = [2, 3].includes(headingLevel) ? headingLevel : 3;
  const title = compact
    ? `<p class="sku-ugc-kicker">${copy(lang, 'منشورات نتخيّلها', 'POSTS WE IMAGINE')}</p>`
    : `<div class="sku-ugc-intro"><p class="sku-ugc-kicker">${copy(lang, 'منشورات نتخيّلها', 'POSTS WE IMAGINE')}</p><h${level} class="sku-ugc-title">${escape(heading)}</h${level}></div>`;
  const cards = compact
    ? posts.map((post) => `<figure class="sku-ugc-post"><div class="sku-ugc-photo"><img src="${escape(post.image)}" width="1024" height="1536" loading="lazy" alt="${at(post.alt, lang)}"></div><figcaption class="sku-ugc-body"><p class="sku-ugc-place">${at(post.place, lang)}</p></figcaption></figure>`).join('')
    : posts.map((post) => renderSkuPostCard(post, lang)).join('');
  return `<aside class="sku-ugc ${compact ? 'is-compact' : ''}" aria-label="${escape(heading)}">
    ${title}
    <div class="sku-ugc-grid">${cards}</div>
    <p class="sku-ugc-note">${escape(note)}</p>
  </aside>`;
}

export function renderSkuUgcHome(lang) {
  const featured = skuPosts.filter((post) => post.featured);
  const tr = (ar, en) => (lang === 'en' ? en : ar);
  return `<div class="sku-ugc-home">
    <div class="sku-ugc-intro">
      <p class="sku-ugc-kicker">${tr('كل نكهة، ولها لحظة', 'EACH FLAVOUR HAS A MOMENT')}</p>
      <h3 class="sku-ugc-title">${tr('منشورات نتخيّلها للنكهات.', 'Posts we imagine for the flavours.')}</h3>
      <p class="sku-ugc-lead">${tr('كوب في اليد، وكيس ينتقل، ولمّة بسيطة. اضغط المنشور، وافتح نكهتك.', 'A cup in hand, a sachet passed, a small gathering. Tap a post to open that flavour.')}</p>
    </div>
    <div class="sku-ugc-grid sku-ugc-home-grid">${featured.map((post) => renderSkuPostCard(post, lang, { asButton: true })).join('')}</div>
    <p class="sku-ugc-note">${tr('تصوّرات لحملة حُبّ مولّدة بالذكاء الاصطناعي؛ ليست منشورات عملاء أو شهادات.', 'AI-generated HUBB campaign concepts; these are not customer posts or testimonials.')}</p>
  </div>`;
}
