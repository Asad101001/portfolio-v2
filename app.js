'use strict';
/* ============================================================
   PORTFOLIO app.js v8  —  Muhammad Asad Khan  (Space Edition)
   ============================================================ */

/* ── A. Background — Star field + shooting stars ──────────── */
(function () {
  var c = document.getElementById('bg-canvas');
  if (!c) return;
  var ctx = c.getContext('2d'), W, H;
  var stars = [];
  var NUM_STARS = 180;

  function resize() {
    W = c.width  = window.innerWidth;
    H = c.height = window.innerHeight;
    initStars();
    draw();
  }

  function initStars() {
    stars = [];
    for (var i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.7 + 0.15,
        speed: Math.random() * 0.3 + 0.05,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  var tick = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    tick += 0.008;

    // Nebula gradient smear
    var grd = ctx.createRadialGradient(W * 0.15, H * 0.3, 0, W * 0.15, H * 0.3, W * 0.45);
    grd.addColorStop(0, 'rgba(0,212,255,0.022)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

    var grd2 = ctx.createRadialGradient(W * 0.8, H * 0.6, 0, W * 0.8, H * 0.6, W * 0.38);
    grd2.addColorStop(0, 'rgba(168,85,247,0.018)');
    grd2.addColorStop(1, 'transparent');
    ctx.fillStyle = grd2; ctx.fillRect(0, 0, W, H);

    // Stars with twinkle
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var twinkle = s.a * (0.7 + 0.3 * Math.sin(tick * s.speed * 8 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220,235,255,' + twinkle + ')';
      ctx.fill();
    }

    // Subtle dot grid overlay
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    var spacing = 52;
    for (var row = 0; row * spacing <= H + spacing; row++) {
      for (var col = 0; col * spacing <= W + spacing; col++) {
        ctx.beginPath();
        ctx.arc(col * spacing, row * spacing, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
})();


/* ── B. Shooting Stars ─────────────────────────────────────── */
(function () {
  function spawnStar() {
    var star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.top  = (Math.random() * 50) + '%';
    star.style.left = (30 + Math.random() * 60) + '%';
    star.style.animation = 'shoot ' + (1.2 + Math.random() * 1.5) + 's ease-out forwards';
    document.body.appendChild(star);
    setTimeout(function () { star.remove(); }, 3000);
  }
  setInterval(function () {
    if (Math.random() < 0.45) spawnStar();
  }, 4000);
  setTimeout(spawnStar, 800);
})();


/* ── C. Cursor glow ────────────────────────────────────────── */
(function () {
  var el = document.getElementById('cursor-glow');
  if (!el || window.matchMedia('(hover: none)').matches) return;
  document.addEventListener('mousemove', function (e) {
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
  }, { passive: true });
})();


/* ── D. Section Nav — Icon Dots ────────────────────────────── */
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
  var labels = { hero:'Home', about:'About', projects:'Projects', demo:'Demo', tech:'Stack', education:'Education', contact:'Contact' };

  var nav = document.createElement('div');
  nav.id = 'section-dots';
  nav.setAttribute('aria-label', 'Section navigation');

  sections.forEach(function (id) {
    var btn = document.createElement('button');
    btn.className = 'section-dot';
    btn.setAttribute('data-section', id);
    btn.setAttribute('title', labels[id] || id);
    btn.innerHTML = icons[id] || '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>';
    btn.addEventListener('click', function () {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    nav.appendChild(btn);
  });
  document.body.appendChild(nav);

  // Observe sections
  if (window.IntersectionObserver) {
    var dots = nav.querySelectorAll('.section-dot');
    sections.forEach(function (id, idx) {
      var el = document.getElementById(id);
      if (!el) return;
      var obs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          dots.forEach(function (d) { d.classList.remove('active'); });
          if (dots[idx]) dots[idx].classList.add('active');
        }
      }, { threshold: 0.35 });
      obs.observe(el);
    });
  }
})();


/* ── E. Typewriter (starts on load) ────────────────────────── */
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
      if (ci === cur.length) { del = true; setTimeout(tick, 1800); return; }
      setTimeout(tick, 55);
    } else {
      el.textContent = cur.slice(0, --ci);
      if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 300); return; }
      setTimeout(tick, 28);
    }
  }
  // Start immediately on page load
  tick();
})();


