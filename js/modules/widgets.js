/* ── Configuration ── */
export const CONFIG = {
  usernames: {
    letterboxd: 'asad_k',
    lastfm: 'Asad991',
    github: 'Asad101001',
    twitter: 'As4d_41'
  },
  currently: {
    reading: '1984 George Orwell',
    series: ['Severance', 'Succession', 'Better Call Saul', 'The Pitt', 'A Knight of the Seven Kingdoms', 'Game of Thrones', 'Pluribus', 'The Boys', 'Invincible', 'Shrinking']
  },
  big3: {
    players: [
      { name: 'Lamine Yamal',    fallback: '⚽' },
      { name: 'Pedri González',  fallback: '⚽', wikiQuery: 'Pedri' },
      { name: 'Nuno Mendes',     fallback: '⚽' }
    ],
    watchlist: [
      { title: 'Dune: Part Three', searchQuery: 'Dune: Part Three' },
      { title: 'The Odyssey', searchQuery: 'The Odyssey (2026 film)' },
      { title: 'Spider-Man: Brand New Day', searchQuery: 'Spider-Man: Brand New Day' }
    ],
    seriesWatchlist: [
      { title: 'The Wire' },
      { title: 'The Sopranos' },
      { title: 'Lost' }
    ]
  }
};

/**
 * Simple HTML escaping to prevent XSS.
 */
export function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ══════════════════════════════════════════════════════════
   IMAGE / DATA UTILITY HELPERS — FIXED VERSION
   ══════════════════════════════════════════════════════════ */

function _toHttpsUrl(url) {
  if (!url || typeof url !== 'string') return null;
  return url.replace(/^http:\/\//i, 'https://');
}

/**
 * TVmaze — free, no key, CORS-safe.
 * Falls back to iTunes TV show search for better coverage.
 */
function _tvmazePoster(title) {
  // 1. Clean title: remove EVERYTHING after ' s\d+' or ' Season \d+'
  // We use split and then take the first part to be extra safe
  var clean = title.replace(/\s[sS]\d+.*/g, '')
                   .replace(/\sSeason\s\d+.*/gi, '')
                   .replace(/[:\-]/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim();

  var search = function(term) {
    return fetch('https://api.tvmaze.com/singlesearch/shows?q=' + encodeURIComponent(term))
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) {
        return d && d.image ? _toHttpsUrl(d.image.medium || d.image.original || null) : null;
      })
      .then(function(url) {
        if (url) return url;
        // iTunes TV fallback — free, CORS-safe, no key
        return fetch(
          'https://itunes.apple.com/search?term=' + encodeURIComponent(term) +
          '&media=tvShow&entity=tvSeason&limit=1'
        )
          .then(function(r) { return r.ok ? r.json() : null; })
          .then(function(d) {
            if (d && d.results && d.results[0] && d.results[0].artworkUrl100) {
              return _toHttpsUrl(d.results[0].artworkUrl100.replace('100x100bb', '600x600bb'));
            }
            return null;
          })
          .catch(function() { return null; });
      })
      .catch(function() { return null; });
  };

  return search(clean).then(function(res) {
    if (res) return res;
    // Fallback: If 3+ words, try first 2
    var parts = clean.split(' ');
    if (parts.length > 2) {
      return search(parts.slice(0, 2).join(' '));
    }
    return null;
  });
}

/**
 * Universal time ago helper.
 */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  var date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  var diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return diff + 's ago';
  if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 86400 * 10) return Math.floor(diff / 86400) + 'd ago';
  if (diff < 86400 * 30) return Math.floor(diff / (86400 * 7)) + 'w ago';
  return Math.floor(diff / (86400 * 30)) + 'mo ago';
}


/**
 * FIXED: Movie poster via Wikipedia Rest API (primary) + iTunes fallback.
 * Wikipedia is excellent for finding high-quality "main" images for films.
 */
function _moviePoster(title) {
  var clean = title.replace(/[:\-]/g, ' ').replace(/\s+/g, ' ').trim();
  var wikiSlug = clean.replace(/ /g, '_');

  var wikiFetch = fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(wikiSlug))
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      return (d && d.thumbnail && d.thumbnail.source) ? _toHttpsUrl(d.thumbnail.source) : null;
    });

  var itunesFetch = function(term) {
    return fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(term) + '&media=movie&limit=1')
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) {
        if (d && d.results && d.results[0] && d.results[0].artworkUrl100) {
          return _toHttpsUrl(d.results[0].artworkUrl100.replace('100x100bb', '600x600bb'));
        }
        return null;
      });
  };

  return wikiFetch.then(function(res) {
    if (res) return res;
    
    // Fallback 1: Try stripping anything in parentheses or after colon
    var simpler = clean.replace(/\(.*\)/, '').replace(/:.*/, '').trim();
    if (simpler && simpler !== clean) {
       return fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(simpler.replace(/ /g, '_')))
         .then(function(r){ return r.ok ? r.json() : null; })
         .then(function(d){ return (d && d.thumbnail && d.thumbnail.source) ? _toHttpsUrl(d.thumbnail.source) : null; })
         .then(function(resS) {
            if (resS) return resS;
            return itunesFetch(clean);
         });
    }

    return itunesFetch(clean).then(function(res2) {
      if (res2) return res2;
      var parts = clean.split(' ');
      if (parts.length > 2) return itunesFetch(parts.slice(0, 2).join(' '));
      return null;
    });
  }).catch(function() { return null; });
}


function _artistImage(name) {
  if (!name) return Promise.resolve(null);

  const FALLBACK_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23222"/><text x="50" y="55" font-family="sans-serif" font-size="30" text-anchor="middle" fill="%23444">🎵</text></svg>';

  // 1. Try Spotify Search API (Best quality)
  return fetch('/api/search-artist?name=' + encodeURIComponent(name))
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data && data.image) return data.image;
      
      // 2. Fallback: Search Spotify by artist name in a broader way or iTunes
      return fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(name) + '&entity=song&limit=1')
        .then(r => r.ok ? r.json() : null)
        .then(d2 => {
          if (d2 && d2.results && d2.results[0] && d2.results[0].artworkUrl100) {
            return d2.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
          }
          // 3. Last Fallback: Wikipedia
          return fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(name))
            .then(r => r.ok ? r.json() : null)
            .then(wikiData => {
              if (wikiData && wikiData.thumbnail && wikiData.thumbnail.source) return wikiData.thumbnail.source;
              return FALLBACK_SVG;
            })
            .catch(() => FALLBACK_SVG);
        })
        .catch(() => FALLBACK_SVG);
    })
    .catch(() => FALLBACK_SVG);
}

/**
 * FIXED: Footballer headshot via TheSportsDB + Wikipedia API fallback.
 * TheSportsDB free tier + Wikipedia summary thumbnail.
 */
function _sportsdbPlayer(pObj) {
  var name = typeof pObj === 'string' ? pObj : pObj.name;
  var wikiQ = (typeof pObj === 'object' && pObj.wikiQuery) ? pObj.wikiQuery : name.replace(/ /g, '_');

  // Try TheSportsDB first
  return fetch('https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=' + encodeURIComponent(name))
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      var p = d && d.player && d.player[0];
      if (p && (p.strCutout || p.strThumb || p.strRender)) {
        return p.strCutout || p.strThumb || p.strRender;
      }
      // Wikipedia Rest Summary fallback
      return fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(wikiQ))
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(d2) {
          return (d2 && d2.thumbnail && d2.thumbnail.source) ? _toHttpsUrl(d2.thumbnail.source) : null;
        });
    })
    .catch(function() { return null; });
}

