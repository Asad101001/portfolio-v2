/**
 * js/modules/gsap-animations.js
 * GSAP-powered animations — hero entrance, scroll-triggered reveals,
 * section stagger, floating orbs, and smooth micro-interactions.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── Utility ───────────────────────────────────────── */
const q = (sel, ctx = document) => ctx.querySelector(sel);
const qa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Hero Entrance Sequence ────────────────────────── */
function initHeroEntrance() {
  const tl = gsap.timeline({ delay: 0.35 });

  // Backdrop fades in from dark + slight scale
  tl.from('.hero-backdrop', {
    opacity: 0,
    scale: 1.04,
    duration: 1.4,
    ease: 'power3.out',
  });

  // Status pill drops in
  tl.from('.status-pill', {
    opacity: 0,
    y: -16,
    duration: 0.5,
    ease: 'back.out(2)',
  }, '-=0.9');

  // Name slams up
  tl.from('.hero-name', {
    opacity: 0,
    y: 40,
    duration: 0.75,
    ease: 'power4.out',
    skewY: 2,
  }, '-=0.4');

  // Typewriter area fades
  tl.from('.typewriter-wrap', {
    opacity: 0,
    y: 16,
    duration: 0.45,
    ease: 'power2.out',
  }, '-=0.35');

  // Sub + desc
  tl.from(['.hero-sub', '.hero-desc'], {
    opacity: 0,
    y: 20,
    stagger: 0.12,
    duration: 0.5,
    ease: 'power2.out',
  }, '-=0.25');

  // Action buttons pop in with spring
  tl.from('.hero-actions .btn-primary, .hero-actions .btn-linkedin, .hero-actions .btn-secondary', {
    opacity: 0,
    scale: 0.88,
    y: 14,
    stagger: 0.09,
    duration: 0.5,
    ease: 'back.out(2.2)',
  }, '-=0.2');

  // Side terminal slides in from right
  tl.from('.hero-side', {
    opacity: 0,
    x: 50,
    duration: 0.75,
    ease: 'power3.out',
  }, '-=0.75');

  // Bottom cards stagger up
  tl.from('.hero-grid .glass-card:nth-child(n+3)', {
    opacity: 0,
    y: 32,
    stagger: 0.1,
    duration: 0.6,
    ease: 'power3.out',
  }, '-=0.5');
}

/* ── Floating Orb Animation ────────────────────────── */
function initFloatingOrbs() {
  const orbs = qa('.hero-orb');
  orbs.forEach((orb, i) => {
    // Random drift path using gsap.to with yoyo
    gsap.to(orb, {
      x: gsap.utils.random(-40, 40),
      y: gsap.utils.random(-30, 30),
      duration: gsap.utils.random(6, 10),
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 1.4,
    });
    // Slow pulse
    gsap.to(orb, {
      opacity: gsap.utils.random(0.35, 0.65),
      scale: gsap.utils.random(0.9, 1.15),
      duration: gsap.utils.random(3, 5),
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 0.8,
    });
  });
}

/* ── Scroll-Triggered Section Reveals ─────────────── */
function initScrollReveals() {
  // Generic reveal for .reveal elements
  qa('.reveal').forEach(el => {
    const delay = parseFloat(el.style.getPropertyValue('--delay') || '0') / 1000;
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.75,
      ease: 'power3.out',
      delay,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
        once: true,
      },
    });
  });

  // Section titles with a wipe-up
  qa('.section-title').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true,
      },
    });
  });

  // Project cards stagger
  const projectCards = qa('.project-card');
  if (projectCards.length) {
    gsap.from(projectCards, {
      opacity: 0,
      y: 48,
      scale: 0.96,
      stagger: 0.08,
      duration: 0.65,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: projectCards[0].closest('section') || projectCards[0].parentElement,
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true,
      },
    });
  }

  // Tech stack items stagger in
  const techItems = qa('.arsenal-item, .tech-item, .skill-tag');
  if (techItems.length) {
    gsap.from(techItems, {
      opacity: 0,
      scale: 0.8,
      stagger: 0.03,
      duration: 0.4,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: techItems[0].closest('section') || techItems[0].parentElement,
        start: 'top 82%',
        toggleActions: 'play none none none',
        once: true,
      },
    });
  }

  // Experience / timeline items
  const expItems = qa('.job-card, .exp-item, .timeline-item');
  if (expItems.length) {
    gsap.from(expItems, {
      opacity: 0,
      x: -32,
      stagger: 0.12,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: expItems[0].closest('section') || expItems[0].parentElement,
        start: 'top 82%',
        toggleActions: 'play none none none',
        once: true,
      },
    });
  }
}

