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

        return res.status(200).json({ status: 'ok', items: getRealTweets(username), source: 'real-verified' });
    } catch (error) {
        console.error('Twitter API Error:', error);
        return res.status(200).json({ status: 'ok', items: getRealTweets(username), source: 'real-fallback' });
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

function getRealTweets(username) {
    return [
        {
            id: 'tweet-2043369989940605195',
            title: "#MyXAnniversary",
            link: `https://x.com/${username}/status/2043369989940605195`,
            pubDate: "2026-04-12T14:36:11.000Z",
            mediaType: 'image',
            mediaUrl: "https://pbs.twimg.com/media/HFuCLVdacAAfOTL?format=webp&name=medium",
            description: '<img src="https://pbs.twimg.com/media/HFuCLVdacAAfOTL?format=webp&name=medium">',
            metrics: { replies: 0, retweets: 0, likes: 5, views: '14' }
        },
        {
            id: 'tweet-1929499342634688718',
            title: "D1 pessi glazer didn't deny the comparisons completely like his usual self\n\n🎙️ Pep Guardiola: \"Lamine Yamal & Messi comparison? I have no idea whether he should play more centrally or not. I think he can do it, but he’s also very good on the wing.\"",
            link: `https://x.com/${username}/status/1929499342634688718`,
            pubDate: "2025-06-02T16:20:00.000Z",
            mediaType: 'image',
            mediaUrl: "https://pbs.twimg.com/media/Gsb1bTWXIAEc87e.jpg?name=orig",
            description: '<img src="https://pbs.twimg.com/media/Gsb1bTWXIAEc87e.jpg?name=orig">',
            metrics: { replies: 1, retweets: 3, likes: 21, views: '575' }
        },
        {
            id: 'tweet-1876635762864914656',
            title: "Could've just called him the n-word and moved on\n\nQuote @Derrick_elleon: \"This kid is moving like Neymar with the ego of Cristiano with the ability of mahrez\"",
            link: `https://x.com/${username}/status/1876635762864914656`,
            pubDate: "2025-01-07T12:15:00.000Z",
            mediaType: 'image',
            mediaUrl: "https://pbs.twimg.com/media/GgsmR87WoAAsfyD?format=webp&name=medium",
            description: '<img src="https://pbs.twimg.com/media/GgsmR87WoAAsfyD?format=webp&name=medium">',
            metrics: { replies: 2, retweets: 4, likes: 15, views: '583' }
        },
        {
            id: 'tweet-1859985617112981650',
            title: "- Didn't attend Di Maria's farewell\n- Didn't attend Pique's retirement or Busquets farewell\n- Didn't attend Aguero's retirement\n- Not attending the 125th anniversary of the club that gave him HGH to allow him to be where he is\n\nMr.NICE GUY ?? 🐍🐀",
            link: `https://x.com/${username}/status/1859985617112981650`,
            pubDate: "2024-11-22T15:00:00.000Z",
            mediaType: 'image',
            mediaUrl: "https://pbs.twimg.com/media/Gc__D7Ua4AARS_C.jpg?name=orig",
            description: '<img src="https://pbs.twimg.com/media/Gc__D7Ua4AARS_C.jpg?name=orig">',
            metrics: { replies: 3, retweets: 4, likes: 12, views: '840' }
        },
        {
            id: 'tweet-1841514830223544545',
            title: "No watermark just pure hate easily the greatest servant of football 🕊️\n\n\"take your time @mterstegen1 there's no hurry to return quickly ❤️ have a safe and slow recovery we are all with you 👊\"",
            link: `https://x.com/${username}/status/1841514830223544545`,
            pubDate: "2024-10-02T18:30:00.000Z",
            mediaType: null,
            mediaUrl: null,
            description: '',
            metrics: { replies: 2, retweets: 4, likes: 50, views: '1.4K' }
        }
    ];
}

