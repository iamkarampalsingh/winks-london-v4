/**
 * Full-screen navigation.
 * - Separate desktop / mobile layers, chosen by breakpoint at open time.
 * - One GSAP timeline per layer: opening plays it, closing REVERSES it,
 *   so the exit is always the mirror of the entrance.
 * - Scroll lock, focus trap (via `inert`), Escape to close, focus restore.
 */
import gsap from 'gsap';
import { lockScroll, unlockScroll, reduced } from './scroll';

type Layer = { el: HTMLElement; tl: gsap.core.Timeline };

const desktopMq = window.matchMedia('(min-width: 900px)');
let layers: { desktop?: Layer; mobile?: Layer } = {};
let active: Layer | null = null;
let isOpen = false;
let toggle: HTMLButtonElement | null = null;

const HIDDEN = 'inset(0% 0% 100% 0%)';
const SHOWN = 'inset(0% 0% 0% 0%)';

function buildTimeline(el: HTMLElement, kind: 'desktop' | 'mobile') {
  const bg = el.querySelector('[data-menu-bg]');
  const titles = el.querySelectorAll('[data-menu-title]');
  const rules = el.querySelectorAll('[data-menu-rule]');
  const fades = el.querySelectorAll('[data-menu-fade]');
  const media = el.querySelector('[data-menu-media]');
  const mediaInner = el.querySelector('[data-menu-media-inner]');

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });

  if (reduced) {
    tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'none' });
    return tl;
  }

  tl.set(el, { autoAlpha: 1 })
    .fromTo(bg, { clipPath: HIDDEN }, { clipPath: SHOWN, duration: 0.95, ease: 'power4.inOut' }, 0);

  if (kind === 'desktop' && media && mediaInner) {
    tl.fromTo(media, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: SHOWN, duration: 1.15, ease: 'power4.inOut' }, 0.2)
      .fromTo(mediaInner, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0.2);
  }

  const stagger = kind === 'desktop' ? 0.065 : 0.055;
  tl.fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 1, stagger, ease: 'power3.inOut' }, 0.3)
    .fromTo(titles, { yPercent: 115 }, { yPercent: 0, duration: 1, stagger }, 0.45)
    .fromTo(fades, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.03, ease: 'power2.out' }, 0.65);

  return tl;
}

function setInert(on: boolean) {
  document.querySelectorAll<HTMLElement>('main, footer').forEach((n) => {
    if (on) n.setAttribute('inert', '');
    else n.removeAttribute('inert');
  });
}

function trapFocus(e: KeyboardEvent) {
  if (!isOpen || !active || e.key !== 'Tab') return;
  const focusables = [
    ...document.querySelectorAll<HTMLElement>('[data-header] a, [data-header] button'),
    ...active.el.querySelectorAll<HTMLElement>('a[href], button'),
  ].filter((n) => n.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

export function openMenu() {
  if (isOpen) return;
  const layer = desktopMq.matches ? layers.desktop : layers.mobile;
  if (!layer || !toggle) return;
  active = layer;
  isOpen = true;

  layer.el.hidden = false;
  layer.el.scrollTop = 0;
  layer.el.querySelector<HTMLElement>('.mmenu__scroll')?.scrollTo(0, 0);
  lockScroll();
  setInert(true);
  document.documentElement.classList.add('menu-open');
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Close menu');

  layer.tl.timeScale(1).play();
}

export function closeMenu(opts: { instant?: boolean; restoreFocus?: boolean } = {}) {
  if (!isOpen || !active || !toggle) return Promise.resolve();
  const layer = active;
  isOpen = false;
  document.documentElement.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');

  return new Promise<void>((resolve) => {
    const done = () => {
      layer.el.hidden = true;
      setInert(false);
      unlockScroll(); // scroll position is untouched — the page is exactly where it was left
      if (opts.restoreFocus !== false) toggle?.focus({ preventScroll: true });
      if (active === layer) active = null;
      resolve();
    };
    if (opts.instant) {
      layer.tl.pause(0);
      done();
    } else {
      // Mirror of the entrance, slightly quicker.
      layer.tl.eventCallback('onReverseComplete', done);
      layer.tl.timeScale(1.55).reverse();
    }
  });
}

export const menuIsOpen = () => isOpen;

function initImageStage(el: HTMLElement) {
  const images = [...el.querySelectorAll<HTMLElement>('[data-menu-image]')];
  const links = [...el.querySelectorAll<HTMLAnchorElement>('[data-menu-link]')];
  const capNum = el.querySelector('[data-menu-caption-num]');
  const cap = el.querySelector('[data-menu-caption]');
  let current = Math.max(0, images.findIndex((i) => i.classList.contains('is-active')));
  let z = 2;

  const show = (i: number) => {
    if (i === current || !images[i]) return;
    current = i;
    const img = images[i];
    images.forEach((n) => n.classList.toggle('is-active', n === img));
    gsap.set(img, { zIndex: ++z });
    if (reduced) {
      gsap.set(img, { clipPath: SHOWN });
    } else {
      gsap.fromTo(img, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: SHOWN, duration: 0.9, ease: 'power4.inOut', overwrite: true });
      gsap.fromTo(img.querySelector('img'), { scale: 1.25 }, { scale: 1, duration: 1.3, ease: 'power3.out', overwrite: true });
    }
    const link = links[i];
    if (capNum) capNum.textContent = `Chapter ${link.dataset.number}`;
    if (cap) cap.textContent = link.dataset.note ?? '';
  };

  links.forEach((link, i) => {
    link.addEventListener('mouseenter', () => show(i));
    link.addEventListener('focus', () => show(i));
  });

  // Menu imagery is decorative: fetch it once the page is idle so the first open is seamless.
  const warm = () => el.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(warm, { timeout: 3500 });
  else setTimeout(warm, 2500);
}

export function initNavigation() {
  toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const d = document.querySelector<HTMLElement>('[data-menu="desktop"]');
  const m = document.querySelector<HTMLElement>('[data-menu="mobile"]');
  if (!toggle || !d || !m) return;

  layers = {
    desktop: { el: d, tl: buildTimeline(d, 'desktop') },
    mobile: { el: m, tl: buildTimeline(m, 'mobile') },
  };
  initImageStage(d);

  toggle.addEventListener('click', () => (isOpen ? closeMenu() : openMenu()));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      closeMenu();
    }
    trapFocus(e);
  });

  // Crossing the breakpoint with the menu open: close cleanly rather than show the wrong layout.
  desktopMq.addEventListener('change', () => closeMenu({ instant: true }));
}
