/**
 * js/modules/ink-reveal.js
 *
 * High-performance Mimo-style ink-reveal for the hero section.
 *
 * Architecture:
 *  • Off-screen buffer renders blots → composited onto hero mask canvas
 *  • Mouse blots are organic wobble-edged blobs using polar parametric paths
 *  • Blots fade back in (re-cover) after LIFETIME ms for continuous feel
 *  • IntersectionObserver pauses all RAF when hero not visible
 *  • Touch/mobile: disabled entirely; top nav hides itself there
 *  • Zero global namespace pollution
 */
'use strict';
(function () {

  /* ── Constants ──────────────────────────────────────────── */
  const MASK_COLOR   = getComputedStyle(document.documentElement)
                         .getPropertyValue('--bg').trim() || '#0D0D0D';
  const R_BASE       = 52;          // base blot radius
  const R_JITTER     = 64;          // extra random radius
  const LIFETIME     = 900;         // ms before blot fully refills
  const STAMP_DIST   = 12;          // px between interpolated stamps
  const WOBBLE_SEGS  = 32;          // polygon segments for organic edge
  const MAX_BLOTS    = 120;         // pool cap to prevent memory creep

  /* ── Touch guard ────────────────────────────────────────── */
  const isTouch = () =>
    window._isMobile ||
    window.innerWidth < 768 ||
    window.matchMedia('(hover: none)').matches;
  if (isTouch()) return;

  /* ── DOM refs ───────────────────────────────────────────── */
  const hero = document.getElementById('hero');
  if (!hero) return;

  /* Build the hidden decorative layer BEHIND the mask */
  const hidden = document.createElement('div');
  hidden.id = 'hero-ink-hidden';
  hidden.setAttribute('aria-hidden', 'true');
  hidden.innerHTML = buildHiddenHTML();
  hero.insertBefore(hidden, hero.firstChild);

  /* Canvas mask */
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-ink-mask';
  canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(canvas, hero.firstChild);
  const ctx = canvas.getContext('2d', { willReadFrequently: false });

  /* Cursor ring */
  const ring = document.createElement('div');
  ring.id = 'hero-ink-ring';
  ring.setAttribute('aria-hidden', 'true');
  hero.appendChild(ring);

  /* ── State ───────────────────────────────────────────────── */
  let W = 0, H = 0;
  let blots = [];
  let rafId = null;
  let heroVisible = true;
  let insideHero  = false;
  let lastPt      = null;
  let hintTimer   = null;
  let hintFired   = false;

  /* ── Utils ───────────────────────────────────────────────── */
  const easeOutCubic = t => 1 - (1 - t) ** 3;
  const clamp        = (v,a,b) => Math.max(a, Math.min(b, v));

  /* ── Resize ──────────────────────────────────────────────── */
  function resize() {
    const r = hero.getBoundingClientRect();
    W = canvas.width  = Math.round(r.width)  || 1;
    H = canvas.height = Math.round(r.height) || 1;
  }

  /* ── Fill mask (opaque) ──────────────────────────────────── */
  function fillMask() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = MASK_COLOR;
    ctx.fillRect(0, 0, W, H);
  }

  /* ── Stamp a single blot ─────────────────────────────────── */
  function makeBlot(x, y) {
    return {
      x, y,
      r:    R_BASE + Math.random() * R_JITTER,
      seed: Math.random() * Math.PI * 2,
      born: performance.now(),
    };
  }

  function spawn(x, y) {
    if (blots.length >= MAX_BLOTS) blots.shift(); // drop oldest
    blots.push(makeBlot(x, y));
    scheduleFrame();
  }

  /* ── Render one frame ────────────────────────────────────── */
  function frame() {
    rafId = null;
    if (!heroVisible) return;

    const now   = performance.now();
    const alive = [];

    /* Rebuild mask fresh each frame */
    fillMask();

    for (const b of blots) {
      const t = clamp((now - b.born) / LIFETIME, 0, 1);
      if (t >= 1) continue;              // fully refilled, drop
      alive.push(b);

      /* Radius grows fast then lingers, alpha fades out */
      const radius = (R_BASE + (b.r - R_BASE) * easeOutCubic(Math.min(t * 1.8, 1)));
      const alpha  = (1 - t * t);       // quadratic ease-out

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = alpha;

      /* Radial gradient for soft edges */
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius);
      grad.addColorStop(0,    'rgba(0,0,0,1)');
      grad.addColorStop(0.55, 'rgba(0,0,0,0.9)');
      grad.addColorStop(1,    'rgba(0,0,0,0)');

      /* Organic wobble path */
      ctx.beginPath();
      for (let i = 0; i <= WOBBLE_SEGS; i++) {
        const angle = (i / WOBBLE_SEGS) * Math.PI * 2;
        const wob = 0.84
          + 0.10 * Math.sin(angle * 3   + b.seed)
          + 0.06 * Math.sin(angle * 7   + b.seed * 1.7)
          + 0.04 * Math.sin(angle * 13  + b.seed * 0.4);
        const r  = radius * wob;
        const px = b.x + Math.cos(angle) * r;
        const py = b.y + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    blots = alive;
    if (blots.length > 0) scheduleFrame();
  }

  function scheduleFrame() {
    if (!rafId) rafId = requestAnimationFrame(frame);
  }

  /* ── Mouse tracking ──────────────────────────────────────── */
  function onMouseMove(e) {
    if (!heroVisible) return;
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    /* Move ring */
    ring.style.left = x + 'px';
    ring.style.top  = y + 'px';
    ring.style.opacity = '1';
    ring.style.transform = 'translate(-50%,-50%) scale(1)';

    /* Interpolated stamps for fast movement */
    if (lastPt) {
      const dx   = x - lastPt.x;
      const dy   = y - lastPt.y;
      const dist = Math.hypot(dx, dy);
      if (dist > STAMP_DIST) {
        const steps = Math.floor(dist / STAMP_DIST);
        for (let i = 1; i <= steps; i++) {
          const frac = i / (steps + 1);
          spawn(lastPt.x + dx * frac, lastPt.y + dy * frac);
        }
      }
    }
    spawn(x, y);
    lastPt = { x, y };

    /* Reset hint timer */
    clearTimeout(hintTimer);
    if (!hintFired) hintTimer = setTimeout(triggerHint, 2500);
  }

  function onMouseEnter() {
    insideHero = true;
    ring.style.opacity   = '1';
    ring.style.transform = 'translate(-50%,-50%) scale(1)';
    clearTimeout(hintTimer);
  }

  function onMouseLeave() {
    insideHero = false;
    lastPt     = null;
    ring.style.opacity   = '0';
    ring.style.transform = 'translate(-50%,-50%) scale(0.5)';
    hintTimer  = setTimeout(triggerHint, 3500);
  }

  /* ── Auto-hint reveal ────────────────────────────────────── */
  function triggerHint() {
    if (hintFired || insideHero) return;
    hintFired = true;

    /* Starburst from center */
    const cx = W / 2, cy = H * 0.45;
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const a = (i / 12) * Math.PI * 2;
        const d = 110 + Math.random() * 90;
        spawn(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.62);
      }, i * 70);
    }
    /* Show ring at center briefly */
    ring.style.left    = cx + 'px';
    ring.style.top     = cy + 'px';
    ring.style.opacity = '1';
    ring.style.transform = 'translate(-50%,-50%) scale(1.6)';
    setTimeout(() => {
      if (!insideHero) {
        ring.style.opacity   = '0';
        ring.style.transform = 'translate(-50%,-50%) scale(0.5)';
      }
    }, 1000);
  }

  /* ── Intersection Observer ───────────────────────────────── */
  const io = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    if (!heroVisible) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      fillMask();
      blots = [];
    }
  }, { threshold: 0.05 });
  io.observe(hero);

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    resize();
    fillMask();

    hero.addEventListener('mousemove',  onMouseMove,  { passive: true });
    hero.addEventListener('mouseenter', onMouseEnter, { passive: true });
    hero.addEventListener('mouseleave', onMouseLeave, { passive: true });

    const ro = new ResizeObserver(() => {
      resize();
      fillMask();
      blots = [];
    });
    ro.observe(hero);

    /* First hint after 2.5 s if user hasn't moved mouse in */
    hintTimer = setTimeout(triggerHint, 2500);
  }

  /* ── Hidden content HTML ─────────────────────────────────── */
  function buildHiddenHTML() {
    return `<div class="ink-hidden-art" aria-hidden="true">
      <div class="ink-ascii-wrap">
<pre class="ink-ascii">
 ███╗   ███╗ █████╗ ██╗  ██╗ █████╗ ███╗   ██╗
 ████╗ ████║██╔══██╗██║  ██║██╔══██╗████╗  ██║
 ██╔████╔██║███████║███████║███████║██╔██╗ ██║
 ██║╚██╔╝██║██╔══██║██╔══██║██╔══██║██║╚██╗██║
 ██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██║██║ ╚████║
 ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
</pre>
      </div>
      <div class="ink-terminal">
        <div class="ink-t-row"><span class="ink-prompt">$</span><span class="ink-cmd">curl -sL muhammadasad.dev</span></div>
        <div class="ink-t-row"><span class="ink-out">→ CS Student @ UBIT '28 · Karachi 🇵🇰</span></div>
        <div class="ink-t-row"><span class="ink-out">→ Python · AWS · AI/ML · Networking</span></div>
        <div class="ink-t-row"><span class="ink-out-dim">→ Open to internships &amp; collabs</span></div>
        <div class="ink-t-row ink-t-blink"><span class="ink-prompt">$</span><span class="ink-caret">▮</span></div>
      </div>
      <div class="ink-hint-label">Move cursor to reveal ✦</div>
    </div>`;
  }

  /* Boot after a short delay to let loader finish */
  const delay = document.readyState === 'loading' ? 600 : 300;
  setTimeout(init, delay);

})();
