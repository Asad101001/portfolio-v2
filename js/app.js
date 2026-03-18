/* ============================================================
   app.js — Portfolio Main Entry Point
   Muhammad Asad Khan — github.com/Asad101001
   
   Module Structure:
     js/modules/loader.js   — 3D startup animation
     js/modules/canvas.js   — Star canvas + hero parallax
     js/modules/ui.js       — All UI interactions
     js/modules/widgets.js  — External API widgets
   ============================================================ */
/* ── Force Scroll to Top on Reload ────────────────────────── */
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

/* ── Master rAF Loop — drives all registered scroll tasks ── */
(function loop() {
  // Lerp factor (higher = faster response)
  const factor = 0.08;
  window._lerpY += (window._scrollY - window._lerpY) * factor;
  
  for (var i = 0; i < window._scrollTasks.length; i++) window._scrollTasks[i]();
  requestAnimationFrame(loop);
})();
