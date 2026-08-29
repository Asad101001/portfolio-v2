// js/main.js
// Main entry point: minimal critical code for FCP/LCP, optimized progressive loading

import './app.js';
import './modules/loader.js';
import './modules/theme.js';
import './modules/ui.js';
import './modules/mobile.js';
import './modules/desktop.js';
import './modules/lenis-setup.js'; // Smooth scroll initialized early for zero-delay buttery motion

// Progressive module hydration after initial paint
window.addEventListener('load', () => {
  const isMobile = window.innerWidth <= 768;
  const idleLoad = (fn, timeout = 2500) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, { timeout });
    } else {
      setTimeout(fn, timeout);
    }
  };

  // Phase 1: Core animations — critical for above-fold feel
  idleLoad(() => {
    import('./modules/animations.js');
    import('./modules/swup-setup.js');
  }, isMobile ? 800 : 400);

  // Phase 2: Canvas (desktop only) + GSAP scroll triggers
  idleLoad(() => {
    if (!isMobile) import('./modules/canvas.js');
    import('./modules/gsap-animations.js'); // ScrollTrigger creates many observers — defer until idle
  }, isMobile ? 1800 : 800);

  // Phase 3: Interactive terminal & WebGL (desktop only, very heavy)
  idleLoad(() => {
    import('./modules/terminal.js');
    if (!isMobile) import('./modules/webgl.js');
  }, isMobile ? 3500 : 1600);

  // Phase 4: Below-fold widgets & external integrations (heaviest — load last)
  // widgets.js is 85KB — must not compete with scroll/paint on initial load
  idleLoad(() => {
    import('./modules/widgets.js').then(() => {
      import('./modules/twitter.js');
    });
  }, isMobile ? 5000 : 2500);
});
