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
      setTimeout(fn, isMobile ? 300 : 150);
    }
  };

  // Phase 1: Core animations & page transitions
  idleLoad(() => {
    import('./modules/animations.js');
    import('./modules/swup-setup.js');
    if (!isMobile) import('./modules/canvas.js');
  }, isMobile ? 1200 : 600);

  // Phase 2: Interactive terminal & WebGL (desktop only)
  idleLoad(() => {
    import('./modules/terminal.js');
    if (!isMobile) import('./modules/webgl.js');
  }, isMobile ? 2200 : 1400);

  // Phase 3: Below-fold widgets & external integrations
  idleLoad(() => {
    import('./modules/gsap-animations.js');
    import('./modules/widgets.js');
    import('./modules/twitter.js');
  }, isMobile ? 3000 : 2000);
});
