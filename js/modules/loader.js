/* ============================================================
   js/modules/loader.js
   3D "In Touch" startup intro animation
   ============================================================ */

(function () {
  'use strict';

  var loader = document.getElementById('loading-screen');
  if (!loader) return;

  /* ── Build the 3D intro DOM ─────────────────────────────── */
  var inner = loader.querySelector('.loading-inner');
  if (!inner) return;

  // Add floating particles
  var particleData = [
    { w:5,  h:5,  bg:'rgba(16,185,129,0.7)',  tx:'40px',  ty:'-50px', dur:'3.2s', delay:'0s',   a1:'0.5', a2:'0.05' },
    { w:3,  h:3,  bg:'rgba(173,255,47,0.6)',  tx:'-30px', ty:'-40px', dur:'2.8s', delay:'0.4s', a1:'0.4', a2:'0.05' },
    { w:4,  h:4,  bg:'rgba(168,85,247,0.6)',  tx:'50px',  ty:'30px',  dur:'3.8s', delay:'0.7s', a1:'0.35','a2':'0.05'},
    { w:6,  h:6,  bg:'rgba(16,185,129,0.4)',  tx:'-60px', ty:'20px',  dur:'4.2s', delay:'1s',   a1:'0.3', a2:'0.04' },
    { w:3,  h:3,  bg:'rgba(249,115,22,0.5)',  tx:'20px',  ty:'-70px', dur:'3.5s', delay:'0.2s', a1:'0.45','a2':'0.05'},
    { w:4,  h:4,  bg:'rgba(255,255,255,0.3)', tx:'-45px', ty:'-30px', dur:'2.5s', delay:'0.9s', a1:'0.3', a2:'0.04' },
  ];

  particleData.forEach(function (p, i) {
    var el = document.createElement('div');
    el.className = 'loading-particle';
    el.style.cssText = [
      'width:' + p.w + 'px',
      'height:' + p.h + 'px',
      'background:' + p.bg,
      'left:calc(50% + ' + (Math.random() * 160 - 80) + 'px)',
      'top:calc(50% + '  + (Math.random() * 100 - 80) + 'px)',
      '--tx:' + p.tx,
      '--ty:' + p.ty,
      '--dur:' + p.dur,
      '--delay:' + p.delay,
      '--a1:' + p.a1,
      '--a2:' + p.a2,
    ].join(';');
    inner.appendChild(el);
  });

  if (window._isMobile || window.innerWidth <= 768) {
    if (loader) loader.remove();
    return;
  }

  /* ── Dismiss logic ──────────────────────────────────────── */
  function dismiss() {
    if (!loader) return;
    loader.classList.add('hidden');
    const t = setTimeout(() => { if (loader) loader.remove(); }, 50);
    loader.addEventListener('transitionend', () => {
      clearTimeout(t);
      if (loader) loader.remove();
    }, { once: true });
  }

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    dismiss();
  } else {
    document.addEventListener('DOMContentLoaded', dismiss);
    window.addEventListener('load', dismiss);
  }

  // Hard cap max
  setTimeout(dismiss, 100);

})();
