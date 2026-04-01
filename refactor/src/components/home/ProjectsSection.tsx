import { motion } from 'framer-motion';
import { Github, ExternalLink, Gavel, BarChart3, Activity, Eye, Cloud } from 'lucide-react';
import { useReveal } from '../../hooks/useReveal';
import ScrambleHeader from './ScrambleHeader';

const projects = [
  {
    title: "LegalEaseAI",
    desc: "Upload contracts for rapid AI risk-rating. Provides plain Urdu explanations and a RAG-powered document chatbot.",
    tech: ["Python", "LangChain", "FAISS", "FastAPI", "React"],
    github: "https://github.com/Asad101001/LegalEaseAI",
    demo: "https://legal-ease-ai-iota.vercel.app/",
    icon: <Gavel size={20} />,
    color: "#00ff41"
  },
  {
    title: "PollPulse",
    desc: "Real-time polling platform built on AWS. Features a custom VPC with EC2 and RDS MySQL isolation.",
    tech: ["Node.js", "Express", "AWS", "MySQL", "Chart.js"],
    github: "https://github.com/Asad101001/pollpulse",
    icon: <BarChart3 size={20} />,
    color: "#a855f7"
  },
  {
    title: "DevPulse",
    desc: "Developer telemetry dashboard analyzing commit narratives with Llama 3.3 to calculate cognitive load.",
    tech: ["React", "Express", "MongoDB", "Groq AI", "Framer"],
    github: "https://github.com/Asad101001/devpulse",
    demo: "https://devpulse-app.onrender.com",
    icon: <Activity size={20} />,
    color: "#FFD600"
  },
  {
    title: "Mogscope",
    desc: "Facial analytics platform using face-api.js for 68-point landmark detection and AI-satirical analysis.",
    tech: ["React", "Threejs", "Tailwind", "TensorFlow", "Groq"],
    github: "https://github.com/Asad101001/mogscope",
    demo: "https://mogscope.vercel.app/",
    icon: <Eye size={20} />,
    color: "#6366f1"
  },
  {
    title: "AWS Infrastructure",
    desc: "Manual provisioning of Ubuntu EC2 instances with Nginx configuration and SSH hardening.",
    tech: ["AWS", "Ubuntu", "Nginx", "Vanilla JS"],
    github: "https://github.com/Asad101001/aws-static-website",
    icon: <Cloud size={20} />,
    color: "#FF9900"
  }
];

export default function ProjectsSection() {
  useReveal();

  return (
    <section id="projects" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div className="flex flex-col">
            <p className="font-mono text-xs text-customCyan uppercase tracking-[0.3em] font-bold mb-2">Work</p>
            <ScrambleHeader text="Projects" className="text-4xl md:text-5xl font-black tracking-tighter text-white" />
          </div>
          <a 
            href="https://github.com/Asad101001?tab=repositories" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-xs font-mono text-customCyan hover:text-white transition-colors uppercase tracking-widest font-bold pb-2"
          >
            All Repositories <Github size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card group reveal overflow-hidden flex flex-col ${i === 4 ? 'lg:col-span-2 lg:mx-auto lg:max-w-2xl w-full' : ''}`}
            >
              {/* Project Image Placeholder */}
              <div className="relative h-48 bg-white/5 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700">
                  <div style={{ color: project.color }}>
                    {project.icon}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] to-transparent"></div>
                
                <div className="absolute top-4 left-4 p-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10" style={{ color: project.color }}>
                  {project.icon}
                </div>
              </div>

              <div className="p-6 flex flex-grow flex-col">
                <h3 className="text-xl font-bold mb-2 group-hover:text-customCyan transition-colors">{project.title}</h3>
                <p className="text-customTextMuted text-sm leading-relaxed mb-6 flex-grow">{project.desc}</p>
                
                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map(t => (
                    <span 
                      key={t}
                      className="tag px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-[10px] text-white/40 group-hover:border-customCyan/30 group-hover:text-customCyan/80 transition-all cursor-default"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-auto">
                  <a 
                    href={project.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    <Github size={14} /> Code
                  </a>
                  {project.demo && (
                    <a 
                      href={project.demo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-customCyan hover:text-white transition-colors"
                    >
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
