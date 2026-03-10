/* ============================================================
   js/modules/widgets.js
   External API widgets: Last.fm, Spotify, GitHub heatmap,
   Coding clock, Visitor XP, Currently Into (dynamic)
   ============================================================ */
'use strict';

/* ── Currently Into — Dynamic Card ─────────────────────────── */
(function () {
  /* ── Book Cover via Open Library ── */
  var readingCover = document.getElementById('reading-cover');
  var readingPlaceholder = document.getElementById('reading-placeholder');
  if (readingCover) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      readingCover.src = img.src;
      readingCover.style.display = 'block';
      if (readingPlaceholder) readingPlaceholder.style.display = 'none';
    };
    img.onerror = function () {
      if (readingPlaceholder) readingPlaceholder.style.display = 'flex';
    };
    // 1984 by George Orwell — ISBN 9780451524935
    img.src = 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg';
  }

  /* ── TV Poster via TVmaze ── */
  var watchingPoster = document.getElementById('watching-poster');
  var watchingPlaceholder = document.getElementById('watching-placeholder');
  if (watchingPoster) {
    fetch('https://api.tvmaze.com/singlesearch/shows?q=The+Pitt')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var url = data && data.image && (data.image.medium || data.image.original);
        if (url) {
          var img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = function () {
            watchingPoster.src = url;
            watchingPoster.style.display = 'block';
            if (watchingPlaceholder) watchingPlaceholder.style.display = 'none';
          };
          img.onerror = function () {
            if (watchingPlaceholder) watchingPlaceholder.style.display = 'flex';
          };
          img.src = url;
        }
      })
      .catch(function () {
        if (watchingPlaceholder) watchingPlaceholder.style.display = 'flex';
      });
  }

  /* ── FC Barcelona Live Score via ESPN ── */
  var barcaScoreEl = document.getElementById('barca-score');
  var barcaItem = document.querySelector('.rotating-item[data-index="2"]');
  if (barcaItem) barcaItem.classList.add('barca-slot');
  if (!barcaScoreEl && !barcaItem) return;

  function setBarcaDisplay(scoreText, isLive) {
    var valEl = barcaItem && barcaItem.querySelector('.rotating-value');
    if (valEl && scoreText) valEl.textContent = scoreText;

    if (!barcaItem) return;

    /* Remove old live badge */
    var oldBadge = barcaItem.querySelector('.barca-live-badge');
    if (oldBadge) oldBadge.remove();

    /* .barca-slot is a permanent CSS class for blaugrana styling
       regardless of live status. It should always be present. */
    barcaItem.classList.add('barca-slot');

    if (isLive) {
      barcaItem.classList.add('barca-live');
      var badge = document.createElement('span');
      badge.className = 'barca-live-badge';
      badge.textContent = 'LIVE';
      var lbl = barcaItem.querySelector('.rotating-label');
      if (lbl) lbl.after(badge);
    } else {
      barcaItem.classList.remove('barca-live');
    }
  }
  fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams/83/schedule?limit=5')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var events = data && data.events;
      if (!events || !events.length) return;

      var liveEvent = null, recentEvent = null, upcomingEvent = null;
      for (var i = 0; i < events.length; i++) {
        var ev = events[i];
        var state = ev.status && ev.status.type && ev.status.type.state;
        if (state === 'in' && !liveEvent) liveEvent = ev;
        else if (state === 'post' && !recentEvent) recentEvent = ev;
        else if (state === 'pre' && !upcomingEvent) upcomingEvent = ev;
      }

      function getMatchInfo(ev) {
        if (!ev || !ev.competitions || !ev.competitions[0]) return null;
        var comp = ev.competitions[0];
        var comps = comp.competitors || [];
        var home = comps.find(function (c) { return c.homeAway === 'home'; });
        var away = comps.find(function (c) { return c.homeAway === 'away'; });
        if (!home || !away) return null;
        var barcaIsHome = home.team && (home.team.id === '83' || (home.team.shortDisplayName || '').toLowerCase().indexOf('barcelona') >= 0);
        var barcaSide = barcaIsHome ? home : away;
        var oppSide   = barcaIsHome ? away : home;
        return {
          barcaScore: barcaSide.score || '0',
          oppScore:   oppSide.score || '0',
          oppName:    (oppSide.team && (oppSide.team.abbreviation || oppSide.team.shortDisplayName)) || '?',
          barcaIsHome: barcaIsHome
        };
      }

      if (liveEvent) {
        var info = getMatchInfo(liveEvent);
        var min = liveEvent.status && liveEvent.status.displayClock || '';
        if (info) {
          setBarcaDisplay('Barça ' + info.barcaScore + ' – ' + info.oppScore + ' ' + info.oppName + (min ? ' (' + min + ')' : ''), true);
        }
      } else if (recentEvent) {
        var info = getMatchInfo(recentEvent);
        if (info) {
          var bs = parseInt(info.barcaScore, 10), os = parseInt(info.oppScore, 10);
          var emoji = bs > os ? '✅' : bs === os ? '🤝' : '😭';
          var result = bs > os ? 'W' : bs === os ? 'D' : 'L';
          setBarcaDisplay(emoji + ' Barça ' + info.barcaScore + '–' + info.oppScore + ' ' + info.oppName + ' · ' + result, false);
        }
      } else if (upcomingEvent) {
        var dateStr = '';
        if (upcomingEvent.date) {
          var d = new Date(upcomingEvent.date);
          dateStr = ' · ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        }
        var shortName = upcomingEvent.shortName || upcomingEvent.name || 'Next match TBD';
        setBarcaDisplay('📅 Next: ' + shortName + dateStr, false);
      }
    })
    .catch(function () {
      // Silent fallback — keep static text
    });
})();


