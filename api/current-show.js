export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
  const TMDB_API_KEY    = process.env.TMDB_API_KEY;
  const USERNAME        = process.env.TRAKT_USERNAME || 'as4d';

  if (!TRAKT_CLIENT_ID) {
    return res.status(200).json({ watching: null, error: 'TRAKT_CLIENT_ID not configured' });
  }

  try {
    let data    = null;
    let watching = false;
    let progress = null;

    // ── 0. Optional: Simkl Priority (if configured) ───────────────────────────
    const SIMKL = process.env.SIMKL_CLIENT_ID;
    const SIMKL_USER = process.env.SIMKL_USER_ID;

    if (SIMKL && SIMKL_USER) {
      try {
        const simklRes = await fetch(`https://api.simkl.com/users/${SIMKL_USER}/ratings/tv/watching`, {
          headers: { 'Content-Type': 'application/json', 'simkl-api-client': SIMKL }
        });
        if (simklRes.ok) {
          const simklData = await simklRes.json();
          if (simklData && simklData.length > 0) {
            const item = simklData[0]; // Get most recent
            const show = item.show || {};
            const meta = item.last_watched_at ? item : {}; // Basic metadata
            
            data = {
              show: { title: show.title, ids: { tmdb: show.ids ? show.ids.tmdb : null } },
              episode: { season: item.season, number: item.episode },
              watching: true,
              progress: item.watched_episodes && item.total_episodes ? Math.round((item.watched_episodes / item.total_episodes) * 100) : null
            };
            watching = true;
            progress = data.progress;
          }
        }
      } catch (_) {}
    }

    // ── 1. Trakt Fallback (Existing Logic) ───────────────────────────────────
    if (!data && TRAKT_CLIENT_ID) {
      const response = await fetch(
        `https://api.trakt.tv/users/${USERNAME}/watching`,
        {
          headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': TRAKT_CLIENT_ID,
          },
        }
      );

      if (response.status === 204) {
        // Fallback to last watched
        const historyRes = await fetch(`https://api.trakt.tv/users/${USERNAME}/history/episodes?limit=1`, {
          headers: { 'Content-Type': 'application/json', 'trakt-api-version': '2', 'trakt-api-key': TRAKT_CLIENT_ID }
        });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          if (historyData && historyData.length > 0) {
            data = historyData[0];
            watching = false;
          }
        }
      } else if (response.ok) {
        data = await response.json();
        watching = true;
      }
    }

    if (!data) return res.status(200).json({ watching: null });

    const show    = data.show;
    const episode = data.episode;

    const formatted = {
      watching,
      title:   show.title             || null,
      season:  episode ? episode.season : null,
      episode: episode ? (episode.number || episode.episode) : null,
      tmdbId:  show.ids?.tmdb          || null,
      poster:  null,
      progress: progress || null
    };

    if (!formatted.title) return res.status(200).json({ watching: null });

    // ── Poster enrichment logic ──────────────────────────────────────────────
    if (formatted.tmdbId && TMDB_API_KEY) {
      try {
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/tv/${formatted.tmdbId}?api_key=${TMDB_API_KEY}`);
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
    res.status(200).json({ watching: null, error: 'Failed to fetch Trakt data', detail: error.message });
  }
}