/* ── F. Terminal Animated Entrance ──────────────────────────── */
(function () {
  var lines = document.querySelectorAll('.terminal-body .t-line');
  if (!lines.length) return;
  lines.forEach(function (line, i) {
    setTimeout(function () {
      line.classList.add('t-visible');
    }, 200 + i * 280);
  });
})();


/* ── G. Stat Counters ──────────────────────────────────────── */
(function () {
  var counters = [
    { id: 'cnt-projects', target: 4 },
    { id: 'cnt-certs',    target: 6 },
    { id: 'cnt-tech',     target: 20 }
  ];
  function animOne(el, target) {
    if (el._done) return;
    el._done = true;
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
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        counters.forEach(function (c) {
          var el = document.getElementById(c.id);
          if (el) animOne(el, c.target);
        });
      }
    }, { threshold: 0.05 });
    obs.observe(about);
  }
})();


/* ── H. Certifications Drawer ──────────────────────────────── */
(function () {
  var drawer   = document.getElementById('certs-drawer');
  var backdrop = document.getElementById('certs-backdrop');
  var closeBtn = document.getElementById('certs-close');
  if (!drawer) return;
  function open()  { drawer.classList.add('open');    document.body.style.overflow = 'hidden'; }
  function close() { drawer.classList.remove('open'); document.body.style.overflow = ''; }
  document.querySelectorAll('a[href="#certifications"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });
  if (backdrop) backdrop.addEventListener('click', close);
  if (closeBtn)  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();


/* ── I. Mobile nav ──────────────────────────────────────────── */
(function () {
  var mn = document.querySelector('details.mobile-nav');
  if (!mn) return;
  mn.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { mn.removeAttribute('open'); });
  });
})();


/* ── J. Marquee duplication ─────────────────────────────────── */
document.querySelectorAll('.export-tech-marquee-lane').forEach(function (lane) {
  lane.innerHTML += lane.innerHTML;
});


/* ── K. Navbar hide on scroll down, show on scroll up ────────── */
(function () {
  var navEl = document.querySelector('nav');
  if (!navEl) return;
  var lastY = 0;
  var hideThreshold = 80;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (y > hideThreshold && y > lastY) {
      navEl.classList.add('nav-hidden');
    } else {
      navEl.classList.remove('nav-hidden');
    }
    lastY = y;
  }, { passive: true });
})();


