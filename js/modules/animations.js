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

    /* ── Spotlight Effect ── */
    function initSpotlight() {
        if (window._isMobile) return;
        const cards = document.querySelectorAll('.glass-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);
            });
        });
    }

    /* ── 3D Tilt Effect ── */
    function initTilt() {
        if (window._isMobile) return;
        const tiltCards = document.querySelectorAll('.project-card, .about-stat-card, .social-platform-card, .hero-main, .hero-side');
        
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Max tilt 5 degrees
                const rotateX = ((y - centerY) / centerY) * -3;
                const rotateY = ((x - centerX) / centerX) * 3;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px) translateZ(10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ── Spotlight Effect ── */
    function initSpotlight() {
        if (window._isMobile) return;
        const cards = document.querySelectorAll('.glass-card, .social-platform-card, .project-card, .about-stat-card, .social-platform-row');
        cards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);
            });
        });
    }

    /* ── Parallax Depth & Scroll Progress ── */
    function initParallax() {
        const progressBar = document.querySelector('.scroll-progress');
        
        window._scrollTasks.push(function() {
            const y = window._scrollY;
            const ly = window._lerpY || y; // Smooth value
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (y / Math.max(1, scrollHeight)) * 100;
            
            if (progressBar) progressBar.style.width = `${progress}%`;
            
            if (window._isMobile) return;
            
            // Hero parallax and zoom
            const heroBackdrop = document.querySelector('.hero-backdrop-inner');
            const heroBackdropContainer = document.querySelector('.hero-backdrop');
            
            if (heroBackdrop) {
                // Parallax shift using smooth lerp
                heroBackdrop.style.transform = `translate3d(0, ${ly * 0.35}px, 0)`;
            }
            if (heroBackdropContainer) {
                // Subtle zoom-out as you scroll
                const shrink = (ly / 800);
                const scale = Math.max(0.85, 1 - shrink * 0.15);
                const opacity = Math.max(0, 1 - shrink * 1.1);
                const radius = Math.min(24, shrink * 24);
                
                heroBackdropContainer.style.transform = `scale(${scale})`;
                heroBackdropContainer.style.opacity = opacity;
                heroBackdropContainer.style.borderRadius = `${radius}px`;
            }
        });
    }

    /* ── Smooth Load Reveal ── */
    function initLoadReveal() {
        // Triggered when loader finishes
        setTimeout(() => {
            document.body.classList.add('is-ready');
        }, 100);
    }

    /* ── Subtle Particle System ── */
    function initParticles() {
        const canvas = document.createElement('canvas');
        canvas.id = 'theme-particles';
        canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0.25;';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        let w, h;
        let activeColor = '#10B981';

        function updateColor() {
            activeColor = getComputedStyle(document.body).getPropertyValue('--cyan').trim() || '#10B981';
        }

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            updateColor();
        }

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.35;
                this.vy = (Math.random() - 0.5) * 0.35;
                this.size = Math.random() * 1.5 + 0.5;
                this.alpha = Math.random() * 0.4 + 0.1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
            }
            draw() {
                ctx.fillStyle = activeColor;
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function init() {
            resize();
            particles = Array.from({ length: 45 }, () => new Particle());
            window.addEventListener('themechanged', updateColor);
        }

        function loop() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(loop);
        }

        window.addEventListener('resize', resize);
        init();
        loop();
    }

    // Initialize all
    window.addEventListener('DOMContentLoaded', () => {
        initMagnetic();
        initSVGTrace();
        initParallax();
        initParticles();
        initSpotlight();
        initTilt();
        initLoadReveal();
        
        // Wrap existing drawer toggle in View Transition
        const oldDrawerOpen = window.openCertsDrawer;
        if (typeof oldDrawerOpen === 'function') {
            window.openCertsDrawer = () => window.smoothTransition(oldDrawerOpen);
        }
    });

})();
