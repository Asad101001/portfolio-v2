import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Github, ExternalLink, Zap } from 'lucide-react';
import { projectDetails } from '../data/projectDetails';
import { useReveal } from '../hooks/useReveal';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const project = slug ? projectDetails[slug] : null;
  useReveal();

  if (!project) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="pt-24 pb-24 px-6 max-w-5xl mx-auto relative z-10">
      {/* Ambient Glow */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]"
        style={{ background: `radial-gradient(circle at 50% 50%, ${project.color}, transparent 60%)` }}
      />

      {/* Return Link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <Link 
          to="/#projects" 
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] font-bold text-customCyan hover:text-white transition-all group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Return to Nexus
        </Link>
      </motion.div>

      {/* Hero Section */}
      <div className="glass-card p-8 md:p-16 mb-12 relative overflow-hidden group">
        <div 
            className="absolute top-0 left-0 w-full h-1 z-20 shadow-[0_0_10px_currentColor]" 
            style={{ backgroundColor: project.color, color: project.color }} 
        />
        
        <div className="text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4"
          >
            {project.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-mono text-sm md:text-base text-customCyan font-bold uppercase tracking-widest"
          >
            {project.subtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 group/img relative"
          >
            <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-75 opacity-50 group-hover/img:scale-90 transition-transform duration-1000" />
            <img 
              src={project.images[0].src} 
              alt={project.images[0].alt}
              className="w-full h-auto rounded-xl border border-white/10 shadow-2xl relative z-10"
            />
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Problem/Solution */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap size={18} className="text-customCyan" />
            <h3 className="font-bold text-white uppercase tracking-widest text-sm">The Problem & Solution</h3>
          </div>
          <p className="text-customTextMuted leading-relaxed">
            {project.problem}
          </p>
        </motion.div>

        {/* Key Features */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap size={18} className="text-customCyan" />
            <h3 className="font-bold text-white uppercase tracking-widest text-sm">Key Features</h3>
          </div>
          <ul className="space-y-4">
            {project.features.map((feature) => {
                const [title, body] = feature.split(':');
                return (
                    <li key={feature} className="flex gap-3 text-sm leading-relaxed group/feat">
                        <span className="text-customCyan font-bold shrink-0">➜</span>
                        <p className="text-customTextMuted font-medium">
                            <span className="text-white group-hover/feat:text-customCyan transition-colors">{title}:</span> {body}
                        </p>
                    </li>
                );
            })}
          </ul>
        </motion.div>

        {/* Technical Architecture */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="lg:col-span-2 glass-card p-8 overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-8">
            <Zap size={18} className="text-customCyan" />
            <h3 className="font-bold text-white uppercase tracking-widest text-sm">Technical Architecture & Stack</h3>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {project.tech.map((t) => (
                <div key={t.name} className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/5 rounded-xl hover:border-customCyan/30 transition-all cursor-default group/tech">
                    <span className="text-xs font-mono font-bold text-white/50 group-hover:text-customCyan transition-colors uppercase tracking-widest">{t.name}</span>
                </div>
            ))}
          </div>
        </motion.div>

        {/* Multi-Preview Sections if exist */}
        {project.images.length > 1 && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {project.images.slice(1).map((img) => (
                    <div key={img.src} className="glass-card p-6 bg-black/40">
                         {img.label && <p className="font-mono text-[10px] uppercase tracking-widest text-customCyan font-bold mb-4 text-center">{img.label}</p>}
                         <img src={img.src} alt={img.alt} className="w-full h-auto rounded-lg border border-white/5" />
                    </div>
                ))}
            </motion.div>
        )}
      </div>

      {/* Footer Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 flex flex-wrap items-center justify-center gap-4"
      >
        {project.demo && (
            <a 
              href={project.demo} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-3 px-10 py-5 bg-customCyan/10 border border-customCyan/30 text-customCyan rounded-full font-mono text-sm uppercase tracking-widest font-black hover:bg-customCyan/20 transition-all shadow-[0_0_20px_-10px_rgba(16,185,129,0.5)]"
            >
              <ExternalLink size={18} /> View Live App
            </a>
        )}
        <a 
          href={project.github} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/10 text-white/70 rounded-full font-mono text-sm uppercase tracking-widest font-black hover:bg-white/10 hover:text-white transition-all"
        >
          <Github size={18} /> GitHub Repo
        </a>
      </motion.div>
    </div>
  );
}
