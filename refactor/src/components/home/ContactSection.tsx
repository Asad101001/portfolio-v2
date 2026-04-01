import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Instagram,
  Music,
  ExternalLink,
  Send,
  Star
} from 'lucide-react';
import { useReveal } from '../../hooks/useReveal';
import { useSocialData } from '../../hooks/useSocialData';
import { useVisitorXP } from '../../hooks/useVisitorXP';
import ScrambleHeader from './ScrambleHeader';

const socialChips = [
  { label: 'GitHub', handle: '@Asad101001', href: 'https://github.com/Asad101001', icon: Github, color: '#fff' },
  { label: 'LinkedIn', handle: 'muhammadasadk', href: 'https://www.linkedin.com/in/muhammadasadk/', icon: Linkedin, color: '#0077b5' },
  { label: 'Twitter', handle: '@As4d_41', href: 'https://twitter.com/As4d_41', icon: Twitter, color: '#1DA1F2' },
  { label: 'Instagram', handle: '@muhammadasad.k_', href: 'https://www.instagram.com/muhammadasad.k_/', icon: Instagram, color: '#E1306C' }
];

export default function ContactSection() {
  useReveal();
  const xp = useVisitorXP();
  const { movie, tv, track, players } = useSocialData();
  
  const [big3Index, setBig3Index] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBig3Index(prev => (prev + 1) % 4);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const renderBig3Content = () => {
    const data = [movie, tv, track, players][big3Index];
    if (!data) return null;

    const Icon = data.type === 'movie' ? '🎬' : data.type === 'tv' ? '📺' : data.type === 'music' ? '🎵' : '⚽';
    const label = data.type === 'movie' ? 'Cinematic Archive' : data.type === 'tv' ? 'Stream Queue' : data.type === 'music' ? 'Frequency Sync' : 'The Beautiful Game';

    return (
      <motion.div
        key={data.type}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.05, y: -10 }}
        className="flex flex-col items-center text-center py-4 w-full h-full justify-center px-4"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-customCyan/10 blur-2xl rounded-full scale-150 opacity-20" aria-hidden="true" />
          {data.img ? (
            <img src={data.img} alt="" className="w-24 h-24 rounded-2xl object-cover border border-white/10 shadow-2xl relative z-10" />
          ) : (
            <div className="text-5xl relative z-10">{Icon}</div>
          )}
          {data.type === 'football' && (
             <div className="flex -space-x-8 mt-2 relative z-10">
                {players.data.map((p: any, i: number) => (
                    <img key={i} src={p.img} alt={p.name} title={p.name} className="w-16 h-16 rounded-full border-2 border-zinc-950 bg-zinc-900 object-cover shadow-lg" />
                ))}
             </div>
          )}
        </div>

        <p className="text-[10px] font-mono text-customCyan uppercase tracking-[0.3em] mb-2 font-bold">{label}</p>
        <h4 className="text-xl font-bold text-white mb-2 leading-tight max-w-[240px] truncate">{data.title}</h4>
        
        {data.subtitle && <p className="text-[10px] text-zinc-500 font-mono italic">{data.subtitle}</p>}
        {data.stars && (
            <div className="flex gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={10} 
                        fill={i < data.stars!.length ? "#EAB308" : "none"} 
                        stroke={i < data.stars!.length ? "#EAB308" : "rgba(255,255,255,0.1)"} 
                    />
                ))}
            </div>
        )}
      </motion.div>
    );
  };

  return (
    <section id="contact" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="section-header text-center mb-16">
          <p className="font-mono text-xs text-customCyan uppercase tracking-[0.3em] font-bold mb-2">Connect</p>
          <ScrambleHeader text="Internet Friends" className="text-4xl md:text-5xl font-black tracking-tighter text-white" />
          <p className="text-customTextMuted mt-4 max-w-lg mx-auto italic">Catch me building stuff, posting takes, or listening to music.</p>
        </div>

        {/* Social Chips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24 reveal">
          {socialChips.map((chip) => (
            <motion.a
              key={chip.label}
              href={chip.href}
              target="_blank"
              rel="noopener"
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card flex items-center gap-4 p-4 border border-white/5 rounded-xl group transition-all hover:bg-white/[0.02]"
            >
              <div className="p-2.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                <chip.icon size={18} style={{ color: chip.color }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-black text-white/30 uppercase tracking-widest">{chip.label}</span>
                <span className="text-xs font-bold text-white group-hover:text-customCyan transition-colors">{chip.handle}</span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* 3-Column Footer Grid for Parity */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 reveal items-stretch">
          {/* Music Widget */}
          <div className="md:col-span-4 glass-card p-6 rounded-2xl flex flex-col justify-between group h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Music size={16} className="text-[#1DB954]" />
                <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-widest">Now Playing</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#1DB954] shadow-[0_0_12px_#1DB954] pulse-dot"></span>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              {track.img ? (
                <img src={track.img} alt="" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-xl overflow-hidden animate-pulse">🎵</div>
              )}
              <div className="flex flex-col min-width-0">
                <h4 className="text-sm font-black text-white line-clamp-1 mb-1">{track.title}</h4>
                <p className="text-[10px] font-mono text-white/40 line-clamp-1 italic">{track.subtitle}</p>
              </div>
            </div>
            
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-auto">
              <motion.div 
                animate={{ width: ['20%', '80%', '40%', '90%', '60%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="h-full bg-[#1DB954]"
              />
            </div>
          </div>

          {/* Big 3 Rotator (Trakt/Letterboxd/etc.) */}
          <div className="md:col-span-4 glass-card p-6 rounded-2xl min-h-[300px] flex flex-col items-center justify-between relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
            {renderBig3Content()}
            
            <div className="flex justify-center gap-2 pb-2">
              {[0, 1, 2, 3].map(i => (
                <button 
                  key={i} 
                  onClick={() => setBig3Index(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${big3Index === i ? 'bg-customCyan w-6' : 'bg-white/10 hover:bg-white/20'}`} 
                />
              ))}
            </div>
          </div>

          {/* Visitor XP */}
          <div className="md:col-span-4 glass-card p-6 rounded-2xl flex flex-col justify-between h-full bg-black/40">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-customCyan"></div>
                 <span className="text-[10px] font-mono font-black text-white/40 uppercase tracking-widest">Protocol Stats</span>
               </div>
               <span className="px-2 py-0.5 rounded bg-customCyan/10 text-customCyan text-[9px] font-mono font-black border border-customCyan/20 tracking-tighter">LVL.{xp.level}</span>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-tighter">Instance Visits</span>
                    <span className="text-xl font-black text-white">{xp.visits} <span className="text-xs font-normal text-white/20">sessions</span></span>
                </div>
                <span className="text-[9px] font-mono text-customCyan font-bold uppercase">{xp.nextXP} XP → LVL.{xp.level + 1}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${xp.pct}%` }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-customCyan shadow-[0_0_15px_var(--cyan)]"
                />
              </div>
            </div>

            <div className="mt-12 flex items-center justify-center gap-3 pb-2 opacity-20 hover:opacity-50 transition-opacity">
                <span className="text-[8px] font-mono uppercase tracking-[0.4em] font-black italic">Decentralized Presence</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-32 pt-12 border-t border-white/5 text-center reveal">
           <a href="mailto:muhammadasadk42@gmail.com" className="inline-flex items-center gap-3 px-10 py-4 bg-white/5 border border-white/5 rounded-full text-xs font-mono font-black uppercase tracking-[0.2em] text-customTextMuted hover:text-white hover:border-customCyan/30 hover:bg-customCyan/5 transition-all hover:scale-105 group">
             <Send size={14} className="text-customCyan group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             Initiate Direct Connection
           </a>
        </div>
      </div>
    </section>
  );
}
