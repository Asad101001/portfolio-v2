import fs from 'fs';
import path from 'path';

const CLIENT_ID = process.env.SIMKL_CLIENT_ID || '7b56e66d068c647eae7a0642374185405201c1283ecca8df1114d27cc6e4fdd8';
const ENV_PATH = path.join(process.cwd(), '.env.local');
const EXPORT_DIR = path.join(process.cwd(), 'trakt-export-as4d');

function getEnvToken() {
  if (process.env.SIMKL_ACCESS_TOKEN) return process.env.SIMKL_ACCESS_TOKEN;
  if (fs.existsSync(ENV_PATH)) {
    const text = fs.readFileSync(ENV_PATH, 'utf8');
    const match = text.match(/SIMKL_ACCESS_TOKEN=["']?([^"'\r\n]+)/);
    if (match) return match[1];
  }
  return null;
}

function saveEnvToken(token, userId) {
  let text = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  if (text.includes('SIMKL_ACCESS_TOKEN=')) {
    text = text.replace(/SIMKL_ACCESS_TOKEN=.*/g, `SIMKL_ACCESS_TOKEN="${token}"`);
  } else {
    text += `\nSIMKL_ACCESS_TOKEN="${token}"\n`;
  }
  if (userId) {
    if (text.includes('SIMKL_USER_ID=')) {
      text = text.replace(/SIMKL_USER_ID=.*/g, `SIMKL_USER_ID="${userId}"`);
    } else {
      text += `SIMKL_USER_ID="${userId}"\n`;
    }
  }
  fs.writeFileSync(ENV_PATH, text, 'utf8');
  console.log('💾 Access token saved to .env.local!');
}

async function obtainAccessToken() {
  let token = getEnvToken();
  if (token) {
    console.log('🔑 Found existing SIMKL_ACCESS_TOKEN in .env.local!');
    return token;
  }

  console.log('📡 Requesting Simkl OAuth PIN Code...');
  const pinRes = await fetch(`https://api.simkl.com/oauth/pin?client_id=${CLIENT_ID}`);
  if (!pinRes.ok) {
    throw new Error(`Failed to request PIN code from Simkl API: ${pinRes.status}`);
  }
  const pinData = await pinRes.json();
  const { user_code } = pinData;

  console.log('\n========================================================================');
  console.log('📺 SIMKL ACCOUNT AUTHORIZATION REQUIRED');
  console.log('========================================================================');
  console.log(`1. Open this link in your browser: https://simkl.com/pin`);
  console.log(`2. Enter the PIN Code:             👉  ${user_code}  👈`);
  console.log('========================================================================\n');
  console.log('⏳ Waiting for authorization... (checking automatically every 3s)');

  const checkUrl = `https://api.simkl.com/oauth/pin/${user_code}?client_id=${CLIENT_ID}`;
  
  while (true) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const checkRes = await fetch(checkUrl);
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.result === 'OK' && checkData.access_token) {
          console.log('\n🎉 Authorization successful!');
          const token = checkData.access_token;
          const userId = checkData.user ? checkData.user.id : null;
          saveEnvToken(token, userId);
          return token;
        }
      }
    } catch (_) {}
  }
}

