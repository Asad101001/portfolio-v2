'use strict';
/* ============================================================
   PORTFOLIO app.js v6  —  Muhammad Asad Khan
   ============================================================ */

/* ── A. Particle Canvas ─────────────────────────────────── */
(function () {
  var c = document.getElementById('bg-canvas');
  if (!c) return;
  var x = c.getContext('2d'), W, H, pts = [], mx = -9999, my = -9999;

  function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', function () { resize(); init(); });
  window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });

  function r(a, b) { return Math.random() * (b - a) + a; }

  // More particles, more variety
  function init() {
    pts = [];
    var n = Math.floor(W * H / 12000);
    for (var i = 0; i < n; i++) {
      pts.push({
        x: r(0,W), y: r(0,H),
        vx: r(-0.22,0.22), vy: r(-0.22,0.22),
        rad: r(0.6,2.8),
        a: r(0.12,0.55),
        hue: r(0,1) // 0=cyan, 0.5=purple, 1=cyan
      });
    }
  }
  init();

  function lerp(a,b,t){ return a+(b-a)*t; }

  function draw() {
    x.clearRect(0, 0, W, H);

    // Big ambient gradient
    var g = x.createRadialGradient(W/2, 0, 0, W/2, 0, H*0.7);
    g.addColorStop(0,'rgba(0,212,255,0.05)'); g.addColorStop(1,'transparent');
    x.fillStyle = g; x.fillRect(0,0,W,H);

    // Secondary bottom purple orb
    var g2 = x.createRadialGradient(W*0.8, H, 0, W*0.8, H, H*0.5);
    g2.addColorStop(0,'rgba(168,85,247,0.04)'); g2.addColorStop(1,'transparent');
    x.fillStyle = g2; x.fillRect(0,0,W,H);

    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -5) p.x = W+5; if (p.x > W+5) p.x = -5;
      if (p.y < -5) p.y = H+5; if (p.y > H+5) p.y = -5;

      // Mouse repulsion
      var dx = p.x-mx, dy = p.y-my, dd = Math.sqrt(dx*dx+dy*dy);
      if (dd < 100 && dd > 0) { var f=(100-dd)/100*0.4; p.x+=dx/dd*f; p.y+=dy/dd*f; }

      // Color interpolation cyan↔purple
      var r_c = p.hue < 0.5 ? lerp(0, 168, p.hue*2) : lerp(168, 0, (p.hue-0.5)*2);
      var g_c = p.hue < 0.5 ? lerp(212, 85, p.hue*2)  : lerp(85, 212, (p.hue-0.5)*2);
      var b_c = p.hue < 0.5 ? lerp(255, 247, p.hue*2)  : lerp(247, 255, (p.hue-0.5)*2);

      x.beginPath(); x.arc(p.x,p.y,p.rad,0,Math.PI*2);
      x.fillStyle='rgba('+Math.round(r_c)+','+Math.round(g_c)+','+Math.round(b_c)+','+p.a+')';
      x.fill();

      // Connect nearby particles
      for (var j = i+1; j < pts.length; j++) {
        var q=pts[j], ex=p.x-q.x, ey=p.y-q.y, ed=Math.sqrt(ex*ex+ey*ey);
        if (ed < 100) {
          x.beginPath(); x.moveTo(p.x,p.y); x.lineTo(q.x,q.y);
          x.strokeStyle='rgba(0,212,255,'+(0.05*(1-ed/100))+')';
          x.lineWidth=0.5; x.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ── B. Cursor Glow ─────────────────────────────────────── */
(function () {
  var glow = document.getElementById('cursor-glow');
  if (!glow) return;
  window.addEventListener('mousemove', function (e) {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
})();


/* ── C. Scroll Progress Bar ─────────────────────────────── */
(function () {
  var bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', function () {
    var scrolled = document.documentElement.scrollTop;
    var total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (scrolled / total * 100) + '%';
  }, { passive: true });
})();


/* ── D. Typewriter ──────────────────────────────────────── */
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
  setTimeout(tick, 800);
})();


