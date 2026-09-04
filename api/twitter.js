const KNOWN_TWEET_IDS = [
    '2043369989940605195',
    '1929499342634688718',
    '1876635762864914656',
    '1859985617112981650',
    '1841514830223544545'
];

export default async function handler(req, res) {
    const { user } = req.query;
    const username = user || 'As4d_41';
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    try {
        // Attempt to fetch real tweets via fxTwitter status API for known tweet IDs
        const liveTweets = await fetchRealTweets(username, KNOWN_TWEET_IDS);
        if (liveTweets && liveTweets.length > 0) {
            return res.status(200).json({ status: 'ok', items: liveTweets, source: 'live' });
        }

        return res.status(200).json({ status: 'empty', items: [], source: 'empty' });
    } catch (error) {
        console.error('Twitter API Error:', error);
        return res.status(200).json({ status: 'empty', items: [], source: 'empty' });
    }
}

async function fetchRealTweets(username, tweetIds) {
    try {
        const promises = tweetIds.map(async (id) => {
            const r = await fetch(`https://api.fxtwitter.com/${username}/status/${id}`, {
                signal: AbortSignal.timeout(3500)
            });
            if (!r.ok) return null;
            const data = await r.json();
            const tweet = data.tweet;
            if (!tweet) return null;

            let mediaType = null;
            let mediaUrl = null;
            let description = '';

            const photo = tweet.media?.photos?.[0] || tweet.media?.all?.[0];
            const video = tweet.media?.videos?.[0];

            if (video && video.url) {
                mediaType = 'video';
                mediaUrl = video.url;
                description = `<video src="${video.url}"></video>`;
            } else if (photo && photo.url) {
                mediaType = 'image';
                mediaUrl = photo.url;
                description = `<img src="${photo.url}">`;
            }

            return {
                id: `tweet-${id}`,
                title: tweet.text || '',
                link: tweet.url || `https://x.com/${username}/status/${id}`,
                pubDate: tweet.created_at || new Date().toISOString(),
                mediaType,
                mediaUrl,
                description,
                metrics: {
                    replies: tweet.replies || 0,
                    retweets: tweet.retweets || 0,
                    likes: tweet.likes || 0,
                    views: tweet.views || '0'
                }
            };
        });

        const results = await Promise.all(promises);
        return results.filter(Boolean);
    } catch (e) {
        console.warn('Live real tweet fetch error:', e.message);
        return null;
    }
}

