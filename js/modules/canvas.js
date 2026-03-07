/* ============================================================
   js/modules/canvas.js
   Star canvas background + hero backdrop parallax
   ============================================================ */
'use strict';

/* ── Star / Nebula Canvas ─────────────────────────────────── */
(function () {
  var c = document.getElementById('bg-canvas');
  if (!c) return;
  var ctx = c.getContext('2d', { alpha: false });
  var W, H, stars = [], dotCanvas, dotCtx;
  var NUM_STARS = window._isMobile ? 80 : 140;
  var tick = 0;
  var nebulaA, nebulaB;

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
    dotCtx.fillStyle = 'rgba(255,255,255,0.018)';
    var sp = 56;
    for (var r = 0; r * sp <= H; r++)
      for (var co = 0; co * sp <= W; co++) {
        dotCtx.beginPath();
        dotCtx.arc(co * sp, r * sp, 0.55, 0, 6.283);
        dotCtx.fill();
      }
  }

  function initStars() {
    stars = [];
    for (var i = 0; i < NUM_STARS; i++)
      stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.1 + 0.25, a: Math.random() * 0.65 + 0.15, sp: Math.random() * 0.25 + 0.04, ph: Math.random() * 6.283 });
  }

  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
    buildGradients(); buildDotGrid(); initStars();
  }

  function draw() {
    if (!window._heroVisible) return;
    tick += 0.007;
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
  window.addEventListener('resize', function () { clearTimeout(resize._t); resize._t = setTimeout(resize, 200); }, { passive: true });
  var heroEl = document.getElementById('hero');
  if (heroEl && window.IntersectionObserver) {
    new IntersectionObserver(function (entries) { window._heroVisible = entries[0].isIntersecting; }, { threshold: 0, rootMargin: '100px 0px 100px 0px' }).observe(heroEl);
  }
  window._scrollTasks.push(draw);
})();


/* ── Hero Backdrop Parallax / Shrink ─────────────────────── */
(function () {
  var backdrop  = document.getElementById('hero-backdrop');
  var indicator = document.getElementById('scroll-indicator');
  if (!backdrop) return;
  var img   = backdrop.querySelector('.hero-backdrop-img');
  var heroH = window.innerHeight;
  window.addEventListener('resize', function () { heroH = window.innerHeight; }, { passive: true });

  window._scrollTasks.push(function () {
    var shrink = Math.min(window._scrollY / (heroH * 0.9), 1);
    backdrop.style.setProperty('--shrink', shrink.toFixed(3));
    if (img) img.style.transform = 'translateY(' + (window._scrollY * 0.4).toFixed(1) + 'px) translateZ(0)';
    backdrop.style.visibility = shrink >= 1 ? 'hidden' : '';
    if (indicator) indicator.classList.toggle('hidden', window._scrollY > 120);
  });
})();
