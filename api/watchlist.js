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
      const r = await fetch(
        `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`
      );
      if (r.ok) {
        const d = await r.json();
        return d?.image?.medium || d?.image?.original || null;
      }
    } catch (_) {}
    return null;
  }

  // ── Fetch Trakt watchlists ──────────────────────────────────────────────────

  try {
    const [showsRes, moviesRes] = await Promise.all([
      fetch(`https://api.trakt.tv/users/${USERNAME}/watchlist/shows?sort=added,asc`,  { headers }),
      fetch(`https://api.trakt.tv/users/${USERNAME}/watchlist/movies?sort=added,asc`, { headers }),
    ]);

    if (!showsRes.ok || !moviesRes.ok) {
      throw new Error(
        `Trakt API error: shows=${showsRes.status}, movies=${moviesRes.status}`
      );
    }

    const [showsData, moviesData] = await Promise.all([
      showsRes.json(),
      moviesRes.json(),
    ]);

    // Shows: TMDB first, TVmaze fallback
    const showsPromise = Array.isArray(showsData)
      ? showsData.slice(0, 3).map(async item => {
          const title = item?.show?.title || 'Unknown';
          let poster  = await getTMDBPoster(item?.show?.ids?.tmdb, 'tv');
          if (!poster) poster = await getTVMazePoster(title);
          return { title, poster };
        })
      : [];

    // Movies: TMDB only (TVmaze is TV-focused; upcoming movies won't be there)
    const moviesPromise = Array.isArray(moviesData)
      ? moviesData.slice(0, 3).map(async item => ({
          title:  item?.movie?.title || 'Unknown',
          poster: await getTMDBPoster(item?.movie?.ids?.tmdb, 'movie'),
        }))
      : [];

    const [shows, movies] = await Promise.all([
      Promise.all(showsPromise),
      Promise.all(moviesPromise),
    ]);

    res.status(200).json({ shows, movies });
  } catch (error) {
    res.status(500).json({
      error:  'Failed to fetch Trakt watchlist',
      detail: error.message,
    });
  }
}
