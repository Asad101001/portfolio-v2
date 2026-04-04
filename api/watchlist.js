export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');

  const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
  const TMDB_API_KEY    = process.env.TMDB_API_KEY;
  const USERNAME        = process.env.TRAKT_USERNAME || 'as4d';

  if (!TRAKT_CLIENT_ID) {
    return res.status(200).json({ shows: [], movies: [], error: 'TRAKT_CLIENT_ID not configured' });
  }

  const headers = {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': TRAKT_CLIENT_ID,
  };

  // ── Poster helpers ──────────────────────────────────────────────────────────

  async function getTMDBPoster(id, type) {
    if (!TMDB_API_KEY || !id) return null;
    try {
      const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.poster_path
          ? `https://image.tmdb.org/t/p/w200${data.poster_path}`
          : null;
      }
    } catch (_) {}
    return null;
  }

  // TVmaze: free, no API key, CORS-safe, great show/series coverage
  async function getTVMazePoster(title) {
    try {
      // Clean title: remove ' s3', ' Season 2', etc.
      const clean = title.replace(/\s[sS]\d+.*/g, '')
                         .replace(/\sSeason\s\d+.*/gi, '')
                         .replace(/[:\-]/g, ' ')
                         .replace(/\s+/g, ' ')
                         .trim();

      const r = await fetch(
        `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(clean)}`
      );
      if (r.ok) {
        const d = await r.json();
        return d?.image?.medium || d?.image?.original || null;
      }
    } catch (_) {}
    return null;
  }

  // ── Fetch Simkl or Trakt ──────────────────────────────────────────────────
  const SIMKL = process.env.SIMKL_CLIENT_ID;
  const SIMKL_USER = process.env.SIMKL_USER_ID;

  try {
    let shows = [];
    let movies = [];

    if (SIMKL && SIMKL_USER) {
      // 1. Simkl Logic
      const [simklWatching, simklPlan] = await Promise.all([
        fetch(`https://api.simkl.com/users/${SIMKL_USER}/ratings/tv/watching`, { headers: { 'simkl-api-client': SIMKL } }).then(r => r.ok ? r.json() : []),
        fetch(`https://api.simkl.com/users/${SIMKL_USER}/ratings/tv/plantowatch`, { headers: { 'simkl-api-client': SIMKL } }).then(r => r.ok ? r.json() : [])
      ]);

      const simklMovies = await fetch(`https://api.simkl.com/users/${SIMKL_USER}/ratings/movies/plantowatch`, { headers: { 'simkl-api-client': SIMKL } }).then(r => r.ok ? r.json() : []);

      // Merge and limit shows
      const allSimklShows = [...simklWatching, ...simklPlan].slice(0, 3);
      shows = await Promise.all(allSimklShows.map(async item => {
        const s = item.show || {};
        let poster = await getTMDBPoster(s.ids?.tmdb, 'tv');
        if (!poster) poster = await getTVMazePoster(s.title);
        return {
          title: s.title,
          poster,
          progress: item.watched_episodes && item.total_episodes ? Math.round((item.watched_episodes / item.total_episodes) * 100) : null
        };
      }));

      // Limit movies
      movies = await Promise.all(simklMovies.slice(0, 3).map(async item => {
        const m = item.movie || {};
        const poster = await getTMDBPoster(m.ids?.tmdb, 'movie');
        return { title: m.title, poster };
      }));

    } else if (TRAKT_CLIENT_ID) {
      // 2. Trakt Logic (Existing)
      const [showsRes, moviesRes] = await Promise.all([
        fetch(`https://api.trakt.tv/users/${USERNAME}/watchlist/shows?sort=added,asc`,  { headers }).catch(() => ({ ok: false })),
        fetch(`https://api.trakt.tv/users/${USERNAME}/watchlist/movies?sort=added,asc`, { headers }).catch(() => ({ ok: false })),
      ]);

      let showsData = [];
      let moviesData = [];

      if (showsRes.ok) try { showsData = await showsRes.json(); } catch (_) {}
      if (moviesRes.ok) try { moviesData = await moviesRes.json(); } catch (_) {}

      shows = await Promise.all((Array.isArray(showsData) ? showsData.slice(0, 3) : []).map(async item => {
        const title = item?.show?.title || 'Unknown';
        let poster  = await getTMDBPoster(item?.show?.ids?.tmdb, 'tv');
        if (!poster) poster = await getTVMazePoster(title);
        return { title, poster };
      }));

      movies = await Promise.all((Array.isArray(moviesData) ? moviesData.slice(0, 3) : []).map(async item => {
        const title = item?.movie?.title || 'Unknown';
        let poster = await getTMDBPoster(item?.movie?.ids?.tmdb, 'movie');
        return { title, poster };
      }));
    }

    res.status(200).json({ shows, movies });
  } catch (error) {
    // If everything fails, return empty to avoid 500
    res.status(200).json({
      shows: [],
      movies: [],
      error:  'Partial failure fetching Trakt watchlist',
      detail: error.message,
    });
  }
}
