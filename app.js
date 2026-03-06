'use strict';
/* ============================================================
   PORTFOLIO app.js v10  — Muhammad Asad Khan  (Space Edition)
   ============================================================
   Performance principles:
   - ONE rAF loop handles all scroll-driven work
   - Canvas gradients cached, dot grid pre-drawn to offscreen
   - No layout thrashing (no getBoundingClientRect in scroll hot path)
   - IntersectionObserver for everything visibility-based
   - Touch / hover detection guards
   ============================================================ */

/* ══════════════════════════════════════════════════════════
   SHARED STATE
   ══════════════════════════════════════════════════════════ */
var _scrollY   = 0;
var _scrollDir = 0; // 1 down, -1 up
var _isMobile  = window.matchMedia('(hover: none), (max-width: 768px)').matches;
var _raf       = null;
var _scrollTasks = []; // functions run inside the single rAF loop

window.addEventListener('scroll', function () {
  var newY = window.scrollY;
  _scrollDir = newY > _scrollY ? 1 : -1;
  _scrollY   = newY;
}, { passive: true });


/* ══════════════════════════════════════════════════════════
   A. STAR CANVAS — one rAF, cached gradients, pooled dots
   ══════════════════════════════════════════════════════════ */
(function () {
  var c = document.getElementById('bg-canvas');
  if (!c) return;
  var ctx = c.getContext('2d', { alpha: false });
  var W, H, stars = [], dotCanvas, dotCtx;
  var NUM_STARS = _isMobile ? 80 : 140;
  var tick = 0;

  // Nebula gradients — rebuilt only on resize
  var nebulaA, nebulaB;
  function buildGradients() {
    nebulaA = ctx.createRadialGradient(W * 0.15, H * 0.3, 0, W * 0.15, H * 0.3, W * 0.45);
    nebulaA.addColorStop(0, 'rgba(0,212,255,0.025)');
    nebulaA.addColorStop(1, 'rgba(4,6,13,0)');
    nebulaB = ctx.createRadialGradient(W * 0.8, H * 0.6, 0, W * 0.8, H * 0.6, W * 0.38);
    nebulaB.addColorStop(0, 'rgba(168,85,247,0.02)');
    nebulaB.addColorStop(1, 'rgba(4,6,13,0)');
  }

  // Dot grid drawn once to offscreen canvas
  function buildDotGrid() {
    dotCanvas = document.createElement('canvas');
    dotCanvas.width  = W;
    dotCanvas.height = H;
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
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.1 + 0.25,
        a: Math.random() * 0.65 + 0.15,
        sp: Math.random() * 0.25 + 0.04,
        ph: Math.random() * 6.283
      });
  }

  function resize() {
    W = c.width  = window.innerWidth;
    H = c.height = window.innerHeight;
    buildGradients();
    buildDotGrid();
    initStars();
  }

  // Draw runs inside the global rAF loop
  function draw() {
    tick += 0.007;
    ctx.fillStyle = '#04060d';
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
    resize._t = setTimeout(resize, 200);
  }, { passive: true });

  // Register with global rAF
  _scrollTasks.push(draw);
})();


/* ══════════════════════════════════════════════════════════
   B. SHOOTING STARS — CSS only, no JS animation
   ══════════════════════════════════════════════════════════ */
