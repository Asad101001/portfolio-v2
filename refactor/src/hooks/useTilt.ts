import { useEffect, useRef } from 'react';

/**
 * useTilt Hook
 * Perspective 3D tilt with shadow-casting logic.
 * Derived from original animations.js (tilt factor 4x).
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.innerWidth < 768) return;

    // Add necessary CSS class-like behavior for transition
    el.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    el.style.willChange = 'transform';

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Tilt logic (-4 deg to 4 deg)
      const tiltX = (((y - rect.height / 2) / rect.height) * -4).toFixed(2);
      const tiltY = (((x - rect.width / 2) / rect.width) * 4).toFixed(2);

      // Shadow logic (simulating light from mouse)
      const shX = (((rect.width / 2 - x) / rect.width) * 12).toFixed(2);
      const shY = (((rect.height / 2 - y) / rect.height) * 12).toFixed(2);

      if (rafId.current) cancelAnimationFrame(rafId.current);

      rafId.current = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
        // In React, we use setProperty for CSS variables
        el.style.setProperty('--sh-x', `${shX}px`);
        el.style.setProperty('--sh-y', `${shY}px`);
      });
    };

    const handleMouseLeave = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      el.style.setProperty('--sh-x', '0px');
      el.style.setProperty('--sh-y', '0px');
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
