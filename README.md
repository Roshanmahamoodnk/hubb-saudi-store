# HUBB — A little HUBB. Happiness to share. · V3

Roza Lab interior-design package (current photos, Working North plans, named desks, monitoring): [`docs/roza-lab/ROZA_LAB_INTERIOR_DESIGN.md`](docs/roza-lab/ROZA_LAB_INTERIOR_DESIGN.md) · visual booklet [`docs/roza-lab/index.html`](docs/roza-lab/index.html).

A bilingual Saudi ecommerce storefront preview with an Arabic-first shopping experience, original HUBB product artwork, generated Saudi campaign scenes, and consumer-first moments of sharing and the founder's development story.

**Public website preview: no payment collected, no live order received or accepted.** Payments, inventory, fulfilment, order acceptance and review storage are not connected. A WhatsApp link opens a message for the visitor to review and send; opening it does not prove the business received an enquiry. The supplied business number is +966 55 312 7999.

Public GitHub Pages website: https://roshanmahamoodnk.github.io/hubb-saudi-store/

Additional preview: https://hubb-saudi-gathering-store.r0shan911.chatgpt.site/

Source: https://github.com/Roshanmahamoodnk/hubb-saudi-store

## Open and run

Run `npm start` and open http://127.0.0.1:8788. No package installation or external JavaScript dependencies required. `npm run check` checks module syntax. `npm run build` creates the static output for hosting. V2 and V3 browser verification is recorded in `_fleet/QA.md`.

## V3 experience

- Exactly four flavours: Classic Sea Salt, Garlic Salt, Pepper Lime and Fire Salt. Family Mix combines those four; it is not a fifth flavour.
- Online formats are the five-sachet Journey Cup, twenty-sachet Family Mix and twenty-four-sachet retail case. Individual 30 g sachets are not sold online, including as add-ons.
- Product details, contents, quantity selection, Arabic/English search and a persistent local cart.
- Saudi contact/address validation and a no-payment order preview; no automatic order submission.
- Price-free B2B volume enquiries for wholesale offers, availability, delivery and supply terms.
- Original package artwork and clearly labelled AI campaign scenes; actual customer reviews begin empty and real feedback is invited without fabricated ratings.
- “A little HUBB. Happiness to share.” leads the experience. Two years of founder-reported development now sit in About HUBB, after shopping and everyday sharing scenes. See `CONTENT_DIRECTION_V3.md` for the current bilingual direction.
- Eight separate format renders: a five-sachet cup and 24-sachet open counter-display carton for each flavour. The selected pack image follows the shopper through product cards, product pages, details, cart and order preview.
- Four new original lifestyle concepts: a football break, colleagues after lunch, a family across adult generations, and a parked road stop. Desktop scroll changes the pinned scene; mobile and reduced-motion layouts show each scene in sequence.
- A silent scroll-controlled ritual: the seed opens along its side edge, the kernel emerges, and the empty husks arc into a separate paper bag. No sound button, synthetic audio or required step clicks. Short-screen, reduced-motion and no-JavaScript views use a static illustrated guide.
- Keyboard-accessible dialogs, mobile layouts, reduced-motion support and complete Arabic/English controls.

## Proposed online offer

| Format | Count | Net contents | Proposed SAR |
|---|---:|---:|---:|
| Journey Cup | 5, one flavour | 150 g | 12.00 |
| Family Mix | 20, five of each flavour | 600 g | 39.00 |
| Retail case | 24, one flavour | 720 g | 42.00 |

The 30 g sachet's **SAR 2.50** is a proposed supermarket retail reference only. It is not an online SKU, verified shelf listing, former online price or retailer partnership.

The current proposal is a **SAR 39 goods-subtotal minimum**, **SAR 15 delivery below SAR 75**, and **free delivery from SAR 75**. These are preview rules awaiting actual cost/fulfilment validation, not confirmed delivery economics. The minimum and threshold are calculated from merchandise after any supported merchandise discount and before delivery. Empty carts cannot proceed.

