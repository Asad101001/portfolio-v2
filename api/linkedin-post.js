// api/linkedin-post.js
// Stores your latest LinkedIn post + profile snapshot
// GET  /api/linkedin-post  → returns { text, url, date, profile: { name, headline, photo } }
// POST /api/linkedin-post  → saves new data (called by you manually)

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const POST_SECRET   = process.env.LINKEDIN_POST_SECRET;

async function kv_set(key, value) {
  const res = await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  });
  return res.json();
}

async function kv_get(key) {
  const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

// ── EDIT THIS ONCE ──────────────────────────────────────────
// How to get your LinkedIn photo URL:
//   1. Open linkedin.com/in/muhammadasadk in browser
//   2. Right-click your profile photo → "Open image in new tab"
//   3. Copy the URL from the address bar → paste below
// It looks like: https://media.licdn.com/dms/image/v2/D4D.../photo...
const DEFAULT_PROFILE = {
  name:     'Muhammad Asad Khan',
  headline: "CS Student @ UBIT '28 | Python · AWS · AI",
  photo:    'https://media.licdn.com/dms/image/v2/D4D03AQHAXvV1pZT4Uw/profile-displayphoto-scale_200_200/B4DZwNavPQHgAY-/0/1769751641032?e=1775692800&amp;v=beta&amp;t=Zeya4BD7yQHomtvZXPvKFW00wN97pBiGJun9FK0Rvlg'
};


export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: widget fetches this ──
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 's-maxage=300');
    try {
      const stored = await kv_get('linkedin_data');
      if (!stored) {
        return res.json({
          text: "Excited to be diving deep into Cloud Architecture and RAG systems as part of the HEC GenAI Cohort 2. The intersection of LLMs and retrieval systems is genuinely fascinating.",
          url: 'https://www.linkedin.com/in/muhammadasadk/',
          date: null,
          profile: DEFAULT_PROFILE,
          source: 'fallback'
        });
      }
      // Merge stored profile with defaults (in case photo was added later)
      return res.json({
        ...stored,
        profile: {
          ...DEFAULT_PROFILE,
          ...(stored.profile || {}),
        },
        source: 'live'
      });
    } catch (e) {
      return res.status(200).json({
        text: "Check out my latest work and thoughts on LinkedIn.",
        url: 'https://www.linkedin.com/in/muhammadasadk/',
        date: null,
        profile: DEFAULT_PROFILE,
        source: 'error'
      });
    }
  }

  // ── POST: you call this to update ──
  if (req.method === 'POST') {
    const auth = req.headers['authorization'] || '';
    const token = auth.replace('Bearer ', '').trim();
    if (!POST_SECRET || token !== POST_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { text, url, profile } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const payload = {
      text: text.trim().slice(0, 500),
      url:  url || 'https://www.linkedin.com/in/muhammadasadk/',
      date: new Date().toISOString(),
      profile: {
        name:     (profile && profile.name)     || DEFAULT_PROFILE.name,
        headline: (profile && profile.headline) || DEFAULT_PROFILE.headline,
        photo:    (profile && profile.photo)    || DEFAULT_PROFILE.photo,
      }
    };

    try {
      await kv_set('linkedin_data', JSON.stringify(payload));
      return res.json({ success: true, saved: payload });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save', detail: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}