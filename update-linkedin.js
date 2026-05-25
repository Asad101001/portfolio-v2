// update-linkedin.js
import readline from 'readline';

const UPSTASH_URL = 'https://enabling-baboon-76025.upstash.io';
const UPSTASH_TOKEN = 'gQAAAAAAASj5AAIncDJjMzVhODU3NmRlMGU0NDhjOGY0NmQ2MGViZGQ4ZWJkNnAyNzYwMjU';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const DEFAULT_PROFILE = {
  name: 'Muhammad Asad Khan',
  headline: "CS Student @ UBIT '28 | Python · AWS · AI",
  photo: 'https://media.licdn.com/dms/image/v2/D4D03AQHAXvV1pZT4Uw/profile-displayphoto-scale_200_200/B4DZwNavPQHgAY-/0/1769751641032?e=1775692800&v=beta&t=Zeya4BD7yQHomtvZXPvKFW00wN97pBiGJun9FK0Rvlg'
};

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function getMultiLineInput(promptText) {
  console.log(promptText);
  return new Promise((resolve) => {
    let lines = [];
    rl.on('line', (line) => {
      if (line.trim().toUpperCase() === 'SEND') {
        rl.removeAllListeners('line');
        resolve(lines.join('\n'));
      } else {
        lines.push(line);
      }
    });
    rl.on('close', () => {
      resolve(lines.join('\n'));
    });
  });
}

async function main() {
  console.log('\n==================================================================');
  console.log('                 🚀 LINKEDIN LIVE WIDGET UPDATER                  ');
  console.log('==================================================================\n');
  
  const urlInput = await askQuestion('🔗 Enter post URL (or press Enter for default profile): ');
  const url = urlInput.trim() || 'https://www.linkedin.com/in/muhammadasadk/';
  
  console.log('\n📝 Paste your LinkedIn post content below.');
  console.log('👉 When finished, type "SEND" on a new line and press Enter to upload:\n');
  console.log('------------------------------------------------------------------');
  
  const text = await getMultiLineInput('');
  
  if (!text.trim()) {
    console.log('\n❌ Error: Post text cannot be empty. Aborting.');
    rl.close();
    return;
  }
  
  const payload = {
    text: text.trim(),
    url: url,
    date: new Date().toISOString(),
    profile: DEFAULT_PROFILE
  };
  
  console.log('\n------------------------------------------------------------------');
  console.log(`📡 Sending update to Upstash Redis...`);
  
  const value = JSON.stringify(payload);
  const upstashUrl = `${UPSTASH_URL}/set/linkedin_data/${encodeURIComponent(value)}`;
  
  try {
    const res = await fetch(upstashUrl, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
    const data = await res.json();
    if (data.result === 'OK') {
      console.log('\n🎉 SUCCESS! LinkedIn widget updated successfully without character truncation.');
      console.log('🌐 Check your portfolio site to see the live updates!');
    } else {
      console.error('\n❌ Upstash Error:', data);
    }
  } catch (err) {
    console.error('\n❌ Network Error:', err);
  }
  
  rl.close();
}

main();
