// api/linkedin-post.js
// Write endpoint — you call this manually when you make a LinkedIn post
// POST /api/linkedin-post
// Header: Authorization: Bearer YOUR_POST_SECRET
// Body: { "text": "your post text", "url": "optional linkedin post url" }
//
// Reads/writes to Upstash Redis (free tier, no credit card required)
// Setup: https://console.upstash.com → create Redis DB → copy REST URL + token

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const POST_SECRET   = process.env.LINKEDIN_POST_SECRET; // Any string you choose

async function kv_set(key, value) {
  const res = await fetch(`${UPSTASH_URL}/set/${key}`, {
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
  const res = await fetch(`${UPSTASH_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: return current post (called by your portfolio widget) ──
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 's-maxage=300'); // Cache 5 min on CDN
    try {
      const post = await kv_get('linkedin_latest_post');
      if (!post) {
        return res.json({
          text: "Excited to be diving deep into Cloud Architecture and RAG systems as part of the HEC GenAI Cohort 2. The intersection of LLMs and retrieval systems is genuinely fascinating.",
          url: 'https://www.linkedin.com/in/muhammadasadk/',
          date: null,
          source: 'fallback'
        });
      }
      return res.json({ ...post, source: 'live' });
    } catch (e) {
      return res.status(200).json({
        text: "Check out my latest work and thoughts on LinkedIn.",
        url: 'https://www.linkedin.com/in/muhammadasadk/',
        date: null,
        source: 'error'
      });
    }
  }

  // ── POST: write a new post (called by you manually) ──
  if (req.method === 'POST') {
    // Auth check
    const auth = req.headers['authorization'] || '';
    const token = auth.replace('Bearer ', '').trim();
    if (!POST_SECRET || token !== POST_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { text, url } = req.body || {};
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'text is required' });
    }

    const payload = {
      text: text.trim().slice(0, 500), // Hard cap 500 chars
      url: url || 'https://www.linkedin.com/in/muhammadasadk/',
      date: new Date().toISOString(),
    };

    try {
      await kv_set('linkedin_latest_post', JSON.stringify(payload));
      return res.json({ success: true, saved: payload });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save', detail: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
