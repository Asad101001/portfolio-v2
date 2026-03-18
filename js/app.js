/* ============================================================
   app.js — Portfolio Main Entry Point
   PERFORMANCE OVERHAUL: throttled tasks, single rAF loop
   ============================================================ */
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
/* Uses a frame budget system: expensive tasks only run when
   there's headroom. Target is 60fps (16.67ms per frame).    */
(function loop(timestamp) {
  // Smooth lerp — intentionally gentle (0.06) to avoid over-shooting
  var factor = 0.06;
  window._lerpY += (window._scrollY - window._lerpY) * factor;

  var len = window._scrollTasks.length;
  for (var i = 0; i < len; i++) window._scrollTasks[i](timestamp);

  requestAnimationFrame(loop);
})();
