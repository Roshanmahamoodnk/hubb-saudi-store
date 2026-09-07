# HUBB V4 — Pass the HUBB

Creative and implementation plan · 7 September 2026

**Scope update after owner review:** Keep the exact live-page layout; improve fonts, images and seed animation. The shorter homepage and alternate product-page structure proposed below are not the release direction. Implement the new candid-moment images inside the established arched hero, green story panel and gallery, retain the shopping/About/trade/contact arrangement, and refine the silent scroll ritual. The four-frame gallery is a collection of generated stills, not completed footage. This update governs the earlier proposal below.

**Status: proposed direction. This document does not change the live website.** Occasion choices come from the owner; they are campaign ideas, not research proving what drivers, families or gamers prefer. Four flavours remain fixed. Family Mix combines them and is not a fifth flavour. All Arabic below is draft pending Saudi copywriter validation.

## The idea

HUBB belongs in the small pause that makes the day better: arriving somewhere, finishing a round, staying for another story, making room beside someone. Let a visitor recognise the moment before reading about the product.

**Brand line:** “Pass the HUBB.”

**Arabic direction:** “حُبّ يجمعنا.”

**Category line:** “Saudi-made sunflower seeds. Four flavours to share.”

Keep the cream packaging, Arabic brand mark and four flavour colours. Give each flavour a different place, pace, camera angle and human action. A sense of sharing can come from someone saving a seat or staying a little longer; every photograph need not show someone offering the pack to the camera.

## What the review found

The public Arabic homepage was inspected at 390 × 844. Its measured height was 16,822 px, approximately 20 phone screens. The moments section occupied 3,777 px, the ritual 2,535 px, the extra gallery 772 px, and About 1,254 px. These are layout measurements, not visitor analytics.

- At widths of 760 px and below, the lifestyle section hides its changing image stage and displays four long static cards. The scroll listener still runs. The phone experience was deliberately simplified too far.
- The seed ritual does animate at this portrait size. Its illustration sticks while the instruction paragraphs flow separately, creating inconsistent timing and potential overlap. Reduced-motion and short landscape screens intentionally receive a static guide.
- The football and car images share a carefully lit, posed presentation. In the football frame, the large bucket dominates three people looking towards the product; the car frame centres a seated person displaying a cup. Those choices contribute to the advertisement-like feeling. This is visual judgement, not a detector score.
- The homepage repeats the same ideas across moments, another gallery, About, reviews and partnerships. The live FAQ also retains an outdated reference to a wholesale “calculator”; replace it with the current volume-enquiry language during the copy pass.

Relevant implementation: `motion.css:3`, `motion.js:45`, `scenes.js`, `crack-scroll.css:30–35`, `crack-scroll.js:32–57`, `index.html`.

## Four flavours, four beats each

These are short shot sequences, not four compulsory full-screen sections per flavour. The homepage shows one concise moment from each world. The product page or campaign film can explore all four beats.

| World | Customer-facing line | Four visual beats | Product role |
|---|---|---|---|
| **Classic Sea Salt · the journey** | **Good company for the road.** | **Pack:** a blue cup joins the trip bag in Riyadh. **Pause:** arrive at a real rest stop; the driver is parked before opening a sachet. **Enjoy:** a close, ordinary moment with the opened sachet and separate shell bag. **Arrive:** the same travellers meet their people in Dammam. | Journey Cup, five sealed sachets. One opened, the rest saved for later. |
| **Fire Salt · gaming** | **One more round.** | **Play:** a close view of a controller and a focused player. **Break:** the controller is put down between rounds. **Enjoy:** a red sachet opens beside the cup; a brief amused reaction to a friend. **Return:** the players lean back towards the game. | Fire Salt cup; show the red sachet in use, with food and shells away from the controller. |
| **Pepper Lime · family visits** | **Stay a little longer.** | **Arrive:** someone makes room on the sofa. **Choose:** an adult daughter or son opens a green sachet. **Listen:** an older family member continues a story; the listener stays. **Belong:** a wider frame reveals the small gathering, the cup now incidental. | Pepper Lime cup; warm family connection without a posed banquet. |
| **Garlic Salt · TV evenings** | **The best seat is together.** | **Settle:** the remote lands on the sofa arm. **Open:** a saffron-coloured sachet is torn open. **React:** two adults react to the same unseen scene. **Stay:** the frame widens to an ordinary evening together. | Garlic Salt cup; recognisable entertainment setting, no invented show or celebrity endorsement. |
| **Family Mix · sharing** | **Everyone has a favourite.** | **Gather:** a family or amateur football group settles into a break. **Open:** one family pack opens, showing four colours. **Choose:** different people take different sealed sachets. **Continue:** conversation or the match carries on; the pack stays in the middle. | 20 sachets, five per flavour. Use football at half-time and family at home as two edits of the same sharing idea. |

