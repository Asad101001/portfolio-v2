export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const USERNAME = 'Asad991'; 

  try {
    const response = await fetch(
      `https://api.trakt.tv/users/${USERNAME}/watching`,
      {
        headers: {
          "Content-Type": "application/json",
          "trakt-api-version": "2",
          "trakt-api-key": TRAKT_CLIENT_ID,
        },
      }
    );

    let data = null;
    let watching = false;

    if (response.status === 204) {
      const historyRes = await fetch(
        `https://api.trakt.tv/users/${USERNAME}/history/episodes?limit=1`,
        {
          headers: {
            "Content-Type": "application/json",
            "trakt-api-version": "2",
            "trakt-api-key": TRAKT_CLIENT_ID,
          },
        }
      );
      const historyData = await historyRes.json();
      if (historyData && historyData.length > 0) {
        data = historyData[0];
        watching = false;
      }
    } else {
      data = await response.json();
      watching = true;
    }

    if (!data) return res.status(200).json({ watching: null });

    const show = data.show || data.track?.show; // Depending on endpoint
    const episode = data.episode || data.track?.episode;

    const formatted = {
      watching: watching,
      title: show.title,
      season: episode.season,
      episode: episode.number,
      tmdbId: show.ids.tmdb || null,
      poster: null
    };

    // TMDb Enrichment
    if (formatted.tmdbId && TMDB_API_KEY) {
      try {
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/tv/${formatted.tmdbId}?api_key=${TMDB_API_KEY}`);
        const tmdbData = await tmdbRes.json();
        if (tmdbData.poster_path) {
          formatted.poster = `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;
        }
      } catch (err) {
        console.error("TMDb fetch error:", err);
      }
    }

    res.status(200).json(formatted);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Trakt data", detail: error.message });
  }
}
