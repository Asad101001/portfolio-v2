import { useEffect, useState } from 'react';
import { Github, Linkedin, Mail, CheckCircle2, Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useReveal } from '../../hooks/useReveal';
import { useMagnetic } from '../../hooks/useMagnetic';
import { useActivityHub } from '../../hooks/useActivityHub';

export default function HeroSection() {
  const { typedText } = useTypewriter([
    "Building AI / LLM pipelines",
    "Deploying Cloud Architecture",
    "Designing Solution-oriented Apps",
    "Breaking things since 2024"
  ]);
  
  const activities = useActivityHub();
  useReveal();
  
  const githubRef = useMagnetic() as React.RefObject<HTMLAnchorElement>;
  const linkedinRef = useMagnetic() as React.RefObject<HTMLAnchorElement>;
  const contactRef = useMagnetic() as React.RefObject<HTMLAnchorElement>;

  const [activeSlot, setActiveSlot] = useState(0);
  const [time, setTime] = useState('');
  const [hourText, setHourText] = useState('--');
  const [status, setStatus] = useState('Checking...');
  const [clockDashoffset, setClockDashoffset] = useState(188.5);

  // Clock logic matching high-fidelity
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Calculate PKT (UTC+5)
      const pktOffset = 5 * 60; // 5 hours in minutes
      const localOffset = now.getTimezoneOffset(); // minutes
      const pktTime = new Date(now.getTime() + (pktOffset + localOffset) * 60000);

      const pct = (pktTime.getHours() * 3600 + pktTime.getMinutes() * 60 + pktTime.getSeconds()) / 86400;
      setClockDashoffset(188.5 - (188.5 * pct));
      setHourText(pktTime.getHours().toString().padStart(2, '0'));

      const timeStr = pktTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
      setTime(timeStr + ' PKT');

      const h = pktTime.getHours();
      if (h >= 2 && h < 10) {
        setStatus('Likely asleep 🌙');
      } else {
        setStatus('Active / Available ⚡');
      }
    };

    const interval = setInterval(updateClock, 1000);
    updateClock();
    return () => clearInterval(interval);
  }, []);

  // Activity Hub rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlot((prev) => (prev + 1) % activities.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activities.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as any
      }
    }
  };

  const snappyTransition = {
    type: "spring",
    stiffness: 400,
    damping: 10
  };

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center pt-24 pb-12 px-6">
      {/* Background Orbs */}
      <div className="hero-orb hero-orb-1" aria-hidden="true"></div>
      <div className="hero-orb hero-orb-2" aria-hidden="true"></div>
      <div className="hero-orb hero-orb-3" aria-hidden="true"></div>

      <motion.div 
        className="hero-grid max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Name Card with 3D Micro-Orb */}
        <motion.div 
          variants={itemVariants}
          className="hero-main glass-card md:col-span-8 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden"
        >
          <div className="status-pill mb-6">
            <span className="status-dot"></span>
            AVAILABLE FOR REVOLUTIONARY PROJECTS
          </div>

          <div className="hero-name-3d-wrap" aria-hidden="true">
            <div className="hero-micro-orb">
              <div className="hero-micro-orb-inner"></div>
              <div className="hero-micro-face"></div>
              <div className="hero-micro-face f2"></div>
              <div className="hero-micro-face f3"></div>
              <div className="hero-micro-ring"></div>
              <div className="hero-micro-dot"></div>
            </div>
          </div>

          <h1 className="hero-name text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-4">
            Muhammad<br />Asad Khan
          </h1>
          
          <div className="typewriter-wrap min-h-[1.5em] font-mono text-customCyan text-lg md:text-xl font-bold flex items-center">
            <span className="typewriter-text">{typedText}</span><span className="caret ml-1 w-2 h-6 bg-customCyan animate-pulse"></span>
          </div>

          <p className="hero-sub mt-4 text-customCyan/80 font-mono text-sm tracking-widest uppercase">CS Student @ UBIT '28</p>
          <p className="hero-desc mt-6 text-customTextMuted max-w-xl leading-relaxed">
            Crafting digital intelligence through Python, Cloud Infrastructure, and AI/ML. 
            Focused on building high-performance RAG systems and solution-oriented applications.
          </p>

          <div className="hero-actions mt-10 flex flex-wrap gap-4">
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={snappyTransition}
              ref={githubRef}
              href="https://github.com/Asad101001" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-mono text-xs uppercase tracking-widest font-bold hover:bg-white/10 transition-colors flex items-center gap-3"
            >
              <Github size={18} />
              GitHub
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={snappyTransition}
              ref={linkedinRef}
              href="https://www.linkedin.com/in/muhammadasadk/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-8 py-4 bg-[#0077b5]/10 border border-[#0077b5]/20 rounded-full font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#0077b5]/20 transition-colors text-[#0077b5] flex items-center gap-3"
            >
              <Linkedin size={18} />
              LinkedIn
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={snappyTransition}
              ref={contactRef}
              href="#contact" 
              className="px-8 py-4 bg-customCyan/10 border border-customCyan/20 rounded-full font-mono text-xs uppercase tracking-widest font-bold hover:bg-customCyan/20 transition-colors text-customCyan flex items-center gap-3"
            >
              <Mail size={18} />
              Contact
            </motion.a>
          </div>
        </motion.div>

        {/* Interactive Terminal */}
        <motion.div 
          variants={itemVariants}
          className="hero-side glass-card md:col-span-4 interactive-terminal group flex flex-col p-0 overflow-hidden"
        >
          <div className="terminal-bar p-3 bg-white/5 flex items-center gap-1.5 border-bottom border-white/5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
            <div className="flex items-center gap-2 ml-4 opacity-40">
              <TerminalIcon size={12} />
              <span className="text-[10px] font-mono tracking-wider">asad@nexus ~</span>
            </div>
          </div>
          <div className="terminal-body p-6 flex-grow font-mono text-sm overflow-y-auto">
            <div className="opacity-40 text-[10px] mb-4">Last login: {new Date().toDateString()} on ttys001</div>
            
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-customLime font-bold">➜</span>
                <span className="text-customCyan font-bold">~</span>
                <span className="text-white">whoami</span>
              </div>
              <div className="mt-1 text-white/90">Muhammad Asad Khan</div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-customLime font-bold">➜</span>
                <span className="text-customCyan font-bold">~</span>
                <span className="text-white">cat status.log</span>
              </div>
              <div className="mt-1 text-white/80 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-customLime" />
                  <span>CS Student @ UBIT '28</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-customLime" />
                  <span>Building AI Pipelines</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-customLime" />
                  <span>Cloud Native Enthusiast</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-customLime font-bold">➜</span>
                <span className="text-customCyan font-bold">~</span>
                <span className="text-white">echo $LOCATION</span>
              </div>
              <div className="mt-1 text-white/90">Karachi, Pakistan 🇵🇰</div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-customLime font-bold">➜</span>
              <span className="text-customCyan font-bold">~</span>
              <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-4 bg-customCyan"
              ></motion.span>
            </div>
          </div>
        </motion.div>

        {/* Activity Hub (Rotating Widget) */}
        <motion.div 
          variants={itemVariants}
          className="glass-card md:col-span-4 p-6 flex flex-col justify-between overflow-hidden relative group min-h-[160px]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <Sparkles size={40} className="text-customCyan" />
          </div>
          <p className="card-label text-[10px] uppercase font-bold tracking-[0.2em] text-customCyan/60 mb-4">Activity Hub</p>
          <div className="rotating-widget relative flex-grow flex items-center">
            <AnimatePresence mode="wait">
              {activities.map((item, i) => i === activeSlot && (
                <motion.div 
                  key={i} 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full flex flex-col justify-center"
                >
                  <span className="text-[10px] font-mono text-customCyan/50 uppercase tracking-widest mb-1">{item.label}</span>
                  <span className="text-white text-lg font-bold line-clamp-2 leading-tight">{item.value}</span>
                  {item.status && <span className="text-[10px] font-mono text-customLime/60 mt-2">{item.status}</span>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="rotating-dots flex gap-2 mt-4">
            {activities.map((_, i) => (
              <button 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${activeSlot === i ? 'bg-customCyan w-6' : 'bg-white/10 w-2 hover:bg-white/20'}`} 
                onClick={() => setActiveSlot(i)}
              />
            ))}
          </div>
        </motion.div>

        {/* Core Competencies Card */}
        <motion.div 
          variants={itemVariants}
          className="glass-card md:col-span-4 p-6 flex flex-col justify-between"
        >
          <p className="card-label text-[10px] uppercase font-bold tracking-[0.2em] text-customCyan/60 mb-4">Core Competencies</p>
          <div className="focus-list space-y-3 mt-2">
            {[
              "End-to-End AI Products",
              "RAG System Optimization",
              "Production Infrastructure"
            ].map((text, i) => (
              <motion.div 
                key={i} 
                whileHover={{ x: 5 }}
                className="focus-item flex items-center gap-3 text-sm text-white/70"
              >
                <CheckCircle2 size={16} className="text-customCyan shrink-0" />
                <span>{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Clock Widget */}
        <motion.div 
          variants={itemVariants}
          className="clock-widget glass-card md:col-span-4 p-6 flex items-center gap-6"
        >
          <div className="clock-face relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 64 64" className="w-full h-full rotate-[-90deg]">
              <circle cx="32" cy="32" r="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
              <motion.circle 
                cx="32" cy="32" r="30" 
                stroke="var(--cyan)" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeDasharray="188.5" 
                animate={{ strokeDashoffset: clockDashoffset }}
                transition={{ duration: 1, ease: "linear" }}
                fill="none"
              />
            </svg>
            <span className="clock-h-text absolute inset-0 flex items-center justify-center font-mono font-bold text-lg text-white">{hourText}</span>
          </div>
          <div className="clock-info">
            <div className="clock-time-label text-[10px] uppercase tracking-wider text-white/40 mb-1">Local Time</div>
            <div className="clock-prime-time text-2xl font-black text-white leading-none mb-1">{time}</div>
            <div className="clock-sub text-[10px] font-mono text-customCyan">{status}</div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] rotate-180 [writing-mode:vertical-lr]">Scroll</span>
        <div className="w-px h-12 bg-white/20 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 48] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-1/3 bg-customCyan shadow-[0_0_8px_var(--cyan)]"
          ></motion.div>
        </div>
      </div>
    </section>
  );
}

