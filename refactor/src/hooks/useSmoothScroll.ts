import { useEffect } from 'react';

/**
 * A hook to implement the "buttery" smooth desktop scrolling from the original portfolio.
 * It uses a requestAnimationFrame loop to lerp the scroll position on desktop.
 */
export function useSmoothScroll() {
  useEffect(() => {
    // Check if desktop (matching original window._isMobile check)
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) return;

    let scrollY = window.scrollY;
    let lerpY = window.scrollY;
    const factor = 0.068; // Matching original "sweet spot"

    const onScroll = () => {
      scrollY = window.scrollY;
    };

    const loop = () => {
      const targetY = scrollY;
      const rawLerp = lerpY + (targetY - lerpY) * factor;
      
      // Snap to target if very close to avoid endless sub-pixel calculating
      lerpY = Math.abs(targetY - rawLerp) < 0.1 ? targetY : rawLerp;

      // In the original, window._lerpY was used by other components for parallax.
      // We'll set it globally as well if needed, or use a custom event.
      (window as any)._lerpY = lerpY;
      (window as any)._scrollY = scrollY;

      requestAnimationFrame(loop);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);
}