/* ── L. Back to Top + Scroll Progress Ring ── */
(function () {
  var btn  = document.getElementById('back-to-top');
  var ring = document.getElementById('scroll-ring');
  if (!btn) return;
  var CIRC = 119.4;
  function onScroll() {
    var scrolled = window.scrollY;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    var pct = total > 0 ? scrolled / total : 0;
    btn.classList.toggle('visible', scrolled > 400);
    if (ring) ring.style.strokeDashoffset = CIRC * (1 - pct);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ── M. Last.fm Recently Played ────────────────────────────── */
(function () {
  var container = document.getElementById('lastfm-tracks');
  if (!container) return;
  var USER    = 'Asad991';
  var API_KEY = 'eccfb681fcf620a63fcb300d526544ba';
  var LIMIT   = 8;
  var URL     = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks'
              + '&user=' + USER + '&api_key=' + API_KEY
              + '&format=json&limit=' + LIMIT;

  function timeAgo(ts) {
    if (!ts) return '';
    var diff = Math.floor(Date.now() / 1000) - parseInt(ts, 10);
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function render(tracks) {
    container.innerHTML = '';
    tracks.forEach(function (t, i) {
      var nowPlaying = t['@attr'] && t['@attr'].nowplaying === 'true';
      var art = (t.image && t.image[1] && t.image[1]['#text']) ? t.image[1]['#text'] : '';
      var ts  = t.date && t.date.uts ? t.date.uts : null;

      var a = document.createElement('a');
      a.className = 'lastfm-track';
      a.href = t.url || '#';
      a.target = '_blank'; a.rel = 'noopener';

      var imgEl = art
        ? '<img class="lastfm-track-art" src="' + art + '" alt="" loading="lazy" />'
        : '<div class="lastfm-track-art" style="display:flex;align-items:center;justify-content:center;font-size:1.1rem">🎵</div>';

      var timeEl = nowPlaying
        ? '<span class="lastfm-now-playing"><span class="lastfm-eq"><span></span><span></span><span></span><span></span></span>&nbsp;now</span>'
        : '<span class="lastfm-track-time">' + timeAgo(ts) + '</span>';

      a.innerHTML = imgEl
        + '<div class="lastfm-track-info">'
        +   '<div class="lastfm-track-name">' + (t.name || '') + '</div>'
        +   '<div class="lastfm-track-artist">' + (t.artist && t.artist['#text'] ? t.artist['#text'] : '') + '</div>'
        + '</div>' + timeEl;
      container.appendChild(a);
    });
  }

  function showError(msg) {
    container.innerHTML = '<p class="lastfm-error">⚠ ' + msg + '</p>';
  }

  fetch(URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var tracks = data && data.recenttracks && data.recenttracks.track;
      if (!tracks || !tracks.length) { showError('No recent tracks found.'); return; }
      render(Array.isArray(tracks) ? tracks : [tracks]);
    })
    .catch(function (err) {
      showError('Could not load scrobbles.');
      console.warn('Last.fm fetch failed:', err);
    });
})();


/* ── N. Gamification — XP ──────────────────────────────────── */
(function () {
  var bar      = document.getElementById('xp-bar');
  var badge    = document.getElementById('xp-level-badge');
  var countEl  = document.getElementById('xp-count-label');
  var nextEl   = document.getElementById('xp-next');
  if (!bar || !badge) return;

  var XP_PER_VISIT = 35;
  var XP_PER_LEVEL = 100;
  var KEY_VISITED  = 'asad_portfolio_visited_v2';
  var KEY_VISITS   = 'asad_portfolio_visit_count';

  var alreadyVisited = sessionStorage.getItem(KEY_VISITED);
  var visits = parseInt(localStorage.getItem(KEY_VISITS) || '0', 10);

  if (!alreadyVisited) {
    visits += 1;
    localStorage.setItem(KEY_VISITS, String(visits));
    sessionStorage.setItem(KEY_VISITED, '1');
  }

  var totalXP  = visits * XP_PER_VISIT;
  var level    = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  var xpInLvl  = totalXP % XP_PER_LEVEL;
  var pct      = Math.min((xpInLvl / XP_PER_LEVEL) * 100, 100);
  var xpToNext = XP_PER_LEVEL - xpInLvl;

  if (countEl) countEl.innerHTML = 'Visit <strong>#' + visits + '</strong> on this device';
  if (badge)   badge.textContent  = 'Lv.' + level;
  if (nextEl)  nextEl.textContent = xpToNext + ' XP → Lv.' + (level + 1);

  setTimeout(function () { bar.style.width = pct + '%'; }, 500);
})();


/* ── O. Scroll-reveal (one-shot, no re-trigger on scroll up) ────── */
(function () {
  if (!window.IntersectionObserver) return;
  var els = document.querySelectorAll('.reveal');
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(function (el) { obs.observe(el); });
})();


/* ── P. Ripple on click ─────────────────────────────────────── */
(function () {
  document.addEventListener('click', function (e) {
    var target = e.target.closest('.btn-primary, .btn-secondary, .social-card, .magnetic');
    if (!target) return;
    var rect = target.getBoundingClientRect();
    var ripple = document.createElement('span');
    var size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.cssText = [
      'width:' + size + 'px',
      'height:' + size + 'px',
      'left:' + (e.clientX - rect.left - size / 2) + 'px',
      'top:' + (e.clientY - rect.top - size / 2) + 'px'
    ].join(';');
    var pos = getComputedStyle(target).position;
    if (pos === 'static') target.style.position = 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(ripple);
    ripple.addEventListener('animationend', function () { ripple.remove(); });
  });
})();


/* ── Q. Card Tilt ───────────────────────────────────────────── */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  var cards = document.querySelectorAll('.project-card');
  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var rx = ((e.clientY - rect.top)  / rect.height - 0.5) * -4;
      var ry = ((e.clientX - rect.left) / rect.width  - 0.5) *  4;
      card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-3px)';
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; });
  });
})();