/* ── Cursor-Following Spotlight on Hero ────────────── */
function initHeroSpotlight() {
  if (window._isMobile) return;
  const hero = q('#hero');
  if (!hero) return;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;

    gsap.to('.hero-backdrop-overlay', {
      '--spotlight-x': x + '%',
      '--spotlight-y': y + '%',
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  });
}

/* ── Subtle Parallax on Hero Grid Cards ────────────── */
function initHeroParallax() {
  if (window._isMobile) return;
  const cards = qa('.hero-grid .glass-card');
  if (!cards.length) return;

  const hero = q('#hero');
  hero?.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const mx = (e.clientX - rect.left - rect.width  / 2) / rect.width;
    const my = (e.clientY - rect.top  - rect.height / 2) / rect.height;

    gsap.to(cards, {
      x: i => mx * (4 + i * 1.5),
      y: i => my * (3 + i * 1.2),
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  });

  hero?.addEventListener('mouseleave', () => {
    gsap.to(cards, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' });
  });
}

/* ── Focus Items: Hover Slide-In Bar ──────────────── */
function initFocusItemAnimations() {
  qa('.focus-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, { x: 6, duration: 0.2, ease: 'power2.out' });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item, { x: 0, duration: 0.3, ease: 'power3.out' });
    });
  });
}

/* ── Experience Toggle: Tape Attention Jiggle ──────── */
function initExperienceToggle() {
  const btn = q('#experience-toggle');
  if (!btn) return;

  // Subtle idle breathing so it draws attention
  gsap.to(btn, {
    scale: 1.015,
    duration: 2.4,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  });

  btn.addEventListener('mouseenter', () => {
    gsap.killTweensOf(btn, 'scale');
    gsap.to(btn, { scale: 1.04, duration: 0.2, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      scale: 1,
      duration: 0.4,
      ease: 'elastic.out(1, 0.5)',
      onComplete: () => {
        // Resume subtle breathing
        gsap.to(btn, {
          scale: 1.015,
          duration: 2.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      },
    });
  });
}

/* ── Scroll Progress Indicator ─────────────────────── */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'gsap-scroll-bar';
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 2px; width: 0%;
    background: linear-gradient(90deg, var(--cyan, #10b981), #a855f7);
    z-index: 9999; pointer-events: none;
    box-shadow: 0 0 8px var(--cyan, #10b981);
    transition: opacity 0.3s;
  `;
  document.body.appendChild(bar);

  gsap.to(bar, {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
      start: 0,
      end: 'max',
      scrub: 0.15,
    },
  });
}

/* ── Footer Blocks Animate In ──────────────────────── */
function initFooterBlocks() {
  const blocks = qa('.block', q('#footer-blocks') || document);
  if (!blocks.length) return;

  gsap.from(blocks, {
    scaleY: 0,
    transformOrigin: 'bottom',
    stagger: 0.1,
    duration: 0.5,
    ease: 'back.out(2)',
    scrollTrigger: {
      trigger: '#footer-blocks',
      start: 'top 90%',
      once: true,
    },
  });
}

/* ── Init ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Stagger init to avoid fighting loading screen
  const ready = () => {
    initHeroEntrance();
    initFloatingOrbs();
    initScrollReveals();
    initHeroSpotlight();
    initHeroParallax();
    initFocusItemAnimations();
    initExperienceToggle();
    initScrollProgress();
    initFooterBlocks();
  };

  // If loader exists wait for it to finish, else go immediately
  if (document.body.classList.contains('is-ready')) {
    ready();
  } else {
    // Small safety delay for loading screen
    setTimeout(ready, 600);
  }
});
