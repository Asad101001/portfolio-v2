/* ── Twitter (X) Feed Implementation ─────────────────────────── */
/* Full-width media below post text; direct X.com links          */

import { CONFIG } from '../js/modules/widgets.js';

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
            container.innerHTML = '<p style="padding:20px;text-align:center;color:var(--text-dim);font-size:0.8rem;">No recent posts found.</p>';
            return;
        }

        items.slice(0, 4).forEach(item => {
            const isRetweet = item.title.startsWith('RT by');

            // Clean text
            let cleanText = item.title
                .replace(/^RT by @[a-zA-Z0-9_]+: /, '')
                .replace(/<[^>]*>/g, '')
                .trim();

            // Normalise link to twitter.com
            let twitterLink = item.link || `https://twitter.com/${USER}`;
            if (twitterLink.includes('nitter') || !/twitter\.com|x\.com/.test(twitterLink)) {
                twitterLink = twitterLink.replace(/https?:\/\/[^\/]+\//, 'https://twitter.com/');
            }
            if (!twitterLink.includes('/status/')) {
                twitterLink = `https://twitter.com/${USER}`;
            }

            // ── Media extraction ──────────────────────────────────────
            let mediaHtml = '';
            const desc = item.description || item.content || '';

            // Try video first
            const videoMatch =
                desc.match(/<video[^>]*>[\s\S]*?<source[^>]+src="([^">]+)"/i) ||
                desc.match(/<video[^>]+src="([^">]+)"/i);

            if (videoMatch && videoMatch[1]) {
                mediaHtml = `
                    <div class="x-full-media">
                        <video src="${videoMatch[1]}" autoplay loop muted playsinline></video>
                    </div>`;
            } else {
                // Try image
                const imgMatch = desc.match(/<img[^>]*src="([^">]+)"/i);
                if (imgMatch && imgMatch[1]) {
                    mediaHtml = `
                    <div class="x-full-media">
                        <img src="${imgMatch[1]}" alt="Post media" loading="lazy">
                    </div>`;
                }
            }

            // ── Build tweet element ───────────────────────────────────
            const tweetEl = document.createElement('div');
            tweetEl.className = 'x-post-container';
            tweetEl.onclick = () => window.open(twitterLink, '_blank');

            tweetEl.innerHTML = `
                <div class="x-post-header">
                    <div class="x-avatar">
                        <img src="https://unavatar.io/twitter/${USER}"
                             onerror="this.src='https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'">
                    </div>
                    <div class="x-author-info">
                        <div class="x-names">
                            <span class="x-display-name">Asad</span>
                            <span class="x-handle">@${USER}</span>
                            <span class="x-dot">·</span>
                            <span class="x-time">${timeAgo(item.pubDate)}</span>
                        </div>
                        ${isRetweet ? `
                        <div class="x-rt-label">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4.5 3.88l4.432 4.43-1.77 1.77L4.5 7.42V17h11v2H2.5V3.88zM21.5 7h-11V5h13v15.12l-4.432-4.43 1.77-1.77 2.662 2.66V7z"/>
                            </svg>
                            Retweeted
                        </div>` : ''}
                    </div>
                </div>
                <div class="x-post-body">
                    <div class="x-post-main">
                        <p class="x-post-text">${cleanText}</p>
                    </div>
                </div>
                ${mediaHtml}
            `;

            container.appendChild(tweetEl);
        });
    }

    function fetchTweets() {
        // Try local API first
        fetch('/api/twitter')
            .then(r => {
                if (!r.ok) throw new Error('No local API');
                return r.json();
            })
            .then(data => {
                if (data && data.data) {
                    const items = data.data.map(t => ({
                        title: t.text,
                        link: `https://twitter.com/${USER}/status/${t.id}`,
                        pubDate: t.created_at,
                        description: ''
                    }));
                    render(items);
                } else {
                    throw new Error('Fallback to Nitter');
                }
            })
            .catch(() => {
                // Nitter RSS fallback
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
                            if (cached) {
                                render(JSON.parse(cached));
                            } else {
                                container.innerHTML = `
                                    <div style="padding:20px;text-align:center;">
                                        <p style="color:var(--text-dim);font-size:0.8rem;margin-bottom:10px;">X feed temporarily unavailable.</p>
                                        <a href="https://twitter.com/${USER}" target="_blank"
                                           style="color:var(--cyan);text-decoration:none;font-size:0.85rem;font-weight:700;">
                                            View @${USER} on X ↗
                                        </a>
                                    </div>`;
                            }
                        }
                    });
            });
    }

    fetchTweets();
    setInterval(fetchTweets, 60000 * 30);
})();