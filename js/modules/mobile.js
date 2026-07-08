/* ============================================================
   js/modules/mobile.js
   Specifically tuned experiences for MOBILE devices.
   ============================================================ */

(function initMobile() {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (isTouch || window._isMobile) {
    document.body.classList.add('is-mobile-device');
    
    // Disable heavy cursor glow on mobile
    const glow = document.getElementById('cursor-glow');
    if (glow) glow.style.display = 'none';

    // Optimize section reveal triggers for touch scrolling
    // (Less aggressive transformation for smoother native scroll)
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(r => {
      if (r.getBoundingClientRect().top < window.innerHeight) {
        r.classList.add('visible');
      }
    });

    /* Pull to Refresh Logic (Native Feel) — higher threshold to avoid accidental triggers */
    let touchStart = 0;
    document.addEventListener('touchstart', (e) => {
      if (window._scrollY === 0) touchStart = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (touchStart > 0 && e.touches[0].clientY - touchStart > 300 && window._scrollY === 0) {
        window.location.reload();
        touchStart = 0;
      }
    }, { passive: true });
  }

  // Education timeline items get proper mobile layout via CSS only
  // (removed JS padding hack that caused asymmetric layouts)

  // Touch feedback is handled purely via CSS :active states in mobile.css
  // (removed JS touch listeners that conflicted with perf.css transform: none)

})();
