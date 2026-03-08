/* ============================================================
   js/modules/ui.js
   All UI interactions: nav, scroll ring, typewriter, terminal,
   section dots, cursor glow, magnetic, ripple, card tilt,
   rotating widget, stat counters, feedback modal, toast,
   scroll reveal, marquee, whimsy, keyboard shortcut
   ============================================================ */
'use strict';

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

/* ── Cursor Glow ────────────────────────────────────────── */
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
    setTimeout(function () { line.classList.add('t-visible'); }, 200 + i * 260);
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
  function open()  { drawer.classList.add('open');    document.body.style.overflow = 'hidden'; }
  function close() { drawer.classList.remove('open'); document.body.style.overflow = ''; }
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

/* ── Marquee Duplication ────────────────────────────────── */
document.querySelectorAll('.export-tech-marquee-lane').forEach(function (lane) { lane.innerHTML += lane.innerHTML; });

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

/* ── Card Tilt ──────────────────────────────────────────── */
(function () {
  if (window._isMobile) return;
  document.querySelectorAll('.project-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var rx = ((e.clientY - rect.top) / rect.height - 0.5) * -4;
      var ry = ((e.clientX - rect.left) / rect.width - 0.5) * 4;
      card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; });
  });
})();

/* ── Magnetic Button Hover ──────────────────────────────── */
(function () {
  if (window._isMobile) return;
  document.querySelectorAll('.magnetic').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var dx = (e.clientX - rect.left - rect.width / 2) * 0.15;
      var dy = (e.clientY - rect.top  - rect.height / 2) * 0.15;
      btn.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
    });
    btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
  });
})();

/* ── Rotating Widget ────────────────────────────────────── */
(function () {
  var widget = document.getElementById('rotating-widget');
  var dotsWrap = document.getElementById('rotating-dots');
  if (!widget || !dotsWrap) return;
  var items = widget.querySelectorAll('.rotating-item');
  var dots  = dotsWrap.querySelectorAll('.r-dot');
  var current = 0, timer;
  function show(index) {
    items.forEach(function (item) { item.classList.remove('active'); });
    dots.forEach(function (dot) { dot.classList.remove('active'); });
    items[index].classList.add('active');
    dots[index].classList.add('active');
    current = index;
  }
  timer = setInterval(function () { show((current + 1) % items.length); }, 4000);
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      clearInterval(timer);
      show(parseInt(dot.getAttribute('data-i'), 10));
      timer = setInterval(function () { show((current + 1) % items.length); }, 4000);
    });
  });
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

