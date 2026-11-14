/**
 * Central business information.
 *
 * IMPORTANT: nothing here is invented. Empty strings render as clearly marked
 * placeholders on the site ("to be confirmed"). Fill these in with the real
 * details and the whole site — footer, contact page, menu, schema — updates.
 */
export const site = {
  name: 'WINKS London',
  tagline: 'The Art of Seductive Touch',
  description: 'A premium outcall massage provider serving Central London.',
  region: 'Central London, United Kingdom',
  contact: {
    phone: '', // e.g. '+44 20 0000 0000'
    email: '', // e.g. 'bookings@your-domain.co.uk'
    whatsapp: '', // full https://wa.me/… link
    hours: '1PM – 2AM', // from winkslondon.co.uk/collection
  },
  /** Add real profiles only: { label: 'Instagram', href: 'https://…' } */
  social: [] as { label: string; href: string }[],
};

export const placeholder = (label: string) => `${label} — to be confirmed`;
