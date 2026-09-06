# HUBB Saudi search and content plan

Version 2 · researched 6 September 2026. This is an evidence-led implementation plan, not a ranking forecast. No keyword-volume tool, Search Console property or live sales analytics was connected for this task; search volumes, difficulty scores, current rankings, demand shares and conversion forecasts are **not measured**. Priorities below reflect relevance to HUBB's actual product and business paths.

## The three immediate priorities

1. Give Arabic and English complete, directly accessible pages, including four substantive flavour pages. Preserve the four-flavour product truth and make the online pack format unmistakable.
2. Tell the founder's two-year story in the words of the business, then connect it to product details and neutral tasting questions. Avoid generic pages that merely repeat keywords.
3. Keep retail reference pricing, online checkout and trade enquiries distinct. The single 30 g sachet at proposed SAR 2.50 is not sold individually online. The current proposed online policy is SAR 39 minimum merchandise value, SAR 15 delivery below SAR 75 and free delivery from SAR 75 in eligible areas; confirm operating coverage before real commerce.

The current private preview should remain noindex. Indexability and a connected checkout are separate decisions; the static SEO foundation can be built and checked while the preview stays private.

## Observed Saudi category terminology

| Term | Primary-source observation | Recommended use | Limit |
|---|---|---|---|
| حب دوار الشمس | Baja uses the phrase in its Arabic product heading; LuLu Saudi uses it for a sunflower-seed listing. | Lead Arabic commercial category phrase; combine naturally with HUBB/flavour/pack. | Observed seller wording is not search-volume evidence. |
| بذور دوار الشمس | Baja's Arabic page title uses the formal seed term. | Clear product description, metadata and explanatory text; add بقشرها to distinguish the product. | Do not confuse the snack with planting seeds, bird feed, oil or shelled baking kernels. |
| حب شمسي | Bin Afif calls its product حب شمسي محمص. | Supporting synonym in a useful category/FAQ passage and internal search aliases. | One seller's usage does not establish national dominance. |
| تسالي | Relevant broad snack/occasion language; a Saudi retailer category example describes sunflower seeds as تسالي. | Occasion copy and supporting terms alongside the precise product category. | Too broad to serve as the only page target. |
| لب / لبّ | Useful for explaining the edible kernel. | Eating guide: اللبّ للأكل والقشرة تُرمى. | Not established in this research as the strongest Saudi shopping query; can blur the in-shell/shelled distinction. |
| فصفص | Broad vernacular hypothesis, not confirmed as a precise sunflower-seed term by the primary sources used here. | Consider only after Saudi copywriter/customer query validation. | Do not make it the lead term or assert a dominant regional meaning. |

