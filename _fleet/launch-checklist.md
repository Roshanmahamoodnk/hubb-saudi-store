# HUBB store — operational launch checklist

Review date: 6 September 2026. This file records concrete implementation and operating dependencies. It is not legal advice or a certification of readiness. The present site is a working storefront concept; pricing, designs and Arabic copy remain proposed. The owner has described the business as a Saudi manufacturer.

## Review scope and result

Read current `index.html`, `catalog.js`, `commerce.js`, `PRICING.md` and the product source briefs. The root agent is still developing the main application and styling, so this review does not claim final browser QA, final asset completeness or a live order test.

**Content and arithmetic pass:** Four flavours are Classic Sea Salt, Garlic Salt, Pepper Lime and Fire Salt. All catalog formats use 30 g per sachet. Cup: 5 × 30 = 150 g, one flavour. Family: 20 × 30 = 600 g, five of each flavour. Retail case: 24 × 30 = 720 g, one flavour. The FAQ agrees with the catalog. Product prices are SAR 2.50 / 12 / 39 / 42 for single/cup/family/case. Family pricing is exactly 22% below twenty proposed SAR 2.50 singles.

Arithmetic was checked by importing the current catalog, comparing its records with the source counts/prices and calculating the volume boundaries. This is a data/code review; visual pack counts need their separate image review.

| Format | Count | Net g | Price SAR | SAR per 30 g sachet | Reduction vs same count of SAR 2.50 singles |
|---|---:|---:|---:|---:|---:|
| Single | 1 | 30 | 2.50 | 2.50 | 0% |
| Journey Cup | 5 | 150 | 12.00 | 2.40 | 4% |
| Family Mix | 20 | 600 | 39.00 | 1.95 | 22% |
| Retail case | 24 | 720 | 42.00 | 1.75 | 30% |

## Findings to resolve in the preview

| Finding | Current evidence | Action / acceptance check |
|---|---|---|
| Bulk helper has no SAR 42 base tier. | `bulkUnitPrice` returns 40 for all values below 12; the input currently starts at four cases, so normal UI use stays within its intended range. | Either enforce finite whole-case input of at least four at every call boundary, or define the helper's 1–3 case result as 42. Reject empty, negative, fractional and non-finite values rather than producing an apparently valid quote. |
| Volume break creates a lower total at 24 cases. | 23 × 38 = SAR 874; 24 × 36 = SAR 864. | At 23, show an explicit optional suggestion: “Add 1 case and save SAR 10 overall.” Preserve the chosen quantity until the user changes it. Do not silently round to 24, apply a fictitious extra discount, or calculate from rounded per-sachet values. |
| Family Mix appears in a control called “Flavour”. | Current `commerce.js` maps all five products into `hc-flavours`, including Family Mix. | Change the legend to “Choose a product”, or keep four flavour buttons with a separate mixed-pack option. Family Mix is not a fifth flavour. |
| Selected format does not change the main product image. | Current `commerce.js` uses `product.image` for sachet, cup and retail-case selections. | Map imagery to the selected sold format when available. Until then, visibly label the image as flavour artwork and keep exact format/count adjacent. The final live PDP should show the exact purchasable outer pack. |
| Shell-bag inclusion needs to be stated at the cup detail. | Source confirms one separate shell bag for the cup; index FAQ counts only sachets. | Include the cup accessory in the detail explanation, without promising four family shell bags while that component is still proposed. |
| Manufacturer copy is broader in the announcement than the About statement. | “From our Saudi factory” appears in the announcement; the owner statement supplied to this review is “Saudi manufacturer”. | The About wording matches the assertion. If factory ownership has not been explicitly established, “A Saudi manufacturer, for your gathering” is the narrower announcement. This is a wording precision issue, not a demand for an approval gate. |

