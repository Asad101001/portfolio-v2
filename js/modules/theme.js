/* ============================================================
   js/modules/theme.js
   Dynamic Theme Engine
   ============================================================ */
'use strict';

(function() {
    const themes = ['sunset', 'industrial', 'emerald'];
    let currentThemeIndex = 0;

    // Load saved theme
    const savedTheme = localStorage.getItem('asad_portfolio_theme');
    if (savedTheme && themes.includes(savedTheme)) {
        currentThemeIndex = themes.indexOf(savedTheme);
    } else {
        // Default to sunset if no saved preference
        currentThemeIndex = 0;
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
            document.startViewTransition(() => {
                applyTheme(nextTheme);
            });
        } else {
            applyTheme(nextTheme);
        }
        
        // Save choice
        localStorage.setItem('asad_portfolio_theme', nextTheme);
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
        
        // Optional: Dispatch event for other components to react
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme } }));
    }

    // Create Toggle Button
    function initToggle() {
        const btn = document.createElement('button');
        btn.className = 'theme-toggle magnetic'; // Magnetic from animations.js
        btn.setAttribute('aria-label', 'Toggle Theme');
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
            </svg>
        `;

        btn.addEventListener('click', rotateTheme);
        document.body.appendChild(btn);

        // Scroll Behavior: Hide on scroll down, show on up
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            if (window.scrollY > lastScrollY && window.scrollY > 200) {
                btn.classList.add('toggle-hidden');
            } else {
                btn.classList.remove('toggle-hidden');
            }
            lastScrollY = window.scrollY;
        }, { passive: true });
    }

    window.addEventListener('DOMContentLoaded', initToggle);
})();
