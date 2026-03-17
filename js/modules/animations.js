/* ============================================================
   js/modules/animations.js
   Premium animations: Magnetic elements, View Transitions, SVG Trace
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

    /* ── Enhanced Magnetic Effect ── */
    function initMagnetic() {
        if (window._isMobile) return;

        const magneticElements = document.querySelectorAll('.magnetic, .social-platform-card, .proj-link-code, .proj-link-demo, .btn-primary, .btn-secondary, .nav-cta-cv');

        magneticElements.forEach(el => {
            el.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // Distance from center
                const deltaX = e.clientX - centerX;
                const deltaY = e.clientY - centerY;
                
                // Pull factor (0.2 = 20% of distance)
                const pull = 0.3;
                
                this.style.transform = `translate3d(${deltaX * pull}px, ${deltaY * pull}px, 0) scale(1.02)`;
                
                // If there's an icon inside, pull it even more for a "3D" effect
                const icon = this.querySelector('svg, .proj-icon, .spc-icon');
                if (icon) {
                    icon.style.transform = `translate3d(${deltaX * 0.1}px, ${deltaY * 0.1}px, 0)`;
                }
            });

            el.addEventListener('mouseleave', function() {
                this.style.transform = '';
                const icon = this.querySelector('svg, .proj-icon, .spc-icon');
                if (icon) icon.style.transform = '';
            });
        });
    }

    /* ── SVG Path Tracing ── */
    function initSVGTrace() {
        // Find all SVGs that should trace on reveal
        const traceSVGs = document.querySelectorAll('.proj-icon svg, .section-title svg');
        
        traceSVGs.forEach(svg => {
            const paths = svg.querySelectorAll('path, polyline, line, rect, circle');
            paths.forEach(path => {
                const length = path.getTotalLength();
                path.style.strokeDasharray = length;
                path.style.strokeDashoffset = length;
                path.style.transition = 'none';
                
                // Observer to fire animation
                const observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        path.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                        path.style.strokeDashoffset = '0';
                        observer.unobserve(svg);
                    }
                }, { threshold: 0.5 });
                observer.observe(svg);
            });
        });
    }

    /* ── Parallax Depth (Subtle) ── */
    function initParallax() {
        if (window._isMobile) return;
        
        window._scrollTasks.push(function() {
            const y = window._scrollY;
            
            // Hero parallax
            const heroBackdrop = document.querySelector('.hero-backdrop-img');
            if (heroBackdrop) {
                heroBackdrop.style.transform = `translate3d(0, ${y * 0.4}px, 0)`;
            }
            
            // Section watermark parallax (the 01, 02 numbers)
            document.querySelectorAll('section::before').forEach(watermark => {
                // Since pseudo-elements can't be styled via JS easily, we skip this or use a data-attribute trick
                // Alternative: just use regular elements for watermarks
            });
        });
    }

    // Initialize all
    window.addEventListener('DOMContentLoaded', () => {
        initMagnetic();
        initSVGTrace();
        initParallax();
        
        // Wrap existing drawer toggle in View Transition
        const oldDrawerOpen = window.openCertsDrawer;
        if (typeof oldDrawerOpen === 'function') {
            window.openCertsDrawer = () => window.smoothTransition(oldDrawerOpen);
        }
    });

})();