/**
 * Parse a Letterboxd RSS title into clean title + star string.
 */
function _parseLetterboxd(rawTitle) {
  var ratingMatch = rawTitle.match(/\s*[-–]\s*(★+½?)\s*$/);
  var starsStr = ratingMatch ? ratingMatch[1] : '';
  var title = rawTitle
    .replace(/\s*[-–]\s*★.*$/, '')
    .replace(/,\s*\d{4}\s*$/, '')
    .split('...')[0]
    .trim();
  return { title: title || rawTitle.split('...')[0].trim(), starsStr: starsStr };
}

/**
 * Build HTML for a 5-star display.
 */
function _starsHTML(starsStr) {
  if (!starsStr) return '';
  var full = (starsStr.match(/★/g) || []).length;
  var half = starsStr.indexOf('½') !== -1;
  var out  = '<span class="star-rating">';
  for (var i = 0; i < 5; i++) {
    if (i < full) {
      out += '<span class="star-filled">★</span>';
    } else if (i === full && half) {
      out += '<span class="star-half">½</span>';
      half = false;
    } else {
      out += '<span class="star-empty">★</span>';
    }
  }
  return out + '</span>';
}


/* ── GitHub Live Commit Tracker ─────────────────────────────── */
(function() {
  var commitLine = document.getElementById('git-commit-line');
  if (!commitLine) return;

  var REPO       = 'Asad101001/portfolio-v2';
  var GITHUB_API = 'https://api.github.com/repos/' + REPO + '/commits/main';

  function fetch(url, options) { return window.fetch(url, options); }

  fetch(GITHUB_API, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
    .then(function(r) {
      if (!r.ok) throw new Error('GitHub API ' + r.status);
      return r.json();
    })
    .then(function(data) {
      var sha  = (data.sha || '').slice(0, 7);
      var msg  = (data.commit && data.commit.message ? data.commit.message : '').split('\n')[0].slice(0, 52);
      var when = data.commit && data.commit.author ? timeAgo(data.commit.author.date) : '';
      commitLine.textContent = sha + ' ' + msg + (when ? ' (' + when + ')' : '');
      commitLine.style.opacity = '1';
    })
    .catch(function() {
      commitLine.textContent = 'a1b2c3d feat: portfolio - latest build';
      commitLine.style.opacity = '0.55';
    });
})();


/* ── Currently Into - Dynamic Card ─────────────────────────── */
(function () {

  /* ── Book Cover via Open Library Search ── */
  var readingCover       = document.getElementById('reading-cover');
  var readingPlaceholder = document.getElementById('reading-placeholder');
  var readingTitle       = document.getElementById('reading-title');

  if (readingCover && CONFIG.currently.reading) {
    function fetchBook(query) {
      fetch('https://openlibrary.org/search.json?q=' + encodeURIComponent(query) + '&limit=5')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.docs && data.docs.length) {
            var doc = data.docs.find(function(d) { return d.cover_i; }) || data.docs[0];
            if (doc) {
              if (doc.cover_i) {
                var url = 'https://covers.openlibrary.org/b/id/' + doc.cover_i + '-L.jpg';
                readingCover.src = url;
                readingCover.onerror = function() {
                  readingCover.style.display = 'none';
                  if (readingPlaceholder) readingPlaceholder.style.display = 'flex';
                };
                readingCover.style.display = 'block';
                if (readingPlaceholder) readingPlaceholder.style.display = 'none';
              }
              if (readingTitle) {
                readingTitle.textContent = doc.title + (doc.author_name ? ' - ' + doc.author_name[0] : '');
              }
            }
          } else if (query !== CONFIG.currently.reading.split(' ')[0]) {
            fetchBook(CONFIG.currently.reading.split(' ')[0]);
          }
        })
        .catch(function() {
          if (readingPlaceholder) readingPlaceholder.style.display = 'flex';
        });
    }
    fetchBook(CONFIG.currently.reading);
  }

  /* ── Media Hub: Movies (Letterboxd RSS) — with star ratings ── */
  var moviePoster      = document.getElementById('watching-poster');
  var moviePlaceholder = document.getElementById('watching-placeholder');
  var movieTitle       = document.getElementById('movie-title');

  if (moviePoster) {
    var LB_USER = CONFIG.usernames.letterboxd;
    var RSS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://letterboxd.com/' + LB_USER + '/rss/&_t=' + Date.now();

    function fetchMovie() {
      fetch(RSS_URL)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (!data || !data.items || !data.items.length) throw new Error('No items');
          var latest = data.items[0];

          var url = latest.thumbnail || '';
          if (!url) {
            var source = (latest.description || '') + (latest.content || '');
            var match  = source.match(/src="([^"]+)"/);
            url = match ? match[1] : '';
          }
          if (url) {
            moviePoster.src = url;
            moviePoster.onerror = function() {
              moviePoster.style.display = 'none';
              if (moviePlaceholder) moviePlaceholder.style.display = 'flex';
            };
            moviePoster.style.display = 'block';
            if (moviePlaceholder) moviePlaceholder.style.display = 'none';
          }

          if (movieTitle && latest.title) {
            var parsed = _parseLetterboxd(latest.title);
            movieTitle.textContent = parsed.title;

            var starsEl = document.getElementById('movie-rating-stars');
            if (!starsEl) {
              starsEl = document.createElement('span');
              starsEl.id = 'movie-rating-stars';
              if (movieTitle.parentNode) {
                movieTitle.parentNode.insertBefore(starsEl, movieTitle.nextSibling);
              }
            }
            starsEl.innerHTML = _starsHTML(parsed.starsStr);

            // Add timeline (time ago) next to stars
            const pubDate = latest.pubDate || latest.pubdate || latest.date_published || latest.published;
            if (pubDate) {
              let timeEl = document.getElementById('movie-logged-time');
              if (!timeEl) {
                timeEl = document.createElement('span');
                timeEl.id = 'movie-logged-time';
                timeEl.className = 'movie-timeline-label';
                // Find a container to append to (parsed.starsStr is stars)
                if (starsEl) {
                  starsEl.appendChild(timeEl);
                }
              }
              timeEl.textContent = ' \u2022 ' + timeAgo(pubDate);
              // Ensure starsEl layout is flex or similar to keep them on same line
              starsEl.style.display = 'inline-flex';
              starsEl.style.alignItems = 'center';
            }
          }
        })
        .catch(function(err) {
          // Silently handle RSS errors to keep console clean
          if (moviePlaceholder) moviePlaceholder.style.display = 'flex';
        });
    }
    fetchMovie();
    setInterval(fetchMovie, 60000 * 15);
  }

  /* ── Media Hub: TV Tracking (Trakt) ── */
  var tvPoster      = document.getElementById('tv-tracking-poster');
  var tvPlaceholder = document.getElementById('tv-tracking-placeholder');
  var tvTitle       = document.getElementById('tv-tracking-title');
  var tvStatus      = document.getElementById('tv-tracking-status');

  if (tvTitle) {
    function fetchTV() {
      fetch('/api/current-show')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (!data || data.watching === null || data.watching === undefined || !data.title) {
            if (tvTitle && CONFIG.currently.series.length) {
              var pick = CONFIG.currently.series[Math.floor(Math.random() * CONFIG.currently.series.length)];
              tvTitle.textContent = pick;
              // Try to get a poster for the fallback show too
              _tvmazePoster(pick).then(function(posterUrl) {
                if (posterUrl && tvPoster) {
                  tvPoster.src = posterUrl;
                  tvPoster.onerror = function() {
                    tvPoster.style.display = 'none';
                    if (tvPlaceholder) tvPlaceholder.style.display = 'flex';
                  };
                  tvPoster.style.display = 'block';
                  if (tvPlaceholder) tvPlaceholder.style.display = 'none';
                }
              });
            }
            if (tvStatus) tvStatus.textContent = 'Currently Watching';
            return;
          }

          if (tvStatus) tvStatus.textContent = data.watching ? 'Currently Watching' : 'Last Watched';

          var epStr = '';
          if (data.season != null && data.episode != null) {
            epStr = ' (S' + String(data.season).padStart(2, '0') + 'E' + String(data.episode).padStart(2, '0') + ')';
          }
          if (tvTitle) tvTitle.textContent = data.title + epStr;

          var progressWrap = document.getElementById('tv-progress-wrap');
          var progressFill = document.getElementById('tv-progress-fill');
          if (progressWrap && progressFill) {
            if (data.progress != null) {
              progressWrap.style.display = 'block';
              progressFill.style.width   = data.progress + '%';
            } else {
              progressFill.style.width   = data.watching ? '45%' : '100%';
              progressWrap.style.display = data.watching ? 'block' : 'none';
            }
          }

          if (data.poster && tvPoster) {
            tvPoster.src = data.poster;
            tvPoster.style.display = 'block';
            if (tvPlaceholder) tvPlaceholder.style.display = 'none';
          } else if (data.title) {
            // Client-side fallback with improved multi-source lookup
            _tvmazePoster(data.title).then(function(posterUrl) {
              if (posterUrl && tvPoster) {
                tvPoster.src = posterUrl;
                tvPoster.style.display = 'block';
                if (tvPlaceholder) tvPlaceholder.style.display = 'none';
              }
            });
          }
        })
        .catch(function() {
          if (tvTitle && CONFIG.currently.series.length) {
            var pick = CONFIG.currently.series[Math.floor(Math.random() * CONFIG.currently.series.length)];
            tvTitle.textContent = pick;
            _tvmazePoster(pick).then(function(posterUrl) {
              if (posterUrl && tvPoster) {
                tvPoster.src = posterUrl;
                tvPoster.style.display = 'block';
                if (tvPlaceholder) tvPlaceholder.style.display = 'none';
              }
            });
          }
          if (tvStatus) tvStatus.textContent = 'Currently Watching';
        });
    }
    fetchTV();
    setInterval(fetchTV, 60000 * 30);
  }

  /* ── FC Barcelona Scorecard ── */
  var barcaItem = document.querySelector('.rotating-item[data-index="3"]');
  if (barcaItem) barcaItem.classList.add('barca-slot');
  if (!barcaItem) return;

  var BARCA_ID = '83';

  function dateRange(daysBack) {
    var d = new Date(), today = d.toISOString().split('T')[0].replace(/-/g,'');
    d.setDate(d.getDate() - daysBack);
    var from = d.toISOString().split('T')[0].replace(/-/g,'');
    return from + '-' + today;
  }



  function fetchESPN(league) {
    return fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/' + league + '/scoreboard?dates=' + dateRange(28))
      .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(d){ return d.events || []; });
  }

  function fetchESPNSchedule() {
    return fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams/' + BARCA_ID + '/schedule')
      .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(d){ return d.events || []; });
  }

  function mergeEvents(arrays) {
    var seen = {}, out = [];
    arrays.forEach(function(arr){
      (arr || []).forEach(function(ev){
        if (ev && ev.id && !seen[ev.id]) { seen[ev.id] = true; out.push(ev); }
      });
    });
    return out;
  }

  function _shortName(fullName) {
    if (!fullName) return '';
    // For names like "R. Lewandowski" keep as-is, otherwise take last word
    var parts = fullName.split(' ');
    if (parts.length === 1) return fullName;
    // If first part is initial (single char or with dot), return as-is shortened
    if (parts[0].length <= 2) return parts[parts.length - 1];
    // Otherwise return just the last name
    return parts[parts.length - 1];
  }

  function fetchScorers(eventId, leagueSlug) {
    var url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/' + leagueSlug + '/summary?event=' + eventId;
    return fetch(url)
      .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(data){
        var scorerMap = {};
        var redCardMap = {};
        var plays = data.scoringPlays || data.keyEvents || [];

        plays.forEach(function(play){
          var typeText = (play.type && play.type.text || play.type && play.type.name || '').toLowerCase();
          var teamId = play.team && String(play.team.id || '');
          if (!teamId) return;

          if (typeText.indexOf('goal') !== -1) {
            var athlete = play.participants && play.participants[0] && play.participants[0].athlete;
            var rawName = athlete && (athlete.shortName || athlete.displayName);
            if (!rawName) return;
            var name = _shortName(rawName);
            var clock = play.clock && play.clock.displayValue || play.period && play.period.displayValue || '';
            var cleanClock = clock.replace(/'/g, '');
            var entry = name + (cleanClock ? ' ' + cleanClock + "'" : '');
            if (!scorerMap[teamId]) scorerMap[teamId] = [];
            if (scorerMap[teamId].indexOf(entry) === -1) scorerMap[teamId].push(entry);
          }

          if (typeText.indexOf('red') !== -1) {
            redCardMap[teamId] = (redCardMap[teamId] || 0) + 1;
          }
        });

        return { scorers: scorerMap, redCards: redCardMap };
      })
      .catch(function(){ return { scorers: {}, redCards: {} }; });
  }

  function leagueSlugFromEvent(ev) {
    var slug = (ev.season && ev.season.slug) || (ev.league && ev.league.slug) || '';
    if (slug.indexOf('copa') !== -1 || slug.indexOf('cdreina') !== -1) return 'esp.copa_del_rey';
    if (slug.indexOf('champion') !== -1 || slug.indexOf('ucl') !== -1)  return 'uefa.champions';
    if (slug.indexOf('europa') !== -1)                                   return 'uefa.europa';
    if (slug.indexOf('supercopa') !== -1)                                return 'esp.super_cup';
    return 'esp.1';
  }

  function formatTeam(team) {
    if (!team) return '???';
    var name = team.shortDisplayName || team.displayName || team.name || '';
    if (name.length > 11) return team.abbreviation || name.slice(0, 3).toUpperCase();
    return name;
  }

  function getMatchTimeframe(matchDate, state) {
    if (!matchDate) return '';
    const d = new Date(matchDate);
    const now = new Date();
    
    // Reset hours to compare dates only
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const nStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((nStart - dStart) / (1000 * 60 * 60 * 24));
    
    if (state === 'in') return 'Live Now';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1d ago';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 1 && diffDays < 7) return diffDays + 'd ago';
    if (diffDays >= 7) return Math.floor(diffDays/7) + 'w ago';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function compactEventList(entries, limit) {
    var list = Array.isArray(entries) ? entries.filter(Boolean) : [];
    if (!list.length) return '';
    if (list.length <= limit) return list.join(', ');
    var overflow = list.length - limit;
    return list.slice(0, limit).join(', ') + ' +' + overflow;
  }

  function setBarcaDisplay(data) {
    var barca        = data.barca;
    var opp          = data.opp;
    var isLive       = data.isLive;
    var state        = data.state;
    var matchDate    = data.date;
    var barcaIsHost  = data.barcaIsHost;
    var barcaScorers = data.barcaScorers || [];
    var oppScorers   = data.oppScorers   || [];
    var barcaRedCards = data.barcaRedCards || 0;
    var oppRedCards   = data.oppRedCards   || 0;

    var barcaScore = parseInt(barca.score) || 0;
    var oppScore   = parseInt(opp.score)   || 0;
    var emotion = '⚽';
    
    if (state === 'post') {
      emotion = barcaScore > oppScore ? '🎉' : barcaScore < oppScore ? '😢' : '😕';
    } else if (state === 'in') {
      emotion = '🔥';
    }

    var barcaLogo = 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png';
    var oppLogo   = (opp.team && opp.team.logo) || 'https://a.espncdn.com/i/teamlogos/soccer/500/default.png';

    var barcaName   = 'FC Barcelona';
    var oppNameFull = (opp.team && formatTeam(opp.team)) || '---';
    
    // Row 1: Home Team, Row 2: Away Team
    var team1 = barcaIsHost ? barcaName : oppNameFull;
    var team2 = !barcaIsHost ? barcaName : oppNameFull;
    var logo1 = barcaIsHost ? barcaLogo : oppLogo;
    var logo2 = !barcaIsHost ? barcaLogo : oppLogo;
    var score1 = barcaIsHost ? barca.score : opp.score;
    var score2 = !barcaIsHost ? barca.score : opp.score;
    
    var s1 = compactEventList(barcaIsHost ? barcaScorers : oppScorers, 2);
    var s2 = compactEventList(!barcaIsHost ? barcaScorers : oppScorers, 2);
    var red1 = barcaIsHost ? barcaRedCards : oppRedCards;
    var red2 = !barcaIsHost ? barcaRedCards : oppRedCards;
    
    var timeframe = getMatchTimeframe(matchDate, state);
    
    const dObj = new Date(matchDate);
    const nObj = new Date();
    const dS   = new Date(dObj.getFullYear(), dObj.getMonth(), dObj.getDate());
    const nS   = new Date(nObj.getFullYear(), nObj.getMonth(), nObj.getDate());
    const diff = Math.round((nS - dS) / (1000 * 60 * 60 * 24));
    var headerLabel = (diff === 0) ? 'Matchday' : 'Watching Football';

    // Suppress "Today" if header is "Matchday", or if it is "Live Now"
    if (state === 'in' || timeframe === 'Today') timeframe = '';
    
    // Identity column layout: logo on top, name+slogan below
    barcaItem.innerHTML =
      '<div class="barca-scorecard-wrap">' +
        '<div class="barca-top-row">' +
          '<span class="rotating-label currently-into-label">' + headerLabel + '</span>' +
          (state !== 'in' && timeframe ? '<span class="match-timeframe">' + timeframe + '</span>' : '') +
        '</div>' +
        '<div class="barca-content-layout-hybrid">' +
          '<div class="barca-identity-side">' +
            '<div class="barca-logo-wrap">' +
              '<img src="' + barcaLogo + '" class="barca-main-logo" alt="">' +
              '<span class="barca-mini-tag">SUPPORTING</span>' +
            '</div>' +
            '<div class="barca-name-stack">' +
               '<span class="barca-name-pink">FC Barcelona</span>' +
               '<span class="barca-slogan-cyan">MÉS QUE UN CLUB</span>' +
            '</div>' +
          '</div>' +
          '<div class="barca-score-rows-side">' +
            '<div class="score-row-mini is-home-row">' +
              '<div class="score-team-info">' +
                '<img src="' + logo1 + '" class="tiny-logo" alt="">' +
                '<span class="score-team-abbr">' + team1 + ' <small class="host-tag" title="Home"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-top:-2px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></small></span>' +
              '</div>' +
              (s1 ? '<span class="score-row-scorer">' + s1 + '</span>' : '') +
              (red1 ? '<span class="score-row-card" title="Red cards">🟥' + (red1 > 1 ? ' x' + red1 : '') + '</span>' : '') +
              '<span class="score-num">' + (state === 'pre' ? '-' : score1) + '</span>' +
            '</div>' +
            '<div class="score-row-mini">' +
              '<div class="score-team-info">' +
                '<img src="' + logo2 + '" class="tiny-logo" alt="">' +
                '<span class="score-team-abbr">' + team2 + '</span>' +
              '</div>' +
              (s2 ? '<span class="score-row-scorer">' + s2 + '</span>' : '') +
              (red2 ? '<span class="score-row-card" title="Red cards">🟥' + (red2 > 1 ? ' x' + red2 : '') + '</span>' : '') +
              '<span class="score-num">' + (state === 'pre' ? '-' : score2) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        (state !== 'in' ? '<div class="barca-emotion-badge">' + emotion + '</div>' : '') +
      '</div>';

    var oldBadge = barcaItem.querySelector('.barca-live-badge');
    if (oldBadge) oldBadge.remove();
    if (isLive) {
      barcaItem.classList.add('barca-live');
      var badge = document.createElement('span');
      badge.className = 'barca-live-badge';
      badge.textContent = 'LIVE';
      var headerTarget = barcaItem.querySelector('.currently-into-label');
      if (headerTarget) headerTarget.after(badge);
    } else {
      barcaItem.classList.remove('barca-live');
    }
  }

  function fetchBarca() {
    Promise.allSettled([
      fetchESPN('esp.1'),
      fetchESPN('uefa.champions'),
      fetchESPN('esp.copa_del_rey'),
      fetchESPN('esp.super_cup')
    ]).then(function(results) {
      var allEvents = mergeEvents(
        results
          .filter(function(r){ return r.status === 'fulfilled'; })
          .map(function(r){ return r.value; })
      );
      if (!allEvents.length) {
        return fetchESPNSchedule().then(function(evs){ return evs; });
      }
      return allEvents;
    }).then(function(events) {
      if (!events || !events.length) return;
      var barcaMatches = events
        .filter(function(ev){
          return ev.competitions && ev.competitions[0] &&
            ev.competitions[0].competitors &&
            ev.competitions[0].competitors.some(function(c){ return String(c.team.id) === BARCA_ID; });
        })
        .sort(function(a, b){ return new Date(b.date) - new Date(a.date); });

      if (!barcaMatches.length) return;

      var ev   = barcaMatches[0];
      var comp = ev.competitions[0];
      var barca = comp.competitors.find(function(c){ return String(c.team.id) === BARCA_ID; });
      var opp   = comp.competitors.find(function(c){ return String(c.team.id) !== BARCA_ID; });
      var state = ev.status.type.state;
      var slug  = leagueSlugFromEvent(ev);

      var scorerPromise = (state === 'post' || state === 'in')
        ? fetchScorers(ev.id, slug)
        : Promise.resolve({ scorers: {}, redCards: {} });

      scorerPromise.then(function(res){
        setBarcaDisplay({
          barca:        barca,
          opp:          opp,
          isLive:       state === 'in',
          state:        state,
          date:         ev.date,
          barcaIsHost:  barca.homeAway === 'home',
          barcaScorers: (res.scorers && res.scorers[BARCA_ID]) || [],
          oppScorers:   opp ? ((res.scorers && res.scorers[String(opp.team.id)]) || []) : [],
          barcaRedCards: (res.redCards && res.redCards[BARCA_ID]) || 0,
          oppRedCards: opp ? ((res.redCards && res.redCards[String(opp.team.id)]) || 0) : 0
        });
      });
    }).catch(function(e){ console.warn('[Barca] fetch error:', e); });
  }

  fetchBarca();
  setInterval(fetchBarca, 3600000);
})();


