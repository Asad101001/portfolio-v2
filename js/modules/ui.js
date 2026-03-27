/* All UI interactions — Section Nav, Keyboard, Arsenal Grid */
'use strict';

// Ensure smoothTransition helper exists as a fallback
// window.smoothTransition is handled by animations.js

/* ── Shooting Stars ─────────────────────────────────────── */
(function () {
  if (window._isMobile) return;
  function spawn() {
    var el = document.createElement('div');
    el.className = 'shooting-star';
    el.style.top  = (Math.random() * 45) + '%';
    el.style.left = (25 + Math.random() * 65) + '%';
    el.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 3000);
  }
  setInterval(function () { 
    if (Math.random() < 0.25 && !document.hidden) spawn(); 
  }, 6000);
  setTimeout(spawn, 2500);

  /* New Fizz Effect */
  function spawnFizz() {
    if (document.hidden) return;
    var f = document.createElement('div');
    f.style.cssText = `
      position: fixed;
      width: ${2 + Math.random() * 4}px;
      height: ${2 + Math.random() * 4}px;
      background: var(--cyan);
      opacity: 0.4;
      border-radius: 50%;
      pointer-events: none;
      z-index: -1;
      left: ${Math.random() * 100}vw;
      bottom: -10px;
      box-shadow: 0 0 10px var(--cyan);
      animation: fizz-up ${6 + Math.random() * 6}s linear forwards;
    `;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 12000);
  }
  setInterval(spawnFizz, 800);
})();

/* Add Fizz CSS to head */
var fizzStyle = document.createElement('style');
fizzStyle.textContent = `@keyframes fizz-up { 
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.4; }
  50% { transform: translateY(-50vh) translateX(${Math.random() * 40 - 20}px); }
  100% { transform: translateY(-110vh) translateX(${Math.random() * 60 - 30}px); opacity: 0; }
}`;
document.head.appendChild(fizzStyle);

/* ── Global Mouse Tracking for Glows ────────────────────── */
(function () {
  if (window._isMobile) return;
  document.addEventListener('mousemove', function (e) {
    document.documentElement.style.setProperty('--x', e.clientX + 'px');
    document.documentElement.style.setProperty('--y', e.clientY + 'px');
  }, { passive: true });
})();

/* ── Cursor Glow (Follower) ─────────────────────────────── */
(function () {
  var el = document.getElementById('cursor-glow');
  if (!el || window._isMobile) return;
  var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  var cx = tx, cy = ty, moved = false;
  document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; moved = true; }, { passive: true });
  function update() {
    if (!moved) return;
    cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1;
    el.style.transform = 'translate3d(' + (cx - 250).toFixed(0) + 'px,' + (cy - 250).toFixed(0) + 'px,0)';
  }
  window._scrollTasks.push(update);
})();

/* ── Sections & Navigation ─────────────────────────────── */
(function () {
  var sections = ['hero','about','projects','demo','tech','education','contact'];
  var icons = {
    hero:      '<svg viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    about:     '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>',
    projects:  '<svg viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>',
    demo:      '<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    tech:      '<svg viewBox="0 0 24 24"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>',
    education: '<svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    contact:   '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  };
  var labels = { hero:'Home', about:'About', projects:'Projects', demo:'Experience', tech:'Stack', education:'Education', contact:'Contact' };
  
  var nav = document.getElementById('section-dots') || document.createElement('div');
  nav.id = 'section-dots';
  if (!nav.parentNode) document.body.appendChild(nav);
  nav.innerHTML = '';
  var dotEls = [];
  sections.forEach(function (id) {
    var btn = document.createElement('button');
    btn.className = 'section-dot';
    btn.setAttribute('data-section', id);
    btn.setAttribute('title', labels[id]);
    btn.innerHTML = icons[id];
    btn.onclick = function () { document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); };
    nav.appendChild(btn);
    dotEls.push(btn);
  });

  function updateDots(i) {
    dotEls.forEach(function (d, j) { 
      d.classList.toggle('active', j === i); 
      d.classList.toggle('nearby', Math.abs(j - i) === 1); 
    });
  }

  if (window.IntersectionObserver) {
    sections.forEach(function (id, idx) {
      var el = document.getElementById(id);
      if (el) new IntersectionObserver(e => { if (e[0].isIntersecting) updateDots(idx); }, { threshold: 0.3 }).observe(el);
    });
  }

  window.addEventListener('keydown', function(e) {
    if (e.key === 'PageDown' || e.key === 'PageUp') {
      e.preventDefault();
      const scrollPos = window.scrollY;
      const sectionStarts = sections.map(id => {
        const el = document.getElementById(id);
        return el ? el.offsetTop - 80 : 0; // subtract 80 for scroll-padding-top
      });

      let curIdx = 0;
      for (let i = 0; i < sectionStarts.length; i++) {
        if (scrollPos >= sectionStarts[i] - 10) curIdx = i;
      }

      const nextIdx = (e.key === 'PageDown') ? curIdx + 1 : curIdx - 1;
      if (nextIdx >= 0 && nextIdx < sections.length) {
        window.scrollTo({ top: sectionStarts[nextIdx], behavior: 'smooth' });
      }
    }
  });
})();

