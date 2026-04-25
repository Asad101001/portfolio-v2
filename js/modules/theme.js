/* ============================================================
   js/modules/theme.js
   Dynamic Theme Engine — Navbar Integrated Version
   ============================================================ */
'use strict';

(function() {
    const themes = ['professional', 'sunset', 'cyberpunk'];
    let currentThemeIndex = 0;

    // Load saved theme
    const savedTheme = localStorage.getItem('asad_portfolio_theme');
    if (savedTheme && themes.includes(savedTheme)) {
        currentThemeIndex = themes.indexOf(savedTheme);
    } else {
        // Default to professional if no saved preference
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
        
        // Dispatch event for other components to react
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme } }));
    }

    // Initialize Toggles found in the Navbar (Branding Text)
    function initToggle() {
        const triggers = document.querySelectorAll('.theme-trigger');
        
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
    window.addEventListener('DOMContentLoaded', initToggle);
    
    // Also listen for a custom event if using a component loader
    window.addEventListener('componentsLoaded', initToggle);
})();
