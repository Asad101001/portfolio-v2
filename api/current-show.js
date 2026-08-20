import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30');

  const TRAKT_CLIENT_ID    = process.env.TRAKT_CLIENT_ID;
  const TMDB_API_KEY       = process.env.TMDB_API_KEY;
  const USERNAME           = process.env.TRAKT_USERNAME || 'as4d';
  const SIMKL_CLIENT_ID    = process.env.SIMKL_CLIENT_ID || '7b56e66d068c647eae7a0642374185405201c1283ecca8df1114d27cc6e4fdd8';
  const SIMKL_ACCESS_TOKEN = process.env.SIMKL_ACCESS_TOKEN;
  const SIMKL_USER_ID      = process.env.SIMKL_USER_ID || '8343435';

  try {
    let data     = null;
    let watching = false;
    let progress = null;
    let source   = null;

    // ── 1. Check for Active Live Scrobble on Simkl ───────────────────────────
    if (SIMKL_CLIENT_ID && SIMKL_USER_ID) {
      try {
        const simklHeaders = { 'Content-Type': 'application/json' };
        if (SIMKL_ACCESS_TOKEN) {
          simklHeaders['Authorization'] = `Bearer ${SIMKL_ACCESS_TOKEN}`;
        }
        
        const url = `https://api.simkl.com/users/${SIMKL_USER_ID}/ratings/tv/watching?client_id=${SIMKL_CLIENT_ID}`;
        const liveRes = await fetch(url, { headers: simklHeaders });
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
            source = 'simkl';
          }
        }
      } catch (_) {}
    }

    // ── 2. Check for Active Live Scrobble or History on Trakt ────────────────
    if (!data && TRAKT_CLIENT_ID) {
      try {
        const traktHeaders = {
          'Content-Type': 'application/json',
          'trakt-api-version': '2',
          'trakt-api-key': TRAKT_CLIENT_ID,
          'User-Agent': 'Mozilla/5.0'
        };

        const liveRes = await fetch(`https://api.trakt.tv/users/${USERNAME}/watching`, { headers: traktHeaders });
        if (liveRes.ok && liveRes.status !== 204) {
          data = await liveRes.json();
          watching = true;
          source = 'trakt';
        } else {
          // Fetch last watched show from history if not currently live-watching
          const histRes = await fetch(`https://api.trakt.tv/users/${USERNAME}/history/shows?limit=1`, { headers: traktHeaders });
          if (histRes.ok) {
            const histData = await histRes.json();
            if (Array.isArray(histData) && histData.length > 0) {
              const item = histData[0];
              data = {
                show: item.show,
                episode: item.episode,
                watched_at: item.watched_at
              };
              watching = false;
              source = 'trakt-history';
            }
          }
        }
      } catch (_) {}
    }

    // ── 3. Exact Historical Fallback from Trakt Export Data ───────────────────
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

    // Poster enrichment logic
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