/* ── Last.fm Recently Played ────────────────────────────── */
(function () {
  var container = document.getElementById('lastfm-tracks');
  if (!container) return;
  var USER    = CONFIG.usernames.lastfm;
  var API_KEY = 'eccfb681fcf620a63fcb300d526544ba';
  var LIMIT   = 4;
  var URL     = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + USER + '&api_key=' + API_KEY + '&format=json&limit=' + LIMIT;

  function timeAgo(ts) {
    if (!ts) return '';
    var diff = Math.floor(Date.now() / 1000) - parseInt(ts, 10);
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff / 60)  + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 86400 * 10) return Math.floor(diff / 86400) + 'd ago';
    if (diff < 86400 * 30) return Math.floor(diff / (86400 * 7)) + 'w ago';
    return Math.floor(diff / (86400 * 30)) + 'mo ago';
  }

  function render(tracks) {
    container.innerHTML = '';
    tracks.forEach(function(t) {
      var nowPlaying = t['@attr'] && t['@attr'].nowplaying === 'true';
      var art = '';
      if (t.image) {
        for (var si = t.image.length - 1; si >= 0; si--) {
          if (t.image[si]['#text'] && t.image[si]['#text'].indexOf('2a96cbd8b46e442fc41c2b86b821562f') === -1) {
            art = t.image[si]['#text']; break;
          }
        }
      }
      var ts = t.date && t.date.uts ? t.date.uts : null;
      var a  = document.createElement('a');
      a.className = 'lastfm-track'; a.href = t.url || '#'; a.target = '_blank'; a.rel = 'noopener noreferrer';
      
      var imgContainer = document.createElement('div');
      imgContainer.className = 'lastfm-track-art-wrap';
      
      if (art) {
        imgContainer.innerHTML = '<img class="lastfm-track-art" src="' + art + '" alt="" crossorigin="anonymous" loading="lazy" decoding="async" fetchpriority="low" />';
      } else {
        imgContainer.innerHTML = '<div class="lastfm-track-art lastfm-track-art--placeholder">🎵</div>';
        // Fallback to Spotify API for artist picture
        _artistImage(t.artist && t.artist['#text'] ? t.artist['#text'] : '').then(function(u) {
            imgContainer.innerHTML = '<img class="lastfm-track-art" src="' + u + '" alt="" crossorigin="anonymous" loading="lazy" onerror="this.src=\'data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' viewBox=\\\'0 0 100 100\\\'><rect width=\\\'100%\\\' height=\\\'100%\\\' fill=\\\'%23222\\\'/><text x=\\\'50\\\' y=\\\'55\\\' font-family=\\\'sans-serif\\\' font-size=\\\'30\\\' text-anchor=\\\'middle\\\' fill=\\\'%23444\\\' >🎵</text></svg>\'" />';
        }).catch(function(){});
      }

      var timeHTML = nowPlaying
        ? '<span class="lastfm-now-playing"><span class="lastfm-eq"><span></span><span></span><span></span><span></span></span>&nbsp;now</span>'
        : '<span class="lastfm-track-time">' + timeAgo(ts) + '</span>';
      
      a.appendChild(imgContainer);
      var info = document.createElement('div');
      info.className = 'lastfm-track-info';
      info.innerHTML = '<div class="lastfm-track-name">' + escHtml(t.name || '') + '</div>' +
          '<div class="lastfm-track-artist">' + escHtml(t.artist && t.artist['#text'] ? t.artist['#text'] : '') + '</div>';
      a.appendChild(info);
      a.insertAdjacentHTML('beforeend', timeHTML);

      container.appendChild(a);
    });
  }

  container.innerHTML = '<div class="lastfm-loading"><span class="lastfm-bars"><span></span><span></span><span></span><span></span></span> Loading scrobbles...</div>';

  var cached = localStorage.getItem('asad_lastfm_cache');
  if (cached) { try { render(JSON.parse(cached)); } catch(e) {} }

  fetch(URL)
    .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(data) {
      var tracks = data && data.recenttracks && data.recenttracks.track;
      if (!tracks || !tracks.length) { container.innerHTML = '<p class="lastfm-error">No recent tracks.</p>'; return; }
      var trackList = Array.isArray(tracks) ? tracks : [tracks];
      localStorage.setItem('asad_lastfm_cache', JSON.stringify(trackList));
      render(trackList);
    })
    .catch(function() {
      if (!localStorage.getItem('asad_lastfm_cache')) {
        container.innerHTML = '<p class="lastfm-error">⚠ Could not load scrobbles.</p>';
      }
    });
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
    visits++;
    localStorage.setItem('asad_portfolio_visit_count', visits);
    sessionStorage.setItem('asad_portfolio_visited_v2', '1');
  }
  var totalXP = visits * XP_PER_VISIT;
  var level   = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  var xpInLvl = totalXP % XP_PER_LEVEL;
  var pct     = Math.min((xpInLvl / XP_PER_LEVEL) * 100, 100);
  if (countEl) countEl.innerHTML = 'Visit <strong>#' + visits + '</strong> on this device';
  if (badge)   badge.textContent = 'Lv.' + level;
  if (nextEl)  nextEl.textContent = (XP_PER_LEVEL - xpInLvl) + ' XP → Lv.' + (level + 1);
  setTimeout(function() { bar.style.width = pct + '%'; }, 600);
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
      var d   = new Date(today); d.setDate(today.getDate() - i);
      var dow = d.getDay();
      var base = rand(seed + i * 7.3 + dow * 1.1);
      var isWeekend = dow === 0 || dow === 6;
      var isActive  = base > (isWeekend ? 0.72 : 0.55);
      var count     = isActive ? Math.floor(rand(seed + i * 3.7) * 10) + 1 : 0;
      days.push(Math.min(count, 12));
    }
    return days;
  }

  buildHeatmap(generatePattern());
  fetch('https://github-contributions-api.jogruber.de/v4/' + CONFIG.usernames.github + '?y=last')
    .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(data) {
      if (!data || !data.contributions) return;
      var flat = [];
      data.contributions.forEach(function(day) { flat.push(day.count || 0); });
      buildHeatmap(flat.slice(-364));
    })
    .catch(function() {});
})();


