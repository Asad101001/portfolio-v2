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
if (window._isMobile) {
  // On mobile, native scrolling is fine; run tasks directly on scroll to save CPU
  window.addEventListener('scroll', function(e) {
    window._lerpY = window._scrollY;
    var len = window._scrollTasks.length;
    for (var i = 0; i < len; i++) {
      try { window._scrollTasks[i](e.timeStamp); } catch (e) {}
    }
  }, { passive: true });
  
  // Run once on init
  setTimeout(function() {
    window._lerpY = window._scrollY;
    var len = window._scrollTasks.length;
    for (var i = 0; i < len; i++) {
      try { window._scrollTasks[i](0); } catch (e) {}
    }
  }, 100);
} else {
  var lastScrollY = -1;
  var lastLerpY = -1;
  (function loop(timestamp) {
    // Enable smooth lerp on desktop for "behemoth level" premium smoothness
    var factor = 0.045; 
    var targetY = window._scrollY;
    var rawLerp = window._lerpY + (targetY - window._lerpY) * factor;
    // Snap to target if very close to avoid endless sub-pixel calculating
    window._lerpY = Math.abs(targetY - rawLerp) < 0.1 ? targetY : rawLerp;

    if (window._scrollY !== lastScrollY || window._lerpY !== lastLerpY) {
      // Run scroll tasks
      var len = window._scrollTasks.length;
      for (var i = 0; i < len; i++) {
        try { window._scrollTasks[i](timestamp); } catch (err) { console.error('Scroll Task Error:', err); }
      }
      lastScrollY = window._scrollY;
      lastLerpY = window._lerpY;
    }

    requestAnimationFrame(loop);
  })(0);
}

/* ── DOM Ready Initializations ────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  // Easter Egg Console Message
  const styleTitle = "font-size: 24px; font-weight: 800; color: #00ff41; background: #18181b; padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(0,255,65,0.3); font-family: monospace;";
  const styleBody = "font-size: 14px; color: #a1a1aa; line-height: 1.6; font-family: monospace;";
  console.log("%cSystem Initialized. // Muhammad Asad Khan", styleTitle);
  console.log("%c\nHey fellow dev! Looking under the hood?\nThe source code is completely modular and built with Vanilla JS + Vite.\n\nLet's connect:\nLinkedIn: https://www.linkedin.com/in/muhammadasad101/\nGitHub:   https://github.com/Asad101001\n", styleBody);

  // Trigger SVG animations on scroll
  // Project SVG Drawing Trigger Task
  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-drawing'); // Trigger the drawing in CSS
        projectObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 }); // Trigger earlier so drawing starts as it fades in

  document.querySelectorAll('.project-card').forEach(card => projectObserver.observe(card));

  // Disabled hash scroll on load to keep default top-of-page behavior across reloads.
});

// NOTE: LiquidGlass mount is disabled — it breaks hero card styling by clearing
// innerHTML and re-mounting in a React root, which kills GSAP bindings and
// overwrites the dark glass background with a flat gray overlay.
// The native CSS glass effect on .hero-main is the intended implementation.
// import('./components/LiquidGlassHero.jsx').then(({ mountLiquidGlass }) => {
//   mountLiquidGlass();
// }).catch(err => console.error("Failed to load LiquidGlass wrapper", err));
