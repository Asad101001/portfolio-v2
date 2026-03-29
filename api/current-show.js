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
    // 1. Check if currently watching something
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

    let data    = null;
    let watching = false;

    if (response.status === 204) {
      // 2. Nothing currently watching → fallback to last watched episode
      const historyRes = await fetch(
        `https://api.trakt.tv/users/${USERNAME}/history/episodes?limit=1`,
        {
          headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': TRAKT_CLIENT_ID,
          },
        }
      );
      if (!historyRes.ok) {
        return res.status(200).json({ watching: null, error: 'Trakt history fetch failed: ' + historyRes.status });
      }
      const historyData = await historyRes.json();
      if (historyData && historyData.length > 0) {
        data    = historyData[0];
        watching = false;
      }
    } else if (response.ok) {
      data    = await response.json();
      watching = true;
    } else {
      return res.status(200).json({ watching: null, error: 'Trakt watching fetch failed: ' + response.status });
    }

    if (!data) return res.status(200).json({ watching: null });

    const show    = data.show;
    const episode = data.episode;

    if (!show || !episode) {
      return res.status(200).json({ watching: null, error: 'Unexpected Trakt data format' });
    }

    const formatted = {
      watching,
      title:   show.title             || null,
      season:  episode.season          ?? null,
      episode: episode.number          ?? null,
      tmdbId:  show.ids?.tmdb          || null,
      poster:  null,
    };

    if (!formatted.title) {
      return res.status(200).json({ watching: null });
    }

    // 3. TMDB poster enrichment (primary)
    if (formatted.tmdbId && TMDB_API_KEY) {
      try {
        const tmdbRes = await fetch(
          `https://api.themoviedb.org/3/tv/${formatted.tmdbId}?api_key=${TMDB_API_KEY}`
        );
        if (tmdbRes.ok) {
          const tmdbData = await tmdbRes.json();
          if (tmdbData.poster_path) {
            formatted.poster = `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;
          }
        }
      } catch (_) {
        // TMDB failed silently — proceed to fallback
      }
    }

    // 4. TVmaze poster fallback — free, no key, CORS-safe, excellent show coverage
    if (!formatted.poster) {
      try {
        const tvmazeRes = await fetch(
          `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(formatted.title)}`
        );
        if (tvmazeRes.ok) {
          const tvmazeData = await tvmazeRes.json();
          formatted.poster =
            tvmazeData?.image?.medium ||
            tvmazeData?.image?.original ||
            null;
        }
      } catch (_) {
        // TVmaze fallback failed silently
      }
    }

    res.status(200).json(formatted);
  } catch (error) {
    res.status(200).json({ watching: null, error: 'Failed to fetch Trakt data', detail: error.message });
  }
}