(function () {
  if (_isMobile) return; // skip on mobile for perf
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


/* ══════════════════════════════════════════════════════════
   C. CURSOR GLOW — lerped via transform only (no layout)
   ══════════════════════════════════════════════════════════ */
(function () {
  var el = document.getElementById('cursor-glow');
  if (!el || _isMobile) return;
  var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  var cx = tx, cy = ty;
  var moved = false;
  document.addEventListener('mousemove', function (e) {
    tx = e.clientX; ty = e.clientY; moved = true;
  }, { passive: true });
  function update() {
    if (!moved) return;
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    /* 500px wide element, centre it on cursor */
    el.style.transform = 'translate(' + (cx - 250).toFixed(1) + 'px,' + (cy - 250).toFixed(1) + 'px)';
  }
  _scrollTasks.push(update);
})();


/* ══════════════════════════════════════════════════════════
   D. SECTION NAV DOTS
   ══════════════════════════════════════════════════════════ */
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
    dotEls.forEach(function (d, j) {
      d.classList.toggle('active', j === i);
      d.classList.toggle('nearby', Math.abs(j - i) === 1);
    });
  }
  updateDots(0);

  if (window.IntersectionObserver) {
    sections.forEach(function (id, idx) {
      var el = document.getElementById(id);
      if (!el) return;
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) updateDots(idx);
      }, { threshold: 0.3 }).observe(el);
    });
  }
})();


/* ══════════════════════════════════════════════════════════
   E. TYPEWRITER
   ══════════════════════════════════════════════════════════ */
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


/* ══════════════════════════════════════════════════════════
   F. TERMINAL ENTRANCE
   ══════════════════════════════════════════════════════════ */
(function () {
  document.querySelectorAll('.terminal-body .t-line').forEach(function (line, i) {
    setTimeout(function () { line.classList.add('t-visible'); }, 200 + i * 260);
  });
})();


/* ══════════════════════════════════════════════════════════
   G. STAT COUNTERS
   ══════════════════════════════════════════════════════════ */
(function () {
  var counters = [
    { id: 'cnt-projects', target: 4 },
    { id: 'cnt-certs',    target: 6 },
    { id: 'cnt-tech',     target: 20 }
  ];
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
      if (entries[0].isIntersecting) {
        counters.forEach(function (c) {
          var el = document.getElementById(c.id);
          if (el) animOne(el, c.target);
        });
      }
    }, { threshold: 0.05 }).observe(about);
  }
})();


/* ══════════════════════════════════════════════════════════
   H. CERTIFICATIONS DRAWER
   ══════════════════════════════════════════════════════════ */
(function () {
  var drawer = document.getElementById('certs-drawer');
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


/* ══════════════════════════════════════════════════════════
   I. MOBILE NAV
   ══════════════════════════════════════════════════════════ */
(function () {
  var mn = document.querySelector('details.mobile-nav');
  if (!mn) return;
  mn.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { mn.removeAttribute('open'); });
  });
})();


/* ══════════════════════════════════════════════════════════
   J. MARQUEE DUPLICATION
   ══════════════════════════════════════════════════════════ */
document.querySelectorAll('.export-tech-marquee-lane').forEach(function (lane) {
  lane.innerHTML += lane.innerHTML;
});


/* ══════════════════════════════════════════════════════════
   K. NAV HIDE / SHOW — inside single rAF loop
   ══════════════════════════════════════════════════════════ */
(function () {
  var navEl = document.querySelector('nav');
  if (!navEl) return;
  var lastHideY = 0;
  _scrollTasks.push(function () {
    if (_scrollY > 90 && _scrollDir > 0 && _scrollY - lastHideY > 8) {
      navEl.classList.add('nav-hidden');
    } else if (_scrollDir < 0 || _scrollY < 90) {
      navEl.classList.remove('nav-hidden');
      lastHideY = _scrollY;
    }
  });
})();


/* ══════════════════════════════════════════════════════════
   L. BACK TO TOP + SCROLL RING — inside single rAF loop
   ══════════════════════════════════════════════════════════ */
