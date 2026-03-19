if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

/* ── Global Shared State ─────────────────────────────────── */
window._isMobile   = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
window._lerpY    = 0;
window._scrollTasks = [];

/* ── Passive scroll listener ─────────────────────────────── */
(function () {
  var prevY = 0;
  function onScroll() {
    var y = window.pageYOffset;
    window._scrollDir = y > prevY ? 1 : -1;
    window._scrollY   = y;
    prevY = y;
  }
  function calcDocH() {
    window._docH = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    ) - window.innerHeight;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', calcDocH, { passive: true });
  calcDocH();
  onScroll();
})();

/* ── Master rAF Loop ─────────────────────────────────────── */
(function loop(timestamp) {
  // Disable lerp on mobile for native smoothness
  if (!window._isMobile) {
    // UPDATED: Disable lerp by setting it to 1.0 for "behemoth level" smoothness (native)
    var factor = 1.0; 
    window._lerpY = window._scrollY;
  } else {
    window._lerpY = window._scrollY;
  }

  // Run scroll tasks
  var len = window._scrollTasks.length;
  for (var i = 0; i < len; i++) {
    try {
      window._scrollTasks[i](timestamp);
    } catch (e) {
      console.error('Scroll Task Error:', e);
    }
  }

  requestAnimationFrame(loop);
})(0);

/* ── DOM Ready Initializations ────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  // Init other modules if needed
});
