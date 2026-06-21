/* ══════════════════════════════════════════════════════════
   js/modules/lenis-setup.js
   Initializes Lenis for smooth scrolling and connects it to GSAP.
   ══════════════════════════════════════════════════════════ */
import Lenis from 'lenis';

export function initLenis() {
    // Initialize Lenis with optimal settings for premium feel
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom ease out
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Synchronize Lenis with GSAP ScrollTrigger if GSAP is available globally
    if (window.ScrollTrigger) {
        lenis.on('scroll', window.ScrollTrigger.update);

        window.gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        window.gsap.ticker.lagSmoothing(0);
    } else {
        // Fallback requestAnimationFrame loop if GSAP isn't loaded yet
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // Expose lenis to window for other scripts (like navigation) to use
    window.lenis = lenis;

    console.log('Lenis smooth scrolling initialized.');
}

// Call on load
initLenis();
