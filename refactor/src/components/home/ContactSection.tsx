import { useReveal } from '../../hooks/useReveal';
import { 
  Github, 
  Linkedin, 
  MessageSquare, 
  Instagram, 
  Music, 
  Disc, 
  Zap, 
  Gamepad2, 
  StickyNote,
  Send
} from 'lucide-react';

const socialChips = [
  { name: 'GitHub', handle: '@Asad101001', icon: Github, href: 'https://github.com/Asad101001' },
  { name: 'LinkedIn', handle: 'muhammadasadk', icon: Linkedin, href: 'https://linkedin.com/in/muhammadasadk' },
  { name: 'Discord', handle: 'asad.k_11', icon: MessageSquare, href: 'https://discord.com/users/1390327957062418654' },
  { name: 'Instagram', handle: '@muhammadasad.k_', icon: Instagram, href: 'https://instagram.com/muhammadasad.k_' }
];

export default function ContactSection() {
  useReveal();

  return (
    <section id="contact">
      <div className="section-inner">
        <div className="section-header centered">
          <p className="label-xs">Connect</p>
          <h2 className="section-title">Let's Be Internet Friends</h2>
          <p className="section-sub">Catch me building stuff, posting takes, or listening to music. Slide in anywhere 👋</p>
        </div>

        {/* Social Chips Row */}
        <div className="flex flex-wrap gap-4 justify-center mb-16">
          {socialChips.map((chip, i) => (
            <a 
              key={i}
              href={chip.href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-card glass-card reveal p-5 flex items-center gap-4 group"
              style={{ '--delay': `${i * 50}ms` } as React.CSSProperties}
            >
              <div className="text-zinc-600 group-hover:text-customCyan transition-colors">
                <chip.icon size={18} />
              </div>
              <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">{chip.name}</span>
                  <span className="text-[11px] text-zinc-700 font-mono tracking-tight group-hover:text-customCyan/80 transition-colors">{chip.handle}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Desktop-only Social Grid (1x1x3 pattern) */}
        <div className="social-cards-grid mt-12">
          {/* Spotify Widget */}
          <div className="spotify-widget glass-card reveal p-6">
             <div className="spotify-widget-header flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Music size={14} className="text-zinc-500" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Now Playing</span>
                </div>
                <div className="spotify-live-dot"></div>
             </div>
             
             <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded bg-zinc-900 border border-white/5 flex items-center justify-center animate-pulse">
                   <Disc size={24} className="text-[#1DB954]" />
                </div>
                <div className="flex flex-col gap-1">
                   <div className="text-sm font-bold text-white">Connecting...</div>
                   <div className="text-xs text-zinc-600 font-mono">Syncing Spotify API</div>
                </div>
             </div>
             
             <div className="spotify-progress-wrap-expanded">
               <div className="spotify-bar-expanded">
                 <div className="spotify-bar-fill-expanded" style={{ width: '45%' }}></div>
               </div>
               <div className="flex justify-between mt-2 font-mono text-[9px] text-zinc-700">
                  <span>01:12</span>
                  <span>03:45</span>
               </div>
             </div>
          </div>

          {/* Last.fm Widget */}
          <div className="lastfm-widget glass-card reveal p-6" style={{ '--delay': '100ms' } as React.CSSProperties}>
             <div className="lastfm-widget-header flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Music size={14} className="text-zinc-500" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Weekly Artists</span>
                </div>
             </div>
             <div className="lastfm-user font-mono text-[10px] text-zinc-600 mb-6 font-bold tracking-wider">@muhammadasadk</div>
             
             <div className="flex flex-col gap-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded bg-white/[0.02] border border-white/5 opacity-50">
                    <div className="w-8 h-8 rounded bg-zinc-900"></div>
                    <div className="flex flex-col">
                      <div className="w-20 h-2 bg-white/5 rounded"></div>
                      <div className="w-12 h-1.5 bg-white/5 rounded mt-2"></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* XP Widget */}
          <div className="xp-widget glass-card reveal p-6" style={{ '--delay': '200ms' } as React.CSSProperties}>
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-zinc-500" />
                  <span className="xp-label text-[10px] font-bold uppercase tracking-widest text-zinc-500">Visitor Experience</span>
                </div>
                <span className="xp-level font-mono text-[10px] font-bold">Lv. 01</span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-customCyan" style={{ width: '25%' }}></div>
             </div>
             <div className="flex justify-between text-[8px] font-mono text-zinc-700 uppercase font-bold">
                <span>Visit #1</span>
                <span>+25 XP</span>
             </div>
          </div>

          {/* Game Widget */}
          <div className="game-widget glass-card reveal p-6" style={{ '--delay': '300ms' } as React.CSSProperties}>
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 size={14} className="text-zinc-500" />
              <span className="game-label text-[10px] font-bold uppercase tracking-widest text-zinc-500">Legacy Highscore</span>
            </div>
             <div id="game-score" className="text-3xl font-black font-mono">1,440</div>
             <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest mt-1">Flappy Cube (v1.0)</p>
          </div>

          {/* Dev Notes Widget */}
          <div className="dev-notes-widget glass-card reveal p-6" style={{ '--delay': '400ms' } as React.CSSProperties}>
             <div className="dev-notes-header flex items-center gap-2 mb-2">
                <StickyNote size={14} className="text-zinc-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Internal Memo</span>
             </div>
             <p className="text-xs text-zinc-600 leading-relaxed italic">"Refactoring to high-fidelity React components. System visual parity complete."</p>
          </div>
        </div>

        {/* Global CTA */}
        <div className="flex justify-center mt-24 reveal">
          <a 
            href="mailto:muhammadasadk42@gmail.com" 
            className="btn-primary magnetic group"
          >
            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            Ping Me &middot; muhammadasadk42@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}
