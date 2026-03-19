'use strict';

const COMMANDS = [
    { id: 'top', label: 'Scroll to Top', icon: '🔝', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { id: 'projects', label: 'Jump to Projects', icon: '📁', action: () => scrollTo('#projects') },
    { id: 'about', label: 'Jump to About', icon: '👤', action: () => scrollTo('#about') },
    { id: 'contact', label: 'Jump to Contact', icon: '✉️', action: () => scrollTo('#contact') },
    { id: 'theme-sunset', label: 'Theme: Sunset Cyberpunk', icon: '🌆', action: () => setTheme('sunset') },
    { id: 'theme-industrial', label: 'Theme: Industrial Stark', icon: '🏗️', action: () => setTheme('industrial') },
    { id: 'theme-cycle', label: 'Toggle Light/Dark Mode', icon: '🌓', action: () => toggleTheme() },
    { id: 'resume', label: 'Download Resume', icon: '📄', action: () => window.open('./resume.pdf', '_blank') },
    { id: 'email', label: 'Email Me', icon: '📨', action: () => window.location.href = 'mailto:muhammadasadk42@gmail.com' }
];

function toggleTheme() {
    const nextBtn = document.querySelector('.theme-btn:not(.active)');
    if (nextBtn) nextBtn.click();
}

function scrollTo(selector) {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function setTheme(name) {
    const btn = document.querySelector(`.theme-btn[data-theme="${name}"]`);
    if (btn) btn.click();
}

export function initCommandPalette() {
    const overlay = document.getElementById('command-palette');
    const input = document.getElementById('cp-input');
    const results = document.getElementById('cp-results');
    
    if (!overlay || !input || !results) {
        console.warn('Command Palette elements missing');
        return;
    }

    let selectedIndex = 0;
    let filteredCommands = [...COMMANDS];

    const keyListener = (e) => {
        // Toggle on Ctrl+K or Cmd+K
        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
            e.preventDefault();
            togglePalette();
        }
        // Close on Escape
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            togglePalette();
        }
    };

    window.removeEventListener('keydown', keyListener);
    window.addEventListener('keydown', keyListener);

    overlay.onclick = (e) => {
        if (e.target === overlay) togglePalette();
    };

    function togglePalette() {
        const isActive = overlay.classList.toggle('active');
        if (isActive) {
            input.value = '';
            input.focus();
            filteredCommands = [...COMMANDS];
            selectedIndex = 0;
            renderResults();
        }
    }

    input.addEventListener('input', () => {
        const query = input.value.toLowerCase().trim();
        filteredCommands = COMMANDS.filter(c => 
            c.label.toLowerCase().includes(query)
        );
        selectedIndex = 0;
        renderResults();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % Math.max(1, filteredCommands.length);
            renderResults();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length);
            renderResults();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
                togglePalette();
            }
        }
    });

    function renderResults() {
        if (filteredCommands.length === 0) {
            results.innerHTML = '<div class="cp-item" style="opacity:0.5; cursor:default;">No results found...</div>';
            return;
        }

        results.innerHTML = filteredCommands.map((c, i) => `
            <div class="cp-item ${i === selectedIndex ? 'selected' : ''}" data-index="${i}">
                <i style="font-style: normal;">${c.icon}</i>
                <span>${c.label}</span>
            </div>
        `).join('');

        const items = results.querySelectorAll('.cp-item');
        items.forEach(item => {
            item.onmouseenter = () => {
                const idx = parseInt(item.dataset.index);
                if (!isNaN(idx)) {
                    selectedIndex = idx;
                    // Minimal re-render of styles only to avoid losing focus/scroll or being too heavy
                    items.forEach((it, j) => it.classList.toggle('selected', j === selectedIndex));
                }
            };
            item.onclick = () => {
                const idx = parseInt(item.dataset.index);
                if (filteredCommands[idx]) {
                    filteredCommands[idx].action();
                    togglePalette();
                }
            };
        });
    }
}