/* ── Coding Clock (PKT) & Weather ───────────────────────── */
(function () {
  var display  = document.getElementById('clock-display');
  var status   = document.getElementById('clock-status');
  var barsEl   = document.getElementById('clock-bars');
  var arc      = document.getElementById('clock-arc');
  var hourText = document.getElementById('clock-hour-text');
  var currentTemp = '';
  var currentIcon = '';
  if (!display) return;
  
  var CIRC = 188.5;
  var zones = [
    { start: 0,  end: 6,  label: '🌙 Asleep (probably)',      color: '#a855f7' },
    { start: 6,  end: 9,  label: '☕ Morning grind',           color: '#f97316' },
    { start: 9,  end: 13, label: '💻 Peak coding hours',       color: '#22c55e' },
    { start: 13, end: 15, label: '🍜 Lunch / break',           color: '#10b981' },
    { start: 15, end: 19, label: '⚡ Deep work mode',          color: '#22c55e' },
    { start: 19, end: 22, label: '🎧 Side projects / music',   color: '#a855f7' },
    { start: 22, end: 24, label: '🌙 Late night hacking',      color: '#f97316' }
  ];

  function getWeatherIcon(code) {
    if (code === 0) return '☀️'; // Clear
    if (code >= 1 && code <= 3) return '☁️'; // Cloudy
    if (code === 45 || code === 48) return '🌫️'; // Fog
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '🌧️'; // Rain
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return '❄️'; // Snow
    if (code >= 95 && code <= 99) return '⛈️'; // Thunderstorm
    return '🌡️';
  }

  function fetchWeather() {
    // Hardcoded to Karachi coords
    fetch('https://api.open-meteo.com/v1/forecast?latitude=24.8608&longitude=67.0104&current_weather=true')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.current_weather) {
          currentTemp = Math.round(data.current_weather.temperature) + '°C';
          currentIcon = getWeatherIcon(data.current_weather.weathercode);
          tick(); // Update UI immediately
        }
      })
      .catch(function(e) { console.warn('Weather fetch failed', e); });
  }

  function tick() {
    var now  = new Date();
    var utc  = now.getTime() + now.getTimezoneOffset() * 60000;
    var pkt  = new Date(utc + 5 * 3600000);
    var h    = pkt.getHours(), m = pkt.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12  = h % 12 || 12;
    if (display) display.textContent = h12 + ':' + String(m).padStart(2,'0') + ' ' + ampm;
    var dayPct = (h + m / 60) / 24;
    if (arc) arc.style.strokeDashoffset = (CIRC * (1 - dayPct)).toFixed(2);
    if (hourText) hourText.textContent = h12;
    var zone = zones.find(function(z) { return h >= z.start && h < z.end; }) || zones[0];
    
    if (status) {
        var weatherStr = currentTemp ? ' • ' + currentTemp + ' ' + currentIcon : '';
        status.textContent = zone.label + weatherStr;
    }
    
    if (arc)    arc.style.stroke   = zone.color;
    if (barsEl) Array.prototype.forEach.call(barsEl.children, function(seg, i) {
      seg.classList.toggle('active', i <= Math.floor(h / 4));
    });
  }
  
  tick(); 
  setInterval(tick, 10000); // 10 sec tick
  fetchWeather();
  setInterval(fetchWeather, 30 * 60 * 1000); // Update weather every 30 mins
})();


