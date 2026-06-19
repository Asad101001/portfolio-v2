// js/projects.js
import './app.js';
import './modules/loader.js';
import './modules/animations.js';
import './modules/ui.js';
import './modules/theme.js';

// Lazy load GSAP animations after the page has fully loaded to keep project subpages performant
window.addEventListener('load', () => {
  setTimeout(() => {
    import('./modules/gsap-animations.js').catch(err => {
      console.error('GSAP dynamic import failed on project page:', err);
    });
  }, 100);
});

