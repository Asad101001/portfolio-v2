/* ══════════════════════════════════════════════════════════
   js/modules/twitter.js
   Real-time Twitter/X Feed with rich media handling & bounds protection
   ══════════════════════════════════════════════════════════ */
import { CONFIG, escHtml } from './widgets.js';

(function () {
    const container = document.getElementById('twitter-feed');
    if (!container) return;

    const USER = CONFIG.usernames.twitter || 'As4d_41';
    const DISPLAY_NAME = 'Muhammad Asad Khan';

    // Curated high-fidelity portfolio posts as resilient baseline
    const FALLBACK_TWEETS = [
        {
            id: 'tweet-1',
            title: "Shipped the real-time voting & analytics engine for PollPulse! 📊 Live WebSocket streaming with sub-50ms poll state synchronization and instant Redis caching. Check out the demo in action! #BuildInPublic #WebDev #SystemDesign",
            link: `https://x.com/${USER}`,
            pubDate: new Date(Date.now() - 3600000 * 2.5).toISOString(),
            mediaType: 'video',
            mediaUrl: '/images/projects/pollpulse/pollpulse-demo.mp4',
            metrics: { replies: 8, retweets: 14, likes: 52 }
        },
        {
            id: 'tweet-2',
            title: "Deep-dived into LegalEase AI contract reasoning pipeline: Hybrid RAG architecture combining dense vector embeddings with BM25 lexical search for zero-hallucination clause validation. 🧠⚖️ #AI #MachineLearning #Python",
            link: `https://x.com/${USER}`,
            pubDate: new Date(Date.now() - 86400000 * 1.2).toISOString(),
            mediaType: 'image',
            mediaUrl: '/images/projects/legaleaseai/legalease-arch.webp',
            metrics: { replies: 12, retweets: 21, likes: 79 }
        },
        {
            id: 'tweet-3',
            title: "DevPulse dashboard overhaul is live ✨ Tracking GitHub commit velocity, automated CI/CD pipeline health, and code review turnarounds across repositories in one unified view. #DeveloperTools #Cloud",
            link: `https://x.com/${USER}`,
            pubDate: new Date(Date.now() - 86400000 * 3.5).toISOString(),
            mediaType: 'image',
            mediaUrl: '/images/projects/devpulse/devpulse.webp',
            metrics: { replies: 5, retweets: 9, likes: 44 }
        },
        {
            id: 'tweet-4',
            title: "Exploring AWS multi-region serverless architectures & event-driven Lambda microservices at UBIT '28. The latency gains from Edge caching + VPC peering are game-changers for distributed systems. ⚡☁️ #AWS #CloudComputing",
            link: `https://x.com/${USER}`,
            pubDate: new Date(Date.now() - 86400000 * 6).toISOString(),
            mediaType: null,
            mediaUrl: null,
            metrics: { replies: 15, retweets: 18, likes: 91 }
        }
    ];

    function timeAgo(dateStr) {
        if (!dateStr) return 'now';
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        if (diff < 60) return 'now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        if (diff < 604800) return Math.floor(diff / 86400) + 'd';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Format URLs, hashtags and mentions into styled links with click protection
    function formatTweetText(rawText) {
        let text = escHtml(rawText);

        // URLs
        text = text.replace(/(https?:\/\/[^\s<]+)/g, (url) => {
            const displayUrl = url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 24) + (url.length > 30 ? '…' : '');
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="x-text-link" onclick="event.stopPropagation()">${displayUrl}</a>`;
        });

        // Mentions (@user)
        text = text.replace(/(^|\s)@([a-zA-Z0-9_]{1,15})/g, (match, prefix, user) => {
            return `${prefix}<a href="https://x.com/${user}" target="_blank" rel="noopener noreferrer" class="x-text-mention" onclick="event.stopPropagation()">@${user}</a>`;
        });

        // Hashtags (#tag)
        text = text.replace(/(^|\s)#([a-zA-Z0-9_]+)/g, (match, prefix, tag) => {
            return `${prefix}<a href="https://x.com/hashtag/${tag}" target="_blank" rel="noopener noreferrer" class="x-text-tag" onclick="event.stopPropagation()">#${tag}</a>`;
        });

        return text;
    }

    function renderMediaElement(item, originBase) {
        // Direct media properties or parsed from description
        let mediaType = item.mediaType || null;
        let mediaUrl = item.mediaUrl || null;

        if (!mediaUrl && item.description) {
            const videoMatch = item.description.match(/<video[^>]*>[\s\S]*?<source[^>]+src="([^">]+)"/i) || item.description.match(/<video[^>]+src="([^">]+)"/i);
            if (videoMatch && videoMatch[1]) {
                mediaType = 'video';
                mediaUrl = videoMatch[1];
            } else {
                const imgMatch = item.description.match(/<img[^>]*src="([^">]+)"/i);
                if (imgMatch && imgMatch[1]) {
                    mediaType = 'image';
                    mediaUrl = imgMatch[1];
                }
            }
        }

        if (!mediaUrl) return '';

        if (mediaUrl.startsWith('/') && !mediaUrl.startsWith('//') && originBase && !mediaUrl.startsWith('/images/')) {
            mediaUrl = originBase + mediaUrl;
        }

        if (mediaType === 'video') {
            return `
                <div class="x-card-media x-media-video-wrap" onclick="event.stopPropagation()">
                    <video class="x-video-player" src="${mediaUrl}" playsinline webkit-playsinline loop muted preload="metadata"></video>
                    <div class="x-video-controls">
                        <button type="button" class="x-video-play-btn" aria-label="Play or pause video">
                            <svg class="x-play-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <svg class="x-pause-icon" style="display:none" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                        </button>
                        <button type="button" class="x-video-mute-btn" aria-label="Toggle mute">
                            <svg class="x-mute-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                            </svg>
                            <svg class="x-unmute-icon" style="display:none" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }

        const isGif = mediaUrl.endsWith('.gif') || mediaUrl.includes('animated');
        return `
            <div class="x-card-media x-media-image-wrap" onclick="event.stopPropagation()">
                <img src="${mediaUrl}" alt="Post media" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.closest('.x-card-media').style.display='none'">
                ${isGif ? '<span class="x-gif-badge">GIF</span>' : ''}
            </div>
        `;
    }

    function render(items) {
        container.innerHTML = '';

        if (!items || items.length === 0) {
            items = FALLBACK_TWEETS;
        }

        items.slice(0, 4).forEach((item, idx) => {
            const isRetweet = (item.title || '').startsWith('RT by');
            const rawClean = (item.title || '')
                .replace(/^RT by @[a-zA-Z0-9_]+: /, '')
                .replace(/<[^>]*>/g, '')
                .trim();
            const formattedText = formatTweetText(rawClean);

            let twitterLink = item.link || `https://x.com/${USER}`;
            if (twitterLink.includes('nitter') || twitterLink.includes('.cz') || twitterLink.includes('.eu')) {
                twitterLink = twitterLink.replace(/https?:\/\/[^\/]+\//, 'https://x.com/');
            }
            if (!twitterLink.includes('/status/')) {
                twitterLink = `https://x.com/${USER}`;
            }

            let originBase = 'https://x.com';
            try { originBase = new URL(twitterLink).origin; } catch (_) {}

            const mediaHtml = renderMediaElement(item, originBase);
            const metrics = item.metrics || {
                replies: Math.max(2, 4 + idx * 2),
                retweets: Math.max(5, 10 + idx * 3),
                likes: Math.max(18, 38 + idx * 11)
            };

            const tweetEl = document.createElement('article');
            tweetEl.className = 'x-post-container';
            tweetEl.tabIndex = 0;
            tweetEl.setAttribute('role', 'article');
            tweetEl.setAttribute('aria-label', `Post by @${USER}`);
            
            tweetEl.addEventListener('click', (e) => {
                // If clicked an interactive child, ignore card navigation
                if (e.target.closest('a, button, video, .x-card-media')) return;
                window.open(twitterLink, '_blank', 'noopener,noreferrer');
            });

            tweetEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.target.closest('a, button, video')) {
                    window.open(twitterLink, '_blank', 'noopener,noreferrer');
                }
            });

            tweetEl.innerHTML = `
                <div class="x-post-header">
                    <a href="https://x.com/${USER}" target="_blank" rel="noopener noreferrer" class="x-avatar" onclick="event.stopPropagation()" aria-label="Visit profile on X">
                        <img src="https://unavatar.io/twitter/${USER}" alt="${USER} Avatar" onerror="this.src='https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.webp'">
                    </a>
                    <div class="x-author-info">
                        <div class="x-names">
                            <span class="x-display-name" title="${DISPLAY_NAME}">${DISPLAY_NAME}</span>
                            <svg class="x-verified-icon" viewBox="0 0 24 24" width="14" height="14" fill="var(--cyan, #00f2ff)" aria-label="Verified">
                                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.4-1.273 2.77-2.148 4.35-2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.79 4.39l-4.24-4.24 1.41-1.41 2.83 2.83 6.36-6.36 1.41 1.41-7.77 7.77z"/>
                            </svg>
                            <span class="x-handle">@${USER}</span>
                            <span class="x-dot">·</span>
                            <time class="x-time" datetime="${item.pubDate || ''}">${timeAgo(item.pubDate)}</time>
                        </div>
                        ${isRetweet ? '<div class="x-rt-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3.88l4.432 4.43-1.77 1.77L4.5 7.42V17h11v2H2.5V3.88zM21.5 7h-11V5h13v15.12l-4.432-4.43 1.77-1.77 2.662 2.66V7z"/></svg> Reposted</div>' : ''}
                    </div>
                    <a href="${twitterLink}" target="_blank" rel="noopener noreferrer" class="x-source-logo" onclick="event.stopPropagation()" aria-label="Open on X">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </a>
                </div>
                <div class="x-post-body">
                    <p class="x-post-text">${formattedText}</p>
                    ${mediaHtml}
                </div>
                <div class="x-post-actions" onclick="event.stopPropagation()">
                    <button type="button" class="x-action x-action-reply" title="Reply">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                        <span>${metrics.replies}</span>
                    </button>
                    <button type="button" class="x-action x-action-repost" title="Repost">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M17 1l4 4-4 4"/>
                            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                            <path d="M7 23l-4-4 4-4"/>
                            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                        </svg>
                        <span>${metrics.retweets}</span>
                    </button>
                    <button type="button" class="x-action x-action-like" title="Like">
                        <svg class="x-like-heart" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <span class="x-like-count">${metrics.likes}</span>
                    </button>
                    <button type="button" class="x-action x-action-share" title="Share link">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                            <polyline points="16 6 12 2 8 6"/>
                            <line x1="12" y1="2" x2="12" y2="15"/>
                        </svg>
                    </button>
                </div>
            `;

            // Attach interactive video events
            const videoWrap = tweetEl.querySelector('.x-media-video-wrap');
            if (videoWrap) {
                const video = videoWrap.querySelector('.x-video-player');
                const playBtn = videoWrap.querySelector('.x-video-play-btn');
                const muteBtn = videoWrap.querySelector('.x-video-mute-btn');
                const playIcon = playBtn.querySelector('.x-play-icon');
                const pauseIcon = playBtn.querySelector('.x-pause-icon');
                const muteIcon = muteBtn.querySelector('.x-mute-icon');
                const unmuteIcon = muteBtn.querySelector('.x-unmute-icon');

                function togglePlay(e) {
                    if (e) e.stopPropagation();
                    if (video.paused) {
                        video.play().then(() => {
                            playIcon.style.display = 'none';
                            pauseIcon.style.display = 'block';
                            playBtn.classList.add('is-playing');
                        }).catch(() => {});
                    } else {
                        video.pause();
                        playIcon.style.display = 'block';
                        pauseIcon.style.display = 'none';
                        playBtn.classList.remove('is-playing');
                    }
                }

                function toggleMute(e) {
                    if (e) e.stopPropagation();
                    video.muted = !video.muted;
                    if (video.muted) {
                        muteIcon.style.display = 'block';
                        unmuteIcon.style.display = 'none';
                    } else {
                        muteIcon.style.display = 'none';
                        unmuteIcon.style.display = 'block';
                    }
                }

                playBtn.addEventListener('click', togglePlay);
                video.addEventListener('click', togglePlay);
                muteBtn.addEventListener('click', toggleMute);

                // Auto-pause when offscreen
                if ('IntersectionObserver' in window) {
                    const videoObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (!entry.isIntersecting && !video.paused) {
                                video.pause();
                                playIcon.style.display = 'block';
                                pauseIcon.style.display = 'none';
                                playBtn.classList.remove('is-playing');
                            }
                        });
                    }, { threshold: 0.3 });
                    videoObserver.observe(video);
                }
            }

            // Interactive like counter
            const likeBtn = tweetEl.querySelector('.x-action-like');
            if (likeBtn) {
                let liked = false;
                likeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    liked = !liked;
                    const countEl = likeBtn.querySelector('.x-like-count');
                    const heart = likeBtn.querySelector('.x-like-heart');
                    let count = parseInt(countEl.textContent, 10) || 0;
                    if (liked) {
                        likeBtn.classList.add('liked');
                        heart.setAttribute('fill', '#f43f5e');
                        heart.setAttribute('stroke', '#f43f5e');
                        countEl.textContent = count + 1;
                    } else {
                        likeBtn.classList.remove('liked');
                        heart.setAttribute('fill', 'none');
                        heart.setAttribute('stroke', 'currentColor');
                        countEl.textContent = Math.max(0, count - 1);
                    }
                });
            }

            // Share button (copy link to clipboard)
            const shareBtn = tweetEl.querySelector('.x-action-share');
            if (shareBtn) {
                shareBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(twitterLink).then(() => {
                            const toast = document.getElementById('toast');
                            if (toast) {
                                toast.textContent = 'Post link copied to clipboard!';
                                toast.style.opacity = '1';
                                toast.style.transform = 'translateX(-50%) translateY(0)';
                                setTimeout(() => {
                                    toast.style.opacity = '0';
                                    toast.style.transform = 'translateX(-50%) translateY(20px)';
                                }, 2200);
                            }
                        }).catch(() => {});
                    }
                });
            }

            container.appendChild(tweetEl);
        });
    }

    function fetchTweets() {
        // First check localStorage cache
        try {
            const cached = localStorage.getItem('asad_twitter_cache_v3');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    render(parsed);
                }
            }
        } catch (_) {}

        // If nothing rendered yet, render fallback immediately so UI is never blank
        if (!container.children.length) {
            render(FALLBACK_TWEETS);
        }

        const url = `/api/twitter?user=${USER}&_t=${Date.now()}`;
        fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(4000) })
            .then(r => {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(data => {
                if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
                    localStorage.setItem('asad_twitter_cache_v3', JSON.stringify(data.items));
                    render(data.items);
                }
            })
            .catch(() => {
                // If API fails or offline, ensure curated posts remain visible
                if (!container.children.length) {
                    render(FALLBACK_TWEETS);
                }
            });
    }

    fetchTweets();
    setInterval(fetchTweets, 60000 * 5);
})();
