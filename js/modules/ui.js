/* ============================================================
   js/modules/ui.js
   All UI interactions.
   ============================================================ */
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
    el.style.animationDuration = (1.1 + Math.random() * 1.4) + 's';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2800);
  }
  setInterval(function () { if (Math.random() < 0.4) spawn(); }, 4500);
  setTimeout(spawn, 1200);
})();

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

/* ── Section Nav Dots ───────────────────────────────────── */
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
  var nav = document.createElement('div');
  nav.id = 'section-dots';
  var dotEls = [];
  sections.forEach(function (id) {
    var btn = document.createElement('button');
    btn.className = 'section-dot';
    btn.setAttribute('data-section', id);
    btn.setAttribute('title', labels[id]);
    btn.innerHTML = icons[id];
    btn.addEventListener('click', function () {
      var t = document.getElementById(id);
      if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
    nav.appendChild(btn);
    dotEls.push(btn);
  });
  document.body.appendChild(nav);
  function updateDots(i) {
    dotEls.forEach(function (d, j) { d.classList.toggle('active', j === i); d.classList.toggle('nearby', Math.abs(j - i) === 1); });
  }
  updateDots(0);
  if (window.IntersectionObserver) {
    sections.forEach(function (id, idx) {
      var el = document.getElementById(id);
      if (!el) return;
      new IntersectionObserver(function (e) { if (e[0].isIntersecting) updateDots(idx); }, { threshold: 0.3 }).observe(el);
    });
  }
})();

/* ── Typewriter ─────────────────────────────────────────── */
(function () {
  var el = document.getElementById('typewriter');
  if (!el) return;
  var phrases = [
    'Cloud & Networking enthusiast',
    'Python + Data Science learner',
    'Building AI / LLM pipelines',
    'AWS architecture explorer',
    'Breaking things since 2024...',
    'Always learning. Always shipping.'
  ];
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

/* ── Terminal Entrance ─────────────────────────────────── */
(function () {
  document.querySelectorAll('.terminal-body .t-line').forEach(function (line, i) {
    setTimeout(function () { line.classList.add('t-visible'); }, 50 + i * 120);
  });
})();

/* ── Stat Counters ──────────────────────────────────────── */
(function () {
  var counters = [{ id: 'cnt-projects', target: 4 }, { id: 'cnt-certs', target: 6 }, { id: 'cnt-tech', target: 20 }];
  function animOne(el, target) {
    if (el._done) return; el._done = true;
    var start = performance.now(), dur = 1400;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(e * target) + '+';
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var about = document.getElementById('about');
  if (about && window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { counters.forEach(function (c) { var el = document.getElementById(c.id); if (el) animOne(el, c.target); }); }
    }, { threshold: 0.05 }).observe(about);
  }
})();

/* ── Certifications Drawer ─────────────────────────────── */
(function () {
  var drawer = document.getElementById('certs-drawer');
  var backdrop = document.getElementById('certs-backdrop');
  var closeBtn = document.getElementById('certs-close');
  if (!drawer) return;
  function open()  { window.smoothTransition(() => { drawer.classList.add('open');    document.body.style.overflow = 'hidden'; }); }
  function close() { window.smoothTransition(() => { drawer.classList.remove('open'); document.body.style.overflow = ''; }); }
  document.querySelectorAll('a[href="#certifications"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
  if (backdrop) backdrop.addEventListener('click', close);
  if (closeBtn)  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

/* ── Mobile Nav ─────────────────────────────────────────── */
(function () {
  var mn = document.querySelector('details.mobile-nav');
  if (!mn) return;
  mn.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mn.removeAttribute('open'); }); });
})();

    /* ── Marquee Duplication ── */
    document.querySelectorAll('.export-tech-marquee-lane').forEach(function (lane) {
      var original = lane.innerHTML;
      lane.innerHTML = original + original + original + original;
    });

/* ── Nav Hide/Show ──────────────────────────────────────── */
(function () {
  var navEl = document.querySelector('nav');
  if (!navEl) return;
  var lastHideY = 0;
  window._scrollTasks.push(function () {
    if (window._scrollY > 90 && window._scrollDir > 0 && window._scrollY - lastHideY > 8) {
      navEl.classList.add('nav-hidden');
    } else if (window._scrollDir < 0 || window._scrollY < 90) {
      navEl.classList.remove('nav-hidden');
      lastHideY = window._scrollY;
    }
  });
})();

