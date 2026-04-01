import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Award, Code2, Database, LayoutPanelLeft, Cpu } from 'lucide-react';

const certifications = [
  { 
    title: 'Generative AI Application Developer (Top Performer)', 
    issuer: 'ULEFUSA - UETians Lahore Endowment Foundation USA', 
    date: 'Issued March 17, 2026', 
    id: 'f7b00764717b7670',
    skills: ['Python', 'Generative AI', 'LLMs / RAG', 'AWS', 'Prompt Engineering'],
    icon: <Cpu size={18} />,
    color: '#00ff41',
    img: '/certs/hec-genai.png',
    status: 'Completed'
  },
  { 
    title: 'Google Agile Essentials', 
    issuer: 'Google', 
    date: 'Issued Jan 2026', 
    id: '5RY1Q2E8VFGC',
    skills: ['Agile Methodology', 'Lean Methodologies', 'Agile Project Management'],
    icon: <LayoutPanelLeft size={18} />,
    color: '#4285F4',
    img: '/certs/google-agile.png',
    status: 'Completed'
  },
  { 
    title: 'Google AI Essentials', 
    issuer: 'Google', 
    date: 'Issued Dec 2025', 
    id: 'HY8VX0Q5HT0U',
    skills: ['AI / ML', 'NLP', 'Generative AI', 'Prompt Engineering', 'Use AI Responsibly'],
    icon: <Code2 size={18} />,
    color: '#FBBC05',
    img: '/certs/google-ai.png',
    status: 'Completed'
  },
  { 
    title: 'Google Prompting Essentials', 
    issuer: 'Google', 
    date: 'Issued Dec 2025', 
    id: 'ONHQG9H3H8EE',
    skills: ['Prompt Engineering', 'AI Tools', 'Responsible AI Use'],
    icon: <Code2 size={18} />,
    color: '#34A853',
    img: '/certs/google-prompt.png',
    status: 'Completed'
  },
  { 
    title: 'Certified Data Scientist', 
    issuer: 'NED University of Engineering & Technology', 
    date: 'Issued Nov 2024', 
    id: '25317',
    skills: ['Statistical Analysis', 'NumPy', 'Scikit-Learn', 'pandas', 'Matplotlib', 'R', 'Random Forest'],
    icon: <Database size={18} />,
    color: '#EA4335',
    img: '/certs/ned-ds.png',
    status: 'Completed'
  },
  { 
    title: 'Cloud Computing', 
    issuer: 'NED University of Engineering & Technology', 
    date: 'Ongoing', 
    id: 'Certificate pending',
    skills: ['AWS', 'Cloud Architecture', 'EC2 / S3 / RDS', 'VPC Networking', 'Linux'],
    icon: <Award size={18} />,
    color: '#FF9900',
    status: 'In Progress'
  }
];

export default function CertsDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = (e: any) => {
      if (e.detail?.open !== undefined) {
        setIsOpen(e.detail.open);
      } else {
        setIsOpen(true);
      }
    };

    window.addEventListener('openCerts', handleOpen);
    
    const handleHash = () => {
      if (window.location.hash === '#certifications') {
        setIsOpen(true);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();

    return () => {
      window.removeEventListener('openCerts', handleOpen);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (window.location.hash === '#certifications') {
        window.history.replaceState(null, '', ' ');
      }
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] cursor-pointer"
          />

          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#0D0D0D] border-l border-white/5 z-[201] shadow-[-20px_0_50px_rgba(0,0,0,0.8)] p-8 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-12">
               <div>
                 <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-customCyan font-bold mb-1">Credentials</p>
                 <h2 className="text-3xl font-black font-mono uppercase tracking-tighter text-white">Certifications</h2>
               </div>
               <button 
                 onClick={() => setIsOpen(false)}
                 className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all transform hover:rotate-90"
               >
                 <X size={20} />
               </button>
            </div>

            <div className="space-y-6">
              {certifications.map((cert, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-6 rounded-xl border ${cert.status === 'In Progress' ? 'border-dashed border-white/10 opacity-60' : 'border-white/5'} bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 transition-all group flex flex-col gap-4 relative overflow-hidden`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {cert.img ? (
                        <img 
                          src={cert.img} 
                          alt="" 
                          className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{ color: cert.color }}>{cert.icon}</div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest font-bold">{cert.issuer}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase tracking-widest font-bold ${cert.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500' : 'bg-customCyan/10 text-customCyan'}`}>
                          {cert.status}
                        </span>
                      </div>
                      <h3 className="text-sm md:text-base font-bold text-white group-hover:text-customCyan transition-colors leading-tight">{cert.title}</h3>
                      <p className="text-[10px] font-mono text-white/20 mt-2">{cert.date} &middot; ID {cert.id}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {cert.skills.map(s => (
                      <span key={s} className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/40 font-mono">
                        {s}
                      </span>
                    ))}
                  </div>

                  {cert.status !== 'In Progress' && (
                    <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all text-customCyan">
                      <ExternalLink size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-8 rounded-2xl border border-dashed border-white/10 text-center bg-white/[0.02]">
               <Award size={24} className="mx-auto mb-4 text-white/10" />
               <p className="text-xs text-white/30 font-mono italic leading-relaxed uppercase tracking-widest">
                 "Learning is a lifelong process. Continuous benchmarks incoming."
               </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
