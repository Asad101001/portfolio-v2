/**
 * js/modules/gsap-animations.js  — v2 (conflict-free, performance-first)
 *
 * KEY FIXES:
 *  1. Strips .reveal CSS opacity:0 BEFORE GSAP runs (prevents invisible-element bug)
 *  2. GSAP owns all animation — IntersectionObserver in ui.js is left to only handle .section-in
 *  3. No competing fizz/shooting-star writers — just smooth compositor-only tweens
 *  4. Mobile: zero expensive effects, only opacity + translateY
 *  5. Scroll progress bar is the only rAF outside GSAP (minimal)
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Global optimizations for smoothness
gsap.defaults({
  force3D: true,
  ease: 'power3.out'
});
ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
const isMobile = () => window._isMobile || window.innerWidth < 768;

/* ─── Strip CSS reveal opacity so GSAP takes full control ──────── */
function disableCSSReveal() {
  // Inject a rule that resets .reveal opacity so GSAP starts clean
  const s = document.createElement('style');
  s.id = 'gsap-reveal-reset';
  s.textContent = '.reveal { opacity: 1; transform: none; transition: none; }';
  document.head.appendChild(s);
}

/* ─── Hero Entrance ─────────────────────────────────────────────── */
function heroEntrance() {
  // Guard — elements must exist
  if (!document.querySelector('.hero-name')) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out', force3D: true } });

  tl.from('.hero-backdrop-inner', { opacity: 0, scale: 1.06, duration: 1.2 })
    .from('.status-pill',         { opacity: 0, y: -14, duration: 0.45, ease: 'back.out(2)' }, '-=0.85')
    .from('.hero-name',           { opacity: 0, y: 36, duration: 0.7, skewY: 1.5 }, '-=0.35')
    .from('.typewriter-wrap',     { opacity: 0, y: 12, duration: 0.4 }, '-=0.3')
    .from(['.hero-sub', '.hero-desc'], { opacity: 0, y: 18, stagger: 0.1, duration: 0.45, clearProps: 'all' }, '-=0.25')
    .from('.hero-actions > *',    { opacity: 0, scale: 0.9, y: 12, stagger: 0.08, duration: 0.45, ease: 'back.out(2)', clearProps: 'all' }, '-=0.2');

  if (!isMobile()) {
    tl.from('.hero-side',         { opacity: 0, x: 40, duration: 0.7, clearProps: 'all' }, 0.5)
      .from('.hero-grid .glass-card:nth-child(n+3)', { opacity: 0, y: 28, stagger: 0.09, duration: 0.6, clearProps: 'all' }, 0.8);
  } else {
    tl.from('.hero-side', { opacity: 0, y: 24, duration: 0.6, clearProps: 'all' }, 0.6);
  }
}

/* ─── Floating Orbs (desktop only, GPU-only props) ──────────────── */
function floatingOrbs() {
  if (isMobile()) return;
  document.querySelectorAll('.hero-orb').forEach((orb, i) => {
    gsap.to(orb, {
      x: gsap.utils.random(-35, 35),
      y: gsap.utils.random(-25, 25),
      duration: gsap.utils.random(7, 12),
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 1.8,
      force3D: true
    });
  });
}

/* ─── Scroll Reveals (replaces IO `.visible` for .reveal elements) ─ */
function scrollReveals() {
  // Bypassing massive DOM query / ScrollTrigger setup on mobile
  if (isMobile()) return;

  // Project cards
  const projectCards = document.querySelectorAll('.project-card');
  if (projectCards.length) {
    gsap.from(projectCards, {
      opacity: 0,
      y: isMobile() ? 24 : 40,
      scale: 0.97,
      stagger: 0.07,
      duration: 0.65,
      ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: {
        trigger: projectCards[0].closest('section') || projectCards[0].parentElement,
        start: 'top 85%',
        once: true,
      },
    });
  }

  // Section titles
  document.querySelectorAll('.section-title').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 22,
      duration: 0.6,
      ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Tech / arsenal items
  const techItems = document.querySelectorAll('.acard, .tech-item, .skill-tag');
  if (techItems.length) {
    gsap.from(techItems, {
      opacity: 0,
      scale: 0.85,
      stagger: isMobile() ? 0.02 : 0.03,
      duration: 0.38,
      ease: 'back.out(1.4)',
      clearProps: 'all',
      force3D: true,
      scrollTrigger: {
        trigger: techItems[0].closest('section') || techItems[0].parentElement,
        start: 'top 82%',
        once: true,
      },
    });
  }

  // Experience / job cards
  const expItems = document.querySelectorAll('.job-card, .exp-item, .timeline-item');
  if (expItems.length) {
    gsap.from(expItems, {
      opacity: 0,
      x: isMobile() ? 0 : -28,
      y: isMobile() ? 18 : 0,
      stagger: 0.1,
      duration: 0.55,
      ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: {
        trigger: expItems[0].closest('section') || expItems[0].parentElement,
        start: 'top 82%',
        once: true,
      },
    });
  }

  // About stat cards
  const statCards = document.querySelectorAll('.about-stat-card');
  if (statCards.length) {
    gsap.from(statCards, {
      opacity: 0,
      y: 20,
      stagger: 0.08,
      duration: 0.5,
      ease: 'back.out(1.5)',
      clearProps: 'all',
      scrollTrigger: {
        trigger: statCards[0].closest('section') || statCards[0].parentElement,
        start: 'top 85%',
        once: true,
      },
    });
  }

  // Education / cert cards
  const eduCards = document.querySelectorAll('.edu-card, .cert-card');
  if (eduCards.length) {
    gsap.from(eduCards, {
      opacity: 0,
      y: 24,
      stagger: 0.09,
      duration: 0.55,
      ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: {
        trigger: eduCards[0].closest('section') || eduCards[0].parentElement,
        start: 'top 85%',
        once: true,
      },
    });
  }

  // Social cards
  const socialCards = document.querySelectorAll('.social-platform-card, .social-card');
  if (socialCards.length) {
    gsap.from(socialCards, {
      opacity: 0,
      y: 20,
      stagger: 0.06,
      duration: 0.5,
      ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: {
        trigger: socialCards[0].closest('section') || socialCards[0].parentElement,
        start: 'top 85%',
        once: true,
      },
    });
  }
}

