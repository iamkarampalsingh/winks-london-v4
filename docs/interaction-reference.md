# Interaction reference — sobha-privy-collection.com → WINKS London

How the reference was studied: the live page markup, section order, class/plugin names and
data attributes were read directly from the served HTML (not screenshots). The sandbox used
for the build has no interactive browser session on the reference, so timing/easing values
below are interpretations of that structure rather than frame-by-frame measurements.
No reference images, copy, logo, video or code are used anywhere in this project.

| # | Reference behaviour (observed in markup) | WINKS London implementation |
|---|---|---|
| 1 | **Preloader** — dark full-screen layer with the brand mark, removed with a fade/slide (`preloaderIntro`, `fade-out`). | `curtain` in `BaseLayout.astro` + `scripts/transitions.ts`. First visit per session: wordmark, tagline and a gold progress line, then the curtain lifts. Later pages: curtain lift only. |
| 2 | **Header** — minimal, transparent, sticky; hides on scroll (`hideHeader`), slides in from top; "Menu" label swaps to "Close" in the same position. | `Header.astro`. Logo left, discreet "Book" + Menu trigger right (as briefed). Label rolls Menu → Close, icon morphs to a cross, header hides on scroll down / returns on scroll up. |
| 3 | **Menu** — full-screen modal *under* the header (`modal--full modal--under-header`), dark, background media, ordered list of "Chapter N" + large serif title, one highlighted feature link. | `DesktopMenu.astro` / `MobileMenu.astro` + `scripts/navigation.ts`. Chapter numbers 01–07, large serif titles, image stage that changes per chapter, prominent "Book Your Experience". |
| 4 | **Menu open / close** — background wipes in, items stagger; closing is the same sequence reversed. | One GSAP timeline per layer: background clip-wipe → image stage unveil + settle → hairlines draw → titles rise through masks (stagger) → secondary items fade. Close = `timeline.reverse()` at 1.55×. Escape closes, focus is trapped and restored, page scroll is locked and the scroll position preserved. |
| 5 | **Mobile menu** — same modal, static image instead of video, same chapter list. | Dedicated layout: stacked chapters with 52px+ touch rows, arrows, faint photographic backdrop, pinned booking button, safe-area padding, internal scroll with `overscroll-behavior: contain`. |
| 6 | **Hero** — full-height sticky layer, cover media, small italic line + large title (`data-reveal="subtitle"`, `"title"`), zoom-in media reveal, scroll arrow; next section slides over it (`sticky--under-next`, parallax `sectionOutTiny`). | Home hero + `PageHero.astro`: image settles from 1.28 → 1, italic pre-line + display title revealed line-by-line, scroll cue; on scroll the image drifts and the copy fades as the next chapter arrives. |
| 7 | **Text reveals** — `maskText` / `reveal` groups with delays. | `data-split` (GSAP SplitText, masked lines), `data-fade`, `data-stagger`, `data-rule`. |
| 8 | **Image treatments** — cover images, asymmetrical small/large pairs, parallax plugin on most media. | `ImageReveal.astro`: clip-path unveil in four directions, inner scale settle, scrubbed parallax; overlapping small/large compositions; outlined numerals drifting at a different speed. |
| 9 | **Tenets section** — `l-tenets-sticky` full-height sticky layer, then `stickySlider` (`sticky-slider--full-screen`, enabled `md-up`): an intro card whose media scales up (`landingExpansiveCardScale`), followed by slider items moved horizontally while the section stays stuck; on small screens the slider is disabled and items stack. | `MassageCollection.astro` + `scripts/collection.ts`: inset image with margins → pinned → clip-path expansion to full viewport (image de-zooms, radius animates to 0) → the whole track, cover included, travels right → left in step with vertical scroll → pin releases. One scrubbed timeline measured in scroll pixels, so the stages are continuous. Mobile keeps the horizontal travel but with a shorter expansion and narrower stacked panels. |
| 10 | **Pinned / sticky storytelling** sections with counters ("1 — 4"). | Progress rail and live "01 / 05" counter during the horizontal sequence. |
| 11 | **Closing section + footer** — full-bleed image section, minimal footer. | `BookingCTA.astro` (image settles as it enters) and a footer whose content rises from beneath the closing section, with an oversized wordmark. |
| 12 | **Page transitions** — Barba.js wrapper with a preloader layer between views. | Curtain rises from below on internal link click, then a real page load (no SPA router), so back/forward and scroll restoration stay native. |
| 13 | **Responsive** — media-query-gated plugins (`enable-mq="md-up"`), separate small-screen media. | Breakpoints at 600 / 900 / 1024px; pinned-sequence measurements recalculated on width change; `svh` units; address-bar resizes ignored. |
| 14 | **No-JS / reduced motion** — `no-js` class swap, content present in HTML. | `html.js` / `html.motion` classes. Without JS or with `prefers-reduced-motion`, all content is visible, the collection becomes a static grid, and the menu simply fades. |

## Deliberate differences
- Logo left / menu right (brief) rather than menu left / logo centre.
- No WebGL, video or custom cursor: kept out for performance and because no brand footage exists yet.
- Multi-page site with real URLs instead of a single anchored page.
