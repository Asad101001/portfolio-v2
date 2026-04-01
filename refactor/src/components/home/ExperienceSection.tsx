import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReveal } from '../../hooks/useReveal';
import { LineChart, Briefcase, Terminal as TerminalIcon, Star } from 'lucide-react';
import ScrambleHeader from './ScrambleHeader';

const skillDist = [
  { label: 'Googling stuff', pct: '97%', color: '#f97316' },
  { label: 'Reading docs', pct: '15%', color: '#a855f7' },
  { label: 'Actual coding', pct: '61%', color: '#00ff41' },
  { label: 'Debugging', pct: '40%', color: '#f87171' },
  { label: 'It works locally', pct: '85%', color: '#22c55e' }
];

const milestones = [
  {
    company: "LegalEase AI",
    role: "Lead Developer",
    period: "Oct '24 - Nov '24",
    desc: "Engineered RAG-based legal parser using LangChain and FAISS. Optimized chunking strategies for high-accuracy retrieval."
  },
  {
    company: "MogScope",
    role: "AI/CV Developer",
    period: "Sep '24 - Oct '24",
    desc: "Implemented computer vision pipelines for physique analysis using PyTorch and FastAPI. Scaled to handle 1k+ requests."
  },
  {
    company: "PollPulse",
    role: "Full-Stack Dev",
    period: "Aug '24 - Sep '24",
    desc: "Developed real-time polling system with DRF and WebSockets. Focused on low-latency data synchronization."
  }
];

const testimonials = [
  {
    quote: "He once spent 3 hours debugging a missing semicolon. Growth.",
    author: "Claude, probably",
    stars: 4
  },
  {
    quote: "Works perfectly. On my machine. Every time.",
    author: "localhost:5000",
    stars: 5
  }
];

export default function ExperienceSection() {
  useReveal();
  const [isOpen, setIsOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    let timer: any;
    if (showError) {
      timer = setTimeout(() => setShowError(false), 4000);
    }
    return () => clearTimeout(timer);
  }, [showError]);

  const handleToggle = () => {
    if (!isOpen) {
      setIsDecrypting(true);
      setTimeout(() => {
        setIsDecrypting(false);
        setIsOpen(true);
        setShowError(true);
      }, 1500);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <section id="experience" className="py-24 px-6 relative overflow-hidden">
      <div className="section-inner max-w-7xl mx-auto">
        <div className="section-header text-center mb-16">
          <p className="font-mono text-xs text-customCyan uppercase tracking-[0.3em] font-bold mb-2">Background</p>
          <ScrambleHeader text="Experience" className="text-4xl md:text-5xl font-black tracking-tighter text-white" />
          <p className="text-customTextMuted mt-4 max-w-lg mx-auto italic">Where I've spent my time, energy, and sanity.</p>
        </div>

        {/* The 404 Quirk Block */}
        {!isOpen && (
          <div 
            className={`demo-404 reveal relative border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer group hover:bg-white/[0.02] transition-colors ${isDecrypting ? 'opacity-50' : ''}`}
            onClick={handleToggle}
          >
            <div className="absolute top-4 left-4 text-[10px] font-mono text-white/20">SECTOR_EXPERIENCE_LOG</div>
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/20">ACCESS_RESTRICTED</div>
            <div className="text-8xl md:text-9xl font-black text-white/5 group-hover:text-customCyan/10 transition-colors uppercase tracking-tighter mb-4">404</div>
            <h3 className="text-xl font-bold text-white mb-2">{isDecrypting ? 'DECRYPTING...' : 'SECTOR_DATA_OFFLINE'}</h3>
            <p className="text-customTextMuted text-center max-w-sm">The experience logs are restricted or haven't been decrypted yet.</p>
            <span className="mt-8 px-6 py-2 border border-customCyan/30 rounded-full text-[10px] font-mono uppercase tracking-widest text-customCyan animate-pulse">
              {isDecrypting ? 'Processing Protocol...' : 'View Experience ▼'}
            </span>
          </div>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                {/* Skill Distribution Card */}
                <div className="glass-card p-8 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3 mb-8">
                    <LineChart size={18} className="text-customCyan" />
                    <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Actual Skill Distribution</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {skillDist.map((skill, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-white/60">{skill.label}</span>
                          <span style={{ color: skill.color }}>{skill.pct}</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: skill.pct }}
                            transition={{ duration: 1.4, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                            className="h-full shadow-[0_0_8px_currentColor]"
                            style={{ backgroundColor: skill.color, color: skill.color } as React.CSSProperties}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <Star size={14} className="text-customCyan" />
                      <h4 className="font-mono text-[10px] uppercase tracking-widest font-bold">Testimonials</h4>
                    </div>
                    <div className="space-y-4">
                      {testimonials.map((t, i) => (
                        <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-white/10 transition-colors">
                          <p className="text-[12px] text-customTextMuted italic mb-2 tracking-tight">"{t.quote}"</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-white/30">— {t.author}</span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, si) => (
                                <Star 
                                  key={si} 
                                  size={8} 
                                  fill={si < t.stars ? "#f59e0b" : "none"} 
                                  stroke={si < t.stars ? "#f59e0b" : "rgba(255,255,255,0.1)"} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Professional Milestones */}
                <div className="glass-card p-8 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3 mb-8">
                    <Briefcase size={18} className="text-customCyan" />
                    <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Core Projects & Milestones</h3>
                  </div>
                  
                  <div className="space-y-8">
                    {milestones.map((item, i) => (
                      <div key={i} className="relative pl-6 border-l border-white/10 group">
                        <div className="absolute top-0 left-0 -translate-x-1/2 w-2 h-2 rounded-full bg-customCyan shadow-[0_0_8px_var(--cyan)] group-hover:scale-150 transition-transform"></div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-white group-hover:text-customCyan transition-colors">{item.company}</h4>
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{item.period}</span>
                        </div>
                        <p className="text-[11px] font-mono text-customCyan/60 mb-2 font-bold uppercase">{item.role}</p>
                        <p className="text-sm text-customTextMuted leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 flex justify-center">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="text-[10px] font-mono text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em]"
                    >
                      [ -- Terminate Decryption Session -- ]
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistence Error Popup Markup */}
      <AnimatePresence>
        {showError && (
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 right-8 w-[320px] bg-[#0A0A0A] border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)] rounded-lg overflow-hidden z-[100]"
          >
            <div className="bg-red-500/10 p-3 flex items-center justify-between border-b border-red-500/20">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              </div>
              <span className="text-[9px] font-mono font-black text-red-500 tracking-[0.2em]">KERNEL_PANIC</span>
            </div>
            <div className="p-6 font-mono">
              <div className="text-xs text-red-400 font-bold mb-2 animate-pulse uppercase tracking-wider">DECRYPTION_FAILURE: SECTOR_404</div>
              <p className="text-[10px] text-red-500/60 leading-relaxed mb-4">
                Critical interrupt occurred during log synthesis. IRQL_NOT_LESS_OR_EQUAL at 0x8004210B.
              </p>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: "100%" }}
                   animate={{ width: 0 }}
                   transition={{ duration: 4, ease: "linear" }}
                   className="h-full bg-red-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