/* ── Spotify Now Playing ────────────────────────────────── */
(function () {
  var wrap         = document.getElementById('spotify-track-wrap');
  var dotEl        = document.getElementById('spotify-live-dot');
  var spotifyWidget = document.getElementById('spotify-widget');
  var lastfmWidget  = document.querySelector('.lastfm-widget');
  if (spotifyWidget) spotifyWidget.classList.add('liquid-glass');
  if (lastfmWidget)  lastfmWidget.classList.add('liquid-glass');
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
      if (dotEl) { dotEl.style.background = '#ef4444'; dotEl.style.boxShadow = '0 0 10px rgba(239,68,68,0.4)'; }
      return;
    }
    var t         = data.track;
    var pct       = t.duration > 0 ? Math.min((t.progress / t.duration) * 100, 100) : 0;
    var isPlaying = data.isPlaying;

    if (dotEl) {
      dotEl.style.background = isPlaying ? '#1DB954' : '#ef4444';
      dotEl.style.boxShadow  = isPlaying ? '0 0 12px #1DB954' : '0 0 12px rgba(239,68,68,0.6)';
    }

    var artInner = t.albumArt
      ? '<img class="spotify-art-expanded" src="' + t.albumArt + '" alt="" crossorigin="anonymous" />'
      : '<div class="spotify-art-expanded spotify-art--empty-expanded"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg></div>';

    var eqOrPause = isPlaying
      ? '<div class="spotify-eq"><span></span><span></span><span></span><span></span><span></span></div>'
      : '';

    var shuffleIcon = '<svg class="spotify-controls-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>';
    var prevIcon    = '<svg class="spotify-controls-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>';
    var playIcon    = isPlaying
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    var playBtnClass = isPlaying ? 'spotify-play-btn' : 'spotify-play-btn paused-state';
    var nextIcon     = '<svg class="spotify-controls-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>';
    var repeatIcon   = '<svg class="spotify-controls-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';

    var controlsHTML = '<div class="spotify-controls-expanded">' + shuffleIcon + prevIcon +
      '<div class="' + playBtnClass + '">' + playIcon + '</div>' + nextIcon + repeatIcon + '</div>';
    var progressHTML = '<div class="spotify-bar-expanded"><div class="spotify-bar-fill-expanded" style="width:' + pct.toFixed(1) + '%"></div></div>';

    var a = document.createElement('a');
    a.href      = t.url || 'https://open.spotify.com/';
    a.target    = '_blank';
    a.rel       = 'noopener noreferrer';
    a.className = 'spotify-track-expanded';
    a.innerHTML =
      '<div class="spotify-art-wrap-expanded">' + artInner + '</div>' +
      '<div class="spotify-info-expanded">' +
        '<div class="spotify-row-expanded"><div class="spotify-title-expanded">' + escHtml(t.name) + '</div>' + eqOrPause + '</div>' +
        '<div class="spotify-artist-expanded">' + escHtml(t.artist) + '</div>' +
      '</div>' +
      '<div class="spotify-progress-wrap-expanded">' +
        '<div class="spotify-times-expanded"><span>' + fmtTime(t.progress) + '</span><span>' + fmtTime(t.duration) + '</span></div>' +
        progressHTML +
      '</div>' + controlsHTML;
    wrap.appendChild(a);
  }

  function load() {
    fetch(ENDPOINT)
      .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(data) {
        localStorage.setItem('asad_spotify_cache', JSON.stringify(data));
        render(data);
      })
      .catch(function() {
        var cached = localStorage.getItem('asad_spotify_cache');
        if (cached) { try { render(JSON.parse(cached)); return; } catch(e) {} }
        wrap.innerHTML = '<p class="spotify-offline">&#x26A0; Could not reach Spotify</p>';
      });
  }

  var cached = localStorage.getItem('asad_spotify_cache');
  if (cached) { try { render(JSON.parse(cached)); } catch(e) {} }

  load();
  setInterval(load, 30000);
})();