/* ── Back to Top + Scroll Ring ─────────────────────────── */
(function () {
  var btn  = document.getElementById('back-to-top');
  var ring = document.getElementById('scroll-ring');
  if (!btn) return;
  var CIRC = 119.4;
  window._scrollTasks.push(function () {
    btn.classList.toggle('visible', window._scrollY > 400);
    if (ring && window._docH > 0) ring.style.strokeDashoffset = (CIRC * (1 - window._scrollY / window._docH)).toFixed(1);
  });
  btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();

/* ── Ripple ─────────────────────────────────────────────── */
(function () {
  document.addEventListener('click', function (e) {
    var t = e.target.closest('.btn-primary,.btn-secondary,.btn-linkedin,.social-card,.magnetic');
    if (!t) return;
    var rect = t.getBoundingClientRect();
    var r = document.createElement('span');
    var s = Math.max(rect.width, rect.height);
    r.className = 'ripple';
    r.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - rect.left - s/2) + 'px;top:' + (e.clientY - rect.top - s/2) + 'px';
    if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
    t.appendChild(r);
    r.addEventListener('animationend', function () { r.remove(); });
  });
})();

/* Animation effects (Tilt, Magnetic, Spotlight) moved to animations.js */

/* ── Rotating Widget — smooth directional animation ─────── */
(function () {
  var widget   = document.getElementById('rotating-widget');
  var dotsWrap = document.getElementById('rotating-dots');
  if (!widget || !dotsWrap) return;

  var items   = widget.querySelectorAll('.rotating-item');
  var dots    = dotsWrap.querySelectorAll('.r-dot');
  var current = 0;
  var timer;
  var isAnimating = false;

  /* Mark the football slot permanently so CSS can target it */
  items.forEach(function (item) {
    if (item.getAttribute('data-index') === '3') {
      item.classList.add('barca-slot');
    }
  });

  function show(index) {
    if (!items || items.length === 0) return;
    if (isAnimating || index === current) return;
    
    var inItem = items[index];
    var outItem = items[current];
    if (!inItem || !outItem) return;

    isAnimating = true;

    /* 1. Clear ALL items of exit classes just in case */
    items.forEach(function(item) { 
      if (item !== outItem && item !== inItem) {
        item.classList.remove('active', 'exit-up'); 
      }
    });

    /* Exit */
    outItem.classList.add('exit-up');
    outItem.classList.remove('active');

    /* Clean up exit class after transition */
    var cleanup = function() {
      outItem.removeEventListener('transitionend', cleanup);
      outItem.classList.remove('exit-up');
      isAnimating = false;
    };
    outItem.addEventListener('transitionend', cleanup, { once: true });
    
    // Safety fallback for cleanup
    setTimeout(function() {
      outItem.classList.remove('exit-up');
      isAnimating = false;
    }, 700);

    /* Enter */
    setTimeout(function () {
      inItem.classList.add('active');
    }, 50);

    /* Dots */
    dots.forEach(function (d) { d.classList.remove('active'); });
    if (dots[index]) dots[index].classList.add('active');

    current = index;

    /* Blaugrana activation (now slot 3) */
    if (index === 3) {
      dotsWrap.classList.add('barca-active');
      widget.classList.add('football-active');
    } else {
      dotsWrap.classList.remove('barca-active');
      widget.classList.remove('football-active');
    }
  }

  /* Auto-rotate */
  function startTimer() {
    clearInterval(timer);
    timer = setInterval(function () {
      show((current + 1) % items.length);
    }, 4500);
  }

  /* Dot click */
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      clearInterval(timer);
      show(parseInt(dot.getAttribute('data-i'), 10));
      startTimer();
    });
  });

  startTimer();
})();

/* ── Toast ──────────────────────────────────────────────── */
window.showToast = function (msg, dur) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(function () { el.classList.remove('show'); }, dur || 2500);
};

/* ── Keyboard Shortcut ──────────────────────────────────── */
document.addEventListener('keydown', function (e) {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
  if (e.key === 't' || e.key === 'T') { window.scrollTo({ top:0, behavior:'smooth' }); window.showToast('⬆ Back to top!'); }
});

/* ── Scroll Reveal ──────────────────────────────────────── */
(function () {
  if (!window.IntersectionObserver) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.style.willChange = 'auto'; // release GPU layer after reveal
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
})();

