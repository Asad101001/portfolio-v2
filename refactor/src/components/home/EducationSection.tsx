import { useReveal } from '../../hooks/useReveal';

const education = [
  {
    year: '2025 – Present',
    degree: 'B.S Computer Science',
    inst: 'Department of Computer Science UBIT, University of Karachi',
    logo: './images/institutions/ubit.jpg',
    color: 'var(--cyan)'
  },
  {
    year: '2023 – 2024',
    degree: 'Intermediate (Pre-Engineering)',
    inst: 'Govt. Degree Science/Commerce College, Gulshan Block 7',
    logo: './images/institutions/college.jpg',
    color: '#a855f7'
  },
  {
    year: '2009 – 2022',
    degree: 'Matric (SSC)',
    inst: 'Karachi Public School',
    logo: './images/institutions/kps.jpg',
    color: '#f97316'
  }
];

export default function EducationSection() {
  useReveal();

  return (
    <section id="education" className="section-in py-20 relative">
      <div className="section-header mb-12">
        <p className="label-xs text-xs font-mono uppercase tracking-[0.3em] text-customCyan mb-2">Background</p>
        <h2 className="section-title text-4xl font-bold">Education</h2>
      </div>

      <div className="timeline">
        {education.map((edu, i) => (
          <div key={i} className="timeline-item reveal" style={{ '--delay': `${i * 150}ms` } as React.CSSProperties}>
            {/* Timeline Dot */}
            <div 
              className="tl-dot"
              style={{ borderColor: edu.color, boxShadow: `0 0 10px ${edu.color}60` }}
            ></div>

            <div className="tl-card glass-card">
              <div className="tl-year mb-1">{edu.year}</div>
              <h3 className="tl-degree">{edu.degree}</h3>
              
              <div className="tl-inst-row mt-4 flex items-center gap-3">
                 <div className="tl-logo bg-zinc-900 border border-white/5 p-1">
                    <img 
                      src={edu.logo} 
                      alt={edu.inst} 
                      className="w-full h-full object-cover filter grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                      onError={(e: any) => e.currentTarget.style.display = 'none'}
                    />
                 </div>
                 <p className="tl-inst">{edu.inst}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
