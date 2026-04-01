import { useEffect, useState, useRef } from 'react';

export function useTextScramble(text: string, active: boolean = true) {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef(0);
  const queueRef = useRef<any[]>([]);
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  const resolveRef = useRef<(() => void) | null>(null);
  const hasAnimated = useRef(false);

  const update = () => {
    let output = '';
    let complete = 0;
    for (let i = 0, n = queueRef.current.length; i < n; i++) {
      let { from, to, start, end, char } = queueRef.current[i];
      if (frameRef.current >= end) {
        complete++;
        output += to;
      } else if (frameRef.current >= start) {
        if (!char || Math.random() < 0.28) {
          char = chars[Math.floor(Math.random() * chars.length)];
          queueRef.current[i].char = char;
        }
        output += char;
      } else {
        output += from;
      }
    }
    
    setDisplayText(output);
    
    if (complete === queueRef.current.length) {
      if (resolveRef.current) resolveRef.current();
    } else {
      frameRef.current++;
      requestAnimationFrame(update);
    }
  };

  const startScramble = (newText: string) => {
    const oldText = displayText;
    const length = Math.max(oldText.length, newText.length);
    queueRef.current = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 25);
      const end = start + Math.floor(Math.random() * 25);
      queueRef.current.push({ from, to, start, end });
    }
    frameRef.current = 0;
    update();
  };

  useEffect(() => {
    if (active && !hasAnimated.current) {
      hasAnimated.current = true;
      startScramble(text);
    }
  }, [active, text]);

  return displayText;
}
