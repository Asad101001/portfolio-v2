import { useEffect, useRef } from 'react';

/**
 * useMagnetic Hook
 * Uses linear interpolation (LERP) and requestAnimationFrame for high-fidelity 
 * magnetic attraction. Matches original portfolio coefficients (0.18 factor).
 */
export function useMagnetic<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.innerWidth < 768) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let animating = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      currentX = lerp(currentX, targetX, 0.18);
      currentY = lerp(currentY, targetY, 0.18);
      
      el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      if (Math.abs(currentX - targetX) > 0.01 || Math.abs(currentY - targetY) > 0.01) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        animating = false;
        rafId.current = null;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Original factor 0.25 as seen in animations.js
      targetX = (e.clientX - centerX) * 0.25;
      targetY = (e.clientY - centerY) * 0.25;

      if (!animating) {
        animating = true;
        rafId.current = requestAnimationFrame(animate);
      }
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!animating) {
        animating = true;
        rafId.current = requestAnimationFrame(animate);
      }
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return ref;
}
