const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
let REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_URL       = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENT_URL      = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

async function getAccessToken() {
  if (!REFRESH_TOKEN) {
    throw new Error('No refresh token available');
  }
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
  const data = await res.json();
  if (data.error === 'invalid_grant') {
    REFRESH_TOKEN = null;
    delete process.env.SPOTIFY_REFRESH_TOKEN;
    console.error('Spotify Refresh Token expired (invalid_grant). Token discarded. Please re-authenticate.');
    throw new Error('invalid_grant');
  }
  return data;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    const { access_token } = await getAccessToken();
    const nowRes = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (nowRes.status === 204 || nowRes.status > 400) {
      const recentRes = await fetch(RECENT_URL, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const recentData = await recentRes.json();
      const track = recentData.items?.[0]?.track;
      if (!track) return res.json({ isPlaying: false, track: null });
      return res.json({
        isPlaying: false,
        track: {
          name:     track.name,
          artist:   track.artists.map(a => a.name).join(', '),
          album:    track.album.name,
          albumArt: track.album.images[0]?.url,
          url:      track.external_urls.spotify,
          duration: track.duration_ms,
          progress: 0,
        }
      });
    }
    const data  = await nowRes.json();
    const track = data.item;
    return res.json({
      isPlaying: data.is_playing,
      track: {
        name:     track.name,
        artist:   track.artists.map(a => a.name).join(', '),
        album:    track.album.name,
        albumArt: track.album.images[0]?.url,
        url:      track.external_urls.spotify,
        duration: track.duration_ms,
        progress: data.progress_ms,
      }
    });
  } catch(e) {
    return res.status(500).json({ error: 'Spotify API error', detail: e.message });
  }
}