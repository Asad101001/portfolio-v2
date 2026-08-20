import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');

  const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const TRAKT_USERNAME = process.env.TRAKT_USERNAME || 'as4d';
  const SIMKL_CLIENT_ID = process.env.SIMKL_CLIENT_ID;
  const SIMKL_USER_ID = process.env.SIMKL_USER_ID;
  const sourceQuery = String(req.query?.source || '').toLowerCase();

  function toHttpsUrl(url) {
    if (!url || typeof url !== 'string') return null;
    return url.replace(/^http:\/\//i, 'https://');
  }

  async function getTMDBPoster(id, type) {
    if (!TMDB_API_KEY || !id) return null;
    try {
      const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}`;
      const tmdbRes = await fetch(url);
      if (!tmdbRes.ok) return null;
      const data = await tmdbRes.json();
      return data.poster_path ? toHttpsUrl(`https://image.tmdb.org/t/p/w200${data.poster_path}`) : null;
    } catch (_) {
      return null;
    }
  }

  async function getTVMazePoster(title) {
    try {
      const clean = String(title || '')
        .replace(/\s[sS]\d+.*/g, '')
        .replace(/\sSeason\s\d+.*/gi, '')
        .replace(/[:\-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) return null;
      const r = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(clean)}`);
      if (!r.ok) return null;
      const d = await r.json();
      return toHttpsUrl(d?.image?.medium || d?.image?.original || null);
    } catch (_) {
      return null;
    }
  }

  async function pullTraktData() {
    if (!TRAKT_CLIENT_ID) return { shows: [], movies: [] };

    const headers = {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': TRAKT_CLIENT_ID,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    const [showsRes, moviesRes] = await Promise.all([
      fetch(`https://api.trakt.tv/users/${TRAKT_USERNAME}/watchlist/shows?sort=added,asc`, { headers }).catch(() => ({ ok: false })),
      fetch(`https://api.trakt.tv/users/${TRAKT_USERNAME}/watchlist/movies?sort=added,asc`, { headers }).catch(() => ({ ok: false }))
    ]);

    let showsData = [];
    let moviesData = [];

    if (showsRes.ok) {
      try { showsData = await showsRes.json(); } catch (_) {}
    }
    if (moviesRes.ok) {
      try { moviesData = await moviesRes.json(); } catch (_) {}
    }

    const shows = await Promise.all((Array.isArray(showsData) ? showsData : []).map(async (item) => {
      const title = item?.show?.title || 'Unknown';
      let poster = await getTMDBPoster(item?.show?.ids?.tmdb, 'tv');
      if (!poster) poster = await getTVMazePoster(title);
      return { title, poster };
    }));

    const movies = await Promise.all((Array.isArray(moviesData) ? moviesData : []).map(async (item) => {
      const title = item?.movie?.title || 'Unknown';
      const poster = await getTMDBPoster(item?.movie?.ids?.tmdb, 'movie');
      return { title, poster };
    }));

    return { shows, movies };
  }

  async function pullSimklData() {
    const SIMKL_ACCESS_TOKEN = process.env.SIMKL_ACCESS_TOKEN;
    if (!SIMKL_CLIENT_ID && !SIMKL_ACCESS_TOKEN) return { shows: [], movies: [] };

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    if (SIMKL_ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${SIMKL_ACCESS_TOKEN}`;
    }

    const param = SIMKL_CLIENT_ID ? `?client_id=${SIMKL_CLIENT_ID}` : '';
    
    let simklWatching = [];
    let simklPlan = [];
    let simklMovies = [];

    if (SIMKL_ACCESS_TOKEN) {
      const res = await fetch(`https://api.simkl.com/sync/all-items${param}`, { headers }).catch(() => ({ ok: false }));
      if (res.ok) {
        const data = await res.json();
        const allShows = data.shows || [];
        simklWatching = allShows.filter(s => s.status === 'watching');
        simklPlan = allShows.filter(s => s.status === 'plantowatch');
        simklMovies = (data.movies || []).filter(m => m.status === 'plantowatch');
      }
    } else if (SIMKL_USER_ID) {
      [simklWatching, simklPlan, simklMovies] = await Promise.all([
        fetch(`https://api.simkl.com/users/${SIMKL_USER_ID}/ratings/tv/watching${param}`, { headers }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch(`https://api.simkl.com/users/${SIMKL_USER_ID}/ratings/tv/plantowatch${param}`, { headers }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch(`https://api.simkl.com/users/${SIMKL_USER_ID}/ratings/movies/plantowatch${param}`, { headers }).then((r) => (r.ok ? r.json() : [])).catch(() => [])
      ]);
    }

    const allSimklShows = simklPlan;
    const shows = await Promise.all(allSimklShows.map(async (item) => {
      const s = item?.show || {};
      let poster = await getTMDBPoster(s.ids?.tmdb, 'tv');
      if (!poster) poster = await getTVMazePoster(s.title);
      const total = Number(item?.total_episodes_count || item?.total_episodes) || 0;
      const watched = Number(item?.watched_episodes_count || item?.watched_episodes) || 0;
      return {
        title: s.title || 'Unknown',
        poster,
        progress: total > 0 ? Math.round((watched / total) * 100) : null
      };
    }));

    const movies = await Promise.all(simklMovies.map(async (item) => {
      const m = item?.movie || {};
      const poster = await getTMDBPoster(m.ids?.tmdb, 'movie');
      return { title: m.title || 'Unknown', poster };
    }));

    return { shows, movies };
  }

  function dedupeByTitle(items) {
    const seen = new Set();
    return (Array.isArray(items) ? items : []).filter((item) => {
      const key = String(item?.title || '').toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function pullExportFallback() {
    try {
      const fallbackPath = path.join(process.cwd(), 'utility', 'trakt-fallback-data.json');
      if (fs.existsSync(fallbackPath)) {
        const fb = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        return {
          shows: fb.showsWatchlist || [],
          movies: fb.moviesWatchlist || []
        };
      }
    } catch (_) {}
    return { shows: [], movies: [] };
  }

  try {
    let providerOrder = ['simkl', 'trakt'];
    if (sourceQuery === 'trakt' || sourceQuery === 'simkl') {
      providerOrder = [sourceQuery, sourceQuery === 'trakt' ? 'simkl' : 'trakt'];
    }

    let shows = [];
    let movies = [];
    let source = 'fallback';

    for (const provider of providerOrder) {
      const pulled = provider === 'simkl' ? await pullSimklData() : await pullTraktData();
      if ((pulled.shows && pulled.shows.length) || (pulled.movies && pulled.movies.length)) {
        shows = dedupeByTitle(pulled.shows);
        movies = dedupeByTitle(pulled.movies);
        source = provider;
        break;
      }
    }

    if (!shows.length && !movies.length) {
      const fallback = pullExportFallback();
      shows = fallback.shows;
      movies = fallback.movies;
      source = 'trakt-export';
    }

    res.status(200).json({
      shows,
      movies,
      source,
      lastSyncedAt: new Date().toISOString(),
      configured: {
        trakt: Boolean(TRAKT_CLIENT_ID),
        simkl: Boolean(SIMKL_CLIENT_ID && (SIMKL_USER_ID || SIMKL_ACCESS_TOKEN))
      }
    });
  } catch (error) {
    const fallback = pullExportFallback();
    res.status(200).json({
      shows: fallback.shows,
      movies: fallback.movies,
      source: 'trakt-export',
      error: 'Failed to fetch dynamic watchlists, loaded backup',
      detail: error.message
    });
  }
}

