import type { ImageMetadata } from 'astro';
import { images } from './images';

/**
 * MASSAGE COLLECTION — names and pricing taken from
 * https://www.winkslondon.co.uk/collection (retrieved 14 Nov 2026).
 *
 * `price: null` means the source lists the price as "tba" → shown as "Price on request".
 * Single letters in "M E G A" are joined with non-breaking spaces so the name never splits.
 * No descriptions are included: none were supplied, and none are invented.
 * Add `description` to an entry and it will appear on its page automatically.
 * Images are stand-ins assigned in rotation.
 */
export interface PriceOption { minutes: number; price: number | null }
export interface Treatment {
  slug: string;
  number: string;
  name: string;
  options: PriceOption[];
  addOn?: { label: string; price: number | null };
  note?: string;
  description?: string[];
  image: ImageMetadata;
  alt: string;
}

const o = (minutes: number, price: number | null): PriceOption => ({ minutes, price });
const pool = [images.signature, images.relaxation, images.deepTissue, images.fullBody, images.personalised, images.collectionCover, images.introHands, images.space, images.introDetail];

const catalogue: Omit<Treatment, 'number' | 'image' | 'alt'>[] = [
  { slug: 'the-m-e-g-a-winks', name: 'The M\u00A0E\u00A0G\u00A0A WINKS', options: [o(60, 500), o(90, 650), o(120, 945)], addOn: { label: 'ELM', price: 100 } },
  { slug: 'the-double-m-e-g-a-winks', name: 'The DOUBLE M\u00A0E\u00A0G\u00A0A WINKS', options: [o(60, 995), o(90, 1300), o(120, 1770)], addOn: { label: 'ELM', price: 200 } },
  { slug: 'tantra-vip-by-winks', name: 'TANTRA VIP by WINKS', options: [o(60, 995), o(90, 1500), o(120, 1990)], addOn: { label: 'ELM', price: 100 } },
  { slug: 'double-tantra-vip-by-winks', name: 'DOUBLE TANTRA VIP by WINKS', options: [o(60, 2000), o(90, 2900), o(120, 3800)], addOn: { label: 'ELM', price: 200 } },
  { slug: 'the-lovers-winks', name: 'The Lovers WINKS', options: [o(90, 1300), o(120, 1995)] },
  { slug: 'taboo-by-winks', name: 'TABOO by WINKS', options: [o(60, 2650), o(90, 3750), o(120, 4950)], note: 'By invitation only' },
  { slug: 'the-xtreme-winks', name: 'The XTREME WINKS', options: [o(60, null)], addOn: { label: 'XLM', price: null } },
  { slug: 'the-double-xtreme', name: 'The DOUBLE XTREME', options: [o(60, null)], addOn: { label: 'XLM', price: null } },
  { slug: 'the-naughty-winks', name: 'The Naughty WINKS', options: [o(60, 2650), o(90, 3750), o(120, 4950)], addOn: { label: 'ELM', price: null } },
  { slug: 'the-pink-winks', name: 'The PINK WINKS', options: [o(60, 500), o(90, 650), o(120, 885)] },
  { slug: 'the-magik-pink-winks', name: 'The MAGIK PINK WINKS', options: [o(60, 1000), o(90, 1500), o(120, 2100)], addOn: { label: 'ELM', price: null } },
];

export const treatments: Treatment[] = catalogue.map((t, i) => ({
  ...t,
  number: String(i + 1).padStart(2, '0'),
  image: pool[i % pool.length],
  alt: `${t.name} — WINKS London massage collection`,
}));

/** Terms published alongside the price list on the source page. */
export const pricing = {
  hours: { label: '1PM – 2AM', open: 13 * 60, close: 2 * 60 },
  outOfHoursSurcharge: 40, // per cent, "may incur"
  centralLondonTaxi: 50, // £, "may incur"
  notes: [
    'Prices exclude transport; Central London bookings may incur a £50 taxi fare, other areas subject to quote.',
    'Bookings outside business hours (1PM – 2AM) may incur a 40% surcharge.',
    'WINKS London reserves the right to change any indicated price without prior notice.',
  ],
};

export const gbp = (n: number | null) => (n === null ? 'Price on request' : `£${n.toLocaleString('en-GB')}`);
export const priceFrom = (t: Treatment) => {
  const known = t.options.map((x) => x.price).filter((p): p is number => p !== null);
  return known.length ? Math.min(...known) : null;
};
export const fromLabel = (t: Treatment) => { const p = priceFrom(t); return p === null ? 'Price on request' : `From ${gbp(p)}`; };
export const durationLabel = (t: Treatment) => t.options.map((x) => x.minutes).join(' · ') + ' minutes';
export const addOnLabel = (t: Treatment) => (t.addOn ? `${t.addOn.label}: ${t.addOn.price === null ? 'price on request' : `add ${gbp(t.addOn.price)}`}` : '');
export const countWord = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'][treatments.length] ?? String(treatments.length);
