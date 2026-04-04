/* ── Twitter (X) Feed Implementation ─────────────────────────── */
import { CONFIG } from './widgets.js';

(function () {
    const container = document.getElementById('twitter-feed');
    if (!container) return;

    const USER = CONFIG.usernames.twitter || 'As4d_41';
    const NITTER_INSTANCES = [
        'nitter.net',
        'nitter.cz',
        'nitter.unixfox.eu',
        'nitter.poast.org',
        'nitter.moomoo.me'
    ];
    let currentInstanceIdx = 0;

    function getProxyUrl(instance) {
        const rssUrl = `https://${instance}/${USER}/rss`;
        return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&v=${Date.now()}`;
    }

    function timeAgo(dateStr) {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        if (diff < 60) return 'now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        return Math.floor(diff / 86400) + 'd';
    }

    function render(items) {
        container.innerHTML = '';
        
        if (!items || items.length === 0) {
            container.innerHTML = '<p class="twitter-status-msg" style="padding:20px;text-align:center;color:var(--text-dim);font-size:0.8rem;">No recent posts found on X.</p>';
            return;
        }

        items.slice(0, 4).forEach(item => {
            const isRetweet = item.title.startsWith('RT by');
            
            // Clean content: remove HTML and the "RT by @user: " prefix
            let cleanText = item.title.replace(/^RT by @[a-zA-Z0-9_]+: /, '').replace(/<[^>]*>/g, '').trim();
            
            // Convert Nitter link to direct X/Twitter link
            let twitterLink = item.link;
            if (twitterLink.includes('nitter') || twitterLink.includes('.cz') || twitterLink.includes('.eu')) {
                // regex to replace domain with twitter.com
                twitterLink = twitterLink.replace(/https?:\/\/[^\/]+\//, 'https://twitter.com/');
            }
            if (!twitterLink.includes('/status/')) {
                twitterLink = `https://twitter.com/${USER}`;
            }

            // Extract media (Image/GIF/Video)
            let mediaHtml = '';
            const desc = item.description || item.content || '';
            const videoMatch = desc.match(/<video[^>]*>[\s\S]*?<source[^>]+src="([^">]+)"/i) || desc.match(/<video[^>]+src="([^">]+)"/i);
            
            const originBase = new URL(item.link).origin;
            if (videoMatch && videoMatch[1]) {
                let vSrc = videoMatch[1];
                if (vSrc.startsWith('/')) vSrc = originBase + vSrc;
                mediaHtml = `
                    <div class="x-card-media">
                        <video src="${vSrc}" controls autoplay loop muted playsinline></video>
                    </div>
                `;
            } else {
                const imgMatch = desc.match(/<img[^>]*src="([^">]+)"/i);
                if (imgMatch && imgMatch[1]) {
                    let imgSrc = imgMatch[1];
                    if (imgSrc.startsWith('/')) imgSrc = originBase + imgSrc;
                    mediaHtml = `
                        <div class="x-card-media">
                            <img src="${imgSrc}" alt="Post media" loading="lazy">
                        </div>
                    `;
                }
            }

            const tweetEl = document.createElement('div');
            tweetEl.className = 'x-post-container';
            tweetEl.onclick = () => window.open(twitterLink, '_blank');
            
            tweetEl.innerHTML = `
                <div class="x-post-header">
                    <div class="x-avatar">
                        <img src="https://unavatar.io/twitter/${USER}" onerror="this.src='https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'">
                    </div>
                    <div class="x-author-info">
                        <div class="x-names">
                            <span class="x-display-name">Asad</span>
                            <span class="x-handle">@${USER}</span>
                            <span class="x-dot">·</span>
                            <span class="x-time">${timeAgo(item.pubDate)}</span>
                        </div>
                        ${isRetweet ? '<div class="x-rt-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3.88l4.432 4.43-1.77 1.77L4.5 7.42V17h11v2H2.5V3.88zM21.5 7h-11V5h13v15.12l-4.432-4.43 1.77-1.77 2.662 2.66V7z"/></svg> Retweeted</div>' : ''}
                    </div>
                </div>
                <div class="x-post-body">
                    <div class="x-post-main">
                        <p class="x-post-text">${cleanText}</p>
                    </div>
                    ${mediaHtml}
                </div>
            `;
            container.appendChild(tweetEl);
        });
    }

    function fetchTweets() {
        // Nitter RSS logic directly
        const url = getProxyUrl(NITTER_INSTANCES[currentInstanceIdx]);
        fetch(url)
            .then(r => r.json())
            .then(data => {
                if (data.status === 'ok') {
                    localStorage.setItem('asad_twitter_cache_v2', JSON.stringify(data.items));
                    render(data.items);
                } else {
                    throw new Error('RSS fail');
                }
            })
            .catch(() => {
                if (currentInstanceIdx < NITTER_INSTANCES.length - 1) {
                    currentInstanceIdx++;
                    fetchTweets();
                } else {
                    const cached = localStorage.getItem('asad_twitter_cache_v2');
                    if (cached) render(JSON.parse(cached));
                    else {
                        container.innerHTML = `
                            <div class="x-error-box" style="padding:20px;text-align:center;">
                                <p style="color:var(--text-dim);font-size:0.8rem;margin-bottom:10px;">X feed briefly unavailable.</p>
                                <a href="https://twitter.com/${USER}" target="_blank" style="color:var(--cyan);text-decoration:none;font-size:0.85rem;font-weight:700;">View Profile ↗</a>
                            </div>
                        `;
                    }
                }
            });
    }

    fetchTweets();
    setInterval(fetchTweets, 60000 * 30);
})();
