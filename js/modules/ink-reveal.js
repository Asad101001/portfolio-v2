/**
 * js/modules/ink-reveal.js
 *
 * Cross-Theme Ink Reveal — "Peek into another world"
 *
 * DESKTOP:
 *  • Opaque mask = current theme bg fills canvas
 *  • Mouse erases mask with organic blobs → reveals hidden "other theme" layer
 *  • Hidden layer shows the aesthetic of a contrasting theme:
 *      professional (white) → reveals Sunset (dark neon magenta)
 *      sunset (dark magenta) → reveals Professional (clean white)
 *      cyberpunk (dark cyan)  → reveals Sunset
 *
 * MOBILE:
 *  • Touch-based expanding color ripples in theme accent colors
 *  • No mask, no canvas erase — instead radial ripple bursts on tap
 *  • DeviceOrientation tilt gently shifts a glow layer
 */
'use strict';
(function () {

  /* ── Detect touch / mobile ──────────────────────────────── */
  const isMobile = () =>
    window._isMobile ||
    window.innerWidth < 769 ||
    window.matchMedia('(hover: none)').matches ||
    window.matchMedia('(pointer: coarse)').matches;

  /* ── DOM refs ─────────────────────────────────────────────── */
  const hero = document.getElementById('hero');
  if (!hero) return;

  /* ── Route: mobile vs desktop ─────────────────────────────── */
  if (isMobile()) {
    initMobile();
  } else {
    initDesktop();
  }

  /* ══════════════════════════════════════════════════════════════
     DESKTOP: Mask + cross-theme revealed layer
     ══════════════════════════════════════════════════════════════ */
  function initDesktop() {

    /* ── Determine which "other theme" to reveal ──────────────── */
    const body = document.body;
    function getRevealTheme() {
      if (body.classList.contains('theme-professional')) return 'sunset';
      if (body.classList.contains('theme-sunset')) return 'professional';
      return 'sunset'; // cyberpunk → sunset as default
    }

    /* ── Build hidden "other theme" layer ─────────────────────── */
    const hidden = document.createElement('div');
    hidden.id = 'hero-ink-hidden';
    hidden.setAttribute('aria-hidden', 'true');
    hidden.innerHTML = buildRevealLayerHTML(getRevealTheme());
    hero.insertBefore(hidden, hero.firstChild);

    /* Re-build if theme changes */
    const themeObs = new MutationObserver(() => {
      hidden.innerHTML = buildRevealLayerHTML(getRevealTheme());
    });
    themeObs.observe(body, { attributes: true, attributeFilter: ['class'] });

    /* ── Canvas mask ──────────────────────────────────────────── */
    const canvas = document.createElement('canvas');
    canvas.id = 'hero-ink-mask';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild);
    const ctx = canvas.getContext('2d', { willReadFrequently: false });

    /* ── Cursor ring ──────────────────────────────────────────── */
    const ring = document.createElement('div');
    ring.id = 'hero-ink-ring';
    ring.setAttribute('aria-hidden', 'true');
    hero.appendChild(ring);

    /* ── Constants ──────────────────────────────────────────────── */
    const R_BASE      = 58;
    const R_JITTER    = 72;
    const LIFETIME    = 950;
    const STAMP_DIST  = 14;
    const WOBBLE_SEGS = 32;
    const MAX_BLOTS   = 140;

    /* ── State ──────────────────────────────────────────────────── */
    let W = 0, H = 0;
    let blots = [];
    let rafId = null;
    let heroVisible = true;
    let insideHero  = false;
    let lastPt      = null;
    let hintTimer   = null;
    let hintFired   = false;

    /* ── Utils ──────────────────────────────────────────────────── */
    const easeOutCubic = t => 1 - (1 - t) ** 3;
    const clamp        = (v,a,b) => Math.max(a, Math.min(b, v));

    function getMaskColor() {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--bg').trim() || '#0D0D0D';
    }

    /* ── Resize ─────────────────────────────────────────────────── */
    function resize() {
      const r = hero.getBoundingClientRect();
      W = canvas.width  = Math.round(r.width)  || 1;
      H = canvas.height = Math.round(r.height) || 1;
    }

    function fillMask() {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = getMaskColor();
      ctx.fillRect(0, 0, W, H);
    }

    function makeBlot(x, y) {
      return { x, y, r: R_BASE + Math.random() * R_JITTER, seed: Math.random() * Math.PI * 2, born: performance.now() };
    }

    function spawn(x, y) {
      if (blots.length >= MAX_BLOTS) blots.shift();
      blots.push(makeBlot(x, y));
      scheduleFrame();
    }

    function frame() {
      rafId = null;
      if (!heroVisible) return;

      const now   = performance.now();
      const alive = [];

      fillMask();

      for (const b of blots) {
        const t = clamp((now - b.born) / LIFETIME, 0, 1);
        if (t >= 1) continue;
        alive.push(b);

        const radius = R_BASE + (b.r - R_BASE) * easeOutCubic(Math.min(t * 1.8, 1));
        const alpha  = 1 - t * t;

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = alpha;

        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius);
        grad.addColorStop(0,    'rgba(0,0,0,1)');
        grad.addColorStop(0.55, 'rgba(0,0,0,0.9)');
        grad.addColorStop(1,    'rgba(0,0,0,0)');

        ctx.beginPath();
        for (let i = 0; i <= WOBBLE_SEGS; i++) {
          const angle = (i / WOBBLE_SEGS) * Math.PI * 2;
          const wob = 0.84
            + 0.10 * Math.sin(angle * 3  + b.seed)
            + 0.06 * Math.sin(angle * 7  + b.seed * 1.7)
            + 0.04 * Math.sin(angle * 13 + b.seed * 0.4);
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

    /* ── Mouse tracking ─────────────────────────────────────────── */
    function onMouseMove(e) {
      if (!heroVisible) return;
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ring.style.left      = x + 'px';
      ring.style.top       = y + 'px';
      ring.style.opacity   = '1';
      ring.style.transform = 'translate(-50%,-50%) scale(1)';

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
      hintTimer = setTimeout(triggerHint, 3500);
    }

    function triggerHint() {
      if (hintFired || insideHero) return;
      hintFired = true;
      const cx = W / 2, cy = H * 0.45;
      for (let i = 0; i < 14; i++) {
        setTimeout(() => {
          const a = (i / 14) * Math.PI * 2;
          const d = 130 + Math.random() * 100;
          spawn(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6);
        }, i * 65);
      }
      ring.style.left      = cx + 'px';
      ring.style.top       = cy + 'px';
      ring.style.opacity   = '1';
      ring.style.transform = 'translate(-50%,-50%) scale(1.8)';
      setTimeout(() => {
        if (!insideHero) {
          ring.style.opacity   = '0';
          ring.style.transform = 'translate(-50%,-50%) scale(0.5)';
        }
      }, 1100);
    }

    /* ── IntersectionObserver ────────────────────────────────────── */
    const io = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (!heroVisible) {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        fillMask();
        blots = [];
      }
    }, { threshold: 0.05 });
    io.observe(hero);

    /* ── Init ───────────────────────────────────────────────────── */
    function init() {
      resize();
      fillMask();

      hero.addEventListener('mousemove',  onMouseMove,  { passive: true });
      hero.addEventListener('mouseenter', onMouseEnter, { passive: true });
      hero.addEventListener('mouseleave', onMouseLeave, { passive: true });

      const ro = new ResizeObserver(() => { resize(); fillMask(); blots = []; });
      ro.observe(hero);

      hintTimer = setTimeout(triggerHint, 2500);
    }

    const delay = document.readyState === 'loading' ? 600 : 300;
    setTimeout(init, delay);
  }

  /* ── HTML builder for revealed "other theme" layer ─────────────── */
  function buildRevealLayerHTML(revealTheme) {
    if (revealTheme === 'sunset') {
      // Sunset aesthetic — dark, neon magenta/red, bold
      return `<div class="ink-hidden-art ink-reveal-sunset" aria-hidden="true">
        <div class="ink-reveal-bg"></div>
        <div class="ink-reveal-content">
          <div class="ink-reveal-badge">
            <span class="ink-reveal-dot"></span>
            ALTERNATE DIMENSION
          </div>
          <div class="ink-reveal-name">ASAD<span>.</span></div>
          <div class="ink-reveal-tagline">← SUNSET MODE →</div>
          <div class="ink-reveal-tags">
            <span>PYTHON</span>
            <span>AWS</span>
            <span>AI/ML</span>
            <span>NETWORKING</span>
          </div>
          <div class="ink-reveal-grid">
            <div class="ink-reveal-stat"><span class="ink-rv-num">4+</span><span class="ink-rv-lbl">PROJECTS</span></div>
            <div class="ink-reveal-stat"><span class="ink-rv-num">'28</span><span class="ink-rv-lbl">UBIT GRAD</span></div>
            <div class="ink-reveal-stat"><span class="ink-rv-num">∞</span><span class="ink-rv-lbl">CURIOSITY</span></div>
          </div>
          <div class="ink-reveal-hint">move cursor to explore ✦</div>
        </div>
      </div>`;
    } else {
      // Professional aesthetic — clean white, minimal, elegant
      return `<div class="ink-hidden-art ink-reveal-professional" aria-hidden="true">
        <div class="ink-reveal-bg"></div>
        <div class="ink-reveal-content">
          <div class="ink-reveal-badge ink-rv-pro-badge">
            <span class="ink-reveal-dot ink-rv-pro-dot"></span>
            PROFESSIONAL MODE
          </div>
          <div class="ink-reveal-name ink-rv-pro-name">Muhammad<br>Asad Khan</div>
          <div class="ink-reveal-tagline ink-rv-pro-tagline">Computer Science Student · UBIT '28</div>
          <div class="ink-reveal-tags ink-rv-pro-tags">
            <span>Python</span>
            <span>AWS</span>
            <span>AI / ML</span>
            <span>Networking</span>
          </div>
          <div class="ink-reveal-grid ink-rv-pro-grid">
            <div class="ink-reveal-stat"><span class="ink-rv-num ink-rv-pro-num">4+</span><span class="ink-rv-lbl ink-rv-pro-lbl">Projects</span></div>
            <div class="ink-reveal-stat"><span class="ink-rv-num ink-rv-pro-num">'28</span><span class="ink-rv-lbl ink-rv-pro-lbl">Graduation</span></div>
            <div class="ink-reveal-stat"><span class="ink-rv-num ink-rv-pro-num">∞</span><span class="ink-rv-lbl ink-rv-pro-lbl">Drive</span></div>
          </div>
          <div class="ink-reveal-hint ink-rv-pro-hint">Move cursor to explore ·</div>
        </div>
      </div>`;
    }
  }

  /* ══════════════════════════════════════════════════════════════
     MOBILE: Touch ripple system in theme accent colors
     ══════════════════════════════════════════════════════════════ */
  function initMobile() {
    /* Only enable in hero section */
    if (!hero) return;

    /* Canvas for ripples */
    const canvas = document.createElement('canvas');
    canvas.id = 'hero-mobile-ripple-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild);
    const ctx = canvas.getContext('2d');

    /* Floating hint */
    const hint = document.createElement('div');
    hint.className = 'mobile-ink-hint';
    hint.textContent = '✦ tap to reveal ✦';
    hero.appendChild(hint);

    /* Hide hint after first tap */
    let hintHidden = false;

    /* Theme accent colors */
    function getAccentColors() {
      const style = getComputedStyle(document.documentElement);
      const cyan   = style.getPropertyValue('--cyan').trim()   || '#ff0055';
      const purple = style.getPropertyValue('--purple').trim() || '#ff00ff';
      const lime   = style.getPropertyValue('--lime').trim()   || '#ffd700';
      return [cyan, purple, lime];
    }

    /* Ripple pool */
    const ripples = [];
    let rafId = null;
    let W = 0, H = 0;

    function resize() {
      const r = hero.getBoundingClientRect();
      W = canvas.width  = Math.round(r.width)  || 1;
      H = canvas.height = Math.round(r.height) || 1;
    }

    function spawnRipple(x, y) {
      const colors = getAccentColors();
      const color  = colors[Math.floor(Math.random() * colors.length)];
      ripples.push({
        x, y,
        r: 0,
        maxR: 120 + Math.random() * 80,
        alpha: 0.55,
        color,
        born: performance.now(),
        lifetime: 700 + Math.random() * 400,
        ring2: Math.random() > 0.4, // 60% chance of second smaller ring
      });
      if (!rafId) rafId = requestAnimationFrame(drawFrame);
    }

    function drawFrame() {
      rafId = null;
      ctx.clearRect(0, 0, W, H);

      const now   = performance.now();
      const alive = [];

      for (const rp of ripples) {
        const t = Math.min((now - rp.born) / rp.lifetime, 1);
        if (t >= 1) continue;
        alive.push(rp);

        const ease = 1 - (1 - t) ** 2.5;  // ease-out
        const r     = rp.maxR * ease;
        const alpha = rp.alpha * (1 - t * t * 1.1);

        /* Main ring */
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = hexAlpha(rp.color, alpha * 0.9);
        ctx.lineWidth   = 2.5 * (1 - t * 0.6);
        ctx.stroke();

        /* Soft fill glow at center */
        const grad = ctx.createRadialGradient(rp.x, rp.y, 0, rp.x, rp.y, r * 0.6);
        grad.addColorStop(0,   hexAlpha(rp.color, alpha * 0.18));
        grad.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        /* Second inner ring with slight delay */
        if (rp.ring2 && t > 0.15) {
          const t2    = Math.min((t - 0.15) / 0.85, 1);
          const ease2 = 1 - (1 - t2) ** 2.5;
          const r2    = rp.maxR * 0.55 * ease2;
          const a2    = alpha * 0.55 * (1 - t2);
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, r2, 0, Math.PI * 2);
          ctx.strokeStyle = hexAlpha(rp.color, a2);
          ctx.lineWidth   = 1.5 * (1 - t2 * 0.5);
          ctx.stroke();
        }
      }

      ripples.length = 0;
      ripples.push(...alive);
      if (ripples.length > 0) rafId = requestAnimationFrame(drawFrame);
    }

    /* hex color → rgba with alpha */
    function hexAlpha(hex, a) {
      hex = hex.trim().replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
      const r = parseInt(hex.slice(0,2), 16);
      const g = parseInt(hex.slice(2,4), 16);
      const b = parseInt(hex.slice(4,6), 16);
      return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
    }

    /* Touch handler */
    function onTouch(e) {
      const rect = hero.getBoundingClientRect();
      for (const touch of e.changedTouches) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        spawnRipple(x, y);
        /* Burst: multiple rings */
        for (let i = 1; i <= 2; i++) {
          setTimeout(() => spawnRipple(
            x + (Math.random() - 0.5) * 30,
            y + (Math.random() - 0.5) * 20
          ), i * 120);
        }
      }
      if (!hintHidden) {
        hintHidden = true;
        hint.style.transition = 'opacity 0.5s ease';
        hint.style.opacity = '0';
        setTimeout(() => hint.remove(), 600);
      }
    }

    /* Device tilt: shift a subtle ambient glow */
    let tiltGlow = null;
    function onTilt(e) {
      if (!tiltGlow) {
        tiltGlow = document.createElement('div');
        tiltGlow.style.cssText = `
          position: absolute; inset: 0; pointer-events: none; z-index: 2;
          border-radius: inherit;
          transition: background 0.4s ease;
        `;
        hero.insertBefore(tiltGlow, hero.firstChild);
      }
      const bx = 50 + (e.gamma || 0) * 0.6;  // left/right tilt → x
      const by = 50 + (e.beta  || 0) * 0.4;  // forward/back → y
      const colors = getAccentColors();
      tiltGlow.style.background = `radial-gradient(circle at ${bx}% ${by}%, ${hexAlpha(colors[0], 0.07)} 0%, transparent 60%)`;
    }

    /* Init */
    resize();
    hero.addEventListener('touchstart', onTouch, { passive: true });
    if (typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', onTilt, { passive: true });
    }
    const ro = new ResizeObserver(() => { resize(); ctx.clearRect(0, 0, W, H); });
    ro.observe(hero);
  }

})();