No official “Saudi Made” programme badge, membership number or certification logo appears in the reviewed `index.html`/catalog. Plain textual manufacturer positioning based on the owner's statement does not itself establish programme membership, a certified mark licence, seed-growing origin or a specific factory address. Keep those distinct in future content entry. This observation does not replace image-level logo inspection.

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
| Product master | Frontend concept catalog; four flavours and counts established. | Assign stable product and variant IDs for each single-flavour sachet, cup and case, plus Family Mix; enter approved ingredients, allergens, nutrition, storage, shelf life, net weights and final product label assets. | Operations signs off one export of the live catalog; each page matches the final pack record. |
| Packaging/stock units | Source architecture uses sealed sachets inside cups/buckets/cases. | Confirm whether inventory is tracked as finished outer SKUs or assembled from sachets. Define pack-assembly/BOM deductions, including 5 of each flavour for Family Mix and any confirmed accessories. | One simulated family order deducts exactly the chosen finished unit or the correct twenty component sachets; no double deduction. |
| Pricing and economics | SAR 2.50 / 12 / 39 / 42 and bulk 40 / 38 / 36 are proposals. | Enter actual production, packaging, channel, fulfilment and tax costs. Approve retail and trade price lists, effective dates and discount rules. | Owner-approved price version with contribution calculation and an expiry/review date for trade quotes. |
| Commerce platform/order service | Local cart and preview-only checkout. | Choose and configure the commerce backend; connect product IDs, server-authoritative price validation, order creation, inventory reservation and customer lookup. Keep credentials out of the browser. | A staging order has a backend order ID, correct server-calculated lines and an auditable state history. Altering a browser price cannot change the charged amount. |
| Payment | No payment collected. | Connect the merchant's chosen payment provider, approved methods and verified server callbacks. Handle successful, failed, abandoned, duplicate and delayed results. | Provider test transactions reconcile with orders; duplicate callbacks do not create duplicate payment/order records. Successful payment alone does not bypass inventory validation. |
| Order states | Preview success is correctly labelled as preview. | Define pending-payment, paid, cancelled, allocated, packed, shipped, delivered and refunded/part-refunded states as appropriate to the chosen service. | Each state can be reached and traced in staging; support can find the order and its actual payment/fulfilment state. |
| Inventory/availability | No real inventory source established. | Connect stock levels, reserve/release behaviour, channel allocation, expiry/batch handling and out-of-stock UI. | Concurrent orders cannot sell the same last unit twice; cancellation releases stock; expired/unavailable lots cannot be dispatched. |
| Shipping and address capture | Preview form collects name, Saudi mobile, city, postcode and district/street without sending or saving them. | Choose dispatch locations/carrier service; confirm destination coverage, rate rules, address fields, parcel mass/dimensions and tracking events. Capture the fields that the actual carrier requires. | Rates and unsupported destinations work in staging; a carrier test label has the correct recipient/parcel data; tracking updates reach the order. |
| Tax and invoice data | Preview has no final tax split. | Operations/accounting configures the seller's tax basis, customer invoice fields and invoice provider/output for the chosen platform. | Test orders reconcile product subtotal, discount, tax, freight and final total; invoices use the correct seller data and references. |
| Customer support | No verified contact or service desk supplied. | Set a monitored brand contact and support inbox/service desk; define owners for delivery issues, wrong items, damaged packs, cancellations and refunds. | A test customer enquiry reaches the responsible operator and can be linked to an order. |
| Delivery, cancellation and returns copy | Informational preview copy only. | Have operations supply actual procedures, timelines, destinations and exceptions; publish final policy content after the relevant business review. | The published text matches fulfilment/support procedures and the checkout confirmation; no invented delivery promise remains. |
| Bulk sales | Downloadable draft enquiry; no automatic send. | Define sales destination, responsible owner, required business/contact/delivery fields, approval workflow, MOQ, quote validity and capacity check. Optionally retain the draft download as a customer convenience. | A test enquiry produces a traceable sales record and acknowledgement only after successful receipt; final quote records taxes/freight, approved price, quantities and validity. |
| Reviews | No verified-purchase reviews; concept feedback flow. | Connect actual review storage/moderation if desired. Require a real order association for verified-purchase badges; secure permission to display submitted content. | Seed-free empty state is correct. A test review is moderated and displayed with its true status; deleting it removes the public record. |
| Creator content | AI concept scenes explicitly labelled; no genuine customer post claim. | Establish a submission destination, usage permission record, original file capture and release/moderation workflow before publishing real creator assets. | Every displayed customer/creator asset maps to a permission record; generated scenes retain honest editorial labelling. |
| Privacy/forms | Checkout states no data is sent or saved; cart persists locally. | Inventory the real services and data flows when integrations are added. Replace preview descriptions with accurate collection, retention, consent and contact behaviour reviewed for the operating setup. | Browser/network inspection agrees with published descriptions; rejected form requests do not show a success receipt. |
| Arabic/English | Bilingual draft UI. | Saudi specialist validates final consumer Arabic and wordmark; localise dynamic errors, metadata, email/SMS, invoice and order-state messaging. | End-to-end checkout, support and refund messages are readable in both languages; RTL controls and embedded Latin/SAR data remain clear. |
| Domain/hosting | Local custom front end; noindex preview. | Configure production host/domain, secure backend environment values, HTTPS, backups, deployment rollback and separate staging/live services. | Production health check passes; rollback works; private credentials cannot be downloaded from public files. |
| Monitoring and handover | No live operating workflow established. | Assign owners for payment errors, failed orders, low stock, quote enquiries and shipping exceptions. Set useful alerts and record operating procedures. | Trigger one representative test failure and verify the operator receives the correct actionable alert with order reference. |

## Final release verification

- Verify every asset referenced by the finished pages loads and shows the correct new SKU system; exact pack counts take precedence over visual abundance.
- Complete mobile/desktop Arabic and English navigation, search, format selection, quantity, add/remove, persistence and checkout tests. Check focus, keyboard operation, readable text and reduced-motion behaviour.
- Test retail cart totals using several formats together; compare UI and server totals after discounts/tax/shipping are configured. Test bulk 4/11/12/23/24/25 separately and verify the saved quote uses the visible quantity/rate.
- Place and cancel/refund representative staging orders through the real connected services. Record confirmation, stock movement, payment reconciliation and operator visibility rather than treating a click as completion.
- Replace concept price/product details only with approved records. Do not remove the preview notice or enable paid checkout while the operational dependencies above remain unconnected.
- Keep the site labelled as a preview and `noindex` while it is a concept. Set public indexability intentionally only when the final production content and launch decision are ready.

Source review: current local HUBB `video_review` rules/reference and V5 briefs; pricing observations and their freshness limits are recorded with primary retailer links in `../PRICING.md`. No additional manufacturer certification, competitor image licence or live merchant account was verified in this review.

All draft Arabic remains **Draft pending Saudi copywriter validation**.
