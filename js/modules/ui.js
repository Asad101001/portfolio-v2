/* All UI interactions â€” Section Nav, Keyboard, Arsenal Grid */
'use strict';

// Ensure smoothTransition helper exists as a fallback
// window.smoothTransition is handled by animations.js

/* â”€â”€ Shooting Stars (desktop only, low freq) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
  // Only spawn occasionally â€” no performance impact
  setInterval(function () {
    if (Math.random() < 0.2 && !document.hidden) spawn();
  }, 12000);
  setTimeout(spawn, 3500);
})();

/* â”€â”€ Global Mouse Tracking for Glows â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function () {
  if (window._isMobile) return;
  var ticking = false, mx = 0, my = 0;
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    if (!ticking) {
      requestAnimationFrame(function () {
        document.documentElement.style.setProperty('--x', mx + 'px');
        document.documentElement.style.setProperty('--y', my + 'px');
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* â”€â”€ Cursor Glow (Follower) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€ Sections & Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* ── Scroll-position based active section (reliable) ─────── */
  /* Finds the section whose top is closest above 35% viewport  */
  var lastActiveIdx = -1;
  var sectionOffsets = [];
  function updateSectionOffsets() {
    var scrollTop = window.scrollY || window.pageYOffset;
    sectionOffsets = sections.map(function(id) {
      var el = document.getElementById(id);
      return el ? el.getBoundingClientRect().top + scrollTop : 0;
    });
  }
  window.addEventListener('resize', updateSectionOffsets, { passive: true });
  window.addEventListener('load', updateSectionOffsets);
  
  function getActiveSectionIdx() {
    if (sectionOffsets.length === 0) updateSectionOffsets();
    var scrollTop = window.scrollY || window.pageYOffset;
    var trigger = scrollTop + window.innerHeight * 0.35;
    var best = 0;
    for (var i = 0; i < sectionOffsets.length; i++) {
      if (sectionOffsets[i] <= trigger) best = i;
    }
    return best;
  }

  function updateAllIndicators() {
    var idx = getActiveSectionIdx();
    if (idx === lastActiveIdx) return;
    lastActiveIdx = idx;
    var activeSection = sections[idx];

    /* Desktop side dots */
    updateDots(idx);

    /* Desktop top-nav link highlights */
    document.querySelectorAll('.nav-links a').forEach(function(link) {
      var href = (link.getAttribute('href') || '').replace('#','');
      var matchId = activeSection;
      if (activeSection === 'demo' || activeSection === 'tech') matchId = 'projects';
      if (activeSection === 'education') matchId = 'about';
      link.classList.toggle('active', href === matchId || href === 'certifications' ? false : href === matchId);
    });

    /* Mobile bottom nav */
    var targetHref = '#' + activeSection;
    if (activeSection === 'demo' || activeSection === 'tech') targetHref = '#projects';
    if (activeSection === 'education') targetHref = '#about';
    document.querySelectorAll('.mbn-item:not(.mbn-cta):not([href="#certifications"])').forEach(function(item) {
      item.classList.toggle('active', item.getAttribute('href') === targetHref);
    });
  }

  /* Hook into the existing rAF scroll task loop */
  if (window._scrollTasks) {
    window._scrollTasks.push(updateAllIndicators);
  } else {
    window.addEventListener('scroll', updateAllIndicators, { passive: true });
  }
  setTimeout(updateAllIndicators, 300);

  /* Mobile bottom nav tap: spring bounce + haptic */
  document.querySelectorAll('.mbn-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      if (navigator.vibrate) navigator.vibrate(8);
      var el = this;
      el.style.transition = 'transform 0.1s cubic-bezier(0.34,1.56,0.64,1)';
      el.style.transform  = 'scale(0.82)';
      setTimeout(function() {
        el.style.transform = 'scale(1.08)';
        setTimeout(function() {
          el.style.transform = '';
          el.style.transition = '';
        }, 200);
      }, 80);
    });
  });

  window.addEventListener('keydown', function(e) {
    if (e.key === 'PageDown' || e.key === 'PageUp') {
      e.preventDefault();
      const scrollPos = window.scrollY;
      const sectionStarts = sections.map(id => {
        const el = document.getElementById(id);
        return el ? el.offsetTop - 80 : 0;
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

/* â”€â”€ Progressive Reveal & Counters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€ Certifications Drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function () {
  var drawer = document.getElementById('certs-drawer'), backdrop = document.getElementById('certs-backdrop'), closeBtn = document.getElementById('certs-close');
  if (!drawer) return;
  function open()  { window.smoothTransition(() => { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; }); }
  function close() { window.smoothTransition(() => { drawer.classList.remove('open'); document.body.style.overflow = ''; }); }
  
  // Toggle on certs click
  document.querySelectorAll('a[href="#certifications"]').forEach(a => a.addEventListener('click', e => { 
    e.preventDefault(); 
    if (drawer.classList.contains('open')) close(); else open(); 
  }));
  
  // Close on other nav links click
  document.querySelectorAll('.nav-links a:not([href="#certifications"]), .mobile-bottom-nav a:not([href="#certifications"])').forEach(a => {
    a.addEventListener('click', () => {
      if (drawer.classList.contains('open')) close();
    });
  });

  if (backdrop) backdrop.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* â”€â”€ Nav & UI Interactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function () {
  var navEl = document.querySelector('nav');
  if (navEl) {
    var lastHideY = 0;
    window._scrollTasks.push(() => {
      // On mobile, the bottom nav is inside <nav> â€” never hide the nav shell
      // The CSS hides .nav-inner on mobile, so we only need this on desktop
      if (window.innerWidth <= 768) {
        navEl.classList.remove('nav-hidden'); // keep visible so bottom nav shows
        return;
      }
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

/* â”€â”€ Rotating Widget Logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function () {
  function initRotation(widgetId, dotsId, interval) {
    var widget = document.getElementById(widgetId), dotsWrap = document.getElementById(dotsId);
    if (!widget || !dotsWrap) return;
    
    var items = widget.querySelectorAll('.rotating-item'), dots = dotsWrap.querySelectorAll('.r-dot'), current = 0, timer, animTimer;
    
    function show(idx) {
      if (idx === current) return;
      var inI = items[idx], outI = items[current];
      if (!inI || !outI) return;
      
      clearTimeout(animTimer);
      
      // Clean up any lingering states from previous animations
      items.forEach(item => {
        if (item !== inI && item !== outI) {
          item.classList.remove('exit-up', 'active');
        }
      });

      // Update dots immediately for snappiness
      dots.forEach(d => d.classList.remove('active')); 
      if (dots[idx]) dots[idx].classList.add('active');

      // Start transition
      outI.classList.add('exit-up');
      outI.classList.remove('active');
      
      // Tiny delay for the new item to enter makes it feel more "liquid"
      animTimer = setTimeout(() => {
        inI.classList.remove('exit-up'); // CRITICAL: prevent invisible content bug
        inI.classList.add('active');
      }, 40);

      // Clean up the exit class after transition to reset state
      setTimeout(() => {
        if (!outI.classList.contains('active')) outI.classList.remove('exit-up');
      }, 450);

      current = idx;
      
      if (widgetId === 'rotating-widget') {
         if (idx === 3) { dotsWrap.classList.add('barca-active'); widget.classList.add('football-active'); }
         else { dotsWrap.classList.remove('barca-active'); widget.classList.remove('football-active'); }
      }
    }
    
    function start() { clearInterval(timer); timer = setInterval(() => show((current + 1) % items.length), interval || 4500); }
    dots.forEach(dot => dot.addEventListener('click', () => { show(parseInt(dot.getAttribute('data-i') || dot.getAttribute('data-index'), 10)); start(); }));
    start();
  }

  // Hero Activity Hub (4 items: Book, Movie, TV Series, Football)
  initRotation('rotating-widget', 'rotating-dots', 5000);
  
  // Socials "The Big 3" (4 items: Films, Series, Players, Artists)
  initRotation('big3-social-widget', 'big3-social-dots', 6000);
})();

/* â”€â”€ Email & Utils â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function () {
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      var email = this.href.replace('mailto:', '');
      navigator.clipboard.writeText(email).then(() => window.showToast('ðŸ“§ Email copied to clipboard!'));
    });
  });

  window.showToast = function (msg, dur) {
    var el = document.getElementById('toast'); if (!el) return;
    el.textContent = msg; el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), dur || 2500);
  }
})();

/* â”€â”€ Section Reveal Stagger (section-in only â€” .reveal handled by GSAP) â”€â”€ */
(function () {
  var staggerParents = document.querySelectorAll('.projects-grid, .working-on-grid, .social-cards-grid, .demo-grid, .about-stats-col');
  staggerParents.forEach(p => Array.prototype.forEach.call(p.children, c => c.classList.add('s-child')));
  if (!window.IntersectionObserver) {
    document.querySelectorAll('.section-in').forEach(s => s.classList.add('in-view'));
    return;
  }
  var obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        e.target.querySelectorAll('.acard').forEach((c, i) => {
          if (!c.classList.contains('in-view')) {
            setTimeout(() => c.classList.add('in-view'), i * 35);
          }
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  // Only observe .section-in â€” GSAP handles .reveal
  document.querySelectorAll('.section-in, .proj-tags').forEach(s => obs.observe(s));
})();

/* â”€â”€ Experience Accordion â”€â”€ */
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
    if (arrow) arrow.textContent = isOpen ? 'â–²' : 'â–¼';
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
        if (d._hideTimer) clearTimeout(d._hideTimer);
        if (d._showTimer) clearTimeout(d._showTimer);
        
        if (f === 'all' || k === f) { 
          d.style.display = 'block'; 
          d._showTimer = setTimeout(() => {
            d.classList.remove('hidden-domain');
            // Re-trigger GSAP scroll trigger for elements that just became visible
            if (window.ScrollTrigger) window.ScrollTrigger.refresh();
          }, 10); 
        } else { 
          d.classList.add('hidden-domain'); 
          d._hideTimer = setTimeout(() => {
            d.style.display = 'none';
            if (window.ScrollTrigger) window.ScrollTrigger.refresh();
          }, 300); 
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
          e.stopPropagation(); // prevent global collapse
        }
      }, { passive: true });

      // Global collapse when touching away
      document.addEventListener('touchstart', (e) => {
        if (!e.target.closest('.acard')) {
          grid.querySelectorAll('.acard.manual-expand').forEach(c => c.classList.remove('manual-expand'));
        }
      }, { passive: true });
    }
  })();
