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

  // 1. Try Spotify Search API
  try {
    if (CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN) {
      const { access_token } = await getAccessToken();
      const searchRes = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(name)}&type=artist&limit=1`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (searchRes.ok) {
        const data = await searchRes.json();
        const artist = data.artists?.items?.[0];
        if (artist && artist.images && artist.images.length > 0) {
          return res.json({
            name:  artist.name,
            image: artist.images[0].url
          });
        }
      }
    }
  } catch (e) {
    console.warn('Spotify API failed, falling back to Deezer', e.message);
  }

  // 2. Fallback to Deezer API
  try {
    const dzRes = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}`);
    if (dzRes.ok) {
      const dzData = await dzRes.json();
      if (dzData.data && dzData.data.length > 0 && dzData.data[0].picture_medium) {
        return res.json({
          name: dzData.data[0].name,
          image: dzData.data[0].picture_medium
        });
      }
    }
  } catch (e) {
    console.warn('Deezer API failed', e.message);
  }

  // 3. Complete failure
  return res.json({ image: null });
}
