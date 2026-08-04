export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=30');

  const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
  const TMDB_API_KEY    = process.env.TMDB_API_KEY;
  const USERNAME        = process.env.TRAKT_USERNAME || 'as4d';
  const SIMKL           = process.env.SIMKL_CLIENT_ID;
  const SIMKL_USER      = process.env.SIMKL_USER_ID;

  try {
    let data     = null;
    let watching = false;
    let progress = null;

    // ── 1. Primary Source: Trakt API ─────────────────────────────────────────
    if (TRAKT_CLIENT_ID) {
      try {
        const traktHeaders = {
          'Content-Type': 'application/json',
          'trakt-api-version': '2',
          'trakt-api-key': TRAKT_CLIENT_ID,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };

        // 1a. Check if currently watching (live scrobble)
        const liveRes = await fetch(`https://api.trakt.tv/users/${USERNAME}/watching`, { headers: traktHeaders });

        if (liveRes.ok && liveRes.status !== 204) {
          data = await liveRes.json();
          watching = true;
        } else {
          // 1b. Fallback to latest item in Trakt history (episodes & movies)
          const historyRes = await fetch(`https://api.trakt.tv/users/${USERNAME}/history?limit=1`, { headers: traktHeaders });
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            if (Array.isArray(historyData) && historyData.length > 0) {
              data = historyData[0];
              watching = false;
            }
          }
        }
      } catch (_) {}
    }

    // ── 2. Fallback Source: Simkl (only if Trakt returned no data) ───────────
    if (!data && SIMKL && SIMKL_USER) {
      try {
        const simklRes = await fetch(`https://api.simkl.com/users/${SIMKL_USER}/ratings/tv/watching`, {
          headers: {
            'Content-Type': 'application/json',
            'simkl-api-client': SIMKL,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (simklRes.ok) {
          const simklData = await simklRes.json();
          if (Array.isArray(simklData) && simklData.length > 0) {
            const item = simklData[0];
            const show = item.show || {};
            
            data = {
              show: { title: show.title, ids: { tmdb: show.ids ? show.ids.tmdb : null } },
              episode: { season: item.season, number: item.episode },
              watching: true,
              progress: item.watched_episodes && item.total_episodes ? Math.round((item.watched_episodes / item.total_episodes) * 100) : null,
              watched_at: item.last_watched_at || null
            };
            watching = true;
            progress = data.progress;
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
      date:    data.watched_at || data.started_at || null
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
    res.status(200).json({ watching: null, error: 'Failed to fetch Trakt data', detail: error.message });
  }
}
