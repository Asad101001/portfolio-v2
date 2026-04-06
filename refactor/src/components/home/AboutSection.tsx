import { useState, useEffect } from 'react'

function Counter({ target, duration = 1400 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easedProgress * target))
      if (progress < 1) window.requestAnimationFrame(step)
    }
    if (isVisible) window.requestAnimationFrame(step)
  }, [isVisible, target, duration])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.1 })

    const el = document.getElementById(`counter-${target}`)
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <span id={`counter-${target}`} className="stat-big">{count}+</span>
}

const wipActivities = [
  { title: 'LLM Pipeline v2', desc: 'Improving RAG chunking strategy with hybrid retrieval', pct: '30%', icon: '🧠', clr: 'var(--cyan)' },
  { title: 'Cloud Computing', desc: 'NED University - EC2, S3, VPC, RDS & cloud architecture deep dives', pct: '95%', icon: '☁️', clr: '#FF9900' },
  { title: 'HEC GenAI Cohort 2', desc: 'Working through RAG systems and AI ethics modules', pct: '85%', icon: '🤖', clr: '#a855f7' },
]

export default function AboutSection() {
  return (
    <>
      <div className="section-divider" />
      <section id="about" className="section-in">
        <div className="ambient-glow" />
        <div className="section-inner">
          <div className="section-header">
            <div>
              <p className="label-xs">Who I Am</p>
              <h2 className="section-title">About Me</h2>
            </div>
          </div>

          <div className="about-grid">
            <div className="about-text glass-card reveal">
              <p>
                I&apos;m a Computer Science student at UBIT, University of Karachi &apos;28, driven to explore
                every corner of CS before settling on a specialty. So far I&apos;ve covered Cloud Computing,
                Networking, Web Dev, Data Science, Version Control, Project Management, Prompt Engineering,
                and AI — with lots more ahead.
              </p>
              <p style={{ marginTop: '1rem' }}>
                I learn by building. Every project is a live experiment — from AWS VPC architecture to
                RAG-powered LLM pipelines. My philosophy: build broken things, understand why they broke,
                then spend ages unbreaking them.
              </p>
            </div>

            <div className="about-stats-col">
              {[4, 6, 20].map((target) => (
                <div key={target} className="about-stat-card glass-card reveal">
                  <Counter target={target} />
                  <p className="stat-lbl">
                    {target === 4 ? 'Projects' : target === 6 ? 'Certifications' : 'Technologies'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="working-on-wrap glass-card reveal" style={{ marginTop: '20px' }}>
            <div className="working-on-header">
              <span>Currently Exploring</span>
              <span className="working-on-pulse"><span />active</span>
            </div>
            <div className="working-on-grid stagger">
              {wipActivities.map((wip) => (
                <div key={wip.title} className="wip-card">
                  <div className="wip-icon" style={{ background: 'rgba(255,255,255,0.06)', color: wip.clr }}>{wip.icon}</div>
                  <div className="wip-info">
                    <p className="wip-title">{wip.title}</p>
                    <p className="wip-desc">{wip.desc}</p>
                  </div>
                  <div className="wip-bar-wrap">
                    <div className="wip-bar" style={{ '--pct': wip.pct, '--clr': wip.clr } as React.CSSProperties} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="github-widget reveal" style={{ marginTop: '20px' }}>
            <div className="github-widget-header">
              <span>GitHub Activity</span>
              <a href="https://github.com/Asad101001" target="_blank" rel="noopener noreferrer">@Asad101001 ↗</a>
            </div>
            <div className="commit-grid" />
            <div className="commit-grid-footer">
              <span>Loading contributions…</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