/* ── Last.fm Recently Played ────────────────────────────── */
(function () {
  var container = document.getElementById('lastfm-tracks');
  if (!container) return;
  var USER    = 'Asad991';
  var API_KEY = 'eccfb681fcf620a63fcb300d526544ba';
  var LIMIT   = 8;
  var URL     = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + USER + '&api_key=' + API_KEY + '&format=json&limit=' + LIMIT;

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
      var art = '';
      if (t.image) {
        for (var si = t.image.length - 1; si >= 0; si--) {
          if (t.image[si]['#text'] && t.image[si]['#text'].indexOf('2a96cbd8b46e442fc41c2b86b821562f') === -1) { art = t.image[si]['#text']; break; }
        }
      }
      var ts = t.date && t.date.uts ? t.date.uts : null;
      var a = document.createElement('a');
      a.className = 'lastfm-track'; a.href = t.url || '#'; a.target = '_blank'; a.rel = 'noopener noreferrer';
      var imgHTML = art ? '<img class="lastfm-track-art" src="' + art + '" alt="" crossorigin="anonymous" />' : '<div class="lastfm-track-art lastfm-track-art--empty">&#x1F3B5;</div>';
      var timeHTML = nowPlaying
        ? '<span class="lastfm-now-playing"><span class="lastfm-eq"><span></span><span></span><span></span><span></span></span>&nbsp;now</span>'
        : '<span class="lastfm-track-time">' + timeAgo(ts) + '</span>';
      a.innerHTML = imgHTML + '<div class="lastfm-track-info"><div class="lastfm-track-name">' + (t.name || '') + '</div><div class="lastfm-track-artist">' + (t.artist && t.artist['#text'] ? t.artist['#text'] : '') + '</div></div>' + timeHTML;
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
    .catch(function () { container.innerHTML = '<p class="lastfm-error">⚠ Could not load scrobbles.</p>'; });
})();


/* ── Visitor XP ─────────────────────────────────────────── */
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


/* ── GitHub Contribution Heatmap ────────────────────────── */
(function () {
  var grid  = document.getElementById('commit-grid');
  var label = document.getElementById('commit-count-label');
  if (!grid) return;

  function buildHeatmap(data) {
    grid.innerHTML = '';
    var totalCommits = 0;
    var today = new Date(); today.setHours(0, 0, 0, 0);
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
        var dayDate = new Date(today);
        dayDate.setDate(today.getDate() - (data.length - 1 - idx));
        dayEl.innerHTML = '<div class="commit-day-tooltip">' + count + ' commit' + (count !== 1 ? 's' : '') + ' on ' + dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</div>';
        weekEl.appendChild(dayEl);
      }
      grid.appendChild(weekEl);
    }
    if (label) label.textContent = totalCommits + ' contributions in the last year';
    grid.scrollLeft = grid.scrollWidth;
  }

  function generatePattern() {
    var days = [], seed = 42;
    function rand(s) { s = Math.sin(s) * 10000; return s - Math.floor(s); }
    var today = new Date();
    for (var i = 363; i >= 0; i--) {
      var d = new Date(today); d.setDate(today.getDate() - i);
      var dow = d.getDay();
      var base = rand(seed + i * 7.3 + dow * 1.1);
      var isWeekend = dow === 0 || dow === 6;
      var isActive = base > (isWeekend ? 0.72 : 0.55);
      var count = isActive ? Math.floor(rand(seed + i * 3.7) * 10) + 1 : 0;
      days.push(Math.min(count, 12));
    }
    return days;
  }

  buildHeatmap(generatePattern());
  fetch('https://github-contributions-api.jogruber.de/v4/Asad101001?y=last')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      if (!data || !data.contributions) return;
      var flat = [];
      data.contributions.forEach(function (day) { flat.push(day.count || 0); });
      buildHeatmap(flat.slice(-364));
    })
    .catch(function () {});
})();


