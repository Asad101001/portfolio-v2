export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');

  const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
  const USERNAME = 'Asad991'; 

  try {
    // Fetch Shows Watchlist
    const showsRes = await fetch(
      `https://api.trakt.tv/users/${USERNAME}/watchlist/shows?sort=added,asc`,
      {
        headers: {
          "Content-Type": "application/json",
          "trakt-api-version": "2",
          "trakt-api-key": TRAKT_CLIENT_ID,
        },
      }
    );
    const showsData = await showsRes.json();
    const shows = showsData.slice(0, 3).map(item => item.show.title);

    // Fetch Movies Watchlist
    const moviesRes = await fetch(
      `https://api.trakt.tv/users/${USERNAME}/watchlist/movies?sort=added,asc`,
      {
        headers: {
          "Content-Type": "application/json",
          "trakt-api-version": "2",
          "trakt-api-key": TRAKT_CLIENT_ID,
        },
      }
    );
    const moviesData = await moviesRes.json();
    const movies = moviesData.slice(0, 3).map(item => item.movie.title);

    res.status(200).json({ shows, movies });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Trakt watchlist", detail: error.message });
  }
}