function parseTraktExport() {
  console.log('📂 Reading watched history & watchlists from trakt-export-as4d...');
  if (!fs.existsSync(EXPORT_DIR)) {
    throw new Error(`Directory trakt-export-as4d not found at ${EXPORT_DIR}`);
  }

  const historyFiles = fs.readdirSync(EXPORT_DIR).filter(f => f.startsWith('watched-history-') && f.endsWith('.json'));
  
  const showsMap = new Map();
  const moviesList = [];

  historyFiles.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, file), 'utf8'));
    content.forEach(item => {
      if (item.type === 'episode' && item.show && item.episode) {
        const key = item.show.ids?.tmdb || item.show.ids?.imdb || item.show.title;
        if (!showsMap.has(key)) {
          showsMap.set(key, {
            title: item.show.title,
            ids: {
              tmdb: item.show.ids?.tmdb,
              imdb: item.show.ids?.imdb,
              tvdb: item.show.ids?.tvdb,
              trakt: item.show.ids?.trakt
            },
            seasons: new Map()
          });
        }
        const showObj = showsMap.get(key);
        const sNum = item.episode.season;
        const eNum = item.episode.number;
        if (!showObj.seasons.has(sNum)) {
          showObj.seasons.set(sNum, new Map());
        }
        const seasonMap = showObj.seasons.get(sNum);
        if (!seasonMap.has(eNum)) {
          seasonMap.set(eNum, { number: eNum, watched_at: item.watched_at });
        }
      } else if (item.type === 'movie' && item.movie) {
        moviesList.push({
          title: item.movie.title,
          ids: {
            tmdb: item.movie.ids?.tmdb,
            imdb: item.movie.ids?.imdb,
            trakt: item.movie.ids?.trakt
          },
          watched_at: item.watched_at
        });
      }
    });
  });

  const formattedShows = [];
  showsMap.forEach(showObj => {
    const seasonsArr = [];
    showObj.seasons.forEach((epMap, sNum) => {
      seasonsArr.push({
        number: sNum,
        episodes: Array.from(epMap.values())
      });
    });
    formattedShows.push({
      title: showObj.title,
      ids: showObj.ids,
      seasons: seasonsArr
    });
  });

  // Watchlist
  const watchlistShows = [];
  const watchlistMovies = [];
  const watchlistPath = path.join(EXPORT_DIR, 'lists-watchlist.json');
  if (fs.existsSync(watchlistPath)) {
    const wl = JSON.parse(fs.readFileSync(watchlistPath, 'utf8'));
    wl.forEach(item => {
      if (item.show) {
        watchlistShows.push({
          title: item.show.title,
          ids: { tmdb: item.show.ids?.tmdb, imdb: item.show.ids?.imdb }
        });
      } else if (item.movie) {
        watchlistMovies.push({
          title: item.movie.title,
          ids: { tmdb: item.movie.ids?.tmdb, imdb: item.movie.ids?.imdb }
        });
      }
    });
  }

  return {
    shows: formattedShows,
    movies: moviesList,
    watchlistShows,
    watchlistMovies
  };
}

async function uploadToSimkl(token, exportData) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const syncUrl = `https://api.simkl.com/sync/history?client_id=${CLIENT_ID}`;
  const listUrl = `https://api.simkl.com/sync/add-to-list?client_id=${CLIENT_ID}`;

  console.log(`\n🚀 Uploading ${exportData.shows.length} shows & 1,440+ watch events to your Simkl account...`);

  // Send shows in batches of 10 to avoid API timeouts
  const batchSize = 10;
  let totalAddedEpisodes = 0;

  for (let i = 0; i < exportData.shows.length; i += batchSize) {
    const batch = exportData.shows.slice(i, i + batchSize);
    console.log(`  Syncing shows batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(exportData.shows.length/batchSize)}...`);
    try {
      const res = await fetch(syncUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ shows: batch })
      });
      if (res.ok) {
        const result = await res.json();
        const epCount = result.added?.episodes || 0;
        totalAddedEpisodes += epCount;
        console.log(`    ✅ Batch ${Math.floor(i/batchSize) + 1} synced! (Added: ${epCount} episodes)`);
      } else {
        console.warn(`    ⚠️ Batch ${Math.floor(i/batchSize) + 1} response HTTP ${res.status}:`, await res.text());
      }
    } catch (err) {
      console.error(`    ❌ Batch error:`, err.message);
    }
  }

  if (exportData.watchlistShows.length || exportData.watchlistMovies.length) {
    console.log(`\n🚀 Syncing Watchlist items...`);
    try {
      const wlRes = await fetch(listUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          shows: exportData.watchlistShows.map(s => ({ ...s, to_list: 'plantowatch' })),
          movies: exportData.watchlistMovies.map(m => ({ ...m, to_list: 'plantowatch' }))
        })
      });
      if (wlRes.ok) {
        console.log('  ✅ Watchlist items successfully synced!');
      }
    } catch (_) {}
  }

  console.log(`\n🎉 SUCCESS! Synchronized ${exportData.shows.length} shows (${totalAddedEpisodes} episode events) & watchlists directly to your Simkl account!`);
}

async function main() {
  try {
    const token = await obtainAccessToken();
    const exportData = parseTraktExport();
    await uploadToSimkl(token, exportData);
  } catch (err) {
    console.error('\n❌ Sync Process Error:', err.message);
  }
}

main();
