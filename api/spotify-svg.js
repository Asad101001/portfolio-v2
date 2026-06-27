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
    console.error('Spotify Refresh Token expired (invalid_grant). Token discarded.');
    throw new Error('invalid_grant');
  }
  return data;
}

async function getBase64Image(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch (e) {
    console.error('Failed to fetch album art base64:', e.message);
    return null;
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function truncate(str, maxLen) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0');
  
  let track = null;
  let isPlaying = false;
  let progress = 0;
  let duration = 0;

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
      const recentTrack = recentData.items?.[0]?.track;
      if (recentTrack) {
        track = {
          name:     recentTrack.name,
          artist:   recentTrack.artists.map(a => a.name).join(', '),
          albumArt: recentTrack.album.images[0]?.url,
        };
      }
    } else {
      const data  = await nowRes.json();
      const currentTrack = data.item;
      if (currentTrack) {
        isPlaying = data.is_playing;
        progress = data.progress_ms || 0;
        duration = currentTrack.duration_ms || 0;
        track = {
          name:     currentTrack.name,
          artist:   currentTrack.artists.map(a => a.name).join(', '),
          albumArt: currentTrack.album.images[0]?.url,
        };
      }
    }
  } catch(e) {
    console.error('Spotify SVG handler error:', e.message);
  }

  const artPlaceholder = `
    <g transform="translate(15, 15)">
      <rect width="80" height="80" fill="#222" rx="8"/>
      <circle cx="40" cy="40" r="25" fill="#111" stroke="#333" stroke-width="2"/>
      <circle cx="40" cy="40" r="8" fill="#0B0B0B"/>
      <!-- simple note icon -->
      <path d="M38 30v16.5c-.8-.3-1.8-.5-2.8-.2-1.7.5-2.7 2.1-2.2 3.6.5 1.5 2.2 2.3 3.9 1.8 1.4-.4 2.2-1.6 2.2-2.7V34h6v6.5c-.8-.3-1.8-.5-2.8-.2-1.7.5-2.7 2.1-2.2 3.6.5 1.5 2.2 2.3 3.9 1.8 1.4-.4 2.2-1.6 2.2-2.7V30H38z" fill="#1DB954"/>
    </g>
  `;

  let albumArtImageTag = artPlaceholder;
  if (track && track.albumArt) {
    const base64Art = await getBase64Image(track.albumArt);
    if (base64Art) {
      albumArtImageTag = `
        <clipPath id="art-clip">
          <rect x="15" y="15" width="80" height="80" rx="8" />
        </clipPath>
        <image href="${base64Art}" x="15" y="15" width="80" height="80" clip-path="url(#art-clip)" />
      `;
    }
  }

  let svgContent = '';

  if (track && isPlaying) {
    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
    const progressWidth = Math.min(Math.max(progressPercent, 0), 100) * 3.1; // 310px width max
    
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="110" viewBox="0 0 450 110" fill="none">
  <style>
    .card {
      fill: #0A0A0A;
      stroke: #222222;
      stroke-width: 1;
      rx: 10px;
    }
    .title {
      font-family: 'JetBrains Mono', 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      font-weight: bold;
      fill: #FFFFFF;
    }
    .artist {
      font-family: 'JetBrains Mono', 'Segoe UI', Arial, sans-serif;
      font-size: 11px;
      fill: #AAAAAA;
    }
    .status {
      font-family: 'JetBrains Mono', 'Segoe UI', Arial, sans-serif;
      font-size: 9px;
      fill: #1DB954;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .bar {
      fill: #1DB954;
      animation: bounce 1.2s ease-in-out infinite;
    }
    .bar:nth-child(2) { animation-delay: 0.2s; }
    .bar:nth-child(3) { animation-delay: 0.4s; }
    .bar:nth-child(4) { animation-delay: 0.1s; }
    .bar:nth-child(5) { animation-delay: 0.3s; }
    @keyframes bounce {
      0%, 100% { transform: scaleY(0.3); }
      50% { transform: scaleY(1.0); }
    }
  </style>
  <rect class="card" width="448" height="108" x="1" y="1" rx="10" />
  
  ${albumArtImageTag}

  <text x="110" y="32" class="status">⚡ NOW PLAYING ON SPOTIFY</text>
  <text x="110" y="52" class="title">${escapeXml(truncate(track.name, 35))}</text>
  <text x="110" y="70" class="artist">${escapeXml(truncate(track.artist, 40))}</text>

  <g transform="translate(405, 20)">
    <rect class="bar" x="0" y="0" width="3" height="15" transform-origin="1.5 15" />
    <rect class="bar" x="5" y="0" width="3" height="15" transform-origin="6.5 15" />
    <rect class="bar" x="10" y="0" width="3" height="15" transform-origin="11.5 15" />
    <rect class="bar" x="15" y="0" width="3" height="15" transform-origin="16.5 15" />
  </g>

  <!-- Progress Bar -->
  <rect x="110" y="82" width="310" height="4" fill="#222222" rx="2" />
  <rect x="110" y="82" height="4" fill="#1DB954" rx="2">
    <animate attributeName="width" from="${progressWidth}" to="310" dur="${Math.max((duration - progress) / 1000, 1)}s" fill="freeze" />
  </rect>
</svg>`;
  } else {
    // Offline or paused
    const lastPlayedText = track ? `Last played: ${truncate(track.name, 25)} · ${truncate(track.artist, 20)}` : 'No recent tracks found';
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="110" viewBox="0 0 450 110" fill="none">
  <style>
    .card {
      fill: #0A0A0A;
      stroke: #222222;
      stroke-width: 1;
      rx: 10px;
    }
    .title {
      font-family: 'JetBrains Mono', 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      font-weight: bold;
      fill: #666666;
    }
    .artist {
      font-family: 'JetBrains Mono', 'Segoe UI', Arial, sans-serif;
      font-size: 11px;
      fill: #444444;
    }
    .status {
      font-family: 'JetBrains Mono', 'Segoe UI', Arial, sans-serif;
      font-size: 9px;
      fill: #666666;
      font-weight: bold;
      letter-spacing: 1px;
    }
  </style>
  <rect class="card" width="448" height="108" x="1" y="1" rx="10" />
  
  ${albumArtImageTag}

  <text x="110" y="32" class="status">💤 OFFLINE / PAUSED</text>
  <text x="110" y="52" class="title">Not listening to Spotify</text>
  <text x="110" y="70" class="artist">${escapeXml(lastPlayedText)}</text>
</svg>`;
  }

  res.send(svgContent);
}