/* ── E. Stat Counters ───────────────────────────────────── */
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
  function runAll() {
    counters.forEach(function (c) {
      var el = document.getElementById(c.id);
      if (el) animOne(el, c.target);
    });
  }
  setTimeout(runAll, 300);
  var about = document.getElementById('about');
  if (about && window.IntersectionObserver) {
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { runAll(); obs.disconnect(); }
    }, { threshold: 0.05 });
    obs.observe(about);
  }
})();


/* ── F. Certifications Drawer ───────────────────────────── */
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


/* ── G. Mobile nav ──────────────────────────────────────── */
(function () {
  var mn = document.querySelector('details.mobile-nav');
  if (!mn) return;
  mn.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { mn.removeAttribute('open'); });
  });
})();


/* ── H. Marquee duplication ─────────────────────────────── */
document.querySelectorAll('.export-tech-marquee-lane').forEach(function (lane) {
  lane.innerHTML += lane.innerHTML;
});


/* ── I. Back to Top ─────────────────────────────────────── */
(function () {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ── J. Last.fm Recently Played ─────────────────────────── */
(function () {
  var container = document.getElementById('lastfm-tracks');
  if (!container) return;
  var USER    = 'Asad991';
  var API_KEY = 'eccfb681fcf620a63fcb300d526544ba';
  var LIMIT   = 8;
  var URL     = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks'
              + '&user=' + USER + '&api_key=' + API_KEY
              + '&format=json&limit=' + LIMIT;
  function timeAgo(unixTs) {
    if (!unixTs) return 'now';
    var diff = Math.floor(Date.now() / 1000) - parseInt(unixTs, 10);
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }
  function getArt(images) {
    if (!images || !images.length) return '';
    var med = images[1] && images[1]['#text'] ? images[1]['#text'] : '';
    var lg  = images[2] && images[2]['#text'] ? images[2]['#text'] : '';
    return lg || med || (images[0] && images[0]['#text']) || '';
  }
  function render(tracks) {
    container.innerHTML = '';
    tracks.forEach(function (t) {
      var nowPlaying = t['@attr'] && t['@attr'].nowplaying === 'true';
      var art    = getArt(t.image);
      var name   = t.name || 'Unknown';
      var artist = (t.artist && (t.artist['#text'] || t.artist.name)) || '';
      var url    = t.url || '#';
      var ts     = t.date && t.date.uts ? t.date.uts : null;
      var a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.className = 'lastfm-track';
      var img = document.createElement('img');
      img.className = 'lastfm-track-art'; img.alt = name;
      if (art) { img.src = art; img.onerror = function () { this.style.background = 'rgba(213,16,7,0.1)'; this.src = ''; }; }
      else { img.style.background = 'rgba(213,16,7,0.08)'; }
      a.appendChild(img);
      var info = document.createElement('div'); info.className = 'lastfm-track-info';
      var nameEl = document.createElement('div'); nameEl.className = 'lastfm-track-name'; nameEl.textContent = name;
      var artistEl = document.createElement('div'); artistEl.className = 'lastfm-track-artist'; artistEl.textContent = artist;
      info.appendChild(nameEl); info.appendChild(artistEl);
      a.appendChild(info);
      var timeEl = document.createElement('div'); timeEl.className = 'lastfm-track-time';
      if (nowPlaying) {
        timeEl.innerHTML = '<span class="lastfm-now-playing"><span class="lastfm-eq"><span></span><span></span><span></span><span></span></span> live</span>';
      } else {
        timeEl.textContent = timeAgo(ts);
      }
      a.appendChild(timeEl);
      container.appendChild(a);
    });
  }
  function showError(msg) {
    container.innerHTML = '<div class="lastfm-error">&#9888; ' + msg + '</div>';
  }
  fetch(URL)
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      var tracks = data && data.recenttracks && data.recenttracks.track;
      if (!tracks || !tracks.length) { showError('No recent tracks found.'); return; }
      if (!Array.isArray(tracks)) tracks = [tracks];
      render(tracks);
    })
    .catch(function (err) {
      showError('Could not load scrobbles — check back later.');
      console.warn('Last.fm fetch failed:', err);
    });
})();