/* ─── Subtle Mouse Parallax on Hero Cards (desktop only) ─────────── */
function heroParallax() {
  if (isMobile()) return;
  const hero = document.getElementById('hero');
  const cards = document.querySelectorAll('.hero-grid .glass-card');
  if (!hero || !cards.length) return;

  // Use gsap.quickTo for maximum performance on high-frequency events like mousemove
  const xSetters = Array.from(cards).map(c => gsap.quickTo(c, "x", { duration: 0.9, ease: "power2.out" }));
  const ySetters = Array.from(cards).map(c => gsap.quickTo(c, "y", { duration: 0.9, ease: "power2.out" }));

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const mx = (e.clientX - r.left - r.width  / 2) / r.width;
    const my = (e.clientY - r.top  - r.height / 2) / r.height;
    
    cards.forEach((_, i) => {
      xSetters[i](mx * (3 + i * 1.2));
      ySetters[i](my * (2.5 + i));
    });
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    cards.forEach((_, i) => {
      xSetters[i](0);
      ySetters[i](0);
    });
  });
}

/* ─── Focus Item Hover Nudge ─────────────────────────────────────── */
function focusItemHover() {
  document.querySelectorAll('.focus-item').forEach(item => {
    item.addEventListener('mouseenter', () => gsap.to(item, { x: 5, duration: 0.18, ease: 'power2.out' }));
    item.addEventListener('mouseleave', () => gsap.to(item, { x: 0, duration: 0.3, ease: 'power3.out' }));
  });
}

/* ─── Experience Toggle Breathing ───────────────────────────────── */
function experienceToggle() {
  const btn = document.getElementById('experience-toggle');
  if (!btn) return;

  let breathing = gsap.to(btn, {
    scale: 1.012,
    duration: 2.2,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  });

  btn.addEventListener('mouseenter', () => {
    breathing.pause();
    gsap.to(btn, { scale: 1.03, duration: 0.18, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      scale: 1,
      duration: 0.45,
      ease: 'elastic.out(1, 0.45)',
      onComplete: () => breathing.resume(),
    });
  });
}

/* ─── Scroll Progress Bar ────────────────────────────────────────── */
function scrollProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'gsap-scroll-bar';
  bar.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'height:2px', 'width:0%',
    'background:linear-gradient(90deg,var(--cyan,#10b981),#a855f7)',
    'z-index:9999', 'pointer-events:none',
    'box-shadow:0 0 6px var(--cyan,#10b981)',
    'will-change:width',
  ].join(';');
  document.body.appendChild(bar);

  // Lightweight RAF-based scroll tracker (not GSAP scrub — cheaper)
  let ticking = false;
  const update = () => {
    const pct = Math.min(window.scrollY / window._docH * 100, 100);
    bar.style.width = pct.toFixed(1) + '%';
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
}

/* ─── Footer Blocks Spring ───────────────────────────────────────── */
function footerBlocks() {
  const blocks = document.querySelectorAll('#footer-blocks .block');
  if (!blocks.length) return;
  gsap.from(blocks, {
    scaleY: 0,
    transformOrigin: 'bottom',
    stagger: 0.1,
    duration: 0.45,
    ease: 'back.out(2)',
    scrollTrigger: { trigger: '#footer-blocks', start: 'top 90%', once: true },
  });
}

/* ─── Boot ───────────────────────────────────────────────────────── */
function boot() {
  // Critical for above-the-fold
  disableCSSReveal();
  heroEntrance();
  floatingOrbs();

  // Defer below-the-fold scroll triggers to avoid large layout thrashing in one task
  setTimeout(() => {
    scrollReveals();
    heroParallax();
  }, 100);

  setTimeout(() => {
    focusItemHover();
    experienceToggle();
    scrollProgressBar();
    footerBlocks();
    ScrollTrigger.refresh();
  }, 250);
}

// Wait for DOM + a small delay so the loading screen is gone
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 100));
} else {
  setTimeout(boot, 100);
}
