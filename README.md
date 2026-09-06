# HUBB — The Art of the Gathering

A fully built bilingual ecommerce storefront for reviewing HUBB’s Saudi retail and wholesale offer. Arabic first, English toggle, responsive desktop/mobile layouts, original product images and original generated Saudi campaign scenes.

This is an interactive store preview. Live payments, fulfilment, inventory, order acceptance and customer-content submission are not connected. It never collects card details or represents a preview as a confirmed order.

## Open and run

Run `npm start` and open http://127.0.0.1:8788. No package installation or external JavaScript dependencies required. `npm run check` checks module syntax. `npm run build` creates the exact static public output for hosting.

## Included

- Four flavours, three single-flavour formats and one Family Mix.
- Product detail panels, contents information, format and quantity selection.
- Arabic/English product search, zero-result state, persistent validated local cart.
- Saudi contact/address validation and no-payment order preview; no personal data persistence.
- Wholesale calculator, volume-price tiers, explicit 23-to-24-case saving and downloadable draft quote request.
- Original SKU pack art and three clearly labelled generated lifestyle scenes with shoppable concept dialogs.
- Honest empty verified-review state and a nonpublishing feedback preview.
- FAQ, packing/eating guidance, provisional delivery/terms, creator direction.
- Native keyboard-accessible modal dialogs, reduced-motion support, responsive grids.

## Proposed price architecture

| Format | Count | Net contents | Proposed SAR |
|---|---:|---:|---:|
| Single sachet | 1 | 30 g | 2.50 |
| Journey Cup | 5 | 150 g | 12.00 |
| Family Mix | 20 (5 of each flavour) | 600 g | 39.00 |
| Retail case | 24 same-flavour | 720 g | 42.00 |

Wholesale all-units case estimates: 4–11 cases SAR40, 12–23 SAR38, 24+ SAR36. These prices are proposals, not verified unit economics. Tax, shipping, capacity and terms are unresolved. See PRICING.md for retailer evidence and limitations.

## Content and artwork status

Source of product facts: owner-provided guide https://roshanmahamoodnk.github.io/hubb-companion/video_review/ and current V5 local briefs. Current four flavours are Classic Sea Salt, Garlic Salt, Pepper Lime and Fire Salt. They supersede older concepts in memory. Saudi manufacturer wording comes from the owner’s statement; no certification, crop-origin or retailer-partnership claim is made.

Arabic copy is draft pending a qualified Saudi copywriter’s review. AI product renders are design concepts; authoritative type-set page facts take precedence over generated small-print. No third-party Howcast footage or other brands’ SKU imagery is used. Original supplied HUBB family/cup reference images support contents explanations. Image prompts and provenance are in assets/PROMPTS.md and assets/SKU_PROMPTS.md; original PNGs are preserved.

## Launch dependencies

See _fleet/launch-checklist.md. Approved cost/margin/tax model, ingredients/allergens/nutrition, physical packaging validation, fulfilment, payment provider, sales contact, business terms and real customer review/consent infrastructure are required for sales. Hosting a private preview does not satisfy these launch requirements.
