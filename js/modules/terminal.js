/* ══════════════════════════════════════════════════════════
   js/modules/terminal.js
   Interactive, Playful, and Feature-Rich Terminal Engine
   Supports: Autosuggestions, History, Matrix rain,
   Minigames, Theme changes, and interactive validation.
   ══════════════════════════════════════════════════════════ */
'use strict';

import { escHtml } from './widgets.js';

(function initTerminal() {
    // Wait for DOM to be ready
    window.addEventListener('DOMContentLoaded', () => {
        const terminalBody = document.getElementById('terminal-body');
        const terminalInput = document.getElementById('terminal-input');
        const terminalHistory = document.getElementById('terminal-history');
        const autosuggest = terminalBody ? terminalBody.querySelector('.t-autosuggest') : null;

        if (!terminalBody || !terminalInput || !terminalHistory) return;

        // Command history stack for ArrowUp/Down navigation
        let cmdHistory = [];
        let historyIndex = -1;
        let tempInput = '';

        // Session start time for uptime calculation
        const sessionStartTime = Date.now();

        // Game mode state
        let gameMode = false;
        let gameNumber = 0;
        let gameAttempts = 0;

        // Matrix mode active state
        let matrixActive = false;
        let matrixInterval = null;

        // Global commit cache
        let latestCommit = 'a1b2c3d feat: portfolio - latest build';
        const REPO = 'Asad101001/portfolio-v2';
        fetch(`https://api.github.com/repos/${REPO}/commits/main`, { 
            headers: { 'Accept': 'application/vnd.github.v3+json' } 
        })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (data) {
                const sha = (data.sha || '').slice(0, 7);
                const msg = (data.commit && data.commit.message ? data.commit.message : '').split('\n')[0].slice(0, 52);
                latestCommit = `${sha} ${msg}`;
            }
        }).catch(() => {});

        // List of all supported commands
        const commands = [
            'help', 'whoami', 'neofetch', 'focus', 
            'projects', 'project', 'theme', 
            'contact', 'joke', 'play', 'matrix', 'clear'
        ];

        // Focus input when clicking anywhere inside the terminal body
        terminalBody.addEventListener('click', (e) => {
            // Don't focus if selecting text or clicking on links
            if (window.getSelection().toString() || e.target.tagName === 'A') return;
            terminalInput.focus();
        });

        // Setup input changes for Zsh-style autosuggestion
        terminalInput.addEventListener('input', () => {
            const val = terminalInput.value.toLowerCase().trimStart();
            if (!val || gameMode || matrixActive) {
                if (autosuggest) autosuggest.textContent = '';
                return;
            }

            // Find matching command
            const match = commands.find(c => c.startsWith(val));
            if (match && match !== val) {
                // Display ghost suggestion (matching letters + remaining letters)
                if (autosuggest) {
                    autosuggest.textContent = terminalInput.value + match.slice(val.length);
                    autosuggest.style.display = 'block';
                }
            } else {
                if (autosuggest) autosuggest.textContent = '';
            }
        });

        // Listen for keypresses
        terminalInput.addEventListener('keydown', (e) => {
            if (matrixActive) {
                stopMatrix();
                e.preventDefault();
                return;
            }

            if (e.key === 'Enter') {
                const cmdText = terminalInput.value;
                terminalInput.value = '';
                if (autosuggest) autosuggest.textContent = '';
                handleCommand(cmdText);
            } 
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (cmdHistory.length === 0) return;
                if (historyIndex === -1) {
                    tempInput = terminalInput.value;
                    historyIndex = cmdHistory.length - 1;
                } else if (historyIndex > 0) {
                    historyIndex--;
                }
                terminalInput.value = cmdHistory[historyIndex];
                triggerInputEvent();
            } 
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex === -1) return;
                if (historyIndex < cmdHistory.length - 1) {
                    historyIndex++;
                    terminalInput.value = cmdHistory[historyIndex];
                } else {
                    historyIndex = -1;
                    terminalInput.value = tempInput;
                }
                triggerInputEvent();
            } 
            else if (e.key === 'Tab' || e.key === 'ArrowRight') {
                // If there's an active autosuggestion, complete it
                if (autosuggest && autosuggest.textContent) {
                    e.preventDefault();
                    terminalInput.value = autosuggest.textContent;
                    autosuggest.textContent = '';
                }
            }
            else if (e.key === 'Escape') {
                terminalInput.value = '';
                if (autosuggest) autosuggest.textContent = '';
            }
            else if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                clearTerminal();
            }
        });

        function triggerInputEvent() {
            terminalInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Handle a command input
        function handleCommand(cmdStr) {
            const trimmed = cmdStr.trim();
            if (!trimmed) return;

            // Save to history if different from last command
            if (cmdHistory.length === 0 || cmdHistory[cmdHistory.length - 1] !== trimmed) {
                cmdHistory.push(trimmed);
            }
            historyIndex = -1;

            // Display typed prompt & command in history
            const promptClass = gameMode ? 't-prompt-game' : 't-prompt';
            const promptText = gameMode ? `guess_game (1-50):~$` : `asad@2006:~$`;
            appendHistory(`<p class="t-line t-visible"><span class="${promptClass}">${promptText}</span> <span class="t-cmd">${escHtml(trimmed)}</span></p>`);

            if (gameMode) {
                handleGameInput(trimmed);
                return;
            }

            // Parse command & args
            const parts = trimmed.split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1);

            switch (cmd) {
                case 'help':
                    printHelp();
                    break;
                case 'whoami':
                    printWhoami();
                    break;
                case 'neofetch':
                    printNeofetch();
                    break;
                case 'focus':
                    printFocus();
                    break;
                case 'projects':
                    printProjects();
                    break;
                case 'project':
                    printProjectDetails(args);
                    break;
                case 'theme':
                    changeThemeCmd(args);
                    break;
                case 'contact':
                    printContact();
                    break;
                case 'joke':
                    printJoke();
                    break;
                case 'play':
                    startGame();
                    break;
                case 'matrix':
                    startMatrix();
                    break;
                case 'clear':
                    clearTerminal();
                    break;
                default:
                    appendHistory(`<p class="t-line t-out t-visible" style="color: #f87171;">Command not found: '${escHtml(cmd)}'. Type <span style="color:#22c55e;font-weight:bold;">help</span> for a list of available commands.</p>`);
            }

            scrollToBottom();
        }

        function appendHistory(htmlStr) {
            const temp = document.createElement('div');
            temp.innerHTML = htmlStr;
            while (temp.firstChild) {
                terminalHistory.appendChild(temp.firstChild);
            }
        }

        function scrollToBottom() {
            setTimeout(() => {
                terminalBody.scrollTop = terminalBody.scrollHeight;
            }, 10);
        }

        function clearTerminal() {
            terminalHistory.innerHTML = '';
            appendHistory(`<p class="t-line t-out t-visible" style="color: var(--cyan); opacity: 0.8;">Terminal cleared. Type 'help' for options.</p>`);
            scrollToBottom();
        }

        // --- Commands Implementation ---

        function printHelp() {
            appendHistory(`
                <div class="t-line t-out t-visible" style="line-height: 1.8;">
                    <p style="color: var(--cyan); font-weight: bold; margin-bottom: 6px;">Available Commands:</p>
                    <div style="display: grid; grid-template-columns: 100px 1fr; gap: 8px 16px; font-size: 0.76rem;">
                        <div>neofetch</div><div>Show system specifications & ASCII art logo</div>
                        <div>whoami</div><div>Details about Muhammad Asad Khan</div>
                        <div>focus</div><div>Display current skill and technology focus</div>
                        <div>projects</div><div>List portfolio projects</div>
                        <div>project &lt;n&gt;</div><div>View details & open a project (e.g. project devpulse)</div>
                        <div>theme &lt;t&gt;</div><div>Set theme (professional, sunset, cyberpunk)</div>
                        <div>contact</div><div>Print social links and email info</div>
                        <div>joke</div><div>Read a quick developer joke</div>
                        <div>play</div><div>Play the interactive Number Guessing Game</div>
                        <div>matrix</div><div>Run Matrix code rain digital rain effect</div>
                        <div>clear</div><div>Clear the terminal screen</div>
                    </div>
                </div>
            `);
        }

        function printWhoami() {
            appendHistory(`
                <div class="t-line t-out t-visible" style="line-height: 1.7;">
                    <p style="color: #fff; font-weight: 600; margin-bottom: 4px;">Muhammad Asad Khan</p>
                    <p>Computer Science student at UBIT '28. Passionate about solving real-world problems with code, exploring artificial intelligence, and building scalable cloud systems.</p>
                    <p style="margin-top: 4px; color: var(--cyan);">Focus Areas: Python &bull; Cloud (AWS) &bull; RAG &bull; Data Science &bull; Networks</p>
                </div>
            `);
        }

        function getUptimeString() {
            const diffMs = Date.now() - sessionStartTime;
            const diffSecs = Math.floor(diffMs / 1000);
            const mins = Math.floor(diffSecs / 60);
            const secs = diffSecs % 60;
            if (mins > 0) return `${mins}m ${secs}s`;
            return `${secs}s`;
        }

        function getActiveTheme() {
            if (document.body.classList.contains('theme-cyberpunk')) return 'Cyberpunk';
            if (document.body.classList.contains('theme-sunset')) return 'Sunset';
            return 'Professional';
        }

        function printNeofetch() {
            const uptime = getUptimeString();
            const theme = getActiveTheme();

            appendHistory(`
                <div class="t-line t-out t-visible neofetch-container" style="display: flex; gap: 24px; line-height: 1.5; align-items: flex-start; margin: 8px 0;">
                    <pre style="color: var(--cyan); font-family: monospace; font-size: 0.72rem; line-height: 1.15; margin: 0; pointer-events: none;">
    /\\
   /  \\
  / /\\ \\
 / /  \\ \\
/_/    \\_\\
  \\ \\/\\ \\
   \\ \\ \\ \\
    \\ \\_\\/
     \\/
                    </pre>
                    <div style="font-size: 0.75rem;">
                        <p style="color: var(--cyan); font-weight: bold; margin-bottom: 4px;">asad@portfolio-v2</p>
                        <p style="opacity: 0.5; margin-bottom: 6px;">------------------</p>
                        <p><span style="color: var(--cyan);">OS:</span> WebTerminal Linux 2.0</p>
                        <p><span style="color: var(--cyan);">Host:</span> Browser Engine (${navigator.appName})</p>
                        <p><span style="color: var(--cyan);">Uptime:</span> ${uptime}</p>
                        <p><span style="color: var(--cyan);">Shell:</span> Interactive-Term v1.1</p>
                        <p><span style="color: var(--cyan);">Theme:</span> ${theme}</p>
                        <p><span style="color: var(--cyan);">Status:</span> <span style="color:#22c55e;">🟢 Active (Internship Ready)</span></p>
                        <p style="margin-top: 4px;"><span style="color: var(--cyan);">Commit:</span> ${latestCommit.slice(0, 32)}...</p>
                    </div>
                </div>
            `);
        }

        function printFocus() {
            appendHistory(`
                <div class="t-line t-out t-visible" style="line-height: 1.7;">
                    <p style="color: var(--cyan); font-weight: bold; margin-bottom: 6px;">BUILD FOCUS & SKILLS:</p>
                    <div style="font-family: monospace; font-size: 0.75rem;">
                        <p>Python & Data Sci  <span style="color:var(--cyan);">████████████████████</span> 100%</p>
                        <p>AI & RAG Pipelines  <span style="color:var(--cyan);">██████████████████░░</span> 90%</p>
                        <p>Cloud (AWS)        <span style="color:var(--cyan);">████████████████░░░░</span> 80%</p>
                        <p>Networks & OOP     <span style="color:var(--cyan);">██████████████░░░░░░</span> 70%</p>
                    </div>
                    <p style="margin-top: 6px; font-size: 0.72rem; opacity: 0.8;">Currently building fully autonomous tools and exploring production pipelines.</p>
                </div>
            `);
        }

        function printProjects() {
            appendHistory(`
                <div class="t-line t-out t-visible" style="line-height: 1.7;">
                    <p style="color: var(--cyan); font-weight: bold; margin-bottom: 6px;">PORTFOLIO PROJECTS:</p>
                    <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; font-size: 0.76rem;">
                        <span style="color:#22c55e; font-weight:bold;">devpulse</span>  <span>Developer Activity Tracking Platform</span>
                        <span style="color:#22c55e; font-weight:bold;">mogscope</span>  <span>Medical Image Processing & Analytics</span>
                        <span style="color:#22c55e; font-weight:bold;">legalease</span> <span>AI Document Analyzer & Summarizer</span>
                        <span style="color:#22c55e; font-weight:bold;">pollpulse</span> <span>Real-time Voting & Survey Engine</span>
                    </div>
                    <p style="margin-top: 6px; font-size: 0.72rem; opacity: 0.85;">Type <span style="color:var(--cyan);">project &lt;name&gt;</span> (e.g. <span style="color:var(--cyan);">project devpulse</span>) to view details.</p>
                </div>
            `);
        }

        function printProjectDetails(args) {
            if (!args || args.length === 0) {
                appendHistory(`<p class="t-line t-out t-visible" style="color: #f87171;">Error: Please specify a project name. Usage: project [devpulse|mogscope|legalease|pollpulse]</p>`);
                return;
            }

            const pName = args[0].toLowerCase();
            let desc = '';
            let tech = '';
            let file = '';

            if (pName === 'devpulse') {
                desc = 'Developer Activity Tracking Platform. Integrates with git systems to track commits, PRs, and metrics. Predicts team exhaustion with analytics.';
                tech = 'Python, AWS, React, PostgreSQL';
                file = '/projects/devpulse.html';
            } else if (pName === 'mogscope') {
                desc = 'Medical Image Processing & Analytics system. Employs deep learning to classify scans and provides web-based dashboarding for clinicians.';
                tech = 'TensorFlow, Python, Flask, OpenCV';
                file = '/projects/mogscope.html';
            } else if (pName === 'legalease') {
                desc = 'AI Document Analyzer & Summarizer. Processes complex legal paperwork, extracts clauses, and offers conversational Q&A.';
                tech = 'LangChain, OpenAI, Python, FastAPI';
                file = '/projects/legaleaseai.html';
            } else if (pName === 'pollpulse') {
                desc = 'Real-time Voting & Survey Engine. Handles thousands of concurrent websocket sessions with charts updated in real-time.';
                tech = 'Node.js, WebSockets, Express, Chart.js';
                file = '/projects/pollpulse.html';
            } else {
                appendHistory(`<p class="t-line t-out t-visible" style="color: #f87171;">Project '${escHtml(pName)}' not found. Available: devpulse, mogscope, legalease, pollpulse.</p>`);
                return;
            }

            appendHistory(`
                <div class="t-line t-out t-visible" style="line-height: 1.7; border-left: 2px solid var(--cyan); padding-left: 10px;">
                    <p style="color: var(--cyan); font-weight: bold; text-transform: uppercase;">[${pName.toUpperCase()}]</p>
                    <p style="font-size: 0.74rem;">${desc}</p>
                    <p style="font-size: 0.72rem; color: #fff; margin-top: 4px;">Tech: ${tech}</p>
                    <p style="color:#22c55e; font-size:0.72rem; margin-top: 6px; animation: blink 1s step-end infinite;">Redirecting to project subpage...</p>
                </div>
            `);

            setTimeout(() => {
                window.open(file, '_blank');
            }, 1800);
        }

        function changeThemeCmd(args) {
            if (!args || args.length === 0) {
                appendHistory(`<p class="t-line t-out t-visible" style="color: #f87171;">Usage: theme [professional|sunset|cyberpunk|random]</p>`);
                return;
            }

            const requested = args[0].toLowerCase();
            const themes = ['professional', 'sunset', 'cyberpunk'];
            let targetTheme = '';

            if (requested === 'random') {
                targetTheme = themes[Math.floor(Math.random() * themes.length)];
            } else if (themes.includes(requested)) {
                targetTheme = requested;
            } else {
                appendHistory(`<p class="t-line t-out t-visible" style="color: #f87171;">Theme '${escHtml(requested)}' unrecognized. Available: professional, sunset, cyberpunk.</p>`);
                return;
            }

            // Apply theme
            themes.forEach(t => document.body.classList.remove(`theme-${t}`));
            document.body.classList.add(`theme-${targetTheme}`);
            localStorage.setItem('asad_portfolio_theme', targetTheme);
            window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: targetTheme } }));

            appendHistory(`<p class="t-line t-out t-visible" style="color: var(--cyan);">Theme changed successfully to: <span style="color:#fff; font-weight:bold;">${targetTheme}</span></p>`);
        }

        function printContact() {
            appendHistory(`
                <div class="t-line t-out t-visible" style="line-height: 1.7;">
                    <p style="color: var(--cyan); font-weight: bold; margin-bottom: 6px;">CONTACT INFORMATION:</p>
                    <p>📧 Email:    <a href="mailto:muhammadasadk42@gmail.com" style="color: var(--cyan); text-decoration: underline;">muhammadasadk42@gmail.com</a></p>
                    <p>🐙 GitHub:   <a href="https://github.com/Asad101001" target="_blank" style="color: var(--cyan); text-decoration: underline;">github.com/Asad101001</a></p>
                    <p>💼 LinkedIn: <a href="https://www.linkedin.com/in/muhammadasadk/" target="_blank" style="color: var(--cyan); text-decoration: underline;">linkedin.com/in/muhammadasadk/</a></p>
                    <p style="margin-top: 4px; font-size: 0.72rem; opacity: 0.85;">Click the links or type mailto in browser to reach out!</p>
                </div>
            `);
        }

        function printJoke() {
            const jokes = [
                "Why do programmers wear glasses? Because they don't C#.",
                "There are 10 types of people in the world: those who understand binary, and those who don't.",
                "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
                "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
                "What is a programmer's favorite hangout place? Foo Bar.",
                "Why did the developer go broke? Because he used up all his cache.",
                "Algorithm: Word used by programmers when they don't want to explain what they did."
            ];
            const joke = jokes[Math.floor(Math.random() * jokes.length)];
            appendHistory(`<p class="t-line t-out t-visible" style="font-style: italic; color: #e2e8f0;">"${joke}"</p>`);
        }

        // --- Guessing Game Engine ---

        function startGame() {
            gameMode = true;
            gameNumber = Math.floor(Math.random() * 50) + 1;
            gameAttempts = 0;

            appendHistory(`
                <div class="t-line t-out t-visible" style="line-height: 1.6; color:#a855f7; border-left: 2px solid #a855f7; padding-left: 10px; margin: 6px 0;">
                    <p style="font-weight: bold;">🎮 GUESSING GAME MODE ACTIVATED</p>
                    <p>I have selected a secret number between 1 and 50.</p>
                    <p>Type your guess, or type <span style="color:#f87171;font-weight:bold;">exit</span> to quit.</p>
                </div>
            `);
            terminalInput.placeholder = "Enter number (1-50)...";
        }

        function handleGameInput(input) {
            if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
                gameMode = false;
                appendHistory(`<p class="t-line t-out t-visible" style="color: var(--cyan);">Exited Game Mode. Back to terminal.</p>`);
                terminalInput.placeholder = "";
                scrollToBottom();
                return;
            }

            const guess = parseInt(input, 10);
            if (isNaN(guess) || guess < 1 || guess > 50) {
                appendHistory(`<p class="t-line t-out t-visible" style="color: #f87171;">Invalid input. Enter a number between 1 and 50, or 'exit'.</p>`);
                scrollToBottom();
                return;
            }

            gameAttempts++;

            if (guess === gameNumber) {
                appendHistory(`
                    <div class="t-line t-out t-visible" style="color: #22c55e; font-weight: bold; margin: 4px 0;">
                        🎉 CORRECT! The secret number was ${gameNumber}.
                        <p style="font-weight: normal; font-size: 0.72rem; color:#a1a1aa; margin-top:2px;">You completed the game in ${gameAttempts} attempts. Exiting Game Mode.</p>
                    </div>
                `);
                gameMode = false;
                terminalInput.placeholder = "";
            } else if (guess < gameNumber) {
                appendHistory(`<p class="t-line t-out t-visible" style="color:#a855f7;">Too low! Try again.</p>`);
            } else {
                appendHistory(`<p class="t-line t-out t-visible" style="color:#a855f7;">Too high! Try again.</p>`);
            }

            scrollToBottom();
        }

        // --- Matrix Digital Rain Engine ---

        function startMatrix() {
            if (matrixActive) return;
            matrixActive = true;

            // Hide the terminal elements temporarily
            terminalHistory.style.display = 'none';
            const inputRow = terminalBody.querySelector('.terminal-input-row');
            if (inputRow) inputRow.style.opacity = '0';

            // Create Canvas
            const canvas = document.createElement('canvas');
            canvas.id = 'terminal-matrix-canvas';
            canvas.style.position = 'absolute';
            canvas.style.inset = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = '5';
            canvas.style.background = '#000';
            terminalBody.appendChild(canvas);

            // Resize Canvas to fit container exactly
            const rect = terminalBody.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            const ctx = canvas.getContext('2d');
            const katakana = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&';
            const alphabet = katakana.split('');

            const fontSize = 10;
            const columns = canvas.width / fontSize;

            const rainDrops = [];
            for (let x = 0; x < columns; x++) {
                rainDrops[x] = 1;
            }

            const draw = () => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Use theme color if available
                const colorStr = getComputedStyle(document.body).getPropertyValue('--cyan').trim() || '#22c55e';
                ctx.fillStyle = colorStr;
                ctx.font = fontSize + 'px monospace';

                for (let i = 0; i < rainDrops.length; i++) {
                    const text = alphabet[Math.floor(Math.random() * alphabet.length)];
                    ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

                    if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                        rainDrops[i] = 0;
                    }
                    rainDrops[i]++;
                }
            };

            // Loop
            matrixInterval = setInterval(draw, 33);

            // Set placeholder message
            terminalInput.placeholder = "Press any key to exit Matrix mode...";
        }

        function stopMatrix() {
            if (!matrixActive) return;
            matrixActive = false;

            clearInterval(matrixInterval);
            const canvas = document.getElementById('terminal-matrix-canvas');
            if (canvas) canvas.remove();

            // Restore terminal layout
            terminalHistory.style.display = 'block';
            const inputRow = terminalBody.querySelector('.terminal-input-row');
            if (inputRow) inputRow.style.opacity = '1';

            terminalInput.placeholder = "";
            appendHistory(`<p class="t-line t-out t-visible" style="color: var(--cyan);">Matrix rain stopped.</p>`);
            scrollToBottom();
        }
    });
})();
