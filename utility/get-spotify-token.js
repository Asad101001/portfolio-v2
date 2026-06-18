import readline from 'readline';
import fs from 'fs';

// 1. Read .env.local to get Client ID and Secret
const envPath = '.env.local';
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error("Could not read .env.local file. Are you in the right directory?");
  process.exit(1);
}

const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=["']?([^"'\n]+)["']?`, 'm'));
  return match ? match[1] : null;
};

const CLIENT_ID = getEnv('SPOTIFY_CLIENT_ID');
const CLIENT_SECRET = getEnv('SPOTIFY_CLIENT_SECRET');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET missing in .env.local");
  process.exit(1);
}

// 2. Use the exact Redirect URI that is already configured in the user's dashboard!
const REDIRECT_URI = 'http://127.0.0.1';
const SCOPES = 'user-read-currently-playing user-read-recently-played';

const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

console.log('\n🎧 Spotify Token Generator (Manual Mode)');
console.log('----------------------------------------');
console.log('1. Please click (or copy & paste) this link into your browser:');
console.log(`\n${authUrl}\n`);
console.log('2. Log in and authorize the app.');
console.log('3. You will be redirected to a broken page starting with "http://127.0.0.1/?code=". That is completely normal!');
console.log('4. Copy the ENTIRE broken URL from your browser address bar and paste it below:\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('> Paste the full URL here: ', async (answer) => {
  try {
    const urlObj = new URL(answer.trim());
    const code = urlObj.searchParams.get('code');
    
    if (!code) {
      console.log('\n❌ Could not find a "code" in the URL. Make sure you pasted the entire URL.');
      process.exit(1);
    }

    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await tokenRes.json();
    
    if (data.refresh_token) {
      // Update the .env.local file
      let newEnvContent = envContent.replace(
        /^SPOTIFY_REFRESH_TOKEN=.*$/m,
        `SPOTIFY_REFRESH_TOKEN="${data.refresh_token}"`
      );
      
      if (!newEnvContent.includes('SPOTIFY_REFRESH_TOKEN=')) {
        newEnvContent += `\nSPOTIFY_REFRESH_TOKEN="${data.refresh_token}"`;
      }
      
      fs.writeFileSync(envPath, newEnvContent);

      console.log('\n✅ Success! Your new Refresh Token has been generated and saved to .env.local!');
      console.log('\n🚨 REMINDER: Update your Vercel environment variables with the new token!\n');
    } else {
      console.log('\n❌ Failed to get refresh token:', data);
    }
  } catch (e) {
    console.log('\n❌ Error parsing URL or fetching token:', e.message);
  }
  
  rl.close();
});
