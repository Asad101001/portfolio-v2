// api/linkedin-post.js

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const POST_SECRET   = process.env.LINKEDIN_POST_SECRET;

// Upstash REST: SET key value
// The value goes in the URL as a path segment, NOT in the body
async function kv_set(key, obj) {
  const value = JSON.stringify(obj);
  const res = await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
    method: 'GET', // Upstash REST SET via GET: /set/key/value
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  return res.json();
}

async function kv_get(key) {
  const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const data = await res.json();
  if (!data.result) return null;
  try {
    return JSON.parse(data.result);
  } catch {
    return null;
  }
}

const DEFAULT_PROFILE = {
  name:     'Muhammad Asad Khan',
  headline: "CS Student @ UBIT '28 | Python · AWS · AI",
  photo:    'https://media.licdn.com/dms/image/v2/D4D03AQHAXvV1pZT4Uw/profile-displayphoto-scale_200_200/B4DZwNavPQHgAY-/0/1769751641032?e=1775692800&v=beta&t=Zeya4BD7yQHomtvZXPvKFW00wN97pBiGJun9FK0Rvlg',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    try {
      const stored = await kv_get('linkedin_data');
      if (!stored || typeof stored !== 'object' || !stored.text) {
        return res.json({
          text: "Proud to present LegalEase AI - built at the Hackathon for HEC Generative AI Training Cohort 2. My first hackathon ever. Upload any contract and get clause risk-rating, plain Urdu explanations, a RAG chatbot, and a downloadable PDF report. Full analysis in under a minute.",
          url: 'https://www.linkedin.com/feed/update/urn:li:activity:7432247621462675456/',
          date: null,
          profile: DEFAULT_PROFILE,
          source: 'fallback'
        });
      }
      return res.json({
        text:    stored.text,
        url:     stored.url || 'https://www.linkedin.com/in/muhammadasadk/',
        date:    stored.date || null,
        profile: { ...DEFAULT_PROFILE, ...(stored.profile || {}) },
        source:  'live'
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
      await kv_set('linkedin_data', payload);
      return res.json({ success: true, saved: payload });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save', detail: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}