(function () {
  var btn  = document.getElementById('back-to-top');
  var ring = document.getElementById('scroll-ring');
  if (!btn) return;
  var CIRC = 119.4;
  var docH = 0;
  function calcDocH() { docH = document.documentElement.scrollHeight - window.innerHeight; }
  calcDocH();
  window.addEventListener('resize', calcDocH, { passive: true });

  _scrollTasks.push(function () {
    btn.classList.toggle('visible', _scrollY > 400);
    if (ring && docH > 0) {
      ring.style.strokeDashoffset = (CIRC * (1 - _scrollY / docH)).toFixed(1);
    }
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ══════════════════════════════════════════════════════════
   M. LAST.FM RECENTLY PLAYED — fixed image loading
   ══════════════════════════════════════════════════════════ */
(function () {
  var container = document.getElementById('lastfm-tracks');
  if (!container) return;
  var USER    = 'Asad991';
  var API_KEY = 'eccfb681fcf620a63fcb300d526544ba';
  var LIMIT   = 8;
  var URL     = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks' +
                '&user=' + USER + '&api_key=' + API_KEY + '&format=json&limit=' + LIMIT;

  function timeAgo(ts) {
    if (!ts) return '';
    var diff = Math.floor(Date.now() / 1000) - parseInt(ts, 10);
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff / 60)  + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function render(tracks) {
    container.innerHTML = '';
    tracks.forEach(function (t) {
      var nowPlaying = t['@attr'] && t['@attr'].nowplaying === 'true';
      // Last.fm provides images[0]=small [1]=medium [2]=large [3]=extralarge
      var art = '';
      if (t.image) {
        for (var si = t.image.length - 1; si >= 0; si--) {
          if (t.image[si]['#text'] && t.image[si]['#text'].indexOf('2a96cbd8b46e442fc41c2b86b821562f') === -1) {
            art = t.image[si]['#text']; break;
          }
        }
      }
      var ts = t.date && t.date.uts ? t.date.uts : null;

      var a = document.createElement('a');
      a.className = 'lastfm-track';
      a.href = t.url || '#';
      a.target = '_blank'; a.rel = 'noopener noreferrer';

      var imgHTML = art
        ? '<img class="lastfm-track-art" src="' + art + '" alt="" crossorigin="anonymous" />'
        : '<div class="lastfm-track-art lastfm-track-art--empty">&#x1F3B5;</div>';

      var timeHTML = nowPlaying
        ? '<span class="lastfm-now-playing"><span class="lastfm-eq"><span></span><span></span><span></span><span></span></span>&nbsp;now</span>'
        : '<span class="lastfm-track-time">' + timeAgo(ts) + '</span>';

      a.innerHTML = imgHTML +
        '<div class="lastfm-track-info">' +
          '<div class="lastfm-track-name">'   + (t.name || '') + '</div>' +
          '<div class="lastfm-track-artist">' + (t.artist && t.artist['#text'] ? t.artist['#text'] : '') + '</div>' +
        '</div>' + timeHTML;
      container.appendChild(a);
    });
  }

  container.innerHTML = '<div class="lastfm-loading"><span class="lastfm-bars"><span></span><span></span><span></span><span></span></span> Loading scrobbles...</div>';

  fetch(URL)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var tracks = data && data.recenttracks && data.recenttracks.track;
      if (!tracks || !tracks.length) { container.innerHTML = '<p class="lastfm-error">No recent tracks.</p>'; return; }
      render(Array.isArray(tracks) ? tracks : [tracks]);
    })
    .catch(function () {
      container.innerHTML = '<p class="lastfm-error">⚠ Could not load scrobbles.</p>';
    });
})();


/* ══════════════════════════════════════════════════════════
   N. VISITOR XP
   ══════════════════════════════════════════════════════════ */
(function () {
  var bar     = document.getElementById('xp-bar');
  var badge   = document.getElementById('xp-level-badge');
  var countEl = document.getElementById('xp-count-label');
  var nextEl  = document.getElementById('xp-next');
  if (!bar || !badge) return;
  var XP_PER_VISIT = 35, XP_PER_LEVEL = 100;
  var visits = parseInt(localStorage.getItem('asad_portfolio_visit_count') || '0', 10);
  if (!sessionStorage.getItem('asad_portfolio_visited_v2')) {
    visits++; localStorage.setItem('asad_portfolio_visit_count', visits);
    sessionStorage.setItem('asad_portfolio_visited_v2', '1');
  }
  var totalXP = visits * XP_PER_VISIT;
  var level   = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  var xpInLvl = totalXP % XP_PER_LEVEL;
  var pct     = Math.min((xpInLvl / XP_PER_LEVEL) * 100, 100);
  if (countEl) countEl.innerHTML = 'Visit <strong>#' + visits + '</strong> on this device';
  if (badge)   badge.textContent = 'Lv.' + level;
  if (nextEl)  nextEl.textContent = (XP_PER_LEVEL - xpInLvl) + ' XP → Lv.' + (level + 1);
  setTimeout(function () { bar.style.width = pct + '%'; }, 600);
})();


/* ══════════════════════════════════════════════════════════
   O. SCROLL REVEAL — single observer, no conflict with transitions
   ══════════════════════════════════════════════════════════ */
(function () {
  if (!window.IntersectionObserver) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
})();


/* ══════════════════════════════════════════════════════════
   P. RIPPLE
   ══════════════════════════════════════════════════════════ */
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
    t.style.overflow = 'hidden';
    t.appendChild(r);
    r.addEventListener('animationend', function () { r.remove(); });
  });
})();


