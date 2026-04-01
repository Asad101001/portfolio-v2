import { useState, useEffect } from 'react';
import { useReveal } from '../../hooks/useReveal';
import { LineChart, Award, Code2, Cpu } from 'lucide-react';

function Counter({ target, duration = 1400 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(easedProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    if (isVisible) {
      window.requestAnimationFrame(step);
    }
  }, [isVisible, target, duration]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });

    const el = document.getElementById(`counter-${target}`);
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [target]);

  return <span id={`counter-${target}`} className="stat-big">{count}+</span>;
}

const wipActivities = [
  { 
    title: 'LLM Pipeline v2', 
    desc: 'Improving RAG chunking strategy with hybrid retrieval', 
    pct: '30%', 
    icon: '🧠', 
    clr: 'var(--cyan)'
  },
  { 
    title: 'Cloud Computing', 
    desc: 'NED University - EC2, S3, VPC, RDS & cloud architecture deep dives', 
    pct: '95%', 
    icon: '☁️', 
    clr: '#FF9900'
  },
  { 
    title: 'HEC GenAI Cohort 2', 
    desc: 'Working through RAG systems and AI ethics modules', 
    pct: '85%', 
    icon: '🤖', 
    clr: '#a855f7'
  }
];

export default function AboutSection() {
  useReveal();

  return (
    <section id="about">
      <div className="section-inner">
        <div className="section-header">
          <div>
            <p className="label-xs">Who I Am</p>
            <h2 className="section-title">About Me</h2>
          </div>
        </div>

        <div className="about-grid">
          <div className="about-text glass-card reveal">
            <p>
              I'm a Computer Science student at UBIT, University of Karachi '28, driven to explore
              every corner of CS before settling on a specialty. So far I've covered Cloud Computing,
              Networking, Web Dev, Data Science, Version Control, Project Management, Prompt Engineering,
              and AI — with lots more ahead.
            </p>
            <p className="mt-4">
              I learn by building. Every project is a live experiment — from AWS VPC architecture to
              RAG-powered LLM pipelines. My philosophy: build broken things, understand why they broke,
              then spend ages unbreaking them.
            </p>
            <div className="mt-8 flex gap-4">
              {/* Optional secondary CTAs could go here */}
            </div>
          </div>

          <div className="about-stats-col">
            {[
              { id: 'cnt-projects', target: 4, label: 'Projects', icon: <LineChart size={18} /> },
              { id: 'cnt-certs', target: 6, label: 'Certifications', icon: <Award size={18} /> },
              { id: 'cnt-tech', target: 20, label: 'Technologies', icon: <Cpu size={18} /> }
            ].map((stat, i) => (
              <div 
                key={stat.id} 
                className="about-stat-card glass-card reveal"
                style={{ '--delay': `${i * 100}ms` } as React.CSSProperties}
              >
                <div className="text-customCyan mb-1">
                   {stat.icon}
                </div>
                <Counter target={stat.target} />
                <p className="stat-lbl">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Currently Working On */}
        <div className="working-on-wrap glass-card reveal mt-12" style={{ '--delay': '200ms' } as React.CSSProperties}>
          <div className="working-on-header">
            <Code2 size={14} className="text-customCyan" />
            <span>Currently Exploring</span>
            <div className="working-on-pulse">
               <span></span> active
            </div>
          </div>

          <div className="working-on-grid">
            {wipActivities.map((wip, i) => (
              <div 
                key={i} 
                className="wip-card"
              >
                <div className="wip-icon" style={{ background: 'rgba(255,255,255,0.03)' }}>
                   {wip.icon}
                </div>
                <div className="wip-info">
                  <p className="wip-title">{wip.title}</p>
                  <p className="wip-desc">{wip.desc}</p>
                </div>
                <div className="wip-bar-wrap">
                   <div 
                      className="wip-bar" 
                      style={{ '--pct': wip.pct, '--clr': wip.clr } as React.CSSProperties}
                    >
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub Activity Heatmap Placeholder */}
        <div className="github-widget glass-card reveal mt-8" style={{ '--delay': '300ms' } as React.CSSProperties}>
          <div className="flex items-center gap-3 mb-6 p-1">
            <GithubIcon />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-white/40">GitHub Commit History</span>
            <a href="https://github.com/Asad101001" target="_blank" rel="noopener noreferrer" className="ml-auto text-[10px] font-mono text-customCyan hover:underline">@Asad101001 ↗</a>
          </div>
          {/* Heatmap implementation will be handled in Phase 4 integration */}
          <div className="h-24 bg-white/[0.02] border border-dashed border-white/10 rounded flex items-center justify-center">
             <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Commit Data Feed Offline</span>
          </div>
        </div>

      </div>
    </section>
  );
}

function GithubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
