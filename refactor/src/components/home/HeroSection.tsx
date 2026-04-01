import { useEffect, useState } from 'react';
import { Github, Linkedin, Mail, CheckCircle2, Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useReveal } from '../../hooks/useReveal';
import { useMagnetic } from '../../hooks/useMagnetic';

export default function HeroSection() {
  const { typedText } = useTypewriter([
    "Building AI / LLM pipeline",
    "Deploying Cloud Architecture",
    "Designing Solution-oriented Apps",
    "Breaking things since 2024"
  ]);
  
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
      const pct = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
      setClockDashoffset(188.5 - (188.5 * pct));
      setHourText(now.getHours().toString().padStart(2, '0'));

      const timeOptions: Intl.DateTimeFormatOptions = { 
        timeZone: 'Asia/Karachi', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      };
      const timeStr = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
      setTime(timeStr + ' PKT');

      const h = parseInt(timeStr.substring(0, 2), 10);
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
      setActiveSlot((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
        ease: [0.16, 1, 0.3, 1] as any // Cinematic out-expo
      }
    }
  };

  const snappyTransition = {
    type: "spring",
    stiffness: 400,
    damping: 10
  };

  return (
    <section id="hero">
      {/* Background Orbs */}
      <div className="hero-orb hero-orb-1" aria-hidden="true"></div>
      <div className="hero-orb hero-orb-2" aria-hidden="true"></div>
      <div className="hero-orb hero-orb-3" aria-hidden="true"></div>

      <motion.div 
        className="hero-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Name Card with 3D Micro-Orb */}
        <motion.div 
          variants={itemVariants}
          className="hero-main glass-card"
        >
          <div className="status-pill">
            <span className="status-dot"></span>
            BUILDING & EXPLORING
          </div>

          <div className="hero-micro-orb-wrap" aria-hidden="true">
            <motion.div 
              className="hero-micro-orb"
              animate={{ rotateY: 360, rotateX: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="hero-micro-orb-inner"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`hero-micro-face f${i+1}`}></div>
              ))}
              <div className="hero-micro-ring"></div>
              <div className="hero-micro-dot"></div>
            </motion.div>
          </div>

          <h1 className="hero-name">Muhammad<br />Asad Khan</h1>
          
          <div className="typewriter-wrap">
            <span className="typewriter-text">{typedText}</span><span className="caret">|</span>
          </div>

          <p className="hero-sub mt-2 text-customCyan/80 font-medium">CS Student @ UBIT '28</p>
          <p className="hero-desc mt-4">Python &bull; AWS &bull; Data Science &bull; AI/ML &bull; Networking</p>

          <div className="hero-actions">
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={snappyTransition}
              ref={githubRef}
              href="https://github.com/Asad101001" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary magnetic group"
            >
              <Github size={18} className="group-hover:rotate-12 transition-transform" />
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
              className="btn-linkedin magnetic group"
            >
              <Linkedin size={18} className="group-hover:-rotate-12 transition-transform" />
              LinkedIn
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={snappyTransition}
              ref={contactRef}
              href="#contact" 
              className="btn-secondary magnetic"
            >
              <Mail size={18} />
              Contact Me
            </motion.a>
          </div>
        </motion.div>

        {/* Interactive Terminal */}
        <motion.div 
          variants={itemVariants}
          className="hero-side glass-card interactive-terminal group"
        >
          <div className="terminal-bar">
            <span className="t-dot t-red"></span>
            <span className="t-dot t-yellow"></span>
            <span className="t-dot t-green"></span>
            <div className="flex items-center gap-2 ml-2 opacity-40">
              <TerminalIcon size={12} />
              <span className="t-title">asad@2006 ~</span>
            </div>
          </div>
          <div className="terminal-body font-mono">
            <div className="t-line t-visible opacity-40 text-[10px]">Last login: {new Date().toDateString()} on ttys001</div>
            <div className="t-line t-visible mt-2">
              <span className="t-prompt text-customCyan">asad@2006:~$</span> <span className="t-cmd">whoami</span>
            </div>
            <div className="t-line t-out t-visible text-white/90">Muhammad Asad Khan</div>
            <div className="t-line t-visible mt-2">
              <span className="t-prompt text-customCyan">asad@2006:~$</span> <span className="t-cmd">cat focus.txt</span>
            </div>
            <div className="t-line t-out t-visible text-white/80">
              <span className="text-customLime">✓</span> Python &bull; AI/ML &bull; Cloud Architecture<br/>
              <span className="text-customLime">✓</span> RAG Systems &bull; High-Fidelity Design
            </div>
            <div className="t-line t-visible mt-2">
              <span className="t-prompt text-customCyan">asad@2006:~$</span> <span className="t-cmd">echo $LOCATION</span>
            </div>
            <div className="t-line t-out t-visible text-white/90">Karachi, Pakistan 🇵🇰</div>
            
            <div className="terminal-input-row">
              <span className="t-prompt text-customCyan">asad@2006:~$</span>
              <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="t-cursor inline-block w-2 h-4 bg-customCyan ml-1 align-middle"
              ></motion.span>
            </div>
          </div>
        </motion.div>

        {/* Activity Hub (Rotating Widget) */}
        <motion.div 
          variants={itemVariants}
          className="glass-card flex flex-col justify-between overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <Sparkles size={40} className="text-customCyan" />
          </div>
          <p className="card-label">Activity Hub</p>
          <div className="rotating-widget py-4">
            <AnimatePresence mode="wait">
              {[
                { label: 'Deep Work Mode', value: 'Enabled (Focus 100%)' },
                { label: 'Current Favorite', value: 'Daughter of the Empire' },
                { label: 'Watching Series', value: 'Severance' },
                { label: 'Favorite Club', value: 'FC Barcelona' }
              ].map((item, i) => i === activeSlot && (
                <motion.div 
                  key={i} 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="rotating-item active"
                >
                  <span className="rotating-label text-customCyan/60">{item.label}</span>
                  <span className="rotating-value text-white text-lg font-bold">{item.value}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="rotating-dots flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <button 
                key={i} 
                className={`r-dot transition-all ${activeSlot === i ? 'active w-6' : 'w-2 hover:bg-white/20'}`} 
                onClick={() => setActiveSlot(i)}
              />
            ))}
          </div>
        </motion.div>

        {/* Build Focus Card */}
        <motion.div 
          variants={itemVariants}
          className="glass-card flex flex-col justify-between"
        >
          <p className="card-label">Build Focus</p>
          <div className="focus-list space-y-3 mt-4">
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
          className="clock-widget glass-card"
        >
          <div className="clock-face relative">
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
            <span className="clock-h-text absolute inset-0 flex items-center justify-center font-bold text-xl">{hourText}</span>
          </div>
          <div className="clock-info">
            <div className="clock-time-label text-[10px] uppercase tracking-wider opacity-60">Current local time</div>
            <div className="clock-prime-time text-2xl font-black text-white">{time}</div>
            <div className="clock-sub text-xs font-mono text-customCyan/80">{status}</div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <span className="scroll-indicator-text">Scroll</span>
        <div className="scroll-indicator-line"></div>
      </div>
    </section>
  );
}