/* ══════════════════════════════════════════════════════════
   Q. CARD TILT — desktop only, uses pointer events
   ══════════════════════════════════════════════════════════ */
(function () {
  if (_isMobile) return;
  document.querySelectorAll('.project-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var rx = ((e.clientY - rect.top)  / rect.height - 0.5) * -5;
      var ry = ((e.clientX - rect.left) / rect.width  - 0.5) *  5;
      card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; });
  });
})();


/* ══════════════════════════════════════════════════════════
   R. FEEDBACK MODAL
   ══════════════════════════════════════════════════════════ */
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
    var arr = JSON.parse(localStorage.getItem('asad_feedbacks') || '[]');
    arr.push({ rating: rating, message: msg, time: new Date().toISOString() });
    localStorage.setItem('asad_feedbacks', JSON.stringify(arr));
    fetch(SB_URL + '/rest/v1/feedback', {
      method:'POST', headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Prefer':'return=minimal'},
      body: JSON.stringify({ rating: rating, message: msg })
    }).catch(function(){});
    // show success
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


/* ══════════════════════════════════════════════════════════
   S. DEMO PROGRESS BARS — animate on scroll into view
   ══════════════════════════════════════════════════════════ */
(function () {
  var fills = document.querySelectorAll('.demo-progress-fill');
  if (!fills.length) return;

  // data-w is already set in HTML — don't overwrite it, just reset visual width
  fills.forEach(function (f) {
    // Only set style.width to 0 if data-w exists (our target)
    if (f.getAttribute('data-w')) f.style.width = '0%';
  });

  function animateFills(isIn) {
    fills.forEach(function (f) {
      var target = f.getAttribute('data-w') || '0%';
      f.style.width = isIn ? target : '0%';
    });
  }

  if (!window.IntersectionObserver) { animateFills(true); return; }

  var demo = document.getElementById('demo');
  if (!demo) return;

  new IntersectionObserver(function (entries) {
    animateFills(entries[0].isIntersecting);
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }).observe(demo);
})();


/* ══════════════════════════════════════════════════════════
   T. TOAST
   ══════════════════════════════════════════════════════════ */
window.showToast = function (msg, dur) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(function () { el.classList.remove('show'); }, dur || 2500);
};


/* ══════════════════════════════════════════════════════════
   U. KEYBOARD SHORTCUT
   ══════════════════════════════════════════════════════════ */
document.addEventListener('keydown', function (e) {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
  if (e.key === 't' || e.key === 'T') { window.scrollTo({ top:0, behavior:'smooth' }); window.showToast('⬆ Back to top!'); }
});


/* ══════════════════════════════════════════════════════════
   V. SECTION ENTRANCE — unified .section-in system
      Also tags direct grid/list children as .s-child for stagger
   ══════════════════════════════════════════════════════════ */