/* ── Coding Clock (PKT) ─────────────────────────────────── */
(function () {
  var display  = document.getElementById('clock-display');
  var status   = document.getElementById('clock-status');
  var barsEl   = document.getElementById('clock-bars');
  var arc      = document.getElementById('clock-arc');
  var hourText = document.getElementById('clock-hour-text');
  if (!display) return;
  var CIRC = 175.9;
  var zones = [
    { start: 0,  end: 6,  label: '🌙 Asleep (probably)', color: '#a855f7' },
    { start: 6,  end: 9,  label: '☕ Morning grind',      color: '#f97316' },
    { start: 9,  end: 13, label: '💻 Peak coding hours',  color: '#00ff41' },
    { start: 13, end: 15, label: '🍜 Lunch / break',      color: '#22c55e' },
    { start: 15, end: 19, label: '⚡ Deep work mode',     color: '#00ff41' },
    { start: 19, end: 22, label: '🎧 Side projects / music', color: '#a855f7' },
    { start: 22, end: 24, label: '🌙 Late night hacking', color: '#f97316' }
  ];
  function tick() {
    var now = new Date();
    var utc = now.getTime() + now.getTimezoneOffset() * 60000;
    var pkt = new Date(utc + 5 * 3600000);
    var h = pkt.getHours(), m = pkt.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 || 12;
    if (display) display.textContent = h12 + ':' + String(m).padStart(2,'0') + ' ' + ampm;
    var dayPct = (h + m / 60) / 24;
    if (arc) arc.style.strokeDashoffset = (CIRC * (1 - dayPct)).toFixed(2);
    if (hourText) hourText.textContent = h12;
    var zone = zones.find(function (z) { return h >= z.start && h < z.end; }) || zones[0];
    if (status) status.textContent = zone.label;
    if (arc) arc.style.stroke = zone.color;
    if (barsEl) Array.prototype.forEach.call(barsEl.children, function (seg, i) { seg.classList.toggle('active', i <= Math.floor(h / 4)); });
  }
  tick(); setInterval(tick, 10000);
})();


/* ── Spotify Now Playing ────────────────────────────────── */
(function () {
  var wrap  = document.getElementById('spotify-track-wrap');
  var dotEl = document.getElementById('spotify-live-dot');
  if (!wrap) return;
  var ENDPOINT = '/api/spotify';

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
    if (dotEl) { dotEl.style.background = isPlaying ? '#1DB954' : 'rgba(255,255,255,0.25)'; dotEl.style.boxShadow = isPlaying ? '0 0 8px #1DB954' : 'none'; }
    var artInner = t.albumArt
      ? '<img class="spotify-art" src="' + t.albumArt + '" alt="" crossorigin="anonymous" />'
      : '<div class="spotify-art spotify-art--empty"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg></div>';
    var eqOrPause = isPlaying
      ? '<div class="spotify-eq"><span></span><span></span><span></span><span></span><span></span></div>'
      : '<svg class="spotify-paused-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1DB954" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>';
    var a = document.createElement('a');
    a.href = t.url || '#'; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'spotify-track';
    a.innerHTML = '<div class="spotify-art-wrap">' + artInner + (isPlaying ? '<div class="spotify-spin-ring"></div>' : '') + '</div><div class="spotify-info"><div class="spotify-row"><div class="spotify-title">' + t.name + '</div>' + eqOrPause + '</div><div class="spotify-artist">' + t.artist + '</div><div class="spotify-progress-wrap"><div class="spotify-bar"><div class="spotify-bar-fill" style="width:' + pct.toFixed(1) + '%"></div></div><div class="spotify-times"><span>' + fmtTime(t.progress) + '</span><span>' + fmtTime(t.duration) + '</span></div></div></div>';
    wrap.appendChild(a);
  }

  function load() {
    fetch(ENDPOINT)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(render)
      .catch(function () { wrap.innerHTML = '<p class="spotify-offline">&#x26A0; Could not reach Spotify</p>'; });
  }
  load();
  setInterval(load, 30000);
})();