/* ── Section Entrance Stagger ───────────────────────────── */
(function () {
  var staggerParents = document.querySelectorAll('.projects-grid, .working-on-grid, .social-cards-grid, .demo-grid, .about-stats-col');
  staggerParents.forEach(function (parent) {
    Array.prototype.forEach.call(parent.children, function (child) { child.classList.add('s-child'); });
  });
  if (!window.IntersectionObserver) {
    document.querySelectorAll('.section-in').forEach(function (s) { s.classList.add('in-view'); });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.03, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.section-in').forEach(function (s) { obs.observe(s); });
})();



/* ── Ambient Glow ───────────────────────────────────────── */
(function () {
  if (!window.IntersectionObserver) return;
  document.querySelectorAll('section .ambient-glow').forEach(function (glow) {
    new IntersectionObserver(function (entries) {
      glow.classList.toggle('visible', entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(glow.parentElement);
  });
})();

/* ── Skill Chip Effects - hover expand only, no particles ── */
(function () {
  /* Pause marquee when tech section scrolls out of view */
  var techSection = document.getElementById('tech');
  if (techSection && window.IntersectionObserver) {
    var lanes = techSection.querySelectorAll('.export-tech-marquee-lane');
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      lanes.forEach(function (lane) {
        lane.style.animationPlayState = visible ? 'running' : 'paused';
      });
    }, { threshold: 0.05 }).observe(techSection);
  }
})();

/* ── Whimsy: Hero Sparks only ───────────────────────────── */
(function () {
  if (!window._isMobile) {
    var heroName = document.querySelector('.hero-name');
    if (heroName) {
      setInterval(function () {
        var rect = heroName.getBoundingClientRect();
        if (rect.width === 0) return;
        var spark = document.createElement('span');
        spark.className = 'hero-spark';
        spark.textContent = ['✦','★','·','✶','◆'][Math.floor(Math.random() * 5)];
        spark.style.cssText = 'position:fixed;left:' + (rect.left + Math.random() * rect.width) + 'px;top:' + (rect.top + Math.random() * rect.height * 0.6 - 10) + 'px;';
        document.body.appendChild(spark);
        spark.addEventListener('animationend', function () { spark.remove(); });
      }, 3500);
    }
  }
})();

/* ── Demo Progress Bars — triggered by accordion open ───── */
(function () {
  var fills = document.querySelectorAll('.demo-progress-fill');
  if (!fills.length) return;
  // Reset all bars to 0 on load
  fills.forEach(function (f) { f.style.width = '0%'; f.style.transition = 'none'; });
})();

/* ── Experience Accordion + Error Popup ─────────────────── */
(function () {
  var toggleBtn  = document.getElementById('experience-toggle');
  var content    = document.getElementById('demo-content');
  var popup      = document.getElementById('error-popup');
  var timerFill  = document.getElementById('error-timer-fill');
  if (!toggleBtn || !content) return;

  var arrow  = toggleBtn.querySelector('.exp-toggle-arrow');
  var isOpen = false;
  var popupTimer = null;

  function showErrorPopup() {
    if (!popup) return;
    popup.classList.add('visible');
    popup.setAttribute('aria-hidden', 'false');

    if (timerFill) {
      timerFill.style.transition = 'none';
      timerFill.style.transform  = 'scaleX(1)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          timerFill.style.transition = 'transform 4s linear';
          timerFill.style.transform  = 'scaleX(0)';
        });
      });
    }

    clearTimeout(popupTimer);
    popupTimer = setTimeout(() => {
      popup.classList.remove('visible');
      popup.setAttribute('aria-hidden', 'true');
    }, 4200);
  }

  toggleBtn.addEventListener('click', function () {
    isOpen = !isOpen;
    
    // UI Updates
    toggleBtn.classList.toggle('open', isOpen);
    content.classList.toggle('demo-content-open', isOpen);
    if (arrow) arrow.textContent = isOpen ? '▲' : '▼';

    if (isOpen) {
      // TRIGGER BARS IMMEDIATELY
      var bars = content.querySelectorAll('.demo-progress-fill');
      bars.forEach(function (f) {
        f.style.transition = 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)';
        f.style.width = f.getAttribute('data-w') || '0%';
      });
      // Delay popup slightly for impact
      setTimeout(showErrorPopup, 200);
    } else {
      // Reset
      content.querySelectorAll('.demo-progress-fill').forEach(function (f) {
        f.style.transition = 'none';
        f.style.width = '0%';
      });
      if (popup) {
        popup.classList.remove('visible');
        clearTimeout(popupTimer);
      }
    }
  });
})();