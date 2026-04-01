import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Github, 
  Code2, 
  BarChart3, 
  Activity, 
  Eye, 
  Server
} from 'lucide-react';

const projects = [
  {
    id: 'legaleaseai',
    title: 'LegalEaseAI',
    desc: 'Upload contracts for rapid AI risk-rating. Provides plain Urdu explanations, a RAG-powered document chatbot, and downloadable PDF reports.',
    link: 'https://legal-ease-ai-iota.vercel.app/',
    repo: 'https://github.com/Asad101001/LegalEaseAI',
    image: './images/projects/legalease.png',
    icon: Code2,
    color: 'hsl(161, 84%, 39%)',
    tags: ['FastAPI', 'LangChain', 'FAISS', 'RAG']
  },
  {
    id: 'pollpulse',
    title: 'PollPulse',
    desc: 'Real-time polling platform built on AWS. Features a custom VPC with EC2 and RDS MySQL isolation. Delivers live data visualization via Chart.js.',
    repo: 'https://github.com/Asad101001/pollpulse',
    image: './images/projects/pollpulse.png',
    icon: BarChart3,
    color: 'hsl(271, 91%, 65%)',
    tags: ['Node.js', 'AWS', 'MySQL', 'Chart.js']
  },
  {
    id: 'devpulse',
    title: 'DevPulse',
    desc: 'A developer telemetry dashboard. Analyzes commit narratives to calculate cognitive load using Llama 3.3. Built with an industrial aesthetic.',
    link: 'https://devpulse-app.onrender.com',
    repo: 'https://github.com/Asad101001/devpulse',
    image: './images/projects/devpulse.png',
    icon: Activity,
    color: 'hsl(54, 100%, 50%)',
    tags: ['React', 'Express', 'Llama 3.3', 'MongoDB']
  },
  {
    id: 'mogscope',
    title: 'Mogscope',
    desc: 'Facial analytics platform using face-api.js for landmarks. Combines ML insights with LLM-generated satirical analysis.',
    link: 'https://mogscope.vercel.app/',
    repo: 'https://github.com/Asad101001/mogscope',
    image: './images/projects/mogscope.png',
    icon: Eye,
    color: 'hsl(231, 89%, 71%)',
    tags: ['React', 'Three.js', 'TensorFlow', 'Groq']
  },
  {
    id: 'aws-hosting',
    title: 'AWS Static Website',
    desc: 'Cloud hosting infrastructure project. Manual provisioning of Ubuntu EC2 instances with Nginx configuration and SSH hardening.',
    repo: 'https://github.com/Asad101001/aws-static-website',
    image: './images/projects/aws.png',
    icon: Server,
    color: 'hsl(35, 100%, 50%)',
    tags: ['AWS', 'Nginx', 'Ubuntu', 'SSH']
  }
];

export default function ProjectsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as any
      }
    }
  };

  return (
    <section id="projects" className="py-24">
      <div className="section-inner max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="section-header flex justify-between items-end mb-12"
        >
          <div>
            <p className="text-customCyan font-mono text-xs uppercase tracking-widest mb-2">Selected Work</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Projects</h2>
          </div>
          <motion.a 
            whileHover={{ x: 5 }}
            href="https://github.com/Asad101001" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-customTextMuted hover:text-white transition-colors font-mono text-xs mb-2"
          >
            All Repositories ↗
          </motion.a>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="projects-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
        >
          {projects.map((project) => (
            <motion.div 
              key={project.id} 
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className={`project-card glass-card relative overflow-hidden group border border-white/5 bg-zinc-900/50 backdrop-blur-xl rounded-md transition-all duration-500`}
            >
              <div className="proj-img-wrap relative h-56 overflow-hidden border-b border-white/5">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="proj-img w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-0"
                  onLoad={(e: any) => e.currentTarget.classList.remove('opacity-0')}
                  onError={(e: any) => { e.currentTarget.classList.add('hidden'); e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                />
                <div className="proj-img-placeholder hidden h-full w-full bg-zinc-900/50 flex items-center justify-center">
                   <span className="text-[10px] font-mono font-bold text-white/10 uppercase tracking-widest">Image Data Offline</span>
                </div>
                <div className="proj-img-overlay absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent"></div>
                <div className="proj-badge absolute top-4 right-4 bg-customCyan/10 border border-customCyan/20 text-customCyan text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                  Live Active
                </div>
              </div>

              <div className="proj-body p-8">
                <div className="proj-head flex items-center gap-4 mb-6">
                   <div 
                     className="proj-icon p-3 rounded-xl" 
                     style={{ background: `${project.color}20`, color: project.color }}
                   >
                     <project.icon size={24} />
                   </div>
                   <div className="flex flex-col">
                     <h3 className="text-xl font-bold text-white group-hover:text-customCyan transition-colors">{project.title}</h3>
                     <span className="text-[10px] font-mono text-customCyan/40 uppercase tracking-widest">System Integrated</span>
                   </div>
                </div>
                
                <p className="text-sm text-customTextMuted leading-relaxed mb-8 h-12 line-clamp-2">
                  {project.desc}
                </p>
                
                <div className="proj-tags flex flex-wrap gap-2 mb-8">
                  {project.tags.map(tag => (
                     <span key={tag} className="px-3 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-white/50 uppercase">
                       {tag}
                     </span>
                  ))}
                </div>

                <div className="proj-links flex gap-4 pt-6 border-t border-white/5 mt-auto">
                  <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={project.repo} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors"
                  >
                    <Github size={14} />
                    Source
                  </motion.a>
                  {project.link && (
                    <motion.a 
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 text-xs font-bold text-customCyan"
                    >
                      <ExternalLink size={14} />
                      Launch Demo
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
