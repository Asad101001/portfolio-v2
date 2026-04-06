type Project = {
  id: string
  title: string
  desc: string
  image: string
  demo?: string
  repo: string
  details: string
  gradient: string
  accent: string
  tags: string[]
}

const projects: Project[] = [
  {
    id: 'legaleaseai',
    title: 'LegalEaseAI',
    desc: 'Upload contracts for rapid AI risk-rating. Provides plain Urdu explanations, a RAG-powered document chatbot, and downloadable PDF reports. Powered by FastAPI and LangChain.',
    image: './images/projects/legalease.png',
    demo: 'https://legal-ease-ai-iota.vercel.app/',
    repo: 'https://github.com/Asad101001/LegalEaseAI',
    details: '/projects/legaleaseai.html',
    gradient: 'linear-gradient(135deg,#00ff4118,#18181b)',
    accent: 'var(--cyan)',
    tags: ['ES6+ Vanilla JS', 'LangChain', 'FAISS', 'RAG', 'FastAPI', 'Python'],
  },
  {
    id: 'pollpulse',
    title: 'PollPulse',
    desc: 'Real-time polling platform built on AWS. Features a custom VPC with EC2 and RDS MySQL isolation. Delivers live data visualization via Chart.js and secure Node.js authentication.',
    image: './images/projects/pollpulse.png',
    repo: 'https://github.com/Asad101001/pollpulse',
    details: '/projects/pollpulse.html',
    gradient: 'linear-gradient(135deg,#a855f720,#18181b)',
    accent: '#a855f7',
    tags: ['Node.js', 'Express', 'AWS', 'MySQL', 'Chart.js'],
  },
  {
    id: 'devpulse',
    title: 'DevPulse',
    desc: 'A developer telemetry dashboard. Analyzes commit narratives to calculate cognitive load using Llama 3.3. Built with an industrial aesthetic using React, Express, and MongoDB Atlas.',
    image: './images/projects/devpulse.png',
    demo: 'https://devpulse-app.onrender.com',
    repo: 'https://github.com/Asad101001/devpulse',
    details: '/projects/devpulse.html',
    gradient: 'linear-gradient(135deg,#FFD60018,#18181b)',
    accent: '#FFD600',
    tags: ['React', 'Express 5', 'Llama 3.3', 'MongoDB Atlas', 'Recharts'],
  },
  {
    id: 'mogscope',
    title: 'Mogscope',
    desc: 'Facial analytics platform using face-api.js for 68-point landmark detection. Combines ML insights with LLM-generated satirical analysis and voice synthesis.',
    image: './images/projects/mogscope.png',
    demo: 'https://mogscope.vercel.app/',
    repo: 'https://github.com/Asad101001/mogscope',
    details: '/projects/mogscope.html',
    gradient: 'linear-gradient(135deg,#6366f118,#18181b)',
    accent: '#818cf8',
    tags: ['React', 'face-api.js', 'LLM', 'Web Speech API'],
  },
]

export default function ProjectsSection() {
  return (
    <>
      <div className="section-divider" />
      <section id="projects" className="section-in">
        <div className="ambient-glow" />
        <div className="section-inner">
          <div className="section-header">
            <div>
              <p className="label-xs">Work</p>
              <h2 className="section-title">Projects</h2>
            </div>
            <a href="https://github.com/Asad101001?tab=repositories" target="_blank" rel="noopener noreferrer" className="view-all-link">
              All Repositories
            </a>
          </div>

          <div className="projects-grid stagger">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card glass-card reveal"
                onClick={(e: any) => {
                  const target = e.target as HTMLElement
                  if (!target.closest('a')) window.location.href = project.details
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="proj-img-wrap" style={{ background: project.gradient }}>
                  <img src={project.image} alt={`${project.title} screenshot`} className="proj-img" />
                  <div className="proj-img-overlay" />
                </div>

                <a
                  href={project.details}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: `linear-gradient(90deg, ${project.accent}33, transparent)`,
                    padding: '8px 16px',
                    borderBottom: `1px solid ${project.accent}22`,
                    borderTop: `1px solid ${project.accent}11`,
                    color: project.accent,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                 
                >
                  <span style={{ fontSize: '1rem' }}>🔍</span> View More Details
                </a>

                <div className="proj-body">
                  <div className="proj-head">
                    <div className="proj-icon" style={{ color: project.accent, background: `${project.accent}22` }}>◆</div>
                    <div>
                      <h3 className="proj-title">{project.title}</h3>
                      <p className="proj-live">
                        {project.demo ? (
                          <a href={project.demo} target="_blank" rel="noopener noreferrer">{new URL(project.demo).host} ↗</a>
                        ) : (
                          <span style={{ color: '#71717a' }}>Cloud-Deployed Capstone</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="proj-desc">{project.desc}</p>

                  <div className="proj-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="tag"><span className="tag-label">{tag}</span></span>
                    ))}
                  </div>

                  <div className="proj-links">
                    <a href={project.repo} target="_blank" rel="noopener noreferrer" className="proj-link-code">
                      Code
                    </a>
                    {project.demo && (
                      <a href={project.demo} target="_blank" rel="noopener noreferrer" className="proj-link-demo">
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
