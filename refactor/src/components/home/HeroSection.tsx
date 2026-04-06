import { useEffect, useState } from 'react'
import { useTypewriter } from '../../hooks/useTypewriter'

const activityItems = [
  { label: 'Current Book', value: 'Daughter of the Empire' },
  { label: 'Last Watched', value: 'Blade Runner 2049' },
  { label: 'Watching Series', value: 'Severance' },
  { label: 'Watching Football', value: 'FC Barcelona' },
]

export default function HeroSection() {
  const { typedText } = useTypewriter([
    'Building AI / LLM pipeline',
    'Deploying Cloud Architecture',
    'Designing Solution-oriented Apps',
    'Breaking things since 2024',
  ])

  const [activeSlot, setActiveSlot] = useState(0)
  const [time, setTime] = useState('--:-- PKT')
  const [hourText, setHourText] = useState('--')
  const [status, setStatus] = useState('Checking...')
  const [clockDashoffset, setClockDashoffset] = useState(188.5)

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const pct = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400
      setClockDashoffset(188.5 - 188.5 * pct)

      const timeOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }

      const timeStr = new Intl.DateTimeFormat('en-US', timeOptions).format(now)
      const hour = Number.parseInt(timeStr.slice(0, 2), 10)
      setHourText(hour.toString().padStart(2, '0'))
      setTime(`${timeStr} PKT`)
      setStatus(hour >= 2 && hour < 10 ? 'Likely asleep 🌙' : 'Active / Available ⚡')
    }

    const interval = window.setInterval(updateClock, 1000)
    updateClock()
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlot((prev) => (prev + 1) % activityItems.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <section id="hero">
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      <div className="hero-grid">
        <div className="card hero-main glass-card reveal" style={{ '--delay': '0ms' } as React.CSSProperties}>
          <div className="status-pill">
            <span className="status-dot" />
            Building &amp; exploring
          </div>

          <div className="hero-name-3d-wrap" aria-hidden="true">
            <div className="hero-micro-orb">
              <div className="hero-micro-orb-inner" />
              <div className="hero-micro-face" />
              <div className="hero-micro-face f2" />
              <div className="hero-micro-face f3" />
              <div className="hero-micro-ring" />
              <div className="hero-micro-dot" />
            </div>
          </div>

          <h1 className="hero-name">Muhammad<br />Asad Khan</h1>
          <div className="typewriter-wrap">
            <span className="typewriter-text">{typedText}</span><span className="caret">|</span>
          </div>

          <p className="hero-sub">CS Student @ UBIT '28</p>
          <p className="hero-desc">Python &middot; AWS &middot; Data Science &middot; AI/ML &middot; Networking</p>

          <div className="hero-actions">
            <a href="https://github.com/Asad101001" target="_blank" rel="noopener noreferrer" className="btn-primary magnetic">GitHub</a>
            <a href="https://www.linkedin.com/in/muhammadasadk/" target="_blank" rel="noopener noreferrer" className="btn-linkedin magnetic">LinkedIn</a>
            <a href="mailto:muhammadasadk42@gmail.com" className="btn-secondary magnetic">Contact Me</a>
          </div>
        </div>

        <div className="card hero-side glass-card reveal" style={{ '--delay': '100ms' } as React.CSSProperties}>
          <div className="terminal-bar">
            <span className="t-dot t-red" />
            <span className="t-dot t-yellow" />
            <span className="t-dot t-green" />
            <span className="t-title">asad@2006 ~</span>
          </div>
          <div className="terminal-body">
            <div className="terminal-meta">Last login: {new Date().toDateString()} from 192.168.1.1</div>
            <p className="t-line"><span className="t-prompt">asad@2006:~$</span> <span className="t-cmd">whoami</span></p>
            <p className="t-line t-out">Muhammad Asad Khan</p>
            <p className="t-line"><span className="t-prompt">asad@2006:~$</span> <span className="t-cmd">cat focus.txt</span></p>
            <p className="t-line t-out">Python &middot; OOP &middot; Data Science</p>
            <p className="t-line t-out">Cloud (AWS) &middot; AI &middot; RAG</p>
            <p className="t-line"><span className="t-prompt">asad@2006:~$</span> <span className="t-cmd">echo $LOCATION</span></p>
            <p className="t-line t-out">Karachi, Pakistan 🇵🇰</p>
            <p className="t-line t-out" style={{ color: 'var(--cyan)' }}>🟢 Open to collabs &amp; internships</p>
            <p className="t-line"><span className="t-prompt">asad@2006:~$</span> <span className="t-cursor">▮</span></p>
          </div>
        </div>

        <div className="card currently-into-card glass-card reveal" style={{ '--delay': '200ms' } as React.CSSProperties}>
          <p className="card-label">Activity Hub</p>
          <div className="rotating-widget">
            {activityItems.map((item, i) => (
              <div key={item.label} className={`rotating-item currently-into-item ${i === activeSlot ? 'active' : ''}`}>
                <div className="currently-into-thumb-placeholder">{i === 0 ? '📖' : i === 1 ? '🎬' : i === 2 ? '📺' : '⚽'}</div>
                <div className="currently-into-text">
                  <span className="rotating-label currently-into-label">{item.label}</span>
                  <span className="rotating-value currently-into-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="rotating-dots">
            {activityItems.map((item, i) => (
              <button key={item.label} className={`r-dot ${i === activeSlot ? 'active' : ''}`} onClick={() => setActiveSlot(i)} />
            ))}
          </div>
        </div>

        <div className="card glass-card reveal" style={{ '--delay': '300ms' } as React.CSSProperties}>
          <p className="card-label">Build Focus</p>
          <div className="focus-list">
            <div className="focus-item">Solution-oriented Projects</div>
            <div className="focus-item">AI Integration &amp; RAG Systems</div>
            <div className="focus-item">Cloud Architecture (AWS)</div>
          </div>
        </div>

        <div className="clock-widget glass-card reveal" style={{ '--delay': '400ms' } as React.CSSProperties}>
          <div className="clock-face">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <circle
                cx="32"
                cy="32"
                r="30"
                stroke="var(--cyan)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="188.5"
                strokeDashoffset={clockDashoffset}
                transform="rotate(-90 32 32)"
              />
              <text x="32" y="38" textAnchor="middle" fill="white" fontFamily="Space Grotesk, sans-serif" fontSize="14" fontWeight="800">{hourText}</text>
            </svg>
            <div className="clock-label">PKT</div>
          </div>
          <div className="clock-info">
            <div className="clock-time-label">Current local time</div>
            <div className="clock-prime-time">{time}</div>
            <div className="clock-sub">{status}</div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator" id="scroll-indicator">
        <span className="scroll-indicator-text">scroll</span>
        <div className="scroll-indicator-line" />
      </div>
    </section>
  )
}
