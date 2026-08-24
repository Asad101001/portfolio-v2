/* ── Twitter (X) Feed Implementation ─────────────────────────── */
import { CONFIG, escHtml } from './widgets.js';

(function () {
    const container = document.getElementById('twitter-feed');
    if (!container) return;

    const USER = CONFIG.usernames.twitter || 'As4d_41';


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
            let rawText = item.title.replace(/^RT by @[a-zA-Z0-9_]+: /, '').replace(/<[^>]*>/g, '').trim();
            let cleanText = escHtml(rawText);
            
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
            
            const originBase = new URL(twitterLink).origin;
            if (videoMatch && videoMatch[1]) {
                let vSrc = videoMatch[1];
                if (vSrc.startsWith('/')) vSrc = originBase + vSrc;
                mediaHtml = `
                    <div class="x-card-media">
                        <video src="${vSrc}" controls autoplay loop muted playsinline webkit-playsinline preload="metadata" onerror="this.parentElement.style.display='none'"></video>
                    </div>
                `;
            } else {
                const imgMatch = desc.match(/<img[^>]*src="([^">]+)"/i);
                if (imgMatch && imgMatch[1]) {
                    let imgSrc = imgMatch[1];
                    if (imgSrc.startsWith('/')) imgSrc = originBase + imgSrc;
                    mediaHtml = `
                        <div class="x-card-media">
                            <img src="${imgSrc}" alt="Post media" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.style.display='none'">
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
                        <img src="https://unavatar.io/twitter/${USER}" alt="${USER} Twitter Avatar" onerror="this.src='https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.webp'">
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

    const FALLBACK_TWEETS = [
        {
            title: "Deep-diving into agentic workflows, AWS VPC architectures, and real-time streaming APIs. Exciting project updates coming soon! 🚀",
            link: `https://twitter.com/${USER}`,
            pubDate: new Date(Date.now() - 3600000 * 3).toISOString()
        },
        {
            title: "Building high-performance modern web platforms & fluid UI systems. Engineering fast, responsive applications!",
            link: `https://twitter.com/${USER}`,
            pubDate: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            title: "Exploring Python, RAG pipelines, and cloud computing infrastructure at UBIT '28.",
            link: `https://twitter.com/${USER}`,
            pubDate: new Date(Date.now() - 86400000 * 5).toISOString()
        }
    ];

    function fetchTweets() {
        try {
            const cached = localStorage.getItem('asad_twitter_cache_v2');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    render(parsed);
                }
            }
        } catch (_) {}

        const url = `/api/twitter?user=${USER}&_t=${Date.now()}`;
        fetch(url, { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
                    localStorage.setItem('asad_twitter_cache_v2', JSON.stringify(data.items));
                    render(data.items);
                } else {
                    render(FALLBACK_TWEETS);
                }
            })
            .catch(() => {
                render(FALLBACK_TWEETS);
            });
    }

    fetchTweets();
    setInterval(fetchTweets, 60000 * 5);
})();
