import { useState, useEffect } from 'react'
import type { MouseEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Palette, Sun, Zap, Leaf } from 'lucide-react'
import { useMagnetic } from '../../hooks/useMagnetic'
import type { Theme } from '../../hooks/useTheme'

const themes: { id: Theme; name: string; icon: React.ReactNode }[] = [
  { id: 'cyberpunk', name: 'Cyberpunk', icon: <Zap size={14} /> },
  { id: 'sunset', name: 'Sunset', icon: <Sun size={14} /> },
  { id: 'industrial', name: 'Industrial', icon: <Zap size={14} /> },
  { id: 'emerald', name: 'Emerald', icon: <Leaf size={14} /> }
]

const navLinks = [
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'Experience', href: '#experience' },
  { name: 'Certifications', href: '#certifications' },
  { name: 'Arsenal', href: '#tech' },
  { name: 'Contact', href: '#contact' }
]

interface NavbarProps {
  activeTheme: Theme;
  setActiveTheme: (theme: Theme) => void;
  rotateTheme: () => void;
}

export default function Navbar({ activeTheme, setActiveTheme, rotateTheme }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  
  const themeBtnRef = useMagnetic<HTMLButtonElement>();
  const ctaRef = useMagnetic<HTMLAnchorElement>();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={isScrolled ? 'nav-scrolled' : ''}>
      <div className="nav-inner">
        {/* Logo */}
        <a href="/" className="nav-brand">
           ASAD<span style={{ color: 'var(--cyan)' }}>.DEV</span>
        </a>

        {/* Desktop Nav */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href}>{link.name}</a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggle Wrapper */}
          <div style={{ position: 'relative' }}>
            <button 
              ref={themeBtnRef}
              onClick={rotateTheme}
              onContextMenu={(e: MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setIsThemeOpen(!isThemeOpen); }}
              className="magnetic"
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)'
              }}
              title="Click to rotate, Right-click to list"
            >
              <Palette size={16} />
            </button>
            <AnimatePresence>
              {isThemeOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: '180px', background: '#0D0D0D', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '4px', padding: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', zIndex: 100
                  }}
                >
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTheme(t.id);
                        setIsThemeOpen(false);
                      }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', border: 'none',
                        background: activeTheme === t.id ? 'var(--surface)' : 'transparent', color: activeTheme === t.id ? 'var(--text)' : 'var(--text-muted)'
                      }}
                    >
                      {t.icon}
                      {t.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a ref={ctaRef} href="#projects" className="nav-cta hidden md:inline-flex">View Work</a>

          <div className="mobile-nav">
             <button 
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer'}}
             >
               {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
             </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
         {isMenuOpen && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="mobile-dropdown"
             style={{ position: 'fixed', top: '70px', left: '16px', right: '16px', display: 'flex', flexDirection: 'column' }}
           >
             {navLinks.map((link) => (
               <a key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)}>
                 {link.name}
               </a>
             ))}
           </motion.div>
         )}
      </AnimatePresence>
    </nav>
  )
}
