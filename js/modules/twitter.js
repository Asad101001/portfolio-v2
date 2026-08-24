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

    function renderErrorState() {
        container.innerHTML = `
            <div class="x-error-box">
                <div class="x-error-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <div class="x-error-title">X Feed Unavailable</div>
                <p class="x-error-desc">Unable to retrieve real-time posts from @${USER} right now.</p>
                <a href="https://x.com/${USER}" target="_blank" rel="noopener" class="x-error-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    View @${USER} on X
                </a>
            </div>
        `;
    }

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
                    renderErrorState();
                }
            })
            .catch(() => {
                renderErrorState();
            });
    }

    fetchTweets();
    setInterval(fetchTweets, 60000 * 5);
})();
