/* ══════════════════════════════════════════════════════════
   js/modules/lenis-setup.js
   Lenis smooth scroll — optimized for 120Hz+ displays
   ══════════════════════════════════════════════════════════ */
import Lenis from 'lenis';

export function initLenis() {
    // Detect if device supports high refresh rate (120Hz+)
    // We use a shorter duration to prevent scroll feeling "floaty" at 120Hz
    const highHz = window.matchMedia('(min-resolution: 120dpi)').matches ||
                   (typeof screen !== 'undefined' && screen.deviceXDPI > 110);

    const lenis = new Lenis({
        // Snappy duration = instantaneous scroll response
        duration: highHz ? 0.4 : 0.48,
        // Responsive easing — quick start, crisp settle
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothTouch: false,   // Native iOS/Android momentum is best
        touchMultiplier: 1.0,
        wheelMultiplier: 1.0,
        infinite: false,
    });

    // ── GSAP Ticker Integration (preferred path) ──────────────────────
    // This is the most important part: Lenis MUST drive via GSAP ticker
    // so both systems share a single rAF and never fight each other.
    const tickerFn = (time) => lenis.raf(time * 1000);

    if (typeof gsap !== 'undefined') {
        // Set GSAP ticker to highest possible fps for 120Hz screens
        gsap.ticker.fps(144); // cap at 144fps; will naturally throttle at display Hz
        gsap.ticker.lagSmoothing(0); // CRITICAL: prevents GSAP from skipping frames
        gsap.ticker.add(tickerFn);

        // Keep ScrollTrigger in sync with Lenis scroll position
        lenis.on('scroll', ScrollTrigger.update);
    } else {
        // Fallback: plain rAF loop when GSAP hasn't loaded yet
        const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
    }

    // Expose for other modules (nav anchor scrolling, etc.)
    window.lenis = lenis;
}

initLenis();
