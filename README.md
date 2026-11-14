# WINKS London — website

Astro 5 · TypeScript · GSAP (ScrollTrigger, SplitText) · Lenis · deployable to Vercel.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build (Vercel adapter)
```

## Before launch — information still needed
Nothing has been invented. These are rendered as clearly marked placeholders until supplied:

| What | Where to add it |
|---|---|
| Telephone, email, opening hours, social links | `src/data/site.ts` |
| Confirmed treatments, durations, rates | `src/data/treatments.ts` |
| Confirmed Central London service areas | `src/data/locations.ts` (each entry also generates `/areas-we-cover/<slug>/`) |
| Live domain | `PUBLIC_SITE_URL` (see `.env.example`) |
| Booking form delivery (Resend or webhook) | `.env` / Vercel env vars (see `.env.example`) |
| Privacy Policy / Terms | `src/pages/privacy-policy.astro`, `terms-and-conditions.astro` — draft templates, need legal review |
| Photography | `src/assets/images/` + `src/data/images.ts` (current images are AI-generated stand-ins) |

## Structure
```
src/
  components/   Header, DesktopMenu, MobileMenu, Footer, PageHero, MassageCollection,
                ImageReveal, TextReveal, Split, Steps, BookingCTA, ContactForm, Pic …
  data/         site, navigation, treatments, locations, steps, images
  layouts/      BaseLayout (SEO, schema, curtain, header, menus, footer)
  pages/        index, about, massage-collection/ (+ [slug]), our-experience, how-it-works,
                areas-we-cover/ (+ [slug]), contact, privacy-policy, terms-and-conditions,
                404, robots.txt, api/booking (serverless)
  scripts/      app (entry), scroll (Lenis), navigation, transitions, animations, collection
  styles/       tokens, typography, animations, navigation, components, home, pages
docs/interaction-reference.md   notes on the reference site and how each pattern was rebuilt
```

## Booking form
`ContactForm.astro` validates in the browser, then posts to `/api/booking`, which validates again
and forwards the request by email (Resend) or webhook. Keys live only on the server.
In local dev with nothing configured, requests are logged to the terminal; in production the
endpoint returns an error until a delivery method is configured. A submission is always
acknowledged as "received — awaiting confirmation", never as a confirmed booking.

## Deploying to Vercel
Import the repository, keep the Astro preset, add the environment variables, deploy.
Astro 5 runs on Node 18.20+/20/22.
