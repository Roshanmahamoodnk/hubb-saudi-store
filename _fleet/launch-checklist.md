# HUBB store — V2 operational launch checklist

Updated 6 September 2026. The current work is a **private storefront preview**, with no payment collected and no live order received or accepted. Designs, commercial terms and Arabic copy remain proposals. This V2 documentation revision uses current owner direction; final application/browser testing is performed separately after integration.

## V2 decisions to preserve

Exactly four flavours: Classic Sea Salt, Garlic Salt, Pepper Lime and Fire Salt. Family Mix bundles those four and is not a fifth flavour. Each sachet is 30 g. Cup: 5 × 30 = 150 g, one flavour and a separate shell bag. Family: 20 × 30 = 600 g, five of each flavour. Case: 24 × 30 = 720 g, one flavour.

| Offer | Channel | Proposed SAR | SAR per sachet |
|---|---|---:|---:|
| 30 g sachet | Supermarket reference only; unavailable online, including as add-on | 2.50 | 2.50 |
| Journey Cup | Online preview | 12 | 2.40 |
| Family Mix | Online preview | 39 | 1.95 |
| Retail case | Online preview | 42 | 1.75 |

Minimum merchandise subtotal: **SAR 39**. Proposed delivery: **SAR 15 below SAR 75**, **free from SAR 75**. Apply these boundaries to goods after any supported merchandise discount and before delivery; shipping cannot make an under-minimum basket qualify. An empty cart cannot proceed. These proposed rules do not establish profitable fulfilment or approved tax/coverage assumptions. The SPL public reference and exact arithmetic are in `../PRICING.md`.

## V2 acceptance checks

| Area | Required result |
|---|---|
| Range and format | No fifth flavour, no single-sachet add-to-cart path. Family is clearly a mixed bundle. Selectors and persisted-cart restoration reject unavailable formats. |
| Contents imagery | A sachet artwork image cannot silently promise a single-sachet sale. Exact selected format/count remain adjacent; live commerce ultimately needs the corresponding final outer-pack photography. |
| Basket boundaries | SAR 36 cannot proceed; SAR 39 plus SAR 15 displays 54; SAR 42 plus SAR 15 displays 57; SAR 75 displays zero delivery. Empty and invalid carts cannot proceed. |
| Founder story | Two years of R&D and the boiling-trial crunch observation are attributed to the founder. No unverified Japanese provenance, universal process claim or measured superiority is introduced. |
| Crack visual | Whole striped seed, two visibly empty husk halves and edible kernel remain clearly distinguishable. Label it a visual concept where needed; it is not product-test evidence. |
| Sound study | Synthesized sound is clearly labelled as designed, not an actual product recording. Play requires visitor action; stop/mute works; content is understandable without sound. No authentic product-ASMR or measurement claim. |
| Reviews | Real feedback invited, empty reviews preserved until actual submissions exist. No fabricated customer quotes, names, ratings, purchases or engagement. |
| Contact | WhatsApp uses `966553127999`. Opening a draft never says the enquiry was received, sent automatically or accepted. |
| Locations | Use supplied factory and Riyadh-warehouse pins exactly. No invented district, hours, pickup promise, visitor access or delivery coverage. |
| Preview boundary | Payment/order receipt remains inactive. Remove misleading success language; private/noindex hosting is not launch completion. |

## Owner-supplied contact and locations

