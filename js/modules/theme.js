/* ============================================================
   js/modules/theme.js
   Dynamic Theme Engine — KOMIK Default + Device-Split Controls
   ============================================================ */
'use strict';

(function() {
    const themes = ['professional', 'sunset', 'cyberpunk', 'komik'];
    // komik is index 3 — default unless user has saved something else
    let currentThemeIndex = 3;

    const savedTheme = localStorage.getItem('asad_portfolio_theme');
    if (savedTheme && themes.includes(savedTheme)) {
        currentThemeIndex = themes.indexOf(savedTheme);
    }

    // Apply initial theme immediately to body (before DOM is ready)
    document.body.classList.add(`theme-${themes[currentThemeIndex]}`);

    function rotateTheme() {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        const nextTheme = themes[currentThemeIndex];

        // Use View Transition API for buttery smooth fade if available
        if (document.startViewTransition) {
            document.body.classList.add('theme-transitioning');
            const transition = document.startViewTransition(() => {
                applyTheme(nextTheme);
            });
            transition.finished.finally(() => {
                document.body.classList.remove('theme-transitioning');
            });
        } else {
            applyTheme(nextTheme);
        }

        localStorage.setItem('asad_portfolio_theme', nextTheme);
    }

    // Theme → hero background image map
    const HERO_BG_MAP = {
        sunset:       '/images/backgrounds/sunset_bg.webp',
        cyberpunk:    '/images/backgrounds/hero-bg.webp',
        professional: '/images/backgrounds/industrial_bg.webp',
        komik:        '/images/backgrounds/industrial_bg.webp',
    };

    function setHeroBg(theme) {
        const img = document.getElementById('hero-bg-img');
        if (!img) return;
        const src = HERO_BG_MAP[theme] || HERO_BG_MAP.sunset;
        if (!img.src.endsWith(src.replace(/^\//, ''))) {
            img.style.transition = 'opacity 0.4s ease';
            img.style.opacity = '0';
            const restore = () => { img.style.opacity = ''; img.removeEventListener('load', restore); };
            img.addEventListener('load', restore);
            img.src = src;
        }
    }

    function applyTheme(theme) {
        themes.forEach(t => {
            document.body.classList.remove(`theme-${t}`);
        });
        document.body.classList.add(`theme-${theme}`);
        setHeroBg(theme);
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme } }));
    }

    const isMobile = () => window.innerWidth <= 768;

    function initToggle() {
        // ── Desktop: navbar brand / .theme-trigger clicks ──
        const desktopTriggers = document.querySelectorAll('.theme-trigger');
        desktopTriggers.forEach(el => {
            el.style.cursor = 'pointer';
            el.onclick = null;
            el.addEventListener('click', (e) => {
                // Only fire on desktop
                if (!isMobile()) {
                    e.preventDefault();
                    rotateTheme();
                }
            });
        });

        // ── Mobile: tap on hero name triggers theme rotation ──
        const heroName = document.querySelector('.hero-name, .hero-name-wrap, [class*="hero-name"]');
        if (heroName) {
            heroName.style.cursor = 'pointer';
            heroName.setAttribute('title', 'Tap to switch theme');
            heroName.addEventListener('click', (e) => {
                if (isMobile()) {
                    e.preventDefault();
                    rotateTheme();
                    // Flash ring feedback for touch
                    heroName.classList.add('komik-theme-tap');
                    setTimeout(() => heroName.classList.remove('komik-theme-tap'), 500);
                }
            });
        }

        // .mobile-theme-trigger (if any) fires only on mobile
        const mobileTriggers = document.querySelectorAll('.mobile-theme-trigger');
        mobileTriggers.forEach(el => {
            el.style.cursor = 'pointer';
            el.onclick = null;
            el.addEventListener('click', (e) => {
                if (isMobile()) {
                    e.preventDefault();
                    rotateTheme();
                }
            });
        });
    }

    window.addEventListener('DOMContentLoaded', () => {
        initToggle();
        setHeroBg(themes[currentThemeIndex]);
    });

    window.addEventListener('componentsLoaded', initToggle);
})();
