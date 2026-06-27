/* ============================================================
   js/modules/theme.js
   Dynamic Theme Engine — Navbar Integrated Version
   ============================================================ */
'use strict';

(function() {
    const themes = ['professional', 'sunset', 'cyberpunk'];
    let currentThemeIndex = 0;

    // Default to professional, but load from saved if available
    currentThemeIndex = 0;
    const savedTheme = localStorage.getItem('asad_portfolio_theme');
    if (savedTheme && themes.includes(savedTheme)) {
        currentThemeIndex = themes.indexOf(savedTheme);
    }
    
    // Apply initial theme immediately to body
    if (currentThemeIndex !== -1) {
        document.body.classList.add(`theme-${themes[currentThemeIndex]}`);
    }

    function rotateTheme() {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        const nextTheme = themes[currentThemeIndex];
        
        // Use View Transition if available for a smooth fade
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
        
        // Save choice
        localStorage.setItem('asad_portfolio_theme', nextTheme);
    }

    // Theme → hero background image map
    const HERO_BG_MAP = {
        sunset:       '/images/backgrounds/sunset_bg.webp',
        cyberpunk:    '/images/backgrounds/hero-bg.webp',
        professional: '/images/backgrounds/industrial_bg.webp',
    };

    function setHeroBg(theme) {
        const img = document.getElementById('hero-bg-img');
        if (!img) return;
        const src = HERO_BG_MAP[theme] || HERO_BG_MAP.sunset;
        // Only swap if different (avoid reload on same theme)
        if (!img.src.endsWith(src.replace(/^\//, ''))) {
            img.style.transition = 'opacity 0.4s ease';
            img.style.opacity = '0';
            const restore = () => { img.style.opacity = ''; img.removeEventListener('load', restore); };
            img.addEventListener('load', restore);
            img.src = src;
        }
    }

    function applyTheme(theme) {
        // Remove all theme classes
        themes.forEach(t => {
            if (t !== 'default') document.body.classList.remove(`theme-${t}`);
        });

        // Add new one if not default
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
        }

        // Swap hero background image src (replaces old CSS variable approach)
        setHeroBg(theme);

        // Dispatch event for other components to react
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme } }));
    }

    function initToggle() {
        const triggers = document.querySelectorAll('.theme-trigger, .mobile-theme-trigger');
        
        if (triggers.length === 0) {
            console.warn('[Theme] No .theme-trigger elements found in DOM.');
            return;
        }

        triggers.forEach(el => {
            el.style.cursor = 'pointer';
            el.onclick = null; 
            el.addEventListener('click', (e) => {
                e.preventDefault();
                rotateTheme();
            });
        });
    }

    // Re-run init when components are likely loaded
    window.addEventListener('DOMContentLoaded', () => {
        initToggle();
        // Sync hero img src to saved theme on initial load
        setHeroBg(themes[currentThemeIndex]);
    });
    
    // Also listen for a custom event if using a component loader
    window.addEventListener('componentsLoaded', initToggle);
})();
