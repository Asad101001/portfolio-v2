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

    /* Pull to Refresh Logic (Native Feel) */
    let touchStart = 0;
    document.addEventListener('touchstart', (e) => {
      if (window._scrollY === 0) touchStart = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (touchStart > 0 && e.touches[0].clientY - touchStart > 180 && window._scrollY === 0) {
        window.location.reload();
        touchStart = 0;
      }
    }, { passive: true });
  }

  // Stagger Ladder for Education on Mobile
  if (window._isMobile) {
    const ladderItems = document.querySelectorAll('.timeline-item');
    ladderItems.forEach((item, idx) => {
      if (idx % 2 !== 0) {
        item.style.paddingLeft = '55px'; // Offset downward steps
        const card = item.querySelector('.tl-card');
        if (card) card.style.maxWidth = '92%'; // Chop right side
      }
    });
  }

  // Handle subtle touch feedback on cards (active state)
  document.addEventListener('touchstart', function(e) {
    const card = e.target.closest('.glass-card');
    if (card) {
      card.style.transform = 'scale(0.98)';
      card.style.transition = 'transform 0.1s ease';
    }
  }, { passive: true });

  ['touchend', 'touchcancel'].forEach(evt => {
    document.addEventListener(evt, function(e) {
      const card = e.target.closest('.glass-card');
      if (card) {
        card.style.transform = '';
      }
    }, { passive: true });
  });

})();
