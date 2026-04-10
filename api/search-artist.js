const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_URL  = 'https://accounts.spotify.com/api/token';
const SEARCH_URL = 'https://api.spotify.com/v1/search';

async function getAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200'); // Cache for 24h

  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Query parameter "name" is required' });

  try {
    const { access_token } = await getAccessToken();
    const searchRes = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(name)}&type=artist&limit=1`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!searchRes.ok) throw new Error(`Spotify Search API error: ${searchRes.statusText}`);

    const data = await searchRes.json();
    const artist = data.artists?.items?.[0];

    if (!artist) return res.json({ image: null });

    return res.json({
      name:  artist.name,
      image: artist.images?.[0]?.url || null
    });
  } catch (e) {
    return res.status(500).json({ error: 'Internal Server Error', detail: e.message });
  }
}
