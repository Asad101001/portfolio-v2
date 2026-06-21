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


// Lazy load GSAP animations after the page has fully loaded to eliminate render blocking
// and keep the initial bundle size small (improves FCP and TBT on mobile/desktop).
window.addEventListener('load', () => {
  setTimeout(() => {
    import('./modules/gsap-animations.js').catch(err => {
      console.error('GSAP dynamic import failed:', err);
    });
  }, 100);
});