Wholesale prices are supplied individually by the Rozana team. No B2B tier, monetary subtotal or discount calculation appears in the page or prepared enquiry. See `PRICING.md` for price evidence, SPL public courier references and limitations.

## Content and artwork status

Product source: the owner-provided guide https://roshanmahamoodnk.github.io/hubb-companion/video_review/ and current V5 local briefs. Current owner instructions supersede older product ideas. Saudi-manufacturer positioning and R&D history are owner-reported; no crop-origin, programme certification, Japanese-process provenance or retailer-partnership claim is established.

**Arabic: Draft pending Saudi copywriter validation.** Generated product renders are design concepts; typeset page facts take precedence over generated small print. No third-party SKU imagery or Howcast footage is used as advertising. Prompts and provenance are in `assets/PROMPTS.md`, `assets/SKU_PROMPTS.md` and `assets/CRACK_PROMPT.md`. V3 prompts are in `assets/CUP_V3_PROMPTS.md`, `assets/CASE_V3_PROMPTS.md` and `assets/UGC_V3_PROMPTS.md`, `assets/DISPLAY_V4_PROMPTS.md` and `assets/RITUAL_V4_PROMPTS.md` and `assets/RITUAL_EDGE_V5_PROMPT.md`; scene guidance is in `SCENES_V3.md`. WebP files serve the site; original PNGs are preserved.

## Owner-supplied contact and locations

- WhatsApp: [+966 55 312 7999](https://wa.me/966553127999).
- [Rozana Al Riyadh Foodstuff Factory](https://www.google.com/maps/place/Rozana+Al+Riyadh+Foodstuff+Factory/@25.131754,46.0771262,17z/data=!3m1!4b1!4m6!3m5!1s0x3e2957ded4967ebb:0x9820725213d7f568!8m2!3d25.131754!4d46.0797011!16s%2Fg%2F11vpt7ngn7): 25.131754, 46.0797011.
- [Riyadh warehouse — Rozana foodstuff](https://www.google.com/maps/place/Rozana+foodstuff/@24.5631677,46.7553478,19.8z/data=!4m6!3m5!1s0x3e2f093c04bcac1d:0x5bb58ad0c4dcee22!8m2!3d24.5634184!4d46.7556442!16s%2Fg%2F11n72754c1): 24.5634184, 46.7556442.

These are owner-supplied contact/location references. Use “Riyadh warehouse” without adding an inferred district. The pins do not establish opening hours, visitor access, collection availability, a dispatch service area or programme certification. A visitor-controlled WhatsApp action does not establish message delivery or acceptance.

## Launch dependencies

See `_fleet/launch-checklist.md`. Product records, physical packaging validation, approved commercial/tax model, payment and order services, stock, fulfilment and customer-content infrastructure remain launch work. The business contact is supplied; monitoring and receipt handling still need operational testing. Public preview hosting and design review do not establish readiness to accept money or live orders.

## GitHub Pages publishing

GitHub Pages must use **GitHub Actions** as its publishing source. `.github/workflows/pages.yml` builds the complete bilingual website and uploads only `out/`, then deploys it after checks succeed. Publishing the repository root directly serves the unbuilt template and breaks root-relative resources on a project URL.

The workflow sets `HUBB_SITE_URL=https://roshanmahamoodnk.github.io/hubb-saudi-store`. This scopes static links, runtime product images, language switching, metadata and sitemap URLs to `/hubb-saudi-store/`. With no override, the existing root-hosted build remains the default. `HUBB_OUT_DIR` optionally places another build in a separate output directory for checks.

Run `npm run check:site` after a build with the same environment settings. It checks all 11 pages, local resources and module imports, deployment metadata, dynamic product images and path-helper behaviour. No payment or order backend is added by publishing.

Workflow reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