/* ── Typewriter ─────────────────────────────────────────── */
(function () {
  var el = document.getElementById('typewriter');
  if (!el) return;
  var phrases = ['Cloud & Networking enthusiast','Python + Data Science learner','Building AI / LLM pipelines','AWS architecture explorer','Breaking things since 2024...','Always learning. Always shipping.'];
  var pi = 0, ci = 0, del = false;
  function tick() {
    var cur = phrases[pi];
    if (!del) {
      el.textContent = cur.slice(0, ++ci);
      if (ci === cur.length) { del = true; setTimeout(tick, 1900); return; }
      setTimeout(tick, 58);
    } else {
      el.textContent = cur.slice(0, --ci);
      if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 350); return; }
      setTimeout(tick, 30);
    }
  }
  tick();
})();

/* ── Progressive Reveal & Counters ────────────────────────── */
(function () {
  document.querySelectorAll('.terminal-body .t-line').forEach((line, i) => {
    setTimeout(() => line.classList.add('t-visible'), 50 + i * 120);
  });

  var counters = [{ id: 'cnt-projects', target: 4 }, { id: 'cnt-certs', target: 6 }, { id: 'cnt-tech', target: 20 }];
  function animOne(el, target) {
    if (el._done) return; el._done = true;
    var start = performance.now(), dur = 1400;
    function step(now) {
      var p = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(e * target) + '+';
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var about = document.getElementById('about');
  if (about && window.IntersectionObserver) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) counters.forEach(c => { var el = document.getElementById(c.id); if (el) animOne(el, c.target); });
    }, { threshold: 0.05 }).observe(about);
  }
})();

/* ── Certifications Drawer ─────────────────────────────── */
(function () {
  var drawer = document.getElementById('certs-drawer'), backdrop = document.getElementById('certs-backdrop'), closeBtn = document.getElementById('certs-close');
  if (!drawer) return;
  function open()  { window.smoothTransition(() => { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; }); }
  function close() { window.smoothTransition(() => { drawer.classList.remove('open'); document.body.style.overflow = ''; }); }
  document.querySelectorAll('a[href="#certifications"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); open(); }));
  if (backdrop) backdrop.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ── Nav & UI Interactions ─────────────────────────────── */
(function () {
  var navEl = document.querySelector('nav');
  if (navEl) {
    var lastHideY = 0;
    window._scrollTasks.push(() => {
      if (window._scrollY > 90 && window._scrollDir > 0 && window._scrollY - lastHideY > 8) navEl.classList.add('nav-hidden');
      else if (window._scrollDir < 0 || window._scrollY < 90) { navEl.classList.remove('nav-hidden'); lastHideY = window._scrollY; }
    });
  }

  var btt = document.getElementById('back-to-top'), ring = document.getElementById('scroll-ring');
  if (btt) {
    var CIRC = 119.4;
    window._scrollTasks.push(() => {
      btt.classList.toggle('visible', window._scrollY > 400);
      if (ring && window._docH > 0) ring.style.strokeDashoffset = (CIRC * (1 - window._scrollY / window._docH)).toFixed(1);
    });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  document.addEventListener('click', e => {
    var t = e.target.closest('.btn-primary,.btn-secondary,.btn-linkedin,.social-card,.magnetic');
    if (!t) return;
    var rect = t.getBoundingClientRect(), s = Math.max(rect.width, rect.height), r = document.createElement('span');
    r.className = 'ripple';
    r.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - rect.left - s/2) + 'px;top:' + (e.clientY - rect.top - s/2) + 'px';
    if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
    t.appendChild(r); r.addEventListener('animationend', () => r.remove());
  });
})();

/* ── Rotating Widget Logic ─────────────────────────────── */
(function () {
  function initRotation(widgetId, dotsId, interval) {
    var widget = document.getElementById(widgetId), dotsWrap = document.getElementById(dotsId);
    if (!widget || !dotsWrap) return;
    
    var items = widget.querySelectorAll('.rotating-item'), dots = dotsWrap.querySelectorAll('.r-dot'), current = 0, timer, isAnim = false;
    
    function show(idx) {
      if (isAnim || idx === current) return;
      var inI = items[idx], outI = items[current];
      if (!inI || !outI) return;
      isAnim = true;
      outI.classList.add('exit-up'); outI.classList.remove('active');
      outI.addEventListener('transitionend', () => { outI.classList.remove('exit-up'); isAnim = false; }, { once: true });
      setTimeout(() => inI.classList.add('active'), 100);
      dots.forEach(d => d.classList.remove('active')); if (dots[idx]) dots[idx].classList.add('active');
      current = idx;
      
      // Special classes for Barca slot (index 3 in hero)
      if (widgetId === 'rotating-widget') {
         if (idx === 3) { dotsWrap.classList.add('barca-active'); widget.classList.add('football-active'); }
         else { dotsWrap.classList.remove('barca-active'); widget.classList.remove('football-active'); }
      }
    }
    
    function start() { clearInterval(timer); timer = setInterval(() => show((current + 1) % items.length), interval || 4500); }
    dots.forEach(dot => dot.addEventListener('click', () => { show(parseInt(dot.getAttribute('data-i') || dot.getAttribute('data-index'), 10)); start(); }));
    start();
  }

  // Hero Activity Hub (5 items)
  initRotation('rotating-widget', 'rotating-dots', 5000);
  
  // Socials Big 3 (3 items)
  initRotation('big3-social-widget', 'big3-social-dots', 6000);
})();

/* ── Email & Utils ──────────────────────────────────────── */
(function () {
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      var email = this.href.replace('mailto:', '');
      navigator.clipboard.writeText(email).then(() => window.showToast('📧 Email copied to clipboard!'));
    });
  });

  window.showToast = function (msg, dur) {
    var el = document.getElementById('toast'); if (!el) return;
    el.textContent = msg; el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), dur || 2500);
  }
})();

