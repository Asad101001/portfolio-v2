import { useRef, useState, useEffect } from 'react';
import { useTextScramble } from '../../hooks/useTextScramble';

interface ScrambleHeaderProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function ScrambleHeader({ text, className, delay = 0 }: ScrambleHeaderProps) {
  const [active, setActive] = useState(false);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const displayText = useTextScramble(text, active);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setActive(true), delay);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.5 });

    if (headerRef.current) observer.observe(headerRef.current);
    
    return () => observer.disconnect();
  }, [delay]);

  return (
    <h2 ref={headerRef} className={className}>
      {displayText}
    </h2>
  );
}
