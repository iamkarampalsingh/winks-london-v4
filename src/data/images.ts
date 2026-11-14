/**
 * Single source of truth for photography. Swap a file in src/assets/images
 * (or re-point an alias below) and every page updates.
 */
import hero from '../assets/images/hero.jpg';
import introHands from '../assets/images/intro-hands.jpg';
import introDetail from '../assets/images/intro-detail.jpg';
import collectionCover from '../assets/images/collection-cover.jpg';
import signature from '../assets/images/treatment-signature.jpg';
import relaxation from '../assets/images/treatment-relaxation.jpg';
import deepTissue from '../assets/images/treatment-deep-tissue.jpg';
import fullBody from '../assets/images/treatment-full-body.jpg';
import personalised from '../assets/images/treatment-personalised.jpg';
import space from '../assets/images/experience-space.jpg';

export const images = {
  hero,
  introHands,
  introDetail,
  collectionCover,
  signature,
  relaxation,
  deepTissue,
  fullBody,
  personalised,
  space,
  // Aliases — replace with dedicated photography when available.
  london: hero,
  cta: space,
};
