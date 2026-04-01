import { motion } from 'framer-motion';
import { Target, Award, Code2, Cpu, Cloud, Brain, TrendingUp } from 'lucide-react';
import GitHubHeatmap from './GitHubHeatmap';
import ScrambleHeader from './ScrambleHeader';
import { useTilt } from '../../hooks/useTilt';

interface StatCardProps {
  stat: {
    label: string;
    value: string;
    icon: React.ReactNode;
  };
  index: number;
  onClick?: () => void;
}

function StatCard({ stat, index, onClick }: StatCardProps) {
  const tiltRef = useTilt<HTMLDivElement>();
  
  return (
    <motion.div 
      ref={tiltRef}
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`glass-card p-6 flex items-center justify-between group cursor-pointer ${onClick ? 'hover:border-customCyan/50' : ''}`}
      onClick={onClick}
    >
      <div className="flex flex-col">
        <span className="text-3xl font-black text-white group-hover:text-customCyan transition-colors">{stat.value}</span>
        <span className="text-xs font-mono uppercase tracking-widest text-white/40 mt-1">{stat.label}</span>
      </div>
      <div className="p-3 bg-white/5 rounded-xl text-customCyan group-hover:bg-customCyan/10 transition-colors">
        {stat.icon}
      </div>
    </motion.div>
  );
}

export default function AboutSection() {
  const stats = [
    { label: 'Projects', value: '4+', icon: <TrendingUp size={18} /> },
    { label: 'Certifications', value: '6+', icon: <Award size={18} /> },
    { label: 'Technologies', value: '20+', icon: <Code2 size={18} /> }
  ];

  const exploring = [
    {
      title: "LLM Pipeline v2",
      desc: "Improving RAG chunking strategy with hybrid retrieval",
      pct: "30%",
      clr: "var(--cyan)",
      icon: <Brain size={16} />
    },
    {
      title: "Cloud Computing",
      desc: "NED University - EC2, S3, VPC, RDS & cloud architecture deep dives",
      pct: "95%",
      clr: "#FF9900",
      icon: <Cloud size={16} />
    },
    {
      title: "HEC GenAI Cohort 2",
      desc: "Working through RAG systems and AI ethics modules",
      pct: "85%",
      clr: "#a855f7",
      icon: <Cpu size={16} />
    }
  ];

  return (
    <section id="about" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col mb-12">
          <p className="font-mono text-xs text-customCyan uppercase tracking-[0.3em] font-bold mb-2">Who I Am</p>
          <ScrambleHeader text="About Me" className="text-4xl md:text-5xl font-black tracking-tighter text-white" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Bio Text */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8 glass-card p-8 md:p-10"
          >
            <div className="space-y-6 text-customTextMuted leading-relaxed text-lg">
              <p>
                I'm a Computer Science student at <span className="text-white font-semibold">UBIT, University of Karachi '28</span>, driven to explore
                every corner of CS before settling on a specialty. So far I've covered Cloud Computing,
                Networking, Web Dev, Data Science, Version Control, Project Management, Prompt Engineering,
                and AI — with lots more ahead.
              </p>
              <p>
                I learn by building. Every project is a live experiment — from AWS VPC architecture to
                RAG-powered LLM pipelines. My philosophy: <span className="text-customCyan font-medium italic">build broken things, understand why they broke,
                then spend ages unbreaking them.</span>
              </p>
            </div>
          </motion.div>

          {/* Stats Column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {stats.map((stat, i) => (
              <StatCard 
                key={stat.label} 
                stat={stat} 
                index={i} 
                onClick={stat.label === 'Certifications' ? () => {
                  const event = new CustomEvent('open-certs-drawer');
                  window.dispatchEvent(event);
                } : undefined}
              />
            ))}
          </div>
        </div>

        {/* Currently Exploring */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card mt-6 p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <Target size={18} className="text-customCyan" />
            <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Currently Exploring</h3>
            <div className="flex items-center gap-2 ml-auto">
              <span className="w-2 h-2 rounded-full bg-customLime animate-pulse"></span>
              <span className="text-[10px] font-mono text-customLime/60 uppercase font-bold">Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {exploring.map((item, i) => (
              <div key={i} className="flex flex-col group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all bg-white/5 group-hover:scale-110" style={{ color: item.clr }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-customCyan transition-colors">{item.title}</h4>
                    <p className="text-[11px] text-white/40 line-clamp-1">{item.desc}</p>
                  </div>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-auto">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: item.pct }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.2 }}
                    className="h-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: item.clr, color: item.clr } as React.CSSProperties}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* GitHub Activity Heatmap */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="glass-card mt-6 p-8"
        >
          <GitHubHeatmap />
        </motion.div>
      </div>
    </section>
  );
}
