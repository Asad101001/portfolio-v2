export default async function handler(req, res) {
    const { user } = req.query;
    const username = user || 'As4d_41';
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');

    try {
        const syndicationUrl = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${username}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(syndicationUrl)}`;
        const response = await fetch(proxyUrl);
        const html = await response.text();

        const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
        if (match && match[1]) {
            const data = JSON.parse(match[1]);
            const instructions = data.props?.pageProps?.timeline?.entries || [];
            const tweets = [];

            for (const entry of instructions) {
                if (entry.entryId.startsWith('tweet-')) {
                    const result = entry.content?.itemContent?.tweet_results?.result;
                    if (result && result.legacy) {
                        const legacy = result.legacy;
                        const userResult = result.core?.user_results?.result?.legacy || {};
                        const author = userResult.screen_name || username;
                        
                        let text = legacy.full_text || '';
                        let isRetweet = false;

                        // Check for retweet
                        if (legacy.retweeted_status_result && legacy.retweeted_status_result.result) {
                            isRetweet = true;
                            const rtLegacy = legacy.retweeted_status_result.result.legacy;
                            text = `RT by @${author}: ` + (rtLegacy?.full_text || text);
                        }

                        let mediaHtml = '';
                        const media = legacy.extended_entities?.media || legacy.entities?.media || [];
                        if (media.length > 0) {
                            const m = media[0];
                            if (m.type === 'video' || m.type === 'animated_gif') {
                                const variants = m.video_info?.variants || [];
                                const mp4 = variants.find(v => v.content_type === 'video/mp4');
                                if (mp4) {
                                    mediaHtml = `<video><source src="${mp4.url}"></video>`;
                                }
                            } else if (m.type === 'photo') {
                                mediaHtml = `<img src="${m.media_url_https}">`;
                            }
                        }

                        tweets.push({
                            title: text,
                            link: `https://twitter.com/${author}/status/${legacy.id_str}`,
                            pubDate: legacy.created_at,
                            description: mediaHtml,
                        });
                    }
                }
            }

            if (tweets.length > 0) {
                return res.status(200).json({ status: 'ok', items: tweets });
            }
        }
        
        return res.status(200).json({ status: 'error', message: 'No tweets found or rate limited' });
    } catch (error) {
        console.error('Twitter API Error:', error);
        res.status(200).json({ status: 'error', message: 'Failed to fetch tweets' });
    }
}
