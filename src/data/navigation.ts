import { images } from './images';

export const navigation = [
  { number: '01', label: 'Home', href: '/', note: 'The art of unwinding', image: images.hero, position: 'center' },
  { number: '02', label: 'About WINKS', href: '/about/', note: 'Our philosophy', image: images.introDetail, position: 'center' },
  { number: '03', label: 'Massage Collection', href: '/massage-collection/', note: 'Experiences & pricing', image: images.collectionCover, position: 'center' },
  { number: '04', label: 'Our Experience', href: '/our-experience/', note: 'Your space, your time', image: images.space, position: 'center' },
  { number: '05', label: 'How It Works', href: '/how-it-works/', note: 'Four simple chapters', image: images.personalised, position: 'center' },
  { number: '06', label: 'Areas We Cover', href: '/areas-we-cover/', note: 'Central London', image: images.london, position: '20% center' },
  { number: '07', label: 'Contact', href: '/contact/', note: 'Arrange your appointment', image: images.introHands, position: 'center' },
];

export const bookingLink = { label: 'Book Your Experience', href: '/contact/' };

export const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions/' },
];
