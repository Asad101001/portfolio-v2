import { useState, useEffect } from 'react';

export function useVisitorXP() {
  const [xpData, setXpData] = useState({
    visits: 0,
    level: 1,
    xpInLevel: 0,
    pct: 0,
    nextXP: 0
  });

  useEffect(() => {
    const XP_PER_VISIT = 35;
    const XP_PER_LEVEL = 100;

    let visits = parseInt(localStorage.getItem('asad_portfolio_visit_count') || '0', 10);
    
    if (!sessionStorage.getItem('asad_portfolio_visited_v2')) {
      visits++;
      localStorage.setItem('asad_portfolio_visit_count', String(visits));
      sessionStorage.setItem('asad_portfolio_visited_v2', '1');
    }

    const totalXP = visits * XP_PER_VISIT;
    const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
    const xpInLevel = totalXP % XP_PER_LEVEL;
    const pct = Math.min((xpInLevel / XP_PER_LEVEL) * 100, 100);
    const nextXP = XP_PER_LEVEL - xpInLevel;

    setXpData({
      visits,
      level,
      xpInLevel,
      pct,
      nextXP
    });
  }, []);

  return xpData;
}
