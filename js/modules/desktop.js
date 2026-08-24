/* ============================================================
   js/modules/desktop.js
   Specifically tuned experiences for BIGGER layout devices.
   ============================================================ */

(function initDesktop() {
  if (!window._isMobile) {
    document.body.classList.add('is-desktop-device');

    // Smooth scroll for anchors routing through Lenis or fallback
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#' || targetId.length <= 1) return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                if (typeof window.smoothScrollTo === 'function') {
                    window.smoothScrollTo(target, -30);
                } else if (window.lenis) {
                    window.lenis.scrollTo(target, { offset: -30, duration: 1.05 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Optimize reveals for desktop: trigger slightly earlier
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(r => {
      const rect = r.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        r.classList.add('visible');
      }
    });

    // Premium Micro-animations for desktop
    let parallaxFrame;
    document.addEventListener('mousemove', function(e) {
      if (!window._isMobile) {
        if (parallaxFrame) cancelAnimationFrame(parallaxFrame);
        parallaxFrame = requestAnimationFrame(() => {
          const layers = document.querySelectorAll('.parallax-layer:not(.parallax-disabled)');
          if (layers.length === 0) return;
          const x = (window.innerWidth - e.pageX * 2) / 100;
          const y = (window.innerHeight - e.pageY * 2) / 100;
          layers.forEach(layer => {
            layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          });
        });
      }
    }, { passive: true });
  }
})();
