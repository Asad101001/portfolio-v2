export default async function handler(req, res) {
    const { user } = req.query;
    const username = user || 'As4d_41';
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    try {
        const response = await fetch(`https://api.fxtwitter.com/${username}`, {
            signal: AbortSignal.timeout(3500)
        });
        if (response.ok) {
            const data = await response.json();
            if (data && data.user) {
                return res.status(200).json({
                    status: 'ok',
                    user: {
                        name: data.user.name,
                        screen_name: data.user.screen_name,
                        avatar_url: data.user.avatar_url,
                        tweets: data.user.tweets,
                        likes: data.user.likes,
                        following: data.user.following
                    },
                    items: [],
                    source: 'live-user'
                });
            }
        }
        return res.status(200).json({ status: 'empty', items: [], source: 'empty' });
    } catch (error) {
        console.error('Twitter API Error:', error);
        return res.status(200).json({ status: 'empty', items: [], source: 'empty' });
    }
}

