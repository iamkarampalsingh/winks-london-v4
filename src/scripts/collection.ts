/**
 * MASSAGE COLLECTION — one continuous, scroll-driven sequence:
 *   1. An inset image sits inside generous margins.
 *   2. Scrolling pins the section and expands the image to the full viewport.
 *   3. Still pinned, the treatment panels travel right → left, driven
 *      entirely by vertical scroll (no arrows, no carousel).
 *   4. At the end of the track the pin releases into normal scrolling.
 *
 * Everything is transform / clip-path based. Measurements are recalculated
 * whenever the viewport width changes or images/fonts finish loading.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced, isTouch, scrollToTarget } from './scroll';

export function initCollection() {
  const root = document.querySelector<HTMLElement>('[data-mc]');
  if (!root || reduced) return;

  const pin = root.querySelector<HTMLElement>('[data-mc-pin]')!;
  const track = root.querySelector<HTMLElement>('[data-mc-track]')!;
  const frame = root.querySelector<HTMLElement>('[data-mc-frame]')!;
  const frameImg = frame.querySelector('img');
  const titleA = root.querySelector('[data-mc-title-a]');
  const titleB = root.querySelector('[data-mc-title-b]');
  const lead = root.querySelectorAll('[data-mc-lead]');
  const coverCopy = root.querySelector('[data-mc-cover-copy]');
  const panels = gsap.utils.toArray<HTMLElement>('[data-mc-panel]', root);
  const panelImgs = gsap.utils.toArray<HTMLElement>('[data-mc-panel] img', root);
  const progress = root.querySelector<HTMLElement>('[data-mc-progress]');
  const bar = root.querySelector<HTMLElement>('[data-mc-bar]');
  const count = root.querySelector<HTMLElement>('[data-mc-count]');

  let tl: gsap.core.Timeline | null = null;
  let expandPx = 0;
  let distance = 0;
  let lastIndex = -1;

  const setIndex = (i: number) => {
    if (i === lastIndex || !count) return;
    lastIndex = i;
    count.textContent = String(Math.min(panels.length, i + 1)).padStart(2, '0');
    panels.forEach((p, n) => p.classList.toggle('is-active', n === i));
  };

  function build() {
    const prevProgress = tl?.scrollTrigger?.progress ?? 0;
    tl?.scrollTrigger?.kill(true);
    tl?.kill();
    gsap.set([track, frame, frameImg, titleA, titleB, lead, coverCopy, progress, bar, ...panelImgs], { clearProps: 'all' });

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw < 900;
    const cs = getComputedStyle(root!);
    const insetY = cs.getPropertyValue('--mc-inset-y').trim() || '22%';
    const insetX = cs.getPropertyValue('--mc-inset-x').trim() || '30%';

    distance = Math.max(0, track.scrollWidth - vw);
    expandPx = Math.round(vh * (mobile ? 0.75 : 1.05));
    const holdPx = Math.round(vh * 0.12);
    const total = expandPx + holdPx + distance;

    // Timeline time is measured in pixels of scroll, so every stage is exact.
    tl = gsap.timeline({
      defaults: { ease: 'none' },
      // Runs on every rendered frame (including scrub smoothing), so the counter always matches what is on screen.
      onUpdate: () => {
        const x = -(gsap.getProperty(track, 'x') as number);
        let idx = 0;
        panels.forEach((p, n) => { if (p.offsetLeft - x < vw * 0.62) idx = n; });
        setIndex(idx);
      },
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: `+=${total}`,
        pin: true,
        scrub: isTouch ? 0.5 : true,
        anticipatePin: 1,
        refreshPriority: 1,
      },
    });

    // Stage 2 — expansion
    tl.fromTo(frame,
        { clipPath: `inset(${insetY} ${insetX} ${insetY} ${insetX} round 6px)` },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: expandPx, ease: 'power1.inOut' }, 0)
      .fromTo(frameImg, { scale: 1.3 }, { scale: 1, duration: expandPx, ease: 'power1.inOut' }, 0)
      .to(lead, { autoAlpha: 0, y: -24, duration: expandPx * 0.3 }, 0)
      .to(titleA, { xPercent: -14, autoAlpha: 0, duration: expandPx * 0.55, ease: 'power1.in' }, expandPx * 0.3)
      .to(titleB, { xPercent: 14, autoAlpha: 0, duration: expandPx * 0.55, ease: 'power1.in' }, expandPx * 0.3)
      .fromTo(coverCopy, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: expandPx * 0.3, ease: 'power1.out' }, expandPx * 0.72);

    // Stage 3 — horizontal travel (right → left)
    const hStart = expandPx + holdPx;
    tl.to(track, { x: -distance, duration: distance }, hStart)
      .fromTo(panelImgs, { xPercent: 7 }, { xPercent: -7, duration: distance + vw * 0.2 }, hStart - vw * 0.2)
      .fromTo(progress, { autoAlpha: 0 }, { autoAlpha: 1, duration: vw * 0.25 }, hStart + vw * 0.35)
      .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: distance - vw * 0.35 }, hStart + vw * 0.35)
      // Stage 4 — soften the indicator as the section releases
      .to(progress, { autoAlpha: 0, duration: vw * 0.12 }, total - vw * 0.12);

    lastIndex = -1;
    setIndex(0);
    if (prevProgress) tl.scrollTrigger?.refresh();
  }

  build();

  // Rebuild on width changes only (mobile address-bar height changes are ignored).
  let lastW = window.innerWidth;
  let timer: number | undefined;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => { build(); ScrollTrigger.refresh(); }, 180);
  });

  // Keyboard users: focusing a panel scrolls the sequence to it.
  panels.forEach((panel) => {
    panel.addEventListener('focusin', () => {
      const st = tl?.scrollTrigger;
      if (!st) return;
      pin.scrollLeft = 0;
      const holdPx = Math.round(window.innerHeight * 0.12);
      const x = Math.min(distance, Math.max(0, panel.offsetLeft - (window.innerWidth - panel.offsetWidth) / 2));
      scrollToTarget(Math.round(st.start + expandPx + holdPx + x));
    });
  });
}
