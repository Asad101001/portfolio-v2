// js/main.js
// Main entry point: minimal critical code for FCP/LCP, lazy-load non-critical features

import './app.js';
import './modules/loader.js';
import './modules/theme.js';
import './modules/ui.js';
import './modules/mobile.js';
import './modules/desktop.js';

// Lazy load non-critical modules after initial render to eliminate main-thread TBT
window.addEventListener('load', () => {
  const idleLoad = (fn, timeout = 2500) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, { timeout });
    } else {
      setTimeout(fn, 150);
    }
  };

  // Phase 1: Visual & canvas effects
  idleLoad(() => {
    import('./modules/animations.js');
    import('./modules/canvas.js');
  }, 1000);

  // Phase 2: Scroll & page transitions
  idleLoad(() => {
    import('./modules/lenis-setup.js');
    import('./modules/swup-setup.js');
  }, 1500);

  // Phase 3: Heavy 3D WebGL & interactive terminal
  idleLoad(() => {
    import('./modules/terminal.js');
    import('./modules/webgl.js');
  }, 2000);

  // Phase 4: Below-fold widgets & external integrations
  idleLoad(() => {
    import('./modules/gsap-animations.js');
    import('./modules/widgets.js');
    import('./modules/twitter.js');
  }, 2500);
});


