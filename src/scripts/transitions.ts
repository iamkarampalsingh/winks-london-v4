/**
 * Page entrance + page-to-page transitions.
 * A single "curtain" covers the page while it loads, lifts to reveal it,
 * and rises again from below when an internal link is followed.
 * Real page loads are used (no SPA router), so back/forward, scroll
 * restoration and SEO behave exactly as the browser intends.
 */
import gsap from 'gsap';
import { closeMenu, menuIsOpen } from './navigation';
import { reduced, scrollToTarget } from './scroll';

const html = document.documentElement;

export function playEntrance(onReveal: () => void) {
  const curtain = document.querySelector<HTMLElement>('[data-curtain]');
  const content = curtain?.querySelector<HTMLElement>('[data-curtain-content]');
  const line = curtain?.querySelector<HTMLElement>('[data-curtain-line]');
  const first = html.classList.contains('first-visit');
  try { sessionStorage.setItem('winks-seen', '1'); } catch {}

  const finish = () => {
    html.classList.add('is-ready');
    html.classList.remove('first-visit');
  };

  if (!curtain || reduced) {
    if (curtain) gsap.to(curtain, { autoAlpha: 0, duration: 0.3, onComplete: () => gsap.set(curtain, { yPercent: -100, autoAlpha: 1 }) });
    onReveal();
    finish();
    return;
  }

  const tl = gsap.timeline({ onComplete: finish });

  if (first && content && line) {
    // First visit in this session: a short branded introduction.
    const parts = content.querySelectorAll('.wordmark > *');
    tl.set(content, { autoAlpha: 1 })
      .fromTo(parts, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.14, ease: 'power3.out' }, 0.1)
      .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0.2)
      .to(content, { autoAlpha: 0, y: -20, duration: 0.55, ease: 'power2.in' }, '+=0.15');
  }

  tl.add(() => onReveal())
    .to(curtain, { yPercent: -100, duration: first ? 1.15 : 0.85, ease: 'power4.inOut' });
}

function isInternalNav(a: HTMLAnchorElement, e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== '_self') return false;
  if (a.hasAttribute('download') || a.getAttribute('rel')?.includes('external')) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  if (!/^https?:$/.test(url.protocol)) return false;
  return true;
}

export function initTransitions() {
  const curtain = document.querySelector<HTMLElement>('[data-curtain]');
  let leaving = false;

  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || !isInternalNav(a, e)) return;
    const url = new URL(a.href, location.href);
    const samePage = url.pathname.replace(/\/?$/, '/') === location.pathname.replace(/\/?$/, '/') && url.search === location.search;

    // Same page: close the menu if needed, then scroll to the anchor / top.
    if (samePage) {
      e.preventDefault();
      const target = url.hash && url.hash !== '#top' ? document.querySelector<HTMLElement>(url.hash) : null;
      const go = () => {
        scrollToTarget(target ?? 0);
        if (target) {
          if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      };
      if (menuIsOpen()) closeMenu({ restoreFocus: !target }).then(go);
      else go();
      return;
    }

    if (!curtain || reduced) return; // plain navigation
    e.preventDefault();
    if (leaving) return;
    leaving = true;
    html.classList.add('is-leaving');
    gsap.set(curtain, { yPercent: 100, autoAlpha: 1 });
    gsap.set(curtain.querySelector('[data-curtain-content]'), { autoAlpha: 0 });
    gsap.to(curtain, {
      yPercent: 0,
      duration: 0.7,
      ease: 'power4.inOut',
      onComplete: () => { window.location.href = url.href; },
    });
  });

  // Restored from the back/forward cache: make sure nothing is left covering the page.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    html.classList.remove('is-leaving');
    if (menuIsOpen()) closeMenu({ instant: true });
    if (curtain) gsap.set(curtain, { yPercent: -100 });
  });
}
