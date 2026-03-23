
/* ── api/twitter.js ────────────────────────────── */
/* Server-side bridge for Official Twitter API      */
export default async function handler(req, res) {
  const USER = 'As4d_41';
  // Personal API Token (Set this in .env or Hosting Dashboard)
  const token = process.env.TWITTER_BEARER_TOKEN;
  
  if (!token) {
    // Return early if no token is configured
    return res.status(404).json({ error: 'Twitter API not configured' });
  }

  try {
    // Step 1: Get User ID from username
    const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${USER}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userData = await userRes.json();
    
    if (!userData.data) throw new Error('User not found');
    const userId = userData.data.id;

    // Step 2: Fetch latest tweets for the User ID
    const tweetsRes = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?max_results=3&tweet.fields=created_at,public_metrics,entities&expansions=attachments.media_keys&media.fields=url,preview_image_url`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const tweetsData = await tweetsRes.json();
    
    return res.status(200).json(tweetsData);
  } catch (err) {
    console.error('[Twitter API Error]', err);
    return res.status(500).json({ error: 'Failed to fetch tweets' });
  }
}