- WhatsApp: [+966 55 312 7999](https://wa.me/966553127999).
- [Rozana Al Riyadh Foodstuff Factory](https://www.google.com/maps/place/Rozana+Al+Riyadh+Foodstuff+Factory/@25.131754,46.0771262,17z/data=!3m1!4b1!4m6!3m5!1s0x3e2957ded4967ebb:0x9820725213d7f568!8m2!3d25.131754!4d46.0797011!16s%2Fg%2F11vpt7ngn7): 25.131754, 46.0797011.
- [Riyadh warehouse — Rozana foodstuff](https://www.google.com/maps/place/Rozana+foodstuff/@24.5631677,46.7553478,19.8z/data=!4m6!3m5!1s0x3e2f093c04bcac1d:0x5bb58ad0c4dcee22!8m2!3d24.5634184!4d46.7556442!16s%2Fg%2F11n72754c1): 24.5634184, 46.7556442.

These are owner-supplied contact/location references. Use “Riyadh warehouse” without adding an inferred district. The pins do not establish opening hours, visitor access, collection availability, a dispatch service area or programme certification. A visitor-controlled WhatsApp action does not establish message delivery or acceptance.

## Exact wholesale calculator rules

The calculator is a quote estimator, beginning at four cases. A case contains 24 single-flavour sachets; selectable flavour is currently applied to the whole estimate. If mixed whole-case orders are added later, record integer cases by flavour and apply any approved tier policy to the confirmed total.

| Boundary / quantity | SAR per case | Goods subtotal SAR | Sachets | Net kg |
|---|---:|---:|---:|---:|
| 4 | 40 | 160 | 96 | 2.88 |
| 11 | 40 | 440 | 264 | 7.92 |
| 12 | 38 | 456 | 288 | 8.64 |
| 23 | 38 | 874 | 552 | 16.56 |
| 24 | 36 | 864 | 576 | 17.28 |
| 25 | 36 | 900 | 600 | 18.00 |

Formulae: `sachets = cases × 24`; `net grams = cases × 720`; `goods subtotal = cases × applicable whole-case rate`. Derive per-sachet display from the unrounded case rate, format it for reading, and do not multiply the displayed SAR 1.67 back into a total. Keep quote copy explicit that freight, tax basis, production capacity, payment terms and final acceptance are not included merely because the estimate was calculated.

At 23 cases use this draft Arabic suggestion: **“أضف كرتونًا واحدًا ووَفّر ١٠ ريالات من الإجمالي.”** At 24 show the applied SAR 36/case rate and optional “24-case rate applied”. No urgency label or deadline is supported.

## Connect before accepting money or live orders

| Workstream | Current state | Concrete work | Evidence of completion |
|---|---|---|---|
| Product master | Frontend concept catalog; four flavours and counts established. | Assign stable saleable IDs for cups, cases and Family Mix; keep individual sachets as stock/retail records unavailable for online purchase; enter approved ingredients, allergens, nutrition, storage, shelf life, net weights and final product label assets. | Operations signs off one export of the live catalog; each page matches the final pack record. |
| Packaging/stock units | Source architecture uses sealed sachets inside cups/buckets/cases. | Confirm whether inventory is tracked as finished outer SKUs or assembled from sachets. Define pack-assembly/BOM deductions, including 5 of each flavour for Family Mix and any confirmed accessories. | One simulated family order deducts exactly the chosen finished unit or the correct twenty component sachets; no double deduction. |
| Pricing and economics | Online SAR 12 / 39 / 42, supermarket reference 2.50, minimum 39, delivery 15/free from 75 and bulk 40 / 38 / 36 are proposals. | Enter actual production, packaging, channel, fulfilment and tax costs. Test the proposed minimum and free-delivery subsidy against actual order contribution; public SPL bundles are not a negotiated HUBB contract. Approve retail and trade price lists, effective dates and discount rules. | Owner-approved price version with contribution calculation and an expiry/review date for trade quotes. |
| Commerce platform/order service | Local cart and preview-only checkout. | Choose and configure the commerce backend; connect product IDs, server-authoritative price validation, order creation, inventory reservation and customer lookup. Keep credentials out of the browser. | A staging order has a backend order ID, correct server-calculated lines and an auditable state history. Altering a browser price cannot change the charged amount. |
| Payment | No payment collected. | Connect the merchant's chosen payment provider, approved methods and verified server callbacks. Handle successful, failed, abandoned, duplicate and delayed results. | Provider test transactions reconcile with orders; duplicate callbacks do not create duplicate payment/order records. Successful payment alone does not bypass inventory validation. |
| Order states | Must remain preview-only; no live order receipt established. | Define pending-payment, paid, cancelled, allocated, packed, shipped, delivered and refunded/part-refunded states as appropriate to the chosen service. | Each state can be reached and traced in staging; support can find the order and its actual payment/fulfilment state. |
| Inventory/availability | No real inventory source established. | Connect stock levels, reserve/release behaviour, channel allocation, expiry/batch handling and out-of-stock UI. | Concurrent orders cannot sell the same last unit twice; cancellation releases stock; expired/unavailable lots cannot be dispatched. |
| Shipping and address capture | Preview form collects name, Saudi mobile, city, postcode and district/street without sending or saving them. | Choose dispatch locations/carrier service; confirm destination coverage, rate rules, address fields, parcel mass/dimensions and tracking events. Capture the fields that the actual carrier requires. | Rates and unsupported destinations work in staging; a carrier test label has the correct recipient/parcel data; tracking updates reach the order. |
| Tax and invoice data | Preview has no final tax split. | Operations/accounting configures the seller's tax basis, customer invoice fields and invoice provider/output for the chosen platform. | Test orders reconcile product subtotal, discount, tax, freight and final total; invoices use the correct seller data and references. |
| Customer support | Owner supplied WhatsApp +966 55 312 7999; monitored response and service desk not tested. | Test routing to the supplied number, assign a responsible operator and support inbox/service desk; define owners for delivery issues, wrong items, damaged packs, cancellations and refunds. | A test customer enquiry reaches the responsible operator and can be linked to an order. |
| Delivery, cancellation and returns copy | Informational preview copy only. | Have operations supply actual procedures, timelines, destinations and exceptions; publish final policy content after the relevant business review. | The published text matches fulfilment/support procedures and the checkout confirmation; no invented delivery promise remains. |
| Bulk sales | Supplied WhatsApp destination; downloadable or visitor-sent draft, no automatic send or proven receipt. | Use +966 55 312 7999, define responsible owner, required business/contact/delivery fields, approval workflow, MOQ, quote validity and capacity check. Optionally retain the draft download as a customer convenience. | A test enquiry produces a traceable sales record and acknowledgement only after successful receipt; final quote records taxes/freight, approved price, quantities and validity. |
| Reviews | No verified-purchase reviews; concept feedback flow. | Connect actual review storage/moderation if desired. Require a real order association for verified-purchase badges; secure permission to display submitted content. | Seed-free empty state is correct. A test review is moderated and displayed with its true status; deleting it removes the public record. |
| Creator content | AI concept scenes explicitly labelled; no genuine customer post claim. | Establish a submission destination, usage permission record, original file capture and release/moderation workflow before publishing real creator assets. | Every displayed customer/creator asset maps to a permission record; generated scenes retain honest editorial labelling. |
| Privacy/forms | Checkout states no data is sent or saved; cart persists locally. | Inventory the real services and data flows when integrations are added. Replace preview descriptions with accurate collection, retention, consent and contact behaviour reviewed for the operating setup. | Browser/network inspection agrees with published descriptions; rejected form requests do not show a success receipt. |
| Arabic/English | Bilingual draft UI. | Saudi specialist validates final consumer Arabic and wordmark; localise dynamic errors, metadata, email/SMS, invoice and order-state messaging. | End-to-end checkout, support and refund messages are readable in both languages; RTL controls and embedded Latin/SAR data remain clear. |
| Domain/hosting | Custom front end; private/noindex preview intended, current hosting state checked separately. | Configure production host/domain, secure backend environment values, HTTPS, backups, deployment rollback and separate staging/live services. | Production health check passes; rollback works; private credentials cannot be downloaded from public files. |
| Monitoring and handover | No live operating workflow established. | Assign owners for payment errors, failed orders, low stock, quote enquiries and shipping exceptions. Set useful alerts and record operating procedures. | Trigger one representative test failure and verify the operator receives the correct actionable alert with order reference. |

## Final release verification

- Verify every asset referenced by the finished pages loads and shows the correct new SKU system; exact pack counts take precedence over visual abundance.
- Complete mobile/desktop Arabic and English navigation, search, format selection, quantity, add/remove, persistence and checkout tests. Check focus, keyboard operation, readable text and reduced-motion behaviour.
- Test online cart totals using cups, family packs and cases; reject old single-sachet cart records. Check minimum and delivery boundaries at 0/36/39/42/74.99/75 and compare UI/server totals after real discounts/tax/shipping are configured. Test bulk 4/11/12/23/24/25 separately and verify the saved quote uses the visible quantity/rate.
- Place and cancel/refund representative staging orders through the real connected services. Record confirmation, stock movement, payment reconciliation and operator visibility rather than treating a click as completion.
- Replace concept price/product details only with approved records. Do not remove the preview notice or enable paid checkout while the operational dependencies above remain unconnected.
- Confirm optional synthesized sound has a working stop path and correct disclosure; do not substitute an actual-recording claim. Confirm founder attribution and the exact supplied contact/pins.
- Keep the site labelled as a private preview and `noindex` while it is a concept. Set public indexability intentionally only when the final production content and launch decision are ready.

Source review: initial local HUBB `video_review` rules/reference and V5 briefs, plus current owner-supplied V2 decisions and contact/location references; pricing observations and their freshness limits are recorded with primary retailer links in `../PRICING.md`. No additional manufacturer certification, competitor image licence or live merchant account was verified in this review.

All draft Arabic remains **Draft pending Saudi copywriter validation**.
