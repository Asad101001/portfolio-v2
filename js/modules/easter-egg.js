/**
 * easter-egg.js — Linked List Node Easter Egg
 * Click the </Asad> footer logo to spawn floating linked-list nodes.
 * Nodes chain together, float up, and vanish after 3s.
 */
(function() {
  'use strict';

  var nodeCounter = 0;
  var lastNodeEl = null;  // track last node to draw chain line

  // Inject keyframes + base styles once
  var style = document.createElement('style');
  style.textContent = [
    '@keyframes ll-float-up {',
    '  0%   { opacity: 0; transform: translateY(0px) scale(0.7); }',
    '  15%  { opacity: 1; transform: translateY(-8px) scale(1.05); }',
    '  80%  { opacity: 1; transform: translateY(-44px) scale(1); }',
    '  100% { opacity: 0; transform: translateY(-70px) scale(0.9); }',
    '}',
    '.ll-node {',
    '  position: fixed;',
    '  display: inline-flex;',
    '  align-items: stretch;',
    '  border-radius: 3px;',
    '  border: 1.5px solid var(--cyan, #10b981);',
    '  background: var(--bg, #060a12);',
    '  box-shadow: 0 0 16px rgba(16,185,129,0.3), inset 0 0 8px rgba(16,185,129,0.04);',
    '  font-family: "JetBrains Mono", monospace;',
    '  font-size: 0.7rem;',
    '  font-weight: 700;',
    '  pointer-events: none;',
    '  z-index: 99999;',
    '  animation: ll-float-up 3s cubic-bezier(0.22,1,0.36,1) forwards;',
    '  white-space: nowrap;',
    '  user-select: none;',
    '}',
    '.ll-node-data {',
    '  padding: 5px 10px;',
    '  color: var(--cyan, #10b981);',
    '  border-right: 1.5px solid var(--cyan, #10b981);',
    '}',
    '.ll-node-ptr {',
    '  padding: 5px 8px;',
    '  color: rgba(255,255,255,0.4);',
    '  font-size: 0.62rem;',
    '}',
    '.ll-connector {',
    '  position: fixed;',
    '  pointer-events: none;',
    '  z-index: 99998;',
    '  border-top: 1.5px dashed rgba(16,185,129,0.4);',
    '  transform-origin: left center;',
    '  animation: ll-float-up 3s cubic-bezier(0.22,1,0.36,1) forwards;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  function spawnNode(x, y) {
    nodeCounter++;
    var id = 'll-node-' + nodeCounter;
    var values = ['0x' + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0'), '*head', '*tail', '*next', 'node_' + nodeCounter, '[' + nodeCounter + ']'];
    var dataLabel = values[Math.floor(Math.random() * values.length)];

    var node = document.createElement('div');
    node.className = 'll-node';
    node.id = id;

    var dataSpan = document.createElement('span');
    dataSpan.className = 'll-node-data';
    dataSpan.textContent = dataLabel;

    var ptrSpan = document.createElement('span');
    ptrSpan.className = 'll-node-ptr';
    ptrSpan.textContent = nodeCounter < 10 ? 'NEXT →' : 'NULL';

    node.appendChild(dataSpan);
    node.appendChild(ptrSpan);

    // Offset each node slightly so they don't perfectly stack
    var offsetX = (Math.random() - 0.5) * 60;
    node.style.left = Math.max(8, Math.min(window.innerWidth - 200, x + offsetX - 70)) + 'px';
    node.style.top = (y - 20) + 'px';

    document.body.appendChild(node);

    // Remove after animation
    setTimeout(function() {
      if (node.parentNode) node.parentNode.removeChild(node);
      if (lastNodeEl === node) lastNodeEl = null;
    }, 3000);

    lastNodeEl = node;
  }

  function init() {
    var logo = document.getElementById('footer-logo');
    if (!logo) return;

    var clickCount = 0;

    logo.style.cursor = 'pointer';
    logo.title = 'You found something...';

    logo.addEventListener('click', function(e) {
      clickCount++;
      spawnNode(e.clientX, e.clientY);

      // After 5 clicks, add a fun terminal-style tooltip
      if (clickCount === 5) {
        var tip = document.createElement('div');
        tip.style.cssText = [
          'position:fixed',
          'left:' + Math.max(8, e.clientX - 120) + 'px',
          'top:' + (e.clientY - 80) + 'px',
          'background:var(--bg,#060a12)',
          'border:1px solid var(--cyan,#10b981)',
          'color:var(--cyan,#10b981)',
          'font-family:"JetBrains Mono",monospace',
          'font-size:0.65rem',
          'padding:6px 12px',
          'border-radius:3px',
          'z-index:99999',
          'pointer-events:none',
          'box-shadow:0 0 20px rgba(16,185,129,0.2)',
          'animation:ll-float-up 3s forwards'
        ].join(';');
        tip.textContent = '// easter egg discovered 🎉';
        document.body.appendChild(tip);
        setTimeout(function() { if (tip.parentNode) tip.parentNode.removeChild(tip); }, 3000);
      }
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