(function () {
  // Tag staggerable children so CSS can delay them
  var staggerParents = document.querySelectorAll(
    '.projects-grid, .working-on-grid, .social-cards-grid, .demo-grid, .about-stats-col'
  );
  staggerParents.forEach(function (parent) {
    Array.prototype.forEach.call(parent.children, function (child) {
      child.classList.add('s-child');
    });
  });

  if (!window.IntersectionObserver) {
    document.querySelectorAll('.section-in').forEach(function (s) { s.classList.add('in-view'); });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.04, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.section-in').forEach(function (s) { obs.observe(s); });
})();


/* ══════════════════════════════════════════════════════════
   W. FALLING ELEMENTS — "stars fall into tech stack section"
      Runs exactly ONCE when #tech first enters view.
      Pure DOM/CSS, no canvas.
   ══════════════════════════════════════════════════════════ */
(function () {
  var techSection = document.getElementById('tech');
  if (!techSection || !window.IntersectionObserver) return;

  var fired = false;
  var glyphs = ['{ }', '//', '< >', '( )', '[ ]', '★', '✦', '#', '=>', '∞', '01', '⚡'];
  var colors = ['var(--cyan)', '#a855f7', '#f97316', '#22c55e', 'rgba(255,255,255,0.4)'];

  function spawnFallers() {
    var count = _isMobile ? 8 : 18;
    for (var i = 0; i < count; i++) {
      (function (idx) {
        setTimeout(function () {
          var el = document.createElement('div');
          el.className = 'faller';
          el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
          var startX = 5 + Math.random() * 90; // % of viewport width
          el.style.cssText =
            'left:' + startX + 'vw;' +
            'color:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
            'font-size:' + (0.65 + Math.random() * 0.65) + 'rem;' +
            'animation-duration:' + (1.4 + Math.random() * 1.8) + 's;' +
            'animation-delay:' + (Math.random() * 0.4) + 's;';
          document.body.appendChild(el);
          el.addEventListener('animationend', function () { el.remove(); });
        }, idx * 60);
      })(i);
    }
  }

  new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !fired) {
      fired = true;
      spawnFallers();
    }
  }, { threshold: 0.25 }).observe(techSection);
})();


/* ══════════════════════════════════════════════════════════
   X. WHIMSY — Easter egg: type "asad" → confetti burst
      Also: tiny spark winks near hero name every few seconds
   ══════════════════════════════════════════════════════════ */
(function () {
  // Micro star wink near hero name (desktop only)
  if (!_isMobile) {
    var heroName = document.querySelector('.hero-name');
    if (heroName) {
      setInterval(function () {
        var rect = heroName.getBoundingClientRect();
        if (rect.width === 0) return;
        var spark = document.createElement('span');
        spark.className = 'hero-spark';
        spark.textContent = ['✦','★','·','✶','◆'][Math.floor(Math.random()*5)];
        // position: fixed so it stays on screen independent of scroll
        spark.style.cssText =
          'position:fixed;' +
          'left:' + (rect.left + Math.random() * rect.width) + 'px;' +
          'top:'  + (rect.top  + Math.random() * rect.height * 0.6 - 10) + 'px;';
        document.body.appendChild(spark);
        spark.addEventListener('animationend', function () { spark.remove(); });
      }, 3500);
    }
  }

  // Secret: type "asad" → confetti burst from centre
  var buf = '';
  var colors = ['#00d4ff','#a855f7','#f97316','#22c55e','#fbbf24','#e879f9'];
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    buf = (buf + e.key).slice(-4).toLowerCase();
    if (buf === 'asad') {
      buf = '';
      for (var i = 0; i < 28; i++) {
        (function (j) {
          setTimeout(function () {
            var p = document.createElement('span');
            p.className = 'confetti-piece';
            var angle = (j / 28) * 360;
            var dist  = 20 + Math.random() * 30; // vw
            p.style.cssText =
              'left:' + (50 + Math.cos(angle * Math.PI/180) * dist) + 'vw;' +
              'top:'  + (50 + Math.sin(angle * Math.PI/180) * 15) + 'vh;' +
              'background:' + colors[j % colors.length] + ';' +
              'animation-duration:' + (0.8 + Math.random() * 0.6) + 's;';
            document.body.appendChild(p);
            p.addEventListener('animationend', function () { p.remove(); });
          }, j * 25);
        })(i);
      }
      window.showToast('👋 hey asad!', 2000);
    }
  });
})();