/* ── Git Logic Jumper Game (CS Theme) ───────────────────── */
(function () {
  var canvas  = document.getElementById('game-canvas');
  var scoreEl = document.getElementById('game-score');
  var overlay = document.getElementById('game-overlay');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var game = {
    score: 0, speed: 3.2, active: true,
    player: { y: 61, vy: 0, jumping: false },
    obstacles: []
  };

  function jump() {
    if (!game.player.jumping && game.active) { game.player.vy = -8.5; game.player.jumping = true; }
    else if (!game.active) { reset(); }
  }

  window.addEventListener('keydown', function(e) { if (e.code === 'Space') { e.preventDefault(); jump(); } });
  canvas.addEventListener('mousedown', function(e) { e.preventDefault(); jump(); });
  canvas.addEventListener('touchstart', function(e) { e.preventDefault(); jump(); });

  function reset() {
    game = { score: 0, speed: 3.2, active: true, player: { y: 61, vy: 0, jumping: false }, obstacles: [] };
    if (scoreEl) scoreEl.textContent = '0 Commits [initial commit]';
    overlay.style.opacity = '0';
  }

  function loop() {
    if (!game.active) { requestAnimationFrame(loop); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(34,197,94,0.12)'; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(0, 75); ctx.lineTo(400, 75);
    for (var x = 0; x < 400; x += 20) { ctx.moveTo(x, 75); ctx.lineTo(x - 8, 80); }
    ctx.stroke();

    game.player.vy += 0.52; game.player.y += game.player.vy;
    if (game.player.y > 61) { game.player.y = 61; game.player.vy = 0; game.player.jumping = false; }

    ctx.fillStyle = '#22c55e'; ctx.shadowBlur = 8; ctx.shadowColor = '#22c55e';
    ctx.fillRect(30, game.player.y, 14, 14); ctx.shadowBlur = 0;
    ctx.fillStyle = '#000'; ctx.font = '7px monospace'; ctx.fillText('git', 31, game.player.y + 10);

    if (Math.random() < 0.016 && (game.obstacles.length === 0 || game.obstacles[game.obstacles.length-1].x < 240)) {
      game.obstacles.push({ x: 400, w: 12 + Math.random() * 12, h: 8 + Math.random() * 8 });
    }

    for (var i = game.obstacles.length - 1; i >= 0; i--) {
      var o = game.obstacles[i];
      o.x -= game.speed;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(o.x, 75 - o.h, o.w, o.h);
      ctx.fillStyle = '#fff'; ctx.font = '7px monospace';
      ctx.fillText('!', o.x + o.w/2 - 2, 75 - o.h + 8);

      if (o.x < 44 && o.x + o.w > 30 && game.player.y + 14 > 75 - o.h) {
        game.active = false; overlay.style.opacity = '1';
      }
      if (o.x < -o.w) {
        game.obstacles.splice(i, 1); game.score++;
        if (scoreEl) {
          var msgs = ['init', 'fix', 'feat', 'docs', 'refactor', 'style', 'test', 'chore'];
          scoreEl.textContent = game.score + ' Commits [' + msgs[Math.floor(game.score / 5) % msgs.length] + ']';
        }
        game.speed += 0.035;
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ── LinkedIn Post Snippet ───────────────────────────────── */
(function () {
  const snippet = document.getElementById('li-post-snippet');
  if (!snippet) return;

  function timeAgo(iso) {
    if (!iso) return 'recently';
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60)     return 'just now';
    if (diff < 3600)   return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400)  return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function render(data) {
    if (!data) return;
    const profile   = data.profile || {};
    const timeEl     = snippet.querySelector('.li-post-time');
    const textEl     = snippet.querySelector('.li-post-text');
    const linkEl     = snippet.querySelector('.li-post-link');
    const dotEl      = document.querySelector('.li-live-dot');
    const avatarWrap = snippet.querySelector('.li-avatar-wrap');
    const nameEl     = snippet.querySelector('.li-profile-name');
    const headlineEl = snippet.querySelector('.li-profile-headline');

    if (timeEl) timeEl.textContent = timeAgo(data.date);
    if (textEl) {
      const text = (data.text || '').slice(0, 160);
      textEl.textContent = '\u201c' + text + (data.text && data.text.length > 160 ? '\u2026' : '') + '\u201d';
    }
    if (linkEl) linkEl.href = data.url || 'https://www.linkedin.com/in/muhammadasadk/';
    if (dotEl) {
      const isRecent = data.date && (Date.now() - new Date(data.date).getTime()) < 7 * 86400 * 1000;
      dotEl.style.background = isRecent ? '#22c55e' : 'rgba(255,255,255,0.2)';
      dotEl.style.boxShadow  = isRecent ? '0 0 6px #22c55e' : 'none';
    }
    if (nameEl && profile.name) nameEl.textContent = profile.name;
    if (headlineEl && profile.headline) headlineEl.textContent = profile.headline;
    if (avatarWrap && profile.photo) {
      avatarWrap.innerHTML = '';
      const img = document.createElement('img');
      img.src = profile.photo;
      img.alt = profile.name || 'Profile';
      img.style.cssText = 'width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,255,255,0.1);';
      img.onerror = function() {
        avatarWrap.innerHTML = '';
        const initials = (profile.name || 'MA').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
        avatarWrap.style.cssText = 'width:28px;height:28px;border-radius:50%;background:#0077b5;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;flex-shrink:0;';
        avatarWrap.textContent = initials;
      };
      avatarWrap.appendChild(img);
    }
  }

  const cached = localStorage.getItem('asad_li_post_cache');
  if (cached) { try { render(JSON.parse(cached)); } catch(e) {} }

  fetch('/api/linkedin-post?v=' + Date.now())
    .then(r => r.json())
    .then(data => {
      if (data && data.text) {
        localStorage.setItem('asad_li_post_cache', JSON.stringify(data));
        render(data);
      }
    })
    .catch(() => {});
})();


/* ══════════════════════════════════════════════════════════
   SOCIALS: MEDIA WATCHLIST + PLAYER HEADSHOTS + ARTISTS
   ══════════════════════════════════════════════════════════ */
(function () {
  var artistsEl    = document.getElementById('big3-artists');
  var playersEl    = document.getElementById('big3-players');
  var watchlistEl  = document.getElementById('big3-watchlist');
  var seriesEl     = document.getElementById('big3-series');
  var headshotsWrap = document.getElementById('player-headshots-wrap');

  if (!artistsEl) return;

  /* ── FOOTBALLER HEADSHOTS — TheSportsDB + Wikipedia fallback ── */
  if (playersEl && CONFIG.big3.players) {
    // Re-order for Podium: index 1 (Silver), 0 (Gold), 2 (Bronze)
    var podiumOrder = [
      CONFIG.big3.players[1], 
      CONFIG.big3.players[0], 
      CONFIG.big3.players[2]
    ].filter(Boolean);

    playersEl.textContent = CONFIG.big3.players.map(function(p) { return p.name; }).join(', ');

    var headshotsEl = headshotsWrap || document.getElementById('player-headshots-wrap');
    if (headshotsEl) {
      headshotsEl.innerHTML = '';
      podiumOrder.forEach(function(p, i) {
        if (!p) return;

        // Correct medal based on original index: p[0]=gold, p[1]=silver, p[2]=bronze
        var originalIdx = CONFIG.big3.players.indexOf(p);
        var rankClass  = ['medal-gold', 'medal-silver', 'medal-bronze'][originalIdx] || '';
        var medalEmoji = ['\ud83e\udd47', '\ud83e\udd48', '\ud83e\udd49'][originalIdx] || '';

        var wrap = document.createElement('div');
        wrap.className = 'footballer-card ' + rankClass;
        wrap.title     = p.name;

        var podiumWrap = document.createElement('div');
        podiumWrap.className = 'podium-avatar-wrap';

        var avatarEl = document.createElement('div');
        avatarEl.className   = 'footballer-emoji-avatar';
        avatarEl.textContent = p.fallback || '⚽';
        podiumWrap.appendChild(avatarEl);

        // FIXED: TheSportsDB + Wikipedia fallback with direct object pass
        _sportsdbPlayer(p).then(function(imgUrl) {
          if (imgUrl && avatarEl.parentNode) {
            var img = document.createElement('img');
            img.className = 'footballer-headshot-img';
            img.alt       = p.name;
            img.loading   = 'lazy';
            img.src       = imgUrl;
            img.onerror   = function() { this.style.display = 'none'; };
            avatarEl.parentNode.replaceChild(img, avatarEl);
          }
        }).catch(function() {});



        var nameLabel = document.createElement('span');
        nameLabel.className   = 'footballer-name-label';
        nameLabel.textContent = p.name.split(' ')[0];

        wrap.appendChild(podiumWrap);
        wrap.appendChild(nameLabel);
        headshotsEl.appendChild(wrap);
      });
    }
  }

  /* ── TOP WEEKLY ARTISTS — FIXED: iTunes Search API (replaces deprecated Deezer) ── */
  var USER       = CONFIG.usernames.lastfm;
  var API_KEY    = 'eccfb681fcf620a63fcb300d526544ba';
  var LASTFM_URL = 'https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=' + USER +
                   '&api_key=' + API_KEY + '&format=json&period=7day&limit=3';
  var artistThumbsEl = document.getElementById('big3-artist-thumbs');

  function fetchArtists() {
    fetch(LASTFM_URL)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) throw new Error(data.message || 'Last.fm error');
        if (!data.topartists || !data.topartists.artist) throw new Error('No artist data');

        var rawArtists = data.topartists.artist;
        var artistArr  = Array.isArray(rawArtists) ? rawArtists : [rawArtists];
        var top3       = artistArr.slice(0, 3);

        if (top3 && top3.length) {
          // 1. Render names text
          var names = top3.map(function(a, idx) {
            return (idx + 1) + '. ' + (a && a.name ? a.name : 'Unknown Artist');
          }).join(', ');
          artistsEl.textContent = names;

          if (artistThumbsEl) {
            artistThumbsEl.innerHTML = '';

            // 2. Prepare cards and fetch images in parallel
            var promises = top3.map(function(a) {
              if (!a) return Promise.resolve(null);
              
              var wrap = document.createElement('div');
              wrap.className = 'artist-thumb-card';
              wrap.title     = a.name;

              var emojiEl = document.createElement('div');
              emojiEl.className   = 'artist-thumb-emoji';
              emojiEl.textContent = '\ud83c\udfb5';
              wrap.appendChild(emojiEl);
              artistThumbsEl.appendChild(wrap);

              return _artistImage(a.name).then(function(imgUrl) {
                return { wrap: wrap, emojiEl: emojiEl, imgUrl: imgUrl, name: a.name };
              });
            });

            Promise.all(promises).then(function(results) {
              results.forEach(function(res) {
                if (res && res.imgUrl && res.emojiEl.parentNode) {
                  var img = document.createElement('img');
                  img.className = 'artist-thumb-img';
                  img.src       = res.imgUrl;
                  img.alt       = res.name;
                  img.loading   = 'lazy';
                  img.onerror   = function() { this.style.display = 'none'; };
                  res.emojiEl.parentNode.replaceChild(img, res.emojiEl);
                }
              });
            });
          }
        }
      })
      .catch(function(err) {
        console.warn('Last.fm fetch failed:', err.message);
        if (artistsEl) artistsEl.textContent = 'Refresh to load artists';
        if (artistThumbsEl) artistThumbsEl.innerHTML = '<div class="currently-into-thumb-placeholder">\ud83c\udfb5</div>';
      });
  }
  fetchArtists();

  /* ── WATCHLIST (Dynamic provider API + local fallback) ── */
  function mergeWatchlistItems(dynamicItems, fallbackItems) {
    var out = [];
    var seen = {};

    (dynamicItems || []).forEach(function(item) {
      var key = (item && item.title ? item.title : '').toLowerCase();
      if (!key || seen[key]) return;
      seen[key] = true;
      out.push(item);
    });

    (fallbackItems || []).forEach(function(item) {
      var normalized = typeof item === 'string' ? { title: item } : item;
      var key = (normalized && normalized.title ? normalized.title : '').toLowerCase();
      if (!key || seen[key]) return;
      seen[key] = true;
      out.push(normalized);
    });

    return out;
  }

  function compactTitles(items, maxVisible) {
    var titles = (items || []).map(function(i) { return i && i.title; }).filter(Boolean);
    if (!titles.length) return 'No items synced';
    if (titles.length <= maxVisible) return titles.join(', ');
    return titles.slice(0, maxVisible).join(', ') + ' +' + (titles.length - maxVisible);
  }

  function renderSeries(seriesItems) {
    if (!seriesEl) return;

    seriesEl.textContent = compactTitles(seriesItems, 4);

    var seriesThumbsEl = document.getElementById('big3-series-thumbs');
    if (!seriesThumbsEl) return;

    seriesThumbsEl.innerHTML = '';
    seriesItems.slice(0, 3).forEach(function(s) {
      var wrap = document.createElement('div');
      wrap.className = 'media-thumb-card';
      wrap.title = s.title;
      wrap.innerHTML = '<div class="media-thumb-emoji">📺</div>';

      var directPoster = s.poster || null;
      var searchStr = s.searchQuery || s.title;
      var posterPromise = directPoster ? Promise.resolve(directPoster) : _tvmazePoster(searchStr);
      posterPromise.then(function(url) {
        if (url && wrap.parentNode) {
          wrap.innerHTML = '<img class="media-thumb-img" src="' + url + '" alt="' + s.title + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />';
        }
      }).catch(function() {});

      if (s.progress != null) {
        var barCont = document.createElement('div');
        barCont.className = 'media-thumb-progress-cont';
        barCont.innerHTML = '<div class="media-thumb-progress-fill" style="width:' + s.progress + '%"></div>';
        wrap.appendChild(barCont);
      }

      seriesThumbsEl.appendChild(wrap);
    });
  }

  function renderMovies(movieItems) {
    if (!watchlistEl) return;

    watchlistEl.textContent = compactTitles(movieItems, 4);

    var movieThumbsEl = document.getElementById('big3-movie-thumbs');
    if (!movieThumbsEl) return;

    movieThumbsEl.innerHTML = '';
    movieItems.slice(0, 3).forEach(function(m) {
      var wrap = document.createElement('div');
      wrap.className = 'media-thumb-card';
      wrap.title = m.title;
      wrap.innerHTML = '<div class="media-thumb-emoji">🎬</div>';

      var directPoster = m.poster || m.fallback || null;
      var searchStr = m.searchQuery || m.title;
      var posterPromise = directPoster ? Promise.resolve(directPoster) : _moviePoster(searchStr);
      posterPromise.then(function(url) {
        if (url && wrap.parentNode) {
          wrap.innerHTML = '<img class="media-thumb-img" src="' + url + '" alt="' + m.title + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />';
        }
      }).catch(function() {});

      movieThumbsEl.appendChild(wrap);
    });
  }

  function fetchWatchlist() {
    fetch('/api/watchlist')
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(data) {
        if (!data) throw new Error('Empty payload');

        var mergedSeries = mergeWatchlistItems(data.shows, CONFIG.big3.seriesWatchlist || []);
        var mergedMovies = mergeWatchlistItems(data.movies, CONFIG.big3.watchlist || []);

        renderSeries(mergedSeries);
        renderMovies(mergedMovies);
      })
      .catch(function() {
        renderSeries(CONFIG.big3.seriesWatchlist || []);
        renderMovies(CONFIG.big3.watchlist || []);
      });
  }
  fetchWatchlist();
})();