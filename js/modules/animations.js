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
            '  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);',
            '}',
            '.tilt-card:hover {',
            '  transform: perspective(1000px)',
            '    rotateX(var(--tilt-x, 0deg))',
            '    rotateY(var(--tilt-y, 0deg))',
            '    translateZ(8px);',
            '}'
        ].join('\n');
        document.head.appendChild(styleEl);

        var tiltCards = document.querySelectorAll('.project-card, .about-stat-card');
        tiltCards.forEach(function(card) {
            card.classList.add('tilt-card');
            var rafId = null;
            var pendingX = 0, pendingY = 0;

            card.addEventListener('mousemove', function(e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                pendingX = ((y - rect.height / 2) / rect.height * -4).toFixed(2);
                pendingY = ((x - rect.width / 2)  / rect.width  *  4).toFixed(2);
                if (!rafId) {
                    rafId = requestAnimationFrame(function() {
                        card.style.setProperty('--tilt-x', pendingX + 'deg');
                        card.style.setProperty('--tilt-y', pendingY + 'deg');
                        rafId = null;
                    });
                }
            });

            card.addEventListener('mouseleave', function() {
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
                card.style.setProperty('--tilt-x', '0deg');
                card.style.setProperty('--tilt-y', '0deg');
            });
        });
    }

    /* ── Scroll Progress + Parallax (registered into master rAF loop) ── */
    function initParallax() {
        var progressBar = document.querySelector('.scroll-progress');
        var heroBackdropInner = document.querySelector('.hero-backdrop-inner');
        var heroContainer = document.querySelector('.hero-backdrop');
        var indicator = document.getElementById('scroll-indicator');
        var prevProgress = -1;
        var prevShrink = -1;

        window._scrollTasks.push(function() {
            var y = window._scrollY;
            var ly = window._lerpY;
            var docH = window._docH || 1;
            var progress = (y / docH) * 100;

            // Only write if changed meaningfully (avoids unnecessary paint)
            if (progressBar && Math.abs(progress - prevProgress) > 0.3) {
                progressBar.style.width = progress.toFixed(1) + '%';
                prevProgress = progress;
            }

            if (window._isMobile) return;

            if (heroBackdropInner) {
                heroBackdropInner.style.transform = 'translate3d(0,' + (ly * 0.3).toFixed(1) + 'px,0)';
            }

            var shrink = Math.min(ly / 800, 1);
            if (heroContainer && Math.abs(shrink - prevShrink) > 0.002) {
                var scale = Math.max(0.88, 1 - shrink * 0.12);
                var opacity = Math.max(0, 1 - shrink * 1.0);
                var radius = Math.min(20, shrink * 20);
                // Use CSS vars to avoid forcing style recalc
                heroContainer.style.transform = 'scale(' + scale.toFixed(3) + ')';
                heroContainer.style.opacity   = opacity.toFixed(3);
                heroContainer.style.borderRadius = radius.toFixed(1) + 'px';
                prevShrink = shrink;
            }

            if (indicator) indicator.classList.toggle('hidden', y > 120);
        });
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
        initParallax();
        initLoadReveal();
    });

})();