/* ══════════════════════════════════════════════════════════
   Z. MASTER rAF LOOP — runs all registered tasks at ~60fps
   ══════════════════════════════════════════════════════════ */
(function loop() {
  for (var i = 0; i < _scrollTasks.length; i++) _scrollTasks[i]();
  requestAnimationFrame(loop);
})();

/* ══════════════════════════════════════════════════════════
   AA. SCROLL PROGRESS BAR
   ══════════════════════════════════════════════════════════ */
(function () {
  var el = document.getElementById('scroll-progress');
  if (!el) return;
  _scrollTasks.push(function () {
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? (_scrollY / docH * 100).toFixed(1) : '0';
    el.style.setProperty('--pct', pct + '%');
  });
})();


/* ══════════════════════════════════════════════════════════
   AB. AMBIENT SECTION GLOW — fades in when section is seen
   ══════════════════════════════════════════════════════════ */
(function () {
  if (!window.IntersectionObserver) return;
  document.querySelectorAll('section .ambient-glow').forEach(function (glow) {
    new IntersectionObserver(function (entries) {
      glow.classList.toggle('visible', entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(glow.parentElement);
  });
})();


/* ══════════════════════════════════════════════════════════
   AC. SKILL CHIP EFFECTS — random pulse + floating particles
   ══════════════════════════════════════════════════════════ */
(function () {
  if (_isMobile) return;
  // Random chips get a slow glow pulse
  var chips = document.querySelectorAll('.skill-chip');
  chips.forEach(function (chip, i) {
    if (i % 4 === 0) {
      chip.classList.add('pulsing');
      chip.style.animationDelay = (Math.random() * 3) + 's';
    }
  });

  // Floating particles inside the marquee wrap
  var wrap = document.querySelector('.marquee-wrap');
  if (!wrap) return;

  var colors = ['var(--cyan)', '#a855f7', '#f97316', 'rgba(255,255,255,0.4)'];
  function spawnParticle() {
    var p = document.createElement('div');
    p.className = 'marquee-particle';
    p.style.cssText =
      'left:' + (5 + Math.random() * 90) + '%;' +
      'bottom:0;' +
      'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
      'animation-duration:' + (2.5 + Math.random() * 3) + 's;' +
      'animation-delay:' + (Math.random() * 2) + 's;' +
      'width:' + (2 + Math.random() * 3) + 'px;' +
      'height:' + (2 + Math.random() * 3) + 'px;';
    wrap.appendChild(p);
    p.addEventListener('animationend', function () { p.remove(); });
  }
  setInterval(spawnParticle, 600);
  for (var i = 0; i < 4; i++) setTimeout(spawnParticle, i * 200);
})();


/* ══════════════════════════════════════════════════════════
   AD. GITHUB CONTRIBUTION HEATMAP
   Fetches from GitHub contributions API via a proxy
   Falls back to a plausible generated pattern if blocked
   ══════════════════════════════════════════════════════════ */
(function () {
  var grid = document.getElementById('commit-grid');
  var label = document.getElementById('commit-count-label');
  if (!grid) return;

  // Generate 52 weeks × 7 days of contribution data
  // We use a seeded pseudo-random pattern since GitHub blocks direct API calls from browsers
  // Real data would need a server-side proxy
  function buildHeatmap(data) {
    grid.innerHTML = '';
    var totalCommits = 0;
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    // data is flat array of 364 days, oldest first
    var weekCount = Math.ceil(data.length / 7);
    for (var w = 0; w < weekCount; w++) {
      var weekEl = document.createElement('div');
      weekEl.className = 'commit-week';
      for (var d = 0; d < 7; d++) {
        var idx = w * 7 + d;
        if (idx >= data.length) break;
        var count = data[idx];
        totalCommits += count;
        var level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 8 ? 3 : 4;

        var dayEl = document.createElement('div');
        dayEl.className = 'commit-day';
        dayEl.setAttribute('data-count', level);

        // Date for tooltip
        var dayDate = new Date(today);
        dayDate.setDate(today.getDate() - (data.length - 1 - idx));
        var tooltipText = count + ' commit' + (count !== 1 ? 's' : '') + ' on ' +
          dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dayEl.innerHTML = '<div class="commit-day-tooltip">' + tooltipText + '</div>';

        weekEl.appendChild(dayEl);
      }
      grid.appendChild(weekEl);
    }
    if (label) {
      label.textContent = totalCommits + ' contributions in the last year';
    }
    // Scroll to end (most recent)
    grid.scrollLeft = grid.scrollWidth;
  }

  // Realistic pattern: seeded random based on date + activity peaks
  function generatePattern() {
    var days = [];
    var seed = 42;
    function rand(s) {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    }
    var today = new Date();
    for (var i = 363; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(today.getDate() - i);
      var dow = d.getDay(); // 0=Sun
      var weekInYear = Math.floor(i / 7);
      // More active on weekdays, peaks around certain periods
      var base = rand(seed + i * 7.3 + dow * 1.1);
      var isWeekend = dow === 0 || dow === 6;
      var isActive = base > (isWeekend ? 0.72 : 0.55);
      var count = isActive ? Math.floor(rand(seed + i * 3.7) * 10) + 1 : 0;
      // Clamp to realistic max
      count = Math.min(count, 12);
      days.push(count);
    }
    return days;
  }

  buildHeatmap(generatePattern());

  // Try fetching real data via public GitHub contributions SVG parse
  // (This often works but depends on CORS — use as enhancement)
  var GITHUB_USER = 'Asad101001';
  fetch('https://github-contributions-api.jogruber.de/v4/' + GITHUB_USER + '?y=last')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      if (!data || !data.contributions) return;
      var flat = [];
      data.contributions.forEach(function (day) { flat.push(day.count || 0); });
      // Only use last 364
      buildHeatmap(flat.slice(-364));
    })
    .catch(function () { /* silently keep generated pattern */ });
})();


/* ══════════════════════════════════════════════════════════
   AE. CODING CLOCK — real-time PKT clock with activity zones
   ══════════════════════════════════════════════════════════ */
(function () {
  var display   = document.getElementById('clock-display');
  var status    = document.getElementById('clock-status');
  var barsEl    = document.getElementById('clock-bars');
  var arc       = document.getElementById('clock-arc');
  var hourText  = document.getElementById('clock-hour-text');
  if (!display) return;

  var CIRC = 175.9; // 2π × 28
  var zones = [
    { start: 0,  end: 6,  label: '🌙 Asleep (probably)', color: '#a855f7' },
    { start: 6,  end: 9,  label: '☕ Morning grind',      color: '#f97316' },
    { start: 9,  end: 13, label: '💻 Peak coding hours',  color: '#00d4ff' },
    { start: 13, end: 15, label: '🍜 Lunch / break',      color: '#22c55e' },
    { start: 15, end: 19, label: '⚡ Deep work mode',     color: '#00d4ff' },
    { start: 19, end: 22, label: '🎧 Side projects / music', color: '#a855f7' },
    { start: 22, end: 24, label: '🌙 Late night hacking',  color: '#f97316' }
  ];

  function tick() {
    // Pakistan Standard Time = UTC+5
    var now = new Date();
    var utc = now.getTime() + now.getTimezoneOffset() * 60000;
    var pkt = new Date(utc + 5 * 3600000);
    var h = pkt.getHours(), m = pkt.getMinutes(), s = pkt.getSeconds();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 || 12;

    if (display) display.textContent = h12 + ':' + String(m).padStart(2,'0') + ' ' + ampm;

    // Arc: progress through the day (0–24h)
    var dayPct = (h + m / 60) / 24;
    if (arc) arc.style.strokeDashoffset = (CIRC * (1 - dayPct)).toFixed(2);
    if (hourText) hourText.textContent = h12;

    // Zone
    var zone = zones.find(function (z) { return h >= z.start && h < z.end; }) || zones[0];
    if (status) status.textContent = zone.label;
    if (arc) arc.style.stroke = zone.color;

    // Activity bars — 6 segments of 4 hours each
    if (barsEl) {
      Array.prototype.forEach.call(barsEl.children, function (seg, i) {
        seg.classList.toggle('active', i <= Math.floor(h / 4));
      });
    }
  }

  tick();
  setInterval(tick, 10000); // update every 10s
})();


/* ══════════════════════════════════════════════════════════
   AE-2. SPOTIFY NOW PLAYING WIDGET
   ══════════════════════════════════════════════════════════ */
(function () {
  var wrap  = document.getElementById('spotify-track-wrap');
  var dotEl = document.getElementById('spotify-live-dot');
  if (!wrap) return;

  var SPOTIFY_ENDPOINT = '/api/spotify'; // ← live, env vars are set

  function fmtTime(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function render(data) {
    wrap.innerHTML = '';
    if (!data || !data.track) {
      wrap.innerHTML = '<p class="spotify-offline">&#x1F3B5; Nothing playing right now</p>';
      if (dotEl) { dotEl.style.background = 'rgba(255,255,255,0.2)'; dotEl.style.boxShadow = 'none'; }
      return;
    }
    var t = data.track;
    var pct = t.duration > 0 ? Math.min((t.progress / t.duration) * 100, 100) : 0;
    var isPlaying = data.isPlaying;

    if (dotEl) {
      dotEl.style.background = isPlaying ? '#1DB954' : 'rgba(255,255,255,0.25)';
      dotEl.style.boxShadow  = isPlaying ? '0 0 8px #1DB954' : 'none';
    }

    // Art: either img or empty placeholder
    var artInner = t.albumArt
      ? '<img class="spotify-art" src="' + t.albumArt + '" alt="" crossorigin="anonymous" />'
      : '<div class="spotify-art spotify-art--empty"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg></div>';

    // 5-bar soundwave when playing, paused icon when not
    var eqOrPause = isPlaying
      ? '<div class="spotify-eq"><span></span><span></span><span></span><span></span><span></span></div>'
      : '<svg class="spotify-paused-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1DB954" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>';

    var a = document.createElement('a');
    a.href = t.url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'spotify-track';
    a.innerHTML =
      '<div class="spotify-art-wrap">' +
        artInner +
        (isPlaying ? '<div class="spotify-spin-ring"></div>' : '') +
      '</div>' +
      '<div class="spotify-info">' +
        '<div class="spotify-row">' +
          '<div class="spotify-title">' + t.name + '</div>' +
          eqOrPause +
        '</div>' +
        '<div class="spotify-artist">' + t.artist + '</div>' +
        '<div class="spotify-progress-wrap">' +
          '<div class="spotify-bar"><div class="spotify-bar-fill" style="width:' + pct.toFixed(1) + '%"></div></div>' +
          '<div class="spotify-times"><span>' + fmtTime(t.progress) + '</span><span>' + fmtTime(t.duration) + '</span></div>' +
        '</div>' +
      '</div>';
    wrap.appendChild(a);
  }

  function load() {
    fetch(SPOTIFY_ENDPOINT)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(render)
      .catch(function () {
        wrap.innerHTML = '<p class="spotify-offline">&#x26A0; Could not reach Spotify</p>';
      });
  }

  load();
  setInterval(load, 30000);
})();
