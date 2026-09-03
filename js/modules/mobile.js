/* ============================================================
   js/modules/mobile.js
   Specifically tuned experiences for MOBILE devices.
   ============================================================ */

(function initMobile() {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024;
  
  if (isTouch || window._isMobile) {
    document.body.classList.add('is-mobile-device');
    
    // Ensure body and html are 100% scrollable on mobile
    document.body.classList.remove('antigravity-scroll-lock');
    if (document.body.style.overflow === 'hidden' && !document.getElementById('certs-drawer')?.classList.contains('open')) {
      document.body.style.overflow = '';
    }
    
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

  }

  // Education timeline items get proper mobile layout via CSS only
  // (removed JS padding hack that caused asymmetric layouts)

  // Touch feedback is handled purely via CSS :active states in mobile.css
  // (removed JS touch listeners that conflicted with perf.css transform: none)

})();
