import React, { useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Glass } from "@samasante/liquid-glass";

// We'll use this custom lens to match the dark theme and new design
const HERO_LENS = {
  mapSize: 256,
  clipToShape: true,
  softEdge: true,
  depth: 0.65,
  curvature: 0.26,
  dispersion: 0.16,
  strength: 0.22,
  bend: 0.65,
  bendWidth: 0.07,
  frost: 0,
  brightness: 1,
  specular: 0.8,
  sheenAngle: 45,
  glow: 0.06,
  glowSpread: 1,
  glowFalloff: 0.8,
  sheen: 0.4,
  sheenWidth: 1,
};

const useSize = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
};

export const LiquidGlassHero = ({ children }) => {
  const [ref, { w, h }] = useSize();
  const [theme, setTheme] = useState(document.body.className || 'theme-professional');
  
  // Track theme changes
  useEffect(() => {
    const updateTheme = () => {
      setTheme(document.body.className || 'theme-professional');
    };
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateTheme();
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // Also listen to the custom event just in case
    window.addEventListener('themechanged', updateTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener('themechanged', updateTheme);
    };
  }, []);

  // Use a dark wallpaper to refract through the glass
  const refractCopy = (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background: "transparent",
      }}
    />
  );

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 16,
      }}
    >
      {w > 0 && h > 0 && (
        <>
          <Glass
            optics={HERO_LENS}
            width={w}
            height={h}
            radius={16}
            refract={refractCopy}
            behind="transparent"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 16,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 16,
              padding: 24,
              boxSizing: "border-box",
              background: "linear-gradient(180deg, rgba(30, 30, 35, 0.4) 0%, rgba(10, 10, 12, 0.5) 100%)",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 24px 48px rgba(255, 255, 255, 0.02), 0 0 0 1px rgba(0, 0, 0, 0.8), 0 16px 40px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.4)",
              zIndex: 1,
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export function mountLiquidGlass() {
  // Find all elements with the 'data-liquid-glass' attribute
  const elements = document.querySelectorAll('[data-liquid-glass]');
  
  elements.forEach(el => {
    // Prevent multiple initializations
    if (el.dataset.liquidGlassInitialized) return;
    
    const children = [];
    // We need to move the inner HTML into a React component or just keep it as DOM
    // For simplicity, we can just wrap the element and put the contents inside our React tree using a portal or simply dangerouslySetInnerHTML.
    // However, since it's a React component, let's just grab the inner HTML
    const innerHtml = el.innerHTML;
    el.innerHTML = '';
    
    // Make sure the container has a relative position and actual dimensions
    if (window.getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }
    
    const root = createRoot(el);
    root.render(
      <LiquidGlassHero>
        <div dangerouslySetInnerHTML={{ __html: innerHtml }} style={{ height: '100%' }} />
      </LiquidGlassHero>
    );
    
    el.dataset.liquidGlassInitialized = "true";
    
    // Important: we need to re-run GSAP or observers if the contents had interactions
  });
}
