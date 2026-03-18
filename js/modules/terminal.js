/* ============================================================
   js/modules/terminal.js
   Interactive terminal logic
   ============================================================ */
'use strict';

(function() {
    const input = document.getElementById('terminal-input');
    const history = document.getElementById('terminal-history');
    const terminalScreen = document.getElementById('terminal-screen');
    if (!input || !history) return;

    const commands = {
        'help': () => `Available commands: [whoami, about, projects, contact, themes, clear, ls, neofetch, sudo, date]`,
        'whoami': () => `Muhammad Asad Khan`,
        'about': () => `CS Student @ UBIT '28. Passionate about Python, AWS, and AI/ML.`,
        'projects': () => `Redirecting to projects section...`, // Logic handled below
        'contact': () => `Redirecting to contact section...`,
        'themes': () => `Rotating active theme...`,
        'ls': () => `bio.txt  projects/  skills/  contact.info`,
        'clear': () => { history.innerHTML = ''; return ''; },
        'date': () => new Date().toString(),
        'sudo': () => `Nice try. Access denied.`,
        'neofetch': () => `
<span style="color:var(--cyan)">OS:</span> AsadOS 1.0.0
<span style="color:var(--cyan)">UP:</span> 2 hours, 18 mins
<span style="color:var(--cyan)">SHELL:</span> zsh 5.9
<span style="color:var(--cyan)">THEME:</span> ${document.body.className.split('theme-')[1] || 'default'}
<span style="color:var(--cyan)">DE:</span> Fluid Glass
<span style="color:var(--cyan)">CPU:</span> Neural-Core x8
`
    };

    function addLine(text, isOutput = true) {
        const p = document.createElement('p');
        p.className = isOutput ? 't-line t-out' : 't-line';
        p.innerHTML = text;
        history.appendChild(p);
        terminalScreen.scrollTop = terminalScreen.scrollHeight;
    }

    function processCommand(cmd) {
        const cleanCmd = cmd.toLowerCase().trim();
        
        if (!cleanCmd) return;

        addLine(`<span class="t-prompt">asad@2006:~$</span> <span class="t-cmd">${cmd}</span>`, false);

        if (commands[cleanCmd]) {
            const output = commands[cleanCmd]();
            if (output) addLine(output);

            // Special actions
            if (cleanCmd === 'projects') {
                setTimeout(() => document.getElementById('projects')?.scrollIntoView({behavior:'smooth'}), 600);
            }
            if (cleanCmd === 'contact') {
                setTimeout(() => document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}), 600);
            }
            if (cleanCmd === 'themes') {
                // Find and click the theme toggle if it exists
                document.querySelector('.theme-toggle')?.click();
            }
        } else {
            addLine(`command not found: ${cleanCmd}. type 'help' for options.`);
        }
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value;
            processCommand(cmd);
            input.value = '';
        }
    });

    // Handle focus
    terminalScreen.addEventListener('click', () => input.focus());
})();
