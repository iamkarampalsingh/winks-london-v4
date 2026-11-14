/**
 * Declarative scroll animations. Markup opts in with data attributes:
 *   data-split         line-by-line masked text reveal
 *   data-fade          fade + rise            (data-delay="0.2")
 *   data-stagger       children fade + rise in sequence
 *   data-img-reveal    clip-path image unveil (up | down | left | right)
 *   data-parallax      inner image parallax
 *   data-speed         element drift on scroll
 *   data-scale-scroll  full-bleed image settles from 1.2 → 1 as it enters
 *   data-zoom-in       hero image entrance
 *   data-rule          hairline draws in
 * All text lives in the HTML; nothing here is required to read the page.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { reduced } from './scroll';

gsap.registerPlugin(ScrollTrigger, SplitText);

const all = <T extends HTMLElement = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);
const delayOf = (el: HTMLElement) => parseFloat(el.dataset.delay || '0');

const CLIP_FROM: Record<string, string> = {
  up: 'inset(100% 0% 0% 0%)',
  down: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 0% 0% 100%)',
  right: 'inset(0% 100% 0% 0%)',
};

export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      header.classList.toggle('is-scrolled', y > 40);
      if (document.documentElement.classList.contains('menu-open')) return;
      header.classList.toggle('is-hidden', self.direction === 1 && y > 320);
    },
  });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
}

export function initReveals() {
  if (reduced) return;

  // ── Text: split into lines at the moment of reveal, restore afterwards
  //    so the heading reflows naturally on resize.
  all('[data-split]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
        gsap.set(el, { visibility: 'visible' });
        gsap.from(split.lines, {
          yPercent: 118,
          duration: 1.2,
          ease: 'power4.out',
          stagger: 0.095,
          delay: delayOf(el),
          onComplete: () => split.revert(),
        });
      },
    });
  });

  all('[data-fade]').forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 0, y: 26 }, {
      autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: delayOf(el),
      scrollTrigger: { trigger: el, start: 'top 93%', once: true },
    });
  });

  all('[data-stagger]').forEach((el) => {
    gsap.fromTo(el.children, { autoAlpha: 0, y: 30 }, {
      autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.11, delay: delayOf(el),
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  all('[data-rule]').forEach((el) => {
    gsap.fromTo(el, { scaleX: 0 }, {
      scaleX: 1, duration: 1.4, ease: 'power3.inOut',
      scrollTrigger: { trigger: el, start: 'top 95%', once: true },
    });
  });

  // ── Images
  all('[data-img-reveal]').forEach((el) => {
    const img = el.querySelector('img');
    const from = CLIP_FROM[el.dataset.imgReveal || 'up'] ?? CLIP_FROM.up;
    const tl = gsap.timeline({ delay: delayOf(el), scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    tl.fromTo(el, { clipPath: from, visibility: 'visible' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power4.inOut' }, 0)
      .fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.9, ease: 'power3.out' }, 0);
  });

  all('[data-parallax]').forEach((el) => {
    const inner = el.querySelector('.img-reveal__inner') ?? el.firstElementChild;
    gsap.fromTo(inner, { yPercent: -7 }, {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  all('[data-speed]').forEach((el) => {
    const s = parseFloat(el.dataset.speed || '0.5');
    gsap.fromTo(el, { y: 90 * s }, {
      y: -90 * s, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  all('[data-scale-scroll]').forEach((el) => {
    gsap.fromTo(el.querySelector('img'), { scale: 1.22, yPercent: -6 }, {
      scale: 1, yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  });

  // ── Hero: entrance zoom, then a gentle exit as the next chapter arrives
  all('[data-zoom-in]').forEach((el) => {
    gsap.fromTo(el, { scale: 1.28 }, { scale: 1, duration: 2.6, ease: 'power3.out' });
  });
  all('[data-hero]').forEach((hero) => {
    const media = hero.querySelector('[data-hero-media]');
    const content = hero.querySelector('[data-hero-content]');
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    if (media) gsap.to(media, { yPercent: 16, ease: 'none', scrollTrigger: st });
    if (content) gsap.to(content, { yPercent: -12, autoAlpha: 0, ease: 'none', scrollTrigger: { ...st, end: '75% top' } });
  });

  // ── Footer: content rises from beneath the closing section
  const footer = document.querySelector<HTMLElement>('[data-footer]');
  const footerInner = footer?.querySelector('[data-footer-inner]');
  if (footer && footerInner) {
    gsap.fromTo(footerInner, { yPercent: -22, opacity: 0.25 }, {
      yPercent: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: footer, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
    gsap.fromTo(footer.querySelector('.footer__mark span'), { yPercent: 60 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: footer, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }
}