/* ── Section Reveal Stagger ───────────────────────────── */
(function () {
  var staggerParents = document.querySelectorAll('.projects-grid, .working-on-grid, .social-cards-grid, .demo-grid, .about-stats-col');
  staggerParents.forEach(p => Array.prototype.forEach.call(p.children, c => c.classList.add('s-child')));
  if (!window.IntersectionObserver) { document.querySelectorAll('.section-in, .reveal').forEach(s => s.classList.add('in-view', 'visible')); return; }
  var obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view', 'visible'); obs.unobserve(e.target); }});
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.section-in, .reveal').forEach(s => obs.observe(s));
})();

/* ── Experience Accordion ── */
(function() {
  var btn = document.getElementById('experience-toggle'), content = document.getElementById('demo-content'), popup = document.getElementById('error-popup'), tFill = document.getElementById('error-timer-fill');
  if (!btn || !content) return;
  var arrow = btn.querySelector('.exp-toggle-arrow'), isOpen = false, pTimer = null;
  function showPopup() {
    if (!popup) return;
    popup.classList.add('visible');
    if (tFill) { tFill.style.transition = 'none'; tFill.style.transform = 'scaleX(1)'; setTimeout(() => { tFill.style.transition = 'transform 4s linear'; tFill.style.transform = 'scaleX(0)'; }, 50); }
    clearTimeout(pTimer); pTimer = setTimeout(() => popup.classList.remove('visible'), 4200);
  }
  btn.addEventListener('click', () => {
    isOpen = !isOpen; btn.classList.toggle('open', isOpen); content.classList.toggle('demo-content-open', isOpen);
    if (arrow) arrow.textContent = isOpen ? '▲' : '▼';
    if (isOpen) {
      content.querySelectorAll('.demo-progress-fill').forEach(f => { f.style.transition = 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)'; f.style.width = f.getAttribute('data-w') || '0%'; });
      setTimeout(showPopup, 200);
    } else {
      content.querySelectorAll('.demo-progress-fill').forEach(f => { f.style.transition = 'none'; f.style.width = '0%'; });
      if (popup) popup.classList.remove('visible');
    }
  });
})();

  /* --- Arsenal: Filter + Reveal + Touch Expansion --- */
  (function() {
    var grid = document.getElementById('arsenal-grid'), fBar = document.getElementById('arsenal-filter');
    if (!grid || !fBar) return;
    var domains = grid.querySelectorAll('.arsenal-domain');
    
    // Reveal Observer
    var dObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          e.target.querySelectorAll('.acard').forEach((c, i) => setTimeout(() => c.classList.add('in-view'), i * 35));
          dObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    domains.forEach(d => dObs.observe(d));

    // Filtering
    fBar.addEventListener('click', (e) => {
      var b = e.target.closest('.af-btn'); if (!b) return;
      fBar.querySelectorAll('.af-btn').forEach(x => x.classList.remove('active')); b.classList.add('active');
      var f = b.getAttribute('data-filter');
      domains.forEach(d => {
        var k = d.getAttribute('data-domain');
        if (f === 'all' || k === f) { 
          d.style.display = 'block'; 
          setTimeout(() => d.classList.remove('hidden-domain'), 10); 
        } else { 
          d.classList.add('hidden-domain'); 
          setTimeout(() => d.style.display = 'none', 300); 
        }
      });
    });

    // Mobile Expansion Toggle (Touch devices)
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      grid.addEventListener('touchstart', (e) => {
        const card = e.target.closest('.acard');
        if (card) {
          // If already expanded, let it be (standard tap behavior)
          // If not, expand it and collapse others in the same row
          const row = card.closest('.arsenal-row');
          if (row) {
            row.querySelectorAll('.acard').forEach(c => {
              if (c !== card) c.classList.remove('manual-expand');
            });
          }
          card.classList.toggle('manual-expand');
        }
      }, { passive: true });
    }
  })();