/* ── Scroll Progress Bar ────────────────────────────────── */
(function () {
  var el = document.getElementById('scroll-progress');
  if (!el) return;
  window._scrollTasks.push(function () {
    var pct = window._docH > 0 ? (window._scrollY / window._docH * 100).toFixed(1) : '0';
    el.style.setProperty('--pct', pct + '%');
  });
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

/* ── Skill Chip Effects — NO falling icons, reduced particles ── */
(function () {
  if (window._isMobile) return;
  var chips = document.querySelectorAll('.skill-chip');
  chips.forEach(function (chip, i) {
    if (i % 4 === 0) { chip.classList.add('pulsing'); chip.style.animationDelay = (Math.random() * 3) + 's'; }
  });
  var techSection = document.getElementById('tech');
  if (techSection && window.IntersectionObserver) {
    var lanes = techSection.querySelectorAll('.export-tech-marquee-lane');
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      lanes.forEach(function (lane) { lane.style.animationPlayState = visible ? 'running' : 'paused'; });
    }, { threshold: 0, rootMargin: '100px 0px 100px 0px' }).observe(techSection);
  }
  // Reduced particles — subtle, no confetti
  var wrap = document.querySelector('.marquee-wrap');
  if (!wrap) return;
  var pColors = ['var(--cyan)', '#a855f7', 'rgba(255,255,255,0.3)'];
  function spawnParticle() {
    var p = document.createElement('div');
    p.className = 'marquee-particle';
    p.style.cssText = 'left:' + (5 + Math.random() * 90) + '%;bottom:0;background:' + pColors[Math.floor(Math.random() * pColors.length)] + ';animation-duration:' + (2.5 + Math.random() * 3) + 's;animation-delay:' + (Math.random() * 2) + 's;width:' + (2 + Math.random() * 2) + 'px;height:' + (2 + Math.random() * 2) + 'px;';
    wrap.appendChild(p);
    p.addEventListener('animationend', function () { p.remove(); });
  }
  // Very reduced interval — 1 particle per 1200ms instead of 600ms
  setInterval(spawnParticle, 1200);
  for (var i = 0; i < 2; i++) setTimeout(spawnParticle, i * 400);
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

  /* ── shared helper: show the error popup ── */
  function showErrorPopup() {
    if (!popup) return;
    // Reset timer bar
    if (timerFill) {
      timerFill.style.transition = 'none';
      timerFill.style.transform  = 'scaleX(1)';
    }
    popup.setAttribute('aria-hidden', 'false');
    popup.classList.add('visible');

    // Animate timer bar draining over 4 s
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (timerFill) {
          timerFill.style.transition = 'transform 4s linear';
          timerFill.style.transform  = 'scaleX(0)';
        }
      });
    });

    // Auto-dismiss
    clearTimeout(popupTimer);
    popupTimer = setTimeout(function () {
      popup.classList.remove('visible');
      popup.setAttribute('aria-hidden', 'true');
    }, 4200);
  }

  /* ── accordion toggle ── */
  toggleBtn.addEventListener('click', function () {
    isOpen = !isOpen;
    content.classList.toggle('demo-content-open', isOpen);
    toggleBtn.classList.toggle('open', isOpen);
    if (arrow) arrow.textContent = isOpen ? '▲' : '▼';

    // Animate progress bars when opening
    if (isOpen) {
      setTimeout(function () {
        content.querySelectorAll('.demo-progress-fill').forEach(function (f) {
          f.style.transition = ''; // restore CSS transition
          f.style.width = f.getAttribute('data-w') || '0%';
        });
      }, 80);

      // Fire the error popup every time the accordion is opened
      setTimeout(showErrorPopup, 400);
    }
  });
})();

/* ── Feedback Modal ─────────────────────────────────────── */
(function () {
  var btn       = document.getElementById('feedback-btn');
  var overlay   = document.getElementById('feedback-overlay');
  var closeBtn  = document.getElementById('feedback-close');
  var submitBtn = document.getElementById('feedback-submit');
  var textarea  = document.getElementById('feedback-text');
  var successEl = document.getElementById('feedback-success');
  var ratingBtns = document.querySelectorAll('.rating-btn');
  if (!btn || !overlay) return;
  var rating = 0;
  var open  = function () { overlay.classList.add('open');    document.body.style.overflow='hidden'; };
  var close = function () { overlay.classList.remove('open'); document.body.style.overflow=''; };
  btn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  ratingBtns.forEach(function (rb) {
    rb.addEventListener('click', function () {
      rating = parseInt(rb.dataset.val, 10);
      ratingBtns.forEach(function (b) { b.classList.remove('selected'); });
      rb.classList.add('selected');
    });
  });
  var SB_URL = 'https://maqcxedrpmqtqibdjeae.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcWN4ZWRycG1xdHFpYmRqZWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzYyOTIsImV4cCI6MjA4ODA1MjI5Mn0.pAjBAmDhsbh8p7noOuyV6maPFDkRtptocE6VpuD6hSA';
  if (submitBtn) submitBtn.addEventListener('click', function () {
    var msg = textarea ? textarea.value.trim() : '';
    fetch(SB_URL + '/rest/v1/feedback', {
      method:'POST', headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'return=minimal'},
      body: JSON.stringify({ rating:rating, message:msg })
    }).catch(function(){});
    [submitBtn, textarea].forEach(function(x){ if(x) x.style.display='none'; });
    ['feedback-rating','feedback-header'].forEach(function(cls){ var el=document.querySelector('.'+cls); if(el) el.style.display='none'; });
    if (successEl) successEl.style.display='block';
    setTimeout(function () {
      close();
      setTimeout(function () {
        [submitBtn,textarea].forEach(function(x){if(x){x.style.display='';if(x.value!==undefined)x.value='';}});
        ['feedback-rating','feedback-header'].forEach(function(cls){var el=document.querySelector('.'+cls);if(el)el.style.display='';});
        if(successEl)successEl.style.display='none';
        rating=0; ratingBtns.forEach(function(b){b.classList.remove('selected');});
      }, 400);
    }, 1800);
  });
})();