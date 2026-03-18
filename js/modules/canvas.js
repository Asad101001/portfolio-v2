/* ============================================================
   js/modules/canvas.js
   PERFORMANCE OVERHAUL:
   - Star draw only runs when hero is visible (same as before but cleaner)
   - Backdrop parallax removed (now handled exclusively in animations.js)
   - buildGradients/buildDotGrid use offscreen canvas (one-time cost)
   ============================================================ */
'use strict';

/* ── Star / Nebula Canvas ─────────────────────────────────── */
(function () {
  var c = document.getElementById('bg-canvas');
  if (!c) return;
  var ctx = c.getContext('2d', { alpha: false });
  var W, H, stars = [], dotCanvas, dotCtx;
  var NUM_STARS = window._isMobile ? 50 : 110; // Reduced count for perf
  var tick = 0;
  var nebulaA, nebulaB;
  var lastFrameTime = 0;
  var FPS_CAP = 30; // Stars don't need 60fps - cap at 30 to save GPU budget
  var FRAME_INTERVAL = 1000 / FPS_CAP;

  function buildGradients() {
    nebulaA = ctx.createRadialGradient(W * 0.15, H * 0.3, 0, W * 0.15, H * 0.3, W * 0.45);
    nebulaA.addColorStop(0, 'rgba(16,185,129,0.03)');
    nebulaA.addColorStop(1, 'rgba(13,13,13,0)');
    nebulaB = ctx.createRadialGradient(W * 0.8, H * 0.6, 0, W * 0.8, H * 0.6, W * 0.38);
    nebulaB.addColorStop(0, 'rgba(168,85,247,0.02)');
    nebulaB.addColorStop(1, 'rgba(13,13,13,0)');
  }

  function buildDotGrid() {
    dotCanvas = document.createElement('canvas');
    dotCanvas.width = W; dotCanvas.height = H;
    dotCtx = dotCanvas.getContext('2d');
    dotCtx.fillStyle = 'rgba(255,255,255,0.016)';
    var sp = 60; // Slightly wider grid = fewer dots = faster blit
    for (var r = 0; r * sp <= H; r++)
      for (var co = 0; co * sp <= W; co++) {
        dotCtx.beginPath();
        dotCtx.arc(co * sp, r * sp, 0.5, 0, 6.283);
        dotCtx.fill();
      }
  }

  function initStars() {
    stars = [];
    for (var i = 0; i < NUM_STARS; i++)
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.0 + 0.2,
        a: Math.random() * 0.6 + 0.1,
        sp: Math.random() * 0.2 + 0.03,
        ph: Math.random() * 6.283
      });
  }

  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
    buildGradients(); buildDotGrid(); initStars();
  }

  function draw(timestamp) {
    // FPS cap: skip frames if too fast
    if (timestamp - lastFrameTime < FRAME_INTERVAL) return;
    lastFrameTime = timestamp;

    if (!window._heroVisible) return;

    tick += 0.005;
    ctx.fillStyle = '#0D0D0D';
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(dotCanvas, 0, 0);
    ctx.fillStyle = nebulaA; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = nebulaB; ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = s.a * (0.65 + 0.35 * Math.sin(tick * s.sp * 8 + s.ph));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fillStyle = 'rgba(210,228,255,' + tw.toFixed(2) + ')';
      ctx.fill();
    }
  }

  resize();
  window.addEventListener('resize', function () {
    clearTimeout(resize._t);
    resize._t = setTimeout(resize, 300);
  }, { passive: true });

  var heroEl = document.getElementById('hero');
  window._heroVisible = true; // Default visible
  if (heroEl && window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      window._heroVisible = entries[0].isIntersecting;
    }, { threshold: 0, rootMargin: '200px 0px 200px 0px' }).observe(heroEl);
  }

  // Register into master rAF loop
  window._scrollTasks.push(draw);
})();


/* ── Hero Backdrop: scroll indicator only ─────────────────
   NOTE: The actual parallax/shrink transform is handled in
   animations.js initParallax() to avoid double-writing.
   This block ONLY handles the scroll indicator visibility.
   ────────────────────────────────────────────────────────── */
(function () {
  var indicator = document.getElementById('scroll-indicator');
  if (!indicator) return;
  // Handled in animations.js — no duplicate task registered here
})();
