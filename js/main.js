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
  const idleLoad = (fn, timeout = 2000) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, { timeout });
    } else {
      setTimeout(fn, 100);
    }
  };

  // Phase 1: Visual, canvas & page transitions
  idleLoad(() => {
    import('./modules/animations.js');
    import('./modules/canvas.js');
    import('./modules/swup-setup.js');
  }, 500);

  // Phase 2: Heavy 3D WebGL & interactive terminal
  idleLoad(() => {
    import('./modules/terminal.js');
    import('./modules/webgl.js');
  }, 1200);

  // Phase 3: Below-fold widgets & external integrations
  idleLoad(() => {
    import('./modules/gsap-animations.js');
    import('./modules/widgets.js');
    import('./modules/twitter.js');
  }, 1800);
});
