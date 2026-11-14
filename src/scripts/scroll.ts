/**
 * Smooth scrolling (Lenis) wired into GSAP's ticker so ScrollTrigger and
 * Lenis always share one clock. Disabled for reduced-motion users.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
export let lenis: Lenis | null = null;

export function initScroll() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (reduced) return;

  lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 0.9, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** Lock page scroll (menu open) without losing the scroll position. */
export function lockScroll() {
  const html = document.documentElement;
  const sbw = window.innerWidth - html.clientWidth;
  html.style.setProperty('--sbw', `${sbw}px`);
  html.classList.add('is-locked');
  lenis?.stop();
}

export function unlockScroll() {
  const html = document.documentElement;
  html.classList.remove('is-locked');
  html.style.removeProperty('--sbw');
  lenis?.start();
}

export function scrollToTarget(target: string | number | HTMLElement, immediate = false) {
  if (lenis) lenis.scrollTo(target as any, { immediate, duration: 1.4 });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: reduced || immediate ? 'auto' : 'smooth' });
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: reduced || immediate ? 'auto' : 'smooth' });
  }
}
