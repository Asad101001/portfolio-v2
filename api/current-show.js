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
  const SIMKL_USER_ID      = process.env.SIMKL_USER_ID;

  try {
    let data     = null;
    let watching = false;
    let progress = null;
    let source   = null;

    // ── 1. Primary Source: Simkl API ──────────────────────────────────────────
    if (SIMKL_ACCESS_TOKEN || (SIMKL_CLIENT_ID && SIMKL_USER_ID)) {
      try {
        const simklHeaders = {
          'Content-Type': 'application/json'
        };
        if (SIMKL_ACCESS_TOKEN) {
          simklHeaders['Authorization'] = `Bearer ${SIMKL_ACCESS_TOKEN}`;
        }
        
        const clientParam = SIMKL_CLIENT_ID ? `?client_id=${SIMKL_CLIENT_ID}` : '';
        const userEndpoint = SIMKL_ACCESS_TOKEN 
          ? `https://api.simkl.com/sync/all-items${clientParam}` 
          : `https://api.simkl.com/users/${SIMKL_USER_ID}/ratings/tv/watching${clientParam}`;

        let simklRes = await fetch(userEndpoint, { headers: simklHeaders });
        if (simklRes.ok) {
          const simklData = await simklRes.json();
          const shows = Array.isArray(simklData) ? simklData : (simklData.shows || []);
          if (shows.length > 0) {
            // Sort by last_watched_at descending
            shows.sort((a, b) => new Date(b.last_watched_at || 0) - new Date(a.last_watched_at || 0));
            const item = shows[0];
            const show = item.show || item;
            const episodeMatch = item.last_watched ? String(item.last_watched).match(/S(\d+)E(\d+)/i) : null;
            
            data = {
              show: { title: show.title, ids: { tmdb: show.ids ? show.ids.tmdb : null } },
              episode: {
                season: item.season || (episodeMatch ? parseInt(episodeMatch[1], 10) : null),
                number: item.episode || (episodeMatch ? parseInt(episodeMatch[2], 10) : null)
              },
              watching: true,
              progress: (item.watched_episodes_count && item.total_episodes_count) 
                ? Math.round((item.watched_episodes_count / item.total_episodes_count) * 100) 
                : null,
              watched_at: item.last_watched_at || null
            };
            watching = true;
            progress = data.progress;
            source = 'simkl';
          }
        }
      } catch (_) {}
    }

    // ── 2. Secondary Source: Trakt API ────────────────────────────────────────
    if (!data && TRAKT_CLIENT_ID) {
      try {
        const traktHeaders = {
          'Content-Type': 'application/json',
          'trakt-api-version': '2',
          'trakt-api-key': TRAKT_CLIENT_ID,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };

        const liveRes = await fetch(`https://api.trakt.tv/users/${USERNAME}/watching`, { headers: traktHeaders });

        if (liveRes.ok && liveRes.status !== 204) {
          data = await liveRes.json();
          watching = true;
          source = 'trakt';
        } else {
          const historyRes = await fetch(`https://api.trakt.tv/users/${USERNAME}/history?limit=1`, { headers: traktHeaders });
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            if (Array.isArray(historyData) && historyData.length > 0) {
              data = historyData[0];
              watching = false;
              source = 'trakt';
            }
          }
        }
      } catch (_) {}
    }

    // ── 3. Fallback Source: Trakt Export Local Backup ─────────────────────────
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

    // ── Poster & Progress enrichment logic ───────────────────────────────────
    if (formatted.tmdbId && TMDB_API_KEY) {
      try {
        const typeEndpoint = formatted.type === 'movie' ? 'movie' : 'tv';
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/${typeEndpoint}/${formatted.tmdbId}?api_key=${TMDB_API_KEY}`);
        if (tmdbRes.ok) {
          const tmdbData = await tmdbRes.json();
          if (tmdbData.poster_path) formatted.poster = `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;
          
          if (!formatted.progress && tmdbData.seasons && formatted.season) {
            const currentSeason = tmdbData.seasons.find(s => s.season_number === formatted.season);
            if (currentSeason && currentSeason.episode_count) {
              formatted.progress = Math.round((formatted.episode / currentSeason.episode_count) * 100);
            }
          }
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