For Classic, Riyadh → Dammam is a proposed campaign journey, not a claim that footage has been shot there. Scout the actual locations before production. Do not substitute an arbitrary mountain desert scene or invented highway signs. A simple route motif can label the two cities without pretending to be a navigation map or promising journey times.

Keep a quieter individual moment in the road and gaming sequences. Add the office break as a later short cut-down, rather than a sixth homepage chapter. Cast a credible range of Saudi adults, including older family members and working people; let everyday behaviour carry the local identity.

## The shorter website

**Proposed homepage order:** invitation → four flavour moments → the seed ritual → choose the pack → a little about us → feedback and business links.

1. **Invitation — roughly one phone screen.** One recognisable human frame or a short silent montage, “Pass the HUBB”, the category line, and “Choose your flavour”. Shopping is accessible immediately.
2. **Four flavour moments — roughly four screens total.** A vertically flowing sequence: road, gaming, family, TV. Each has a portrait image or brief clip, a 3–6 word headline, one supporting line, the flavour name and one shopping action. A thumb scroll reveals the next moment; no tap-to-start sequence or mandatory sideways carousel.
3. **The ritual — roughly 1.5 screens of content.** “Crack. Enjoy. Shells away.” One compact picture and matching caption move together: natural edge opening → kernel revealed → empty husks collected in the separate paper bag. Include a clear “Eat the kernel. Discard the husk.” line. Keep it silent.
4. **Choose the pack — roughly 1.5 screens.** Family Mix leads the sharing option. Cup / Family Mix / 24-piece carton are immediately distinguishable. Quantity, weight, relevant price, minimum order and delivery information remain readable at the decision point.
5. **The close — roughly one screen.** A genuine factory detail when available; “Two years of care. For your everyday moment.” One optional About link, one invitation to share an honest experience, one business-contact route. Detailed maps, FAQs and supply forms stay accessible through clear links or disclosure sections.

**Layout target:** about 9–10 screens at 390 × 844 with disclosures closed, measured again after implementation. This is a design budget, not a proven conversion optimum. Do not force users to finish a film or story before shopping.

Remove the duplicate “more moments” gallery and repeated R&D paragraphs. Keep the complete founder story in About. Keep wholesale offers, delivery and distribution behind a prominent “For your business” link; do not reintroduce public volume price tiers.

## Words that earn their place

Use one headline, one short line and one action per scene. Aim for 12–18 supporting words, with a separate concise product-facts line. Do not turn alt text, disclosures, ingredients, delivery conditions or essential purchase information into decorative unreadable text.

| Location | Proposed English | Arabic direction — draft |
|---|---|---|
| Hero | Pass the HUBB. | حُبّ يجمعنا. |
| Road | Good company for the road. | للمشوار رفيق. |
| Gaming | One more round. | باقي جولة. |
| Family | Stay a little longer. | خلك معنا شوي. |
| TV | The best seat is together. | الجلسة تحلى معكم. |
| Sharing | Everyone has a favourite. | كل واحد له نكهته. |
| Feedback | Which flavour stayed with you? | أي نكهة رجعت لها؟ |

