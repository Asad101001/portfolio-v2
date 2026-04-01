import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Terminal, 
  Globe, 
  Cloud, 
  Database, 
  Cpu, 
  Layers, 
  Smartphone,
  Box,
  Braces,
  Coffee,
  DatabaseZap
} from 'lucide-react';
import ScrambleHeader from './ScrambleHeader';

const categories = [
  { id: 'ALL', label: 'All Modules' },
  { id: 'LANGS', label: 'Systems & Core' },
  { id: 'WEB', label: 'Web ecosystem' },
  { id: 'CLOUD', label: 'Infra & Cloud' },
  { id: 'AI', label: 'Intelligence' }
];

const domains = [
  {
    id: 'langs',
    cat: 'LANGS',
    label: 'Core Languages',
    desc: 'Systems-level logic and high-performance algorithms.',
    skills: [
      { name: 'Python', icon: Code2, color: '#3776AB' },
      { name: 'C++', icon: Box, color: '#00599C' },
      { name: 'C#', icon: Terminal, color: '#239120' },
      { name: 'Java', icon: Coffee, color: '#007396' },
      { name: 'Rust', icon: Cpu, color: '#DEA584' }
    ]
  },
  {
    id: 'web',
    cat: 'WEB',
    label: 'Modern Web',
    desc: 'Scalable frontend architectures and robust backend services.',
    skills: [
      { name: 'TS / JS', icon: Globe, color: '#F7DF1E' },
      { name: 'React', icon: Layers, color: '#61DAFB' },
      { name: 'Tailwind', icon: Layers, color: '#06B6D4' },
      { name: 'Node.js', icon: Globe, color: '#339933' },
      { name: 'Next.js', icon: Globe, color: '#fff' }
    ]
  },
  {
    id: 'cloud',
    cat: 'CLOUD',
    label: 'Cloud & DevOps',
    desc: 'Multi-cloud strategy, VPC networking, and containerization.',
    skills: [
      { name: 'AWS Merged', icon: Cloud, color: '#FF9900', isMerged: true },
      { name: 'Docker', icon: Box, color: '#2496ED' },
      { name: 'Nginx', icon: Terminal, color: '#009639' },
      { name: 'PostgreSQL', icon: DatabaseZap, color: '#336791' }
    ]
  },
  {
    id: 'ai',
    cat: 'AI',
    label: 'AI & Data',
    desc: 'RAG pipelines, vector databases, and predictive modeling.',
    skills: [
      { name: 'FastAPI', icon: Smartphone, color: '#009688' },
      { name: 'PyTorch', icon: Cpu, color: '#EE4C2C' },
      { name: 'Pandas', icon: Database, color: '#150458' },
      { name: 'FAISS', icon: Database, color: '#00ff41' },
      { name: 'LangChain', icon: Braces, color: '#00ff41' }
    ]
  }
];

export default function TechStackSection() {
  const [activeCat, setActiveCat] = useState('ALL');

  const filteredDomains = activeCat === 'ALL' 
    ? domains 
    : domains.filter(d => d.cat === activeCat);

  return (
    <section id="tech" className="py-24 relative overflow-hidden">
      <div className="section-inner max-w-7xl mx-auto px-6">
        <div className="section-header centered text-center mb-16">
          <p className="text-customCyan font-mono text-xs uppercase tracking-[0.4em] mb-2 font-bold">Arsenal</p>
          <ScrambleHeader text="Tech Stack" className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4" />
          <p className="text-customTextMuted max-w-2xl mx-auto italic">A versatile domain-driven technical foundation engineered for scale and performance.</p>
        </div>

        {/* Categories Bar - Mono style to match parity */}
        <div className="arsenal-filter-bar flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest font-bold transition-all border ${
                activeCat === cat.id 
                  ? 'bg-customCyan border-customCyan text-zinc-950 shadow-[0_0_20px_hsla(161,84%,39%,0.3)]' 
                  : 'bg-white/5 border-white/10 text-customTextMuted hover:border-white/20 hover:text-white'
              }`}
              onClick={() => setActiveCat(cat.id)}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Arsenal Grid */}
        <motion.div 
          layout
          className="arsenal-grid grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredDomains.map((domain) => (
              <motion.div 
                key={domain.id} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="arsenal-domain glass-card flex flex-col p-8 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl group hover:border-customCyan/30 transition-colors"
              >
                <div className="arsenal-domain-header mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-customCyan font-black text-[10px] uppercase tracking-[0.25em]">{domain.label}</span>
                    <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.1em]">{domain.skills.length} modules_active</span>
                  </div>
                  <p className="text-customTextMuted font-medium text-sm leading-relaxed">{domain.desc}</p>
                </div>
                
                <div className="arsenal-skill-grid flex flex-wrap gap-2.5 mt-auto">
                  {domain.skills.map((skill, si) => (
                    skill.isMerged ? (
                      <motion.div 
                        key={si}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="w-full mt-4 p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 group/merged hover:border-orange-500/50 transition-all flex flex-col gap-4 shadow-xl"
                      >
                         <div className="flex items-center gap-3">
                            <Cloud size={24} className="text-orange-500" />
                            <div className="flex flex-col">
                               <span className="text-[12px] font-black text-white uppercase tracking-widest font-mono">AWS Infrastructure</span>
                               <span className="text-[9px] font-mono text-orange-500/60 uppercase tracking-[0.2em] font-bold">Multi-Service Implementation</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-6 px-2 py-1 opacity-60 group-hover/merged:opacity-100 transition-opacity">
                            <Cloud size={16} className="text-orange-400" title="EC2" />
                            <Database size={16} className="text-orange-400" title="RDS" />
                            <Box size={16} className="text-orange-400" title="S3" />
                            <Layers size={16} className="text-orange-400" title="VPC" />
                         </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key={si}
                        whileHover={{ scale: 1.08, y: -2 }}
                        className="group/chip flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-customCyan/40 transition-all cursor-default shadow-lg"
                      >
                        <skill.icon size={15} style={{ color: skill.color }} className="transition-transform group-hover/chip:rotate-12 filter drop-shadow-[0_0_3px_currentColor]" />
                        <span className="text-[11px] font-mono font-black text-white/40 group-hover/chip:text-white transition-colors uppercase tracking-widest">
                           {skill.name}
                        </span>
                      </motion.div>
                    )
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.4 }}
          viewport={{ once: true }}
          className="tech-footer mt-24 px-4 py-8 border-t border-white/5 text-[10px] font-mono uppercase tracking-[0.4em] font-black flex flex-wrap gap-12 justify-center"
        >
           <span className="flex items-center gap-3 transition-colors hover:text-customCyan"><span className="w-2 h-2 rounded-full bg-customCyan shadow-[0_0_10px_var(--cyan)] pulse-dot"></span> Cloud Specialist</span>
           <span className="flex items-center gap-3 transition-colors hover:text-customCyan"><span className="w-2 h-2 rounded-full bg-customCyan shadow-[0_0_10px_var(--cyan)] pulse-dot"></span> Data Pioneer</span>
           <span className="flex items-center gap-3 transition-colors hover:text-customCyan"><span className="w-2 h-2 rounded-full bg-customCyan shadow-[0_0_10px_var(--cyan)] pulse-dot"></span> Core Systems</span>
        </motion.div>
      </div>
    </section>
  );
}
