/**
 * AREAS WE COVER
 *
 * Only CONFIRMED service areas belong here. The list is intentionally empty
 * until WINKS London confirms exactly which Central London areas it serves —
 * the site never claims coverage the business has not confirmed.
 *
 * Add an entry and it will (1) appear on /areas-we-cover/ and on the homepage,
 * and (2) get its own page at /areas-we-cover/<slug>/ automatically.
 *
 * Example:
 * {
 *   slug: 'mayfair',
 *   name: 'Mayfair',
 *   postcodes: 'W1J, W1K',
 *   intro: 'One or two sentences about visiting clients in this area.',
 * }
 */
export interface Area {
  slug: string;
  name: string;
  postcodes: string;
  intro: string;
}

export const areas: Area[] = [];
