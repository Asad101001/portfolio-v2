/* ============================================================
   js/modules/animations.js
   PERFORMANCE OVERHAUL:
   - Removed duplicate rAF particle canvas (was competing with canvas.js)
   - Tilt now uses CSS custom properties + single CSS transition (no JS style writes on mousemove)
   - Parallax consolidated into app.js scroll tasks (no double writes)
   - Spotlight uses CSS vars (GPU compositing, no repaints)
   - Magnetic uses requestAnimationFrame debouncing
   ============================================================ */
'use strict';

(function() {

    /* ── View Transitions API Helper ── */
    window.smoothTransition = function(callback) {
        if (!document.startViewTransition) {
            callback();
            return;
        }
        document.startViewTransition(callback);
    };

    /* ── Enhanced Magnetic Effect (rAF debounced) ── */
    function initMagnetic() {
        if (window._isMobile) return;

        var magneticEls = document.querySelectorAll('.magnetic, .btn-primary, .btn-secondary, .nav-cta');
        magneticEls.forEach(function(el) {
            var targetX = 0, targetY = 0;
            var currentX = 0, currentY = 0;
            var animating = false;

            function lerp(a, b, t) { return a + (b - a) * t; }

            function animate() {
                currentX = lerp(currentX, targetX, 0.18);
                currentY = lerp(currentY, targetY, 0.18);
                el.style.transform = 'translate3d(' + currentX.toFixed(2) + 'px,' + currentY.toFixed(2) + 'px,0)';
                if (Math.abs(currentX - targetX) > 0.05 || Math.abs(currentY - targetY) > 0.05) {
                    requestAnimationFrame(animate);
                } else {
                    animating = false;
                }
            }

            el.addEventListener('mousemove', function(e) {
                var rect = this.getBoundingClientRect();
                var cx = rect.left + rect.width / 2;
                var cy = rect.top + rect.height / 2;
                targetX = (e.clientX - cx) * 0.25;
                targetY = (e.clientY - cy) * 0.25;
                if (!animating) { animating = true; requestAnimationFrame(animate); }
            });

            el.addEventListener('mouseleave', function() {
                targetX = 0; targetY = 0;
                if (!animating) { animating = true; requestAnimationFrame(animate); }
            });
        });
    }

    /* ── CSS-var Spotlight (zero repaints, compositor-only) ── */
    function initSpotlight() {
        if (window._isMobile) return;
        // Uses CSS --x / --y set globally by ui.js mousemove handler
        // The radial gradient in glass-card::before uses those vars
        // No per-card listener needed - vars cascade via :root
    }

    /* ── 3D Tilt: CSS custom props only, no style.transform writes ── */
    function initTilt() {
        if (window._isMobile) return;

        // Inject a shared style rule so tilt uses CSS custom properties
        var styleEl = document.createElement('style');
        styleEl.textContent = [
            '.tilt-card {',
            '  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);',
            '  will-change: transform;',
            '}',
            '.tilt-card:hover {',
            '  transform: perspective(1000px)',
            '    rotateX(var(--tilt-x, 0deg))',
            '    rotateY(var(--tilt-y, 0deg))',
            '    translateZ(10px);',
            '}'
        ].join('\n');
        document.head.appendChild(styleEl);

        var tiltCards = document.querySelectorAll('.project-card, .about-stat-card');
        tiltCards.forEach(function(card) {
            card.classList.add('tilt-card');
            var rafId = null;
            var pendingX = 0, pendingY = 0;
            var pendingShX = 0, pendingShY = 0;

            card.addEventListener('mousemove', function(e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                
                // Tilt logic
                pendingX = ((y - rect.height / 2) / rect.height * -4).toFixed(2);
                pendingY = ((x - rect.width / 2)  / rect.width  *  4).toFixed(2);
                
                // Shadow logic (simulating light from mouse)
                pendingShX = ((rect.width / 2 - x) / rect.width  * 12).toFixed(2);
                pendingShY = ((rect.height / 2 - y) / rect.height * 12).toFixed(2);

                if (!rafId) {
                    rafId = requestAnimationFrame(function() {
                        card.style.setProperty('--tilt-x', pendingX + 'deg');
                        card.style.setProperty('--tilt-y', pendingY + 'deg');
                        card.style.setProperty('--sh-x', pendingShX + 'px');
                        card.style.setProperty('--sh-y', pendingShY + 'px');
                        rafId = null;
                    });
                }
            });

            card.addEventListener('mouseleave', function() {
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
                card.style.setProperty('--tilt-x', '0deg');
                card.style.setProperty('--tilt-y', '0deg');
                card.style.setProperty('--sh-x', '0px');
                card.style.setProperty('--sh-y', '0px');
            });
        });
    }

    /* ── Consolidate Scroll Tasks ── */
    function initScrollAnimations() {
        var heroBackdropInner = document.querySelector('.hero-backdrop-inner');
        var heroContainer = document.querySelector('.hero-backdrop');
        var indicator = document.getElementById('scroll-indicator');
        var prevShrink = -1;

        window._scrollTasks.push(function() {
            var y = window._scrollY;
            var ly = window._lerpY;
            
            // Skip expensive parallax on mobile for performance
            if (window._isMobile) {
                if (indicator) indicator.classList.toggle('hidden', y > 80);
                return;
            }

            // High performance Parallax for desktop
            if (heroBackdropInner && ly < 1200) {
                heroBackdropInner.style.transform = 'translate3d(0,' + (ly * 0.32).toFixed(1) + 'px,0)';
            }

            // Smooth scale/shrink for hero
            var shrink = Math.min(ly / 900, 1);
            if (heroContainer && Math.abs(shrink - prevShrink) > 0.0015) {
                var scale = Math.max(0.88, 1 - shrink * 0.12);
                var opacity = Math.max(0, 1 - shrink * 1.15);
                
                heroContainer.style.transform = 'scale(' + scale.toFixed(3) + ') translate3d(0,0,0)';
                heroContainer.style.opacity   = opacity.toFixed(3);
                prevShrink = shrink;
            }

            if (indicator) indicator.classList.toggle('hidden', y > 150);
        });

        // Global Scroll Jank Fix: Disable heavy paints while scrolling
        var scrollTimeout;
        window.addEventListener('scroll', function() {
            if (!document.body.classList.contains('is-scrolling')) {
                document.body.classList.add('is-scrolling');
            }
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function() {
                document.body.classList.remove('is-scrolling');
            }, 150); // Increased from 100ms to 150ms for better inertia handling
        }, { passive: true });
    }

    /* ── Text Scramble Effect ── */
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 20); // Reduced delay
                const end = start + Math.floor(Math.random() * 20); // Reduced duration
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.2) { // Less frequent randomization
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="scramble-char">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    function initScrambleHeaders() {
        const headers = document.querySelectorAll('.section-title, .card-label, .hero-name');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.hasAttribute('data-scrambled')) {
                    const fx = new TextScramble(entry.target);
                    fx.setText(entry.target.innerText);
                    entry.target.setAttribute('data-scrambled', 'true');
                }
            });
        }, { threshold: 0.5 });
        headers.forEach(h => observer.observe(h));
    }

    /* ── Load Reveal ── */
    function initLoadReveal() {
        setTimeout(function() {
            document.body.classList.add('is-ready');
        }, 100);
    }

    // Initialize
    window.addEventListener('DOMContentLoaded', function() {
        initMagnetic();
        initSpotlight();
        initTilt();
        initScrollAnimations();
        initScrambleHeaders();
        initLoadReveal();
    });

})();