/* ── K. Gamification — XP (unique visit, first-visit only) ─ */
(function () {
  var bar      = document.getElementById('xp-bar');
  var badge    = document.getElementById('xp-level-badge');
  var countEl  = document.getElementById('xp-count-label');
  var nextEl   = document.getElementById('xp-next');
  if (!bar || !badge) return;

  var XP_PER_VISIT = 35;
  var XP_PER_LEVEL = 100;
  var KEY_VISITED  = 'asad_portfolio_visited_v2'; // new key = clean slate
  var KEY_VISITS   = 'asad_portfolio_visit_count';

  // Unique visit — only increment on first visit per browser session
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


/* ── L. Scroll-reveal (IntersectionObserver) ────────────── */
(function () {
  if (!window.IntersectionObserver) return;
  var els = document.querySelectorAll('.reveal');
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var delay = i * 80;
        setTimeout(function () { el.classList.add('visible'); }, delay);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(function (el) { obs.observe(el); });
})();


/* ── M. Ripple on click ─────────────────────────────────── */
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
    // Ensure relative positioning
    var pos = getComputedStyle(target).position;
    if (pos === 'static') target.style.position = 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(ripple);
    ripple.addEventListener('animationend', function () { ripple.remove(); });
  });
})();


/* ── N. Card Tilt on mouse move ─────────────────────────── */
(function () {
  var cards = document.querySelectorAll('.project-card, .about-stat-card');
  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var cx = rect.width / 2;
      var cy = rect.height / 2;
      var rx = (y - cy) / cy * -6;
      var ry = (x - cx) / cx * 6;
      card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });
})();


/* ── O. Feedback Modal ──────────────────────────────────── */
(function () {
  var btn      = document.getElementById('feedback-btn');
  var overlay  = document.getElementById('feedback-overlay');
  var closeBtn = document.getElementById('feedback-close');
  var submitBtn= document.getElementById('feedback-submit');
  var textarea = document.getElementById('feedback-text');
  var successEl= document.getElementById('feedback-success');
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

  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      var msg = textarea ? textarea.value.trim() : '';
      // Store feedback locally (no backend needed this way)
      var feedbacks = JSON.parse(localStorage.getItem('asad_feedbacks') || '[]');
      feedbacks.push({
        rating: selectedRating,
        message: msg,
        time: new Date().toISOString()
      });
      localStorage.setItem('asad_feedbacks', JSON.stringify(feedbacks));

      // Show success state
      if (submitBtn.parentNode) {
        submitBtn.style.display = 'none';
        if (textarea) textarea.style.display = 'none';
        document.querySelector('.feedback-rating').style.display = 'none';
        document.querySelector('.feedback-header').style.display = 'none';
      }
      if (successEl) successEl.style.display = 'block';

      // Auto-close
      setTimeout(function () {
        closeModal();
        // Reset after close
        setTimeout(function () {
          if (submitBtn) submitBtn.style.display = '';
          if (textarea)  { textarea.style.display = ''; textarea.value = ''; }
          var ratingDiv = document.querySelector('.feedback-rating');
          if (ratingDiv) ratingDiv.style.display = '';
          var headerDiv = document.querySelector('.feedback-header');
          if (headerDiv) headerDiv.style.display = '';
          if (successEl) successEl.style.display = 'none';
          selectedRating = 0;
          ratingBtns.forEach(function (b) { b.classList.remove('selected'); });
        }, 400);
      }, 1800);
    });
  }
})();
