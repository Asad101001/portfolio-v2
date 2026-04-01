import { useEffect, useState, useRef } from 'react';
import { Github } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export default function GitHubHeatmap() {
  const [contributions, setContributions] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const username = 'Asad101001';
    
    // Generate placeholder pattern while loading
    const generatePattern = () => {
      const days = [];
      const seed = 42;
      const rand = (s: number) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
      };
      for (let i = 363; i >= 0; i--) {
        const base = rand(seed + i * 7.3);
        const count = base > 0.6 ? Math.floor(rand(seed + i * 3.7) * 10) : 0;
        days.push(count);
      }
      return days;
    };

    setContributions(generatePattern());

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then(r => r.json())
      .then(data => {
        if (data && data.contributions) {
          const counts = data.contributions.map((d: any) => d.count);
          const lastYear = counts.slice(-364);
          setContributions(lastYear);
          setTotal(lastYear.reduce((a: number, b: number) => a + b, 0));
          setLoading(false);
          
          // Scroll to end of grid after render
          setTimeout(() => {
            if (gridRef.current) {
              gridRef.current.scrollLeft = gridRef.current.scrollWidth;
            }
          }, 100);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 8) return 3;
    return 4;
  };

  // Group into weeks
  const weeks = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }

  return (
    <div className="github-widget mt-8">
      <div className="flex items-center gap-3 mb-4">
        <Github size={18} className="text-customCyan" />
        <span className="font-mono text-xs uppercase tracking-widest font-bold">GitHub Activity</span>
        <a 
          href="https://github.com/Asad101001" 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-auto text-[10px] font-mono text-customCyan/60 hover:text-customCyan transition-colors"
        >
          @Asad101001 ↗
        </a>
      </div>

      <div 
        ref={gridRef}
        className="commit-grid flex gap-1 overflow-x-auto pb-2 scrollbar-none"
      >
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 shrink-0">
            {week.map((count, di) => (
              <div 
                key={di}
                className="w-[10px] h-[10px] rounded-[2px] transition-colors duration-500"
                style={{ 
                  backgroundColor: count === 0 ? 'rgba(255,255,255,0.04)' : 
                                   getLevel(count) === 1 ? 'rgba(0,255,65,0.15)' :
                                   getLevel(count) === 2 ? 'rgba(0,255,65,0.35)' :
                                   getLevel(count) === 3 ? 'rgba(0,255,65,0.6)' :
                                   'rgba(0,255,65,0.85)'
                }}
                title={`${count} contributions`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-[10px] font-mono text-white/40">
          {loading ? 'Syncing contributions...' : `${total} contributions in the last year`}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-white/20 mr-1">Less</span>
          {[0, 1, 2, 3, 4].map(l => (
            <div 
              key={l}
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ 
                backgroundColor: l === 0 ? 'rgba(255,255,255,0.04)' : 
                                 l === 1 ? 'rgba(0,255,65,0.15)' :
                                 l === 2 ? 'rgba(0,255,65,0.35)' :
                                 l === 3 ? 'rgba(0,255,65,0.6)' :
                                 'rgba(0,255,65,0.85)'
              }}
            />
          ))}
          <span className="text-[10px] font-mono text-white/20 ml-1">More</span>
        </div>
      </div>
    </div>
  );
}