Occasion copy suggests a moment; it does not claim “Saudi drivers prefer Classic” or that every family loves Pepper Lime. Keep product naming explicit so creative lines remain understandable. Scannable headings and concise copy follow the reading behaviours described in [NN/g's research](https://www.nngroup.com/articles/how-people-read-online/); the particular word and screen budgets above are HUBB design proposals.

## Make the imagery believable

**Recommended production route: real people, real locations and physical HUBB packs.** Shoot the moment between actions: an unfinished smile, someone listening, a controller being set down, the quiet after a car door opens. Capture several takes and select the least performed one. Use actual ambient light, ordinary rooms and natural skin and fabric texture. Vary shot size and viewpoint across worlds.

Start with one small Classic pilot before producing the entire set. Keep the same adult travellers, clothing, car, cup and sachet throughout its four beats. Record actual packing and seed handling, including the side seam, kernel separation and empty-shell disposal. Check the product scale against a real hand and a measured physical pack.

**Initial asset package:** five short films of approximately 6–10 seconds, four usable frames from each sequence, one separate macro seed ritual, and clear pack photographs for the shopping selector. Capture portrait first and a wider companion angle where useful. Deliver silent web edits with a strong still poster, plus vertical social edits. Footage, not forced parallax on a still face, should provide human movement.

If physical packs or a real shoot are not available yet, use generated images as **labelled campaign concepts** for layout and art direction. Use the owned packaging references and one action per shot. Reject distorted seals, invented logo text, inconsistent people, oversized cups, floating fingers, artificial skin, generic geography and implausible kernel/husk handling. A better prompt cannot guarantee footage that viewers mistake for reality; do not call synthetic scenes real UGC or reviews.

Replace concepts with permissioned creator/customer material as it becomes available. Invite creators to show their own occasion and opinion. Avoid scripted testimonials or invented ratings. Location and participant coordination is production work to arrange, not something this plan has already booked.

## Motion that works on a phone

- Keep normal vertical scrolling. Use small image movement and natural transitions when a chapter enters view; never capture scrolling to force a cinematic timeline.
- Keep each product moment compact. Short clips may play muted and inline when visible, then pause offscreen. Preserve the still image if playback is blocked. Do not rely on autoplay to explain the product. [MDN video guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video).
- Rebuild the ritual with its active caption inside the same sticky panel as the seed. Use a short, bounded scroll track. The copy must never slide behind the picture. Match the displayed instruction to the visual phase rather than an unrelated equal division of the page.
- Animate the shell opening from its side edge. Reveal the edible kernel. Send only empty husks into the separate paper bag. Use no fake audio, click-to-crack prompt or hands-free eating implication.
- Use the same content order on desktop and phone. Desktop can use a pinned composition; mobile should retain the story without a hidden image stage.
- For reduced motion, short landscape screens, blocked video and no JavaScript, provide the complete still sequence and concise instructions. [MDN reduced-motion guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- Load the opening still first, defer later media, reserve image dimensions and keep only the visible clip running. Retain controls to pause motion. Test real iOS Safari and Android Chrome before calling the phone experience verified.

## Build order and definition of done

**1 — Mobile structure.** Remove duplicate sections, shorten the narrative, repair the ritual/caption relationship and keep shopping directly reachable. Use existing assets temporarily to prove the layout.

**2 — One complete visual pilot.** Produce the four Classic story beats and the real pack/seed close-ups. Review sequence continuity, material texture, actual pack size and credible location before using the approach for the other worlds.

**3 — Full flavour treatment.** Produce gaming, family, TV and Family Mix sequences. Apply each moment to its existing product page; retain recognisable product names and canonical links. Keep the homepage's compact sequence and deepen exploration on the product pages.

**4 — Copy and purchase clarity.** Apply the short bilingual copy after Saudi review. Preserve five-sachet cups, 20-sachet Family Mix and 24-sachet cartons. No single-piece online sale. Keep the current preview/order boundaries and B2B enquiry route accurate.

**5 — Verify and publish.** Check Arabic and English at 360 × 800, 390 × 844, 430 × 932 and landscape. Verify scroll gestures over media, links and controls; sticky captions at each ritual phase; reduced motion; blocked autoplay; rotation; image loading; and scroll restoration after closing every modal. Verify all product links, format selectors, cart images and GitHub Pages paths. Compare the measured page height with the budget. Publish through the existing GitHub workflow once the implemented revision passes.

Then watch real behaviour: whether people reach a flavour, open its detail, choose a format and return to shop. In this preview, an order draft is not a sale. Use a small qualitative session with Saudi readers to check whether each occasion is understood without paragraphs; do not claim universal preference or conversion uplift from the creative treatment alone.
