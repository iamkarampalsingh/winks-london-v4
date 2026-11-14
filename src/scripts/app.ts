/** Site entry point — boots scrolling, navigation, transitions and animations. */
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initScroll } from './scroll';
import { initNavigation } from './navigation';
import { initTransitions, playEntrance } from './transitions';
import { initHeader, initReveals } from './animations';
import { initCollection } from './collection';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function boot() {
  initScroll();
  initNavigation();
  initTransitions();
  initHeader();

  // Measure only once the web fonts are in (bounded so a slow font never blocks the page).
  await Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(1500)]);

  initCollection(); // pinned section first, so everything below it measures correctly
  playEntrance(() => {
    initReveals();
    ScrollTrigger.refresh();
  });

  // Late-loading images can change layout: re-measure.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
