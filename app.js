'use strict';
/* ============================================================
   PORTFOLIO — app.js v2
   Muhammad Asad Khan
   ============================================================ */

/* ── A. Animated Particle Canvas Background ─────────────── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); initParticles(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function initParticles() {
    particles = [];
    const count = Math.floor((W * H) / 18000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.18, 0.18), vy: rand(-0.18, 0.18),
        r: rand(0.8, 2.2),
        alpha: rand(0.15, 0.55),
      });
    }
  }
  initParticles();

  const CYAN = { r: 0, g: 212, b: 255 };

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Ambient glow
    const grd = ctx.createRadialGradient(W/2, 0, 0, W/2, 0, H * 0.65);
    grd.addColorStop(0, 'rgba(0,212,255,0.045)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Particles + connections
    particles.forEach((p, i) => {
      // Move
      p.x += p.vx; p.y += p.vy;
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;

      // Mouse repel (subtle)
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 90) {
        const force = (90 - dist) / 90 * 0.4;
        p.x += dx / dist * force;
        p.y += dy / dist * force;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CYAN.r},${CYAN.g},${CYAN.b},${p.alpha})`;
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const ddx = p.x - q.x, ddy = p.y - q.y;
        const d = Math.sqrt(ddx*ddx + ddy*ddy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${CYAN.r},${CYAN.g},${CYAN.b},${0.06 * (1 - d/120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  }
  draw();
})();


/* ── B. Typewriter ────────────────────────────────────────── */
(function () {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    'Cloud & Networking enthusiast',
    'Python + Data Science learner',
    'Building AI / LLM pipelines',
    'AWS architecture explorer',
    'Breaking things since 2024...',
    'Always learning. Always shipping.',
  ];

  let phraseIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = phrases[phraseIdx];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
      setTimeout(type, 55);
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(type, 300);
        return;
      }
      setTimeout(type, 28);
    }
  }
  setTimeout(type, 600);
})();


/* ── C. Animated Stat Counters ───────────────────────────── */
function runCounters(root) {
  (root || document).querySelectorAll('[data-export-counter]').forEach(el => {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const target = parseInt(el.dataset.exportCounter, 10);
    const duration = 1400;
    const start = performance.now();
    function step(now) {
      const eased = 1 - Math.pow(1 - Math.min((now - start) / duration, 1), 3);
      el.textContent = Math.floor(eased * target) + '+';
      if (eased < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// Run counters when About or Hero enters viewport
document.querySelectorAll('#about, #hero').forEach(sec => {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { runCounters(sec); obs.disconnect(); }
  }, { threshold: 0.15 });
  obs.observe(sec);
});


/* ── D. Live GitHub Contribution Graph ───────────────────── */
(function () {
  const GITHUB_USER = 'Asad101001';
  const COLOR = '#00d4ff';
  const grid     = document.getElementById('gh-contrib-grid');
  const countEl  = document.getElementById('gh-contrib-count');
  if (!grid) return;

  fetch('https://github-contributions-api.jogruber.de/v4/' + GITHUB_USER + '?y=last')
    .then(r => r.json())
    .then(data => {
      const weeks = data.contributions;
      let total = 0;
      grid.innerHTML = '';

      weeks.forEach(week => {
        const col = document.createElement('div');
        const days = week.days || week;
        days.forEach(day => {
          const count = day.count !== undefined ? day.count : day;
          total += count;
          const cell = document.createElement('div');
          const op = count === 0 ? 0.07 : count < 3 ? 0.22 : count < 7 ? 0.45 : count < 12 ? 0.7 : 1;
          cell.style.cssText = `background:${COLOR};opacity:${op}`;
          cell.title = `${count} contribution${count !== 1 ? 's' : ''}`;
          col.appendChild(cell);
        });
        grid.appendChild(col);
      });

      if (countEl) countEl.textContent = `${total.toLocaleString()} contributions in the last year`;
    })
    .catch(() => {
      grid.innerHTML = '';
      const ops = [0.07, 0.07, 0.12, 0.22, 0.38, 0.55, 0.8];
      for (let w = 0; w < 52; w++) {
        const col = document.createElement('div');
        for (let d = 0; d < 7; d++) {
          const cell = document.createElement('div');
          cell.style.cssText = `background:${COLOR};opacity:${ops[(w*3+d*2)%7]}`;
          col.appendChild(cell);
        }
        grid.appendChild(col);
      }
      if (countEl) countEl.textContent = 'Contribution data unavailable offline';
    });
})();


/* ── E. Certifications Drawer ────────────────────────────── */
const drawer   = document.getElementById('certs-drawer');
const backdrop = document.getElementById('certs-backdrop');
const closeBtn = document.getElementById('certs-close');

function openCerts()  { if (!drawer) return; drawer.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeCerts() { if (!drawer) return; drawer.classList.remove('open'); document.body.style.overflow = ''; }

document.querySelectorAll('a[href="#certifications"]').forEach(link => {
  link.addEventListener('click', e => { e.preventDefault(); openCerts(); });
});
if (backdrop) backdrop.addEventListener('click', closeCerts);
if (closeBtn) closeBtn.addEventListener('click', closeCerts);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCerts(); });


/* ── F. Mobile nav auto-close ────────────────────────────── */
const mobileNav = document.querySelector('details.mobile-nav');
if (mobileNav) {
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileNav.removeAttribute('open'));
  });
}


/* ── G. Seamless Marquee ─────────────────────────────────── */
document.querySelectorAll('.export-tech-marquee-lane').forEach(lane => {
  lane.innerHTML += lane.innerHTML;
});
