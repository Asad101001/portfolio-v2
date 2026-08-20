import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30');

  const TMDB_API_KEY       = process.env.TMDB_API_KEY;
  const SIMKL_CLIENT_ID    = process.env.SIMKL_CLIENT_ID || '7b56e66d068c647eae7a0642374185405201c1283ecca8df1114d27cc6e4fdd8';
  const SIMKL_ACCESS_TOKEN = process.env.SIMKL_ACCESS_TOKEN || '96f98ecb34ee48e498aabbaaf903f1ab100837b69cf0086b19c3e2be8d20481f';
  const SIMKL_USER_ID      = process.env.SIMKL_USER_ID || '8343435';

  try {
    let data     = null;
    let watching = false;
    let progress = null;
    let source   = null;

    // ── 1. Primary: Simkl Sync API (Full Real-Time User History & Watching) ──
    if (SIMKL_CLIENT_ID && SIMKL_ACCESS_TOKEN) {
      try {
        const simklHeaders = {
          'Content-Type': 'application/json',
          'simkl-api-key': SIMKL_CLIENT_ID,
          'Authorization': `Bearer ${SIMKL_ACCESS_TOKEN}`
        };

        const syncRes = await fetch('https://api.simkl.com/sync/all-items/shows', { headers: simklHeaders });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          const shows = (syncData.shows || []).sort((a, b) => new Date(b.last_watched_at || 0) - new Date(a.last_watched_at || 0));

          if (shows.length > 0) {
            const item = shows[0];
            const show = item.show || {};
            let season = null, episode = null;

            if (item.last_watched) {
              const match = item.last_watched.match(/S(\d+)E(\d+)/i);
              if (match) {
                season = parseInt(match[1], 10);
                episode = parseInt(match[2], 10);
              }
            }

            data = {
              show: { title: show.title, ids: { tmdb: show.ids ? show.ids.tmdb : null } },
              episode: { season, number: episode },
              watching: item.status === 'watching',
              progress: (item.watched_episodes_count && item.total_episodes_count)
                ? Math.round((item.watched_episodes_count / item.total_episodes_count) * 100)
                : null,
              watched_at: item.last_watched_at || new Date().toISOString()
            };
            watching = item.status === 'watching';
            progress = data.progress;
            source = 'simkl-sync';
          }
        }
      } catch (err) {
        console.warn('[Simkl API] Sync error:', err.message);
      }
    }

    // ── 2. Secondary: Simkl Public User Watching API ──────────────────────────
    if (!data && SIMKL_CLIENT_ID && SIMKL_USER_ID) {
      try {
        const url = `https://api.simkl.com/users/${SIMKL_USER_ID}/ratings/tv/watching?client_id=${SIMKL_CLIENT_ID}`;
        const liveRes = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (liveRes.ok) {
          const liveData = await liveRes.json();
          if (Array.isArray(liveData) && liveData.length > 0) {
            const item = liveData[0];
            const show = item.show || {};
            data = {
              show: { title: show.title, ids: { tmdb: show.ids ? show.ids.tmdb : null } },
              episode: { season: item.season, number: item.episode },
              watching: true,
              progress: (item.watched_episodes && item.total_episodes)
                ? Math.round((item.watched_episodes / item.total_episodes) * 100)
                : null,
              watched_at: item.last_watched_at || new Date().toISOString()
            };
            watching = true;
            progress = data.progress;
            source = 'simkl-public';
          }
        }
      } catch (_) {}
    }

    // ── 3. Fallback: Local JSON Snapshot ──────────────────────────────────────
    if (!data) {
      try {
        const fallbackPath = path.join(process.cwd(), 'utility', 'trakt-fallback-data.json');
        if (fs.existsSync(fallbackPath)) {
          const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
          if (fallbackData && fallbackData.currentShow) {
            return res.status(200).json(fallbackData.currentShow);
          }
        }
      } catch (_) {}
    }

    if (!data) return res.status(200).json({ watching: null });

    const show    = data.show || data.movie;
    const episode = data.episode;

    const formatted = {
      watching,
      title:   show?.title            || null,
      season:  episode ? episode.season : null,
      episode: episode ? (episode.number || episode.episode) : null,
      tmdbId:  show?.ids?.tmdb        || null,
      type:    data.type              || (data.movie ? 'movie' : 'show'),
      poster:  null,
      progress: progress              || null,
      date:    data.watched_at || data.started_at || null,
      source:  source || 'unknown'
    };

    if (!formatted.title) return res.status(200).json({ watching: null });

    // Poster enrichment logic via TMDB
    if (formatted.tmdbId && TMDB_API_KEY) {
      try {
        const typeEndpoint = formatted.type === 'movie' ? 'movie' : 'tv';
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/${typeEndpoint}/${formatted.tmdbId}?api_key=${TMDB_API_KEY}`);
        if (tmdbRes.ok) {
          const tmdbData = await tmdbRes.json();
          if (tmdbData.poster_path) formatted.poster = `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;
        }
      } catch (_) {}
    }

    // Fallback Poster enrichment via TVmaze
    if (!formatted.poster) {
      try {
        const tvmazeRes = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(formatted.title)}`);
        if (tvmazeRes.ok) {
          const tvmazeData = await tvmazeRes.json();
          formatted.poster = tvmazeData?.image?.medium || tvmazeData?.image?.original || null;
        }
      } catch (_) {}
    }

    res.status(200).json(formatted);
  } catch (error) {
    try {
      const fallbackPath = path.join(process.cwd(), 'utility', 'trakt-fallback-data.json');
      if (fs.existsSync(fallbackPath)) {
        const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        if (fallbackData && fallbackData.currentShow) {
          return res.status(200).json(fallbackData.currentShow);
        }
      }
    } catch (_) {}
    res.status(200).json({ watching: null, error: 'Failed to fetch series data', detail: error.message });
  }
}
