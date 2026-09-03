/* ══════════════════════════════════════════════════════════
   js/modules/lenis-setup.js
   Lenis smooth scroll — Ultra-buttery momentum & seamless anchor sync
   ══════════════════════════════════════════════════════════ */
import Lenis from 'lenis';

let lenisInstance = null;

export function initLenis() {
    if (lenisInstance) return lenisInstance;

    // Detect touch and mobile devices to give 100% native momentum scrolling with zero overhead
    const isMobileOrTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0) || window.innerWidth <= 1024;
    if (isMobileOrTouch) {
        document.documentElement.classList.remove('lenis');
        document.body.classList.remove('lenis');
        initAnchorLinks();
        return null;
    }

    const lenis = new Lenis({
        duration: 0.8,
        easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 1.8,
        smoothTouch: false,
        infinite: false,
    });

    lenisInstance = lenis;
    window.lenis = lenis;

    // Resize listener: destroy Lenis if resized to mobile/tablet
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 1024 && lenisInstance) {
            lenisInstance.destroy();
            lenisInstance = null;
            window.lenis = null;
            document.documentElement.classList.remove('lenis');
            document.body.classList.remove('lenis');
        }
    }, { passive: true });

    // ── GSAP Ticker or High-Performance rAF Integration ──────────────────────
    const tickerFn = (time) => lenis.raf(time * 1000);

    if (typeof gsap !== 'undefined') {
        gsap.ticker.fps(144);
        gsap.ticker.lagSmoothing(500, 33);
        gsap.ticker.add(tickerFn);
        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
        }
    } else {
        const raf = (time) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    // Connect global anchor link clicking
    initAnchorLinks();

    return lenis;
}

export function smoothScrollTo(target, offset = -30) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        window.lenis.scrollTo(el, {
            offset,
            duration: 1.1,
            easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
        });
    } else {
        const top = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) + offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
}

function initAnchorLinks() {
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        if (!href || href === '#' || href.length <= 1) return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            smoothScrollTo(target, -30);
        }
    });
}

// Expose on window for easy access across modules
window.smoothScrollTo = smoothScrollTo;

initLenis();
