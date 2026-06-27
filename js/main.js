// js/main.js
// Main entry point that orchestrates module execution and lazy loads heavy animations

import './app.js';
import './modules/loader.js';
import './modules/canvas.js';
import './modules/animations.js';
import './modules/ui.js';
import './modules/theme.js';
import './modules/mobile.js';
import './modules/desktop.js';
import './modules/terminal.js';
import './modules/webgl.js';
import './modules/lenis-setup.js';
import './modules/swup-setup.js';


// Lazy load heavy non-critical modules after page load
// widgets.js (76KB) and twitter.js (6.8KB) power below-fold content only
// gsap-animations.js is also non-critical for initial paint
window.addEventListener('load', () => {
  // Small delay to let the browser go idle before loading heavy modules
  const idleLoad = (fn) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, { timeout: 2000 });
    } else {
      setTimeout(fn, 200);
    }
  };

  idleLoad(() => {
    import('./modules/gsap-animations.js').catch(err => {
      console.error('GSAP dynamic import failed:', err);
    });
  });

  idleLoad(() => {
    // widgets.js is the heaviest module (~77KB) — powers Spotify, GitHub, Weather, etc.
    // These are all below-fold, so loading them after LCP is safe
    import('./modules/widgets.js').catch(err => {
      console.error('Widgets dynamic import failed:', err);
    });
  });

  idleLoad(() => {
    import('./modules/twitter.js').catch(err => {
      console.error('Twitter dynamic import failed:', err);
    });
  });
});