/* ── R. Feedback Modal ──────────────────────────────────────── */
(function () {
  var btn       = document.getElementById('feedback-btn');
  var overlay   = document.getElementById('feedback-overlay');
  var closeBtn  = document.getElementById('feedback-close');
  var submitBtn = document.getElementById('feedback-submit');
  var textarea  = document.getElementById('feedback-text');
  var successEl = document.getElementById('feedback-success');
  var ratingBtns = document.querySelectorAll('.rating-btn');
  if (!btn || !overlay) return;

  var selectedRating = 0;
  function openModal()  { overlay.classList.add('open');    document.body.style.overflow = 'hidden'; }
  function closeModal() { overlay.classList.remove('open'); document.body.style.overflow = ''; }

  btn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  ratingBtns.forEach(function (rb) {
    rb.addEventListener('click', function () {
      selectedRating = parseInt(rb.dataset.val, 10);
      ratingBtns.forEach(function (b) { b.classList.remove('selected'); });
      rb.classList.add('selected');
    });
  });

  var SUPABASE_URL = 'https://maqcxedrpmqtqibdjeae.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hcWN4ZWRycG1xdHFpYmRqZWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzYyOTIsImV4cCI6MjA4ODA1MjI5Mn0.pAjBAmDhsbh8p7noOuyV6maPFDkRtptocE6VpuD6hSA';

  function saveFeedback(rating, message) {
    var entry = { rating: rating, message: message, time: new Date().toISOString() };
    var feedbacks = JSON.parse(localStorage.getItem('asad_feedbacks') || '[]');
    feedbacks.push(entry);
    localStorage.setItem('asad_feedbacks', JSON.stringify(feedbacks));
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      fetch(SUPABASE_URL + '/rest/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ rating: rating, message: message })
      }).catch(function(err) { console.warn('Supabase save failed:', err); });
    }
  }

  function showSuccess() {
    if (submitBtn) submitBtn.style.display = 'none';
    if (textarea)  textarea.style.display  = 'none';
    var ratingDiv = document.querySelector('.feedback-rating');
    var headerDiv = document.querySelector('.feedback-header');
    if (ratingDiv) ratingDiv.style.display = 'none';
    if (headerDiv) headerDiv.style.display = 'none';
    if (successEl) successEl.style.display = 'block';
    setTimeout(function () {
      closeModal();
      setTimeout(function () {
        if (submitBtn) submitBtn.style.display = '';
        if (textarea)  { textarea.style.display = ''; textarea.value = ''; }
        if (ratingDiv) ratingDiv.style.display = '';
        if (headerDiv) headerDiv.style.display = '';
        if (successEl) successEl.style.display = 'none';
        selectedRating = 0;
        ratingBtns.forEach(function (b) { b.classList.remove('selected'); });
      }, 400);
    }, 1800);
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      saveFeedback(selectedRating, textarea ? textarea.value.trim() : '');
      showSuccess();
    });
  }
})();


/* ── S. Demo Section — Progress bars animate on scroll ────────── */
(function () {
  var fills = document.querySelectorAll('.demo-progress-fill');
  if (!fills.length || !window.IntersectionObserver) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      entry.target.querySelectorAll('.demo-progress-fill').forEach(function (fill) {
        if (entry.isIntersecting) {
          fill.style.width = fill.getAttribute('data-w') || '0%';
        } else {
          fill.style.width = '0%';
        }
      });
    });
  }, { threshold: 0.2 });

  var demoSection = document.getElementById('demo');
  if (demoSection) {
    obs.observe(demoSection);
    // Store original widths
    fills.forEach(function (f) {
      if (!f.getAttribute('data-w')) {
        f.setAttribute('data-w', f.style.width || '0%');
        f.style.width = '0%';
      }
    });
  }
})();


/* Quiz game removed */


/* ── U. Toast helper ────────────────────────────────────────── */
window.showToast = function(msg, dur) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(function () { el.classList.remove('show'); }, dur || 2500);
};


/* ── V. Keyboard shortcut: T for top, / for search focus ──── */
(function () {
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.key === 't' || e.key === 'T') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.showToast('⬆ Back to top!');
    }
  });
})();