Source wording: [Baja Arabic product page](https://baja.com.sa/ar/product-detail.php?productId=12), [LuLu Saudi](https://gcc.luluhypermarket.com/ar-sa/baja-sunflower-seeds-230-g/p/1485525), [Bin Afif Arabic product page](https://binafifroasters.com/products/Roasted-sunflower-Seeds), [Nazeeel retailer category example](https://nazeeel.com/en/baja-sunflower-seeds-nazeeel/p185883214). Baja's direct open was unavailable during the task; its primary-site search extract supplied the heading/title. Other listed pages were readable in search or open results. These are terminology observations, not endorsements or competing-brand claims for HUBB's page.

## Keyword-to-page map

Use these as editorial targets and internal search synonyms, not a list to paste repeatedly into the page. Priority is the team's relevance judgement; volume, difficulty and present rank remain unmeasured for every row.

| Proposed query/topic | Intent | Page/section | Priority |
|---|---|---|---|
| حُبّ / HUBB sunflower seeds | Brand navigation | Home and product collection | First |
| حب دوار الشمس بنكهات | Product discovery | Four-flavour collection | First |
| بذور دوار الشمس بقشرها | Category understanding | Collection and eating guide | First |
| حب دوار الشمس ملح بحري | Flavour consideration | Classic Sea Salt page | First |
| حب دوار الشمس بالثوم | Flavour consideration | Garlic Salt page | First |
| حب دوار الشمس فلفل ولايم | Flavour consideration | Pepper Lime page | First |
| حب دوار الشمس حار | Flavour consideration | Fire Salt page | First |
| حب شمسي بنكهات | Supporting category discovery | Category introduction / FAQ | Next |
| تسالي للّمة | Occasion exploration | Family Mix / gathering editorial | Next |
| عبوة حب دوار الشمس للعائلة | Pack consideration | Family Mix detail | First |
| أكواب حب دوار الشمس | Pack consideration | Journey Cup guide | Next |
| كرتون حب دوار الشمس | Case purchase/enquiry | Trade/retail-case details | First |
| حب دوار الشمس بالجملة | B2B purchase | Wholesale enquiry | First |
| مورد تسالي في السعودية | B2B supplier exploration | Wholesale/distribution landing | Next |
| توزيع منتجات غذائية سعودية | Partnership | Distributor application | Next |
| التعاون مع علامة تسالي | Creator/brand partnership | Collaborations page | Next |
| كيف آكل حب دوار الشمس | Informational | Shell/kernel ritual guide | Next |
| هل يؤكل قشر دوار الشمس | Informational | Clear shell/kernel FAQ | Next |
| sunflower seeds Saudi Arabia | English product discovery | English collection | First |
| flavoured in-shell sunflower seeds | English product discovery | English flavour pages | First |
| sunflower seed multipack Saudi Arabia | Online pack consideration | English cup/family guide | Next |
| wholesale sunflower seeds Saudi Arabia | B2B purchase | English wholesale landing | First |

These longer phrases are hypotheses grounded in product/channel relevance, not claims that we observed measurable demand for each phrase. Do not create twenty-two thin pages; answer related intents within a small coherent set.

## Routes and crawlable content

Recommended main routes: `/ar/`, `/en/`; four product routes per language at `/ar/products/sea-salt/`, `/ar/products/garlic-salt/`, `/ar/products/pepper-lime/`, `/ar/products/fire-salt/` and matching `/en/` routes. Family Mix can later have a bundle detail route, clearly described as four flavours. Dedicated story, wholesale, distributors, collaborations and ritual routes are the next expansion when each contains enough useful content; sections on the main page can serve these paths while the preview is being built.

Give the visible language a stable URL, a complete main-language body and links to the alternate language. Do not rely on a cookie or a language button changing text at one URL as the only way to expose English. Google recommends separate language URLs and warns that dynamic locale adaptation can leave some versions undiscovered. Use a clear language switch without automatic geographic/language redirection. [Google — multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

Each product page should have its own full headline, actual catalogue description, own pack image, precise available formats, founder-development context, shell/kernel explanation, online-order terms and related flavour links. A modal may still handle choosing a pack and adding to the bag; the informational content remains directly readable without opening the modal. Hash fragments are for page sections, not distinct indexable flavour identities. [Google — ecommerce URL structure](https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites)

For each Arabic/English pair, use a self canonical and identical reciprocal `hreflang` lists containing `ar-SA`, `en-SA` and a real `x-default` fallback. Use fully qualified URLs built from the actual deployment origin. Each alternate must link back. Do not canonicalise every Arabic page to English or every flavour to the home page. [Google — localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)

## Draft metadata and editorial titles

Arabic is draft pending Saudi copywriter validation. Titles/descriptions should fit the actual page and read naturally; arbitrary character cutoffs are not a promise of how Google will display them.

| Page | Title | Meta description |
|---|---|---|
| Arabic home | حُبّ — حب دوار الشمس بأربع نكهات | اكتشف حُبّ من مصنع سعودي: أربع نكهات، وأكياس داخل عبوات للّمة والرحلات. تعرّف على حكايتنا وعبوات الموقع وطلبات الجملة. |
| English home | HUBB — Four Flavours, Made for the Gathering | Meet HUBB, a Saudi sunflower-seed manufacturer. Explore four flavours, the story behind the seed, online multipacks and wholesale enquiries. |
| Arabic Sea Salt | حُبّ ملح بحري — حب دوار الشمس بقشره | تعرّف على حُبّ ملح بحري، وعبوات الموقع: كوب بخمسة أكياس وكرتون من ٢٤ كيسًا. الكيس الفردي مرجع للتجزئة ولا يُباع منفردًا عبر الموقع. |
| English Sea Salt | HUBB Classic Sea Salt — In-Shell Sunflower Seeds | Explore HUBB Classic Sea Salt and its five-sachet cup or 24-sachet case. See exact contents, the story behind HUBB and the proposed online order policy. |
| Arabic Garlic | حُبّ ملح بالثوم — حب دوار الشمس بنكهات | اكتشف نكهة ملح بالثوم من حُبّ. تعرّف على الأكياس المغلقة داخل عبوات الموقع، طريقة الاستمتاع باللبّ، وخيارات الكميات. |
| English Garlic | HUBB Garlic Salt — In-Shell Sunflower Seeds | Meet Garlic Salt, one of HUBB's four flavours. Explore sealed-sachet multipacks, the shell-to-kernel ritual and the proposed online order policy. |
| Arabic Pepper Lime | حُبّ فلفل ولايم — حب دوار الشمس بنكهات | فلفل ولايم من حُبّ، ضمن أربع نكهات للّمة. اكتشف محتويات عبوة الخمسة أكياس وكرتون التجزئة، وحكاية تطوير حُبّ. |
| English Pepper Lime | HUBB Pepper Lime — In-Shell Sunflower Seeds | A pepper-and-lime flavour for the gathering. Discover HUBB's exact pack contents, two-year development story and online multipack choices. |
| Arabic Fire Salt | حُبّ ملح حار — حب دوار الشمس بقشره | تعرّف على نكهة ملح حار من حُبّ، وخيارات عبوات الموقع، ومحتويات كل عبوة. اكتشف طريقة أكل اللبّ وجمع القشور منفصلة. |
| English Fire Salt | HUBB Fire Salt — In-Shell Sunflower Seeds | Explore HUBB Fire Salt: one of four flavours in individually sealed sachets. Compare online packs and discover the care behind the seed. |

Do not place “from SAR 2.50” in homepage titles, descriptions, social cards or structured offers. That would attract a shopper to an online purchase the site does not offer. Do not optimise for “best”, “number one”, “healthiest” or a named certification without evidence.

## Structured data decisions

Google distinguishes informational product snippets from merchant listings; merchant-listing experiences require a page on which a shopper can purchase the product. A private demo with proposed prices is not a live merchant offer. Build descriptive `WebPage` and `BreadcrumbList` markup now. A basic truthful `Product` entity without fabricated offer/review data can describe the item, but it must not be described as rich-result eligible merely because it parses. [Google — Product introduction](https://developers.google.com/search/docs/appearance/structured-data/product), [Google — merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)

When commerce is live, generate product offers from the actual sellable pack ID: cup/case/family as supported. Use the exact visible current price, `SAR`, real availability and the selected pack's image/count; do not use the single-sachet retail reference as an online offer. Keep price and inventory generated from one catalogue source. Google's merchant guide recommends initial-HTML product markup and notes reliability concerns for dynamically changing shopping data. [Google — merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)

If using ProductGroup/variant markup later, give variants stable IDs and distinct directly selectable URLs showing the matching image, price and availability. The Family Mix remains a separate assortment. The simplest present implementation is one substantive flavour page with accurately named format options, without claiming advanced variant eligibility. [Google — product variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants)

No review count, rating, author identity or testimonial is to be created for markup. Only actual visible, item-specific reviews belong in Review/AggregateRating; disclose sample/gift relationships and preserve the difference between product tasting and design feedback. Do not import retailer/customer reviews from another brand. [Google — review snippets](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)

For links that users submit, apply `rel="ugc"` when appropriate. For compensated/advertising links, use `rel="sponsored"`; both can be combined when they describe the same link. These attributes qualify links; they do not turn generated brand scenes into genuine UGC. [Google — outbound links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)

**Current correction to older SEO playbooks:** Google stopped showing FAQ rich results from 7 May 2026 and removed that feature's documentation in June. Keep FAQ content because it answers shopper questions; do not promise a FAQ rich-result feature. The current update log also states that llms.txt is not required for Google Search and does not improve its rankings. [Google — documentation updates](https://developers.google.com/search/updates)

## Technical release checklist

| Check | Preview target | Live target / verification |
|---|---|---|
| Indexing | Every generated route remains `noindex,nofollow`; robots continues to disallow the private preview. | Deliberately change both controls for approved public routes, then inspect a deployed URL. A sitemap alone does not override noindex. |
| Main/product content | Standalone HTML has title, description, H1, contents, story, links and image. | Fetch HTML and inspect the rendered page; ensure the required content and real offers agree. |
| Canonical/hreflang | Built from a supplied preview origin; reciprocal language URLs. | Replace origin with actual production domain and verify all response URLs. |
| Sitemap | Include both main routes and all eight product routes, without invented timestamps. | Keep only canonical live routes intended for discovery; submit the production sitemap through the verified property. |
| Navigation | Real anchors from home/collection to flavour pages and back. | No orphan pages or hash-only product identities. |
| Media | Original HUBB assets, descriptive Arabic/English alt, correct dimensions. | Check actual format/count and image loading; use appropriately sized modern images. |
| Product/cart assets | Root-relative image/module paths on nested product pages. | Open a product page directly, choose a pack, add/remove and refresh; no nested-path 404s. |
| Mobile and performance | Responsive layout, readable body, reserved image space, reduced-motion support. | Inspect mobile behaviour and measure the deployed site's actual performance; no invented Core Web Vitals score. |
| Search Console | Not claimed connected. | Verify the actual property, inspect canonical/language pages and record indexation/coverage issues. |
| Merchant data | No proposed checkout/retail price emitted as an active Offer. | Test real product data and fulfilment policy only after the merchant service is connected. |
| Tracking | Label preview interactions separately. | Attribute actual paid orders and qualified enquiries; no personal data in analytics event names/URLs. |

## Useful content, rather than many repeated pages

First articles: the founder's two-year story; the exact cup/Family Mix pack guide; how to enjoy in-shell sunflower seeds and collect husks; a clear wholesale/distributor explanation. Publish original detail that only HUBB can provide—actual development notes, packaging facts and permitted customer experiences. Do not generate city-by-city near-duplicates, recipe claims or supposed factory case studies for keywords. Google treats scaled low-value content made mainly to manipulate rankings as spam regardless of how it is generated. [Google — spam policies](https://developers.google.com/search/docs/essentials/spam-policies)

## Measurement and thirty-day decisions

In week one, document the actual page inventory, canonical/hreflang coverage and working form destinations. After launch, read Search Console impressions/clicks by page and query; distinguish brand/category/business queries. Use observed questions to improve headings and explanatory content, rather than claiming a keyword ranking because a seller uses similar words.

Link social story posts to the relevant story/flavour/pack page with consistent content IDs. Measure qualified actions: a sellable-pack view, basket that reaches the order minimum, eligible checkout, paid order, received wholesale enquiry, qualified distributor lead and accepted collaboration. Count preview-order screens and draft downloads separately. Compare content on equal date ranges and operating conditions; do not ascribe changes to a creative without considering stock, price, shipping and traffic mix. The full 30-day channel schedule is in `CONTENT_STRATEGY_V2.md`.

## Local channel evidence

[Sary](https://sary.com/) describes a B2B service for retail and HORECA buyers. [Almunajem services](https://almunajemfoods.com/services/) separates direct retail, wholesale, supermarkets/mini-markets and HORECA. These primary sources support distinct enquiry intent and page wording. They are examples of channel structures to investigate, not selected or authorised partners, and no company/logo is to appear as HUBB distribution proof.

Research accessed 6 September 2026. Google documentation was opened directly during this task; local listing freshness and availability may vary. No social content was sent or published.
