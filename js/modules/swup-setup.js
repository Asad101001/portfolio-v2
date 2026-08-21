/* ══════════════════════════════════════════════════════════
   js/modules/swup-setup.js
   Initializes Swup for SPA-like seamless page transitions.
   ══════════════════════════════════════════════════════════ */
import Swup from 'swup';

export function initSwup() {
    const swup = new Swup({
        containers: ['#main-content'], // Target the main wrapper
        animationSelector: '[class*="transition-"]',
        linkSelector: 'a[href^="/"]:not([href*="demo.html"]):not([href*="projects/"]):not([target="_blank"]):not([data-no-swup])',
        ignoreVisit: (url, { el }) => {
            if (url && (url.includes('demo.html') || url.includes('projects/'))) return true;
            if (el && (el.getAttribute('target') === '_blank' || el.hasAttribute('data-no-swup'))) return true;
            return false;
        }
    });

    // Handle re-initializing scripts after page transition
    swup.hooks.on('page:view', () => {
        // Re-init modules if necessary
        console.log('Swup navigated to a new page!');
        
        // Ensure Lenis scrolls to top smoothly
        if (window.lenis) {
            window.lenis.scrollTo(0, { immediate: true });
        }
        
        // Optional: Re-trigger lazy load GSAP or UI hooks
        if (window.initGSAPAnimations) {
            window.initGSAPAnimations();
        }
    });

    window.swup = swup;
}

// Call on load
initSwup();
