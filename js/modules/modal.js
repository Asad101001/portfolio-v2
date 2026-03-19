'use strict';

const PROJECT_DATA = {
    'bitscrypt-v3': {
        title: 'Bitscrypt v3',
        challenge: 'Visualizing complex real-time crypto transactions across multiple chains without lagging the main thread.',
        solution: 'Implemented OffscreenCanvas and WebWorkers for heavy data processing, coupled with a custom WebGL renderer for the main pulse graph.',
        learnings: 'Deepened knowledge in high-performance browser rendering and state management for rapidly updating data feeds.',
        tags: ['React', 'WebGL', 'WebWorkers', 'Ethers.js']
    },
    'devpulse-v2': {
        title: 'DevPulse V2',
        challenge: 'Aggregating fragmented developer activity from GitHub, Jira, and Slack into a single cohesive "Cognitive Load" metric.',
        solution: 'Built a multi-agent system using LangChain to analyze commit sentiment and task complexity, exposing the data via a low-latency GraphQL API.',
        learnings: 'Mastered the integration of LLMs into production workflows and understood the nuances of developer productivity metrics.',
        tags: ['Next.js', 'LangChain', 'PostgreSQL', 'Python']
    },
    'pulse-io': {
        title: 'Pulse.io',
        challenge: 'Creating a sub-second latency system for monitoring distributed server health with an Industrial Brutalist aesthetic.',
        solution: 'Used WebSocket connections for real-time telemetry and a heavily optimized CSS variable system for the high-contrast UI.',
        learnings: 'Learned the importance of "Design Systems" in specialized technical tools and how to optimize for data-dense dashboards.',
        tags: ['Node.js', 'Socket.io', 'Industrial UI', 'Docker']
    },
    'git-logic': {
        title: 'Git Logic',
        challenge: 'Explaining abstract Git concepts (branching, merging) to beginners in a way that is interactive and non-threatening.',
        solution: 'Developed a visual canvas that maps Git commands to character movements and path-finding logic.',
        learnings: 'Improved skills in educational UX design and complex SVG manipulation.',
        tags: ['Vanilla JS', 'SVG.js', 'Game Engine', 'Git API']
    },
    'bitscrypt-legacy': {
        title: 'Bitscrypt Legacy',
        challenge: 'Initial foray into blockchain data visualization, focusing on a single-chain explorer.',
        solution: 'Built a lightweight Ruby on Rails application that parsed block data into a searchable relational database.',
        learnings: 'Understanding the fundamentals of blockchain structure and database performance.',
        tags: ['Ruby on Rails', 'PostgreSQL', 'Blockchain']
    },
    'aws-static-website': {
        title: 'AWS Static Website',
        challenge: 'Deploying a high-availability personal site with near-zero latency and automated CI/CD.',
        solution: 'Configured an S3 + CloudFront stack with GitHub Actions for automated invalidations.',
        learnings: 'Best practices for cloud architecture, DNS management (Route 53), and SSL termination.',
        tags: ['AWS S3', 'CloudFront', 'GitHub Actions', 'Terraform']
    }
};

export function initProjectModals() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const bodyContent = document.getElementById('modal-body-content');
    const projectCards = document.querySelectorAll('.project-card');

    if (!modal || !bodyContent) return;

    projectCards.forEach(card => {
        // Find the project ID (assuming it's in a data-attr or from the title)
        const title = card.querySelector('.project-title')?.innerText || '';
        const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // Add a "Details" button if not present
        if (!card.querySelector('.proj-details-btn')) {
            const btn = document.createElement('button');
            btn.className = 'proj-details-btn';
            btn.innerHTML = 'Case Study <span>&rarr;</span>';
            btn.onclick = (e) => {
                e.stopPropagation();
                openModal(id);
            };
            card.querySelector('.project-content').appendChild(btn);
        }
    });

    function openModal(id) {
        const data = PROJECT_DATA[id] || {
            title: id.replace(/-/g, ' ').toUpperCase(),
            challenge: 'Information coming soon...',
            solution: 'Working on documenting this journey.',
            learnings: 'Every project is a lesson.',
            tags: ['Technical', 'Bespoke']
        };

        const html = `
            <h2 class="section-title">${data.title}</h2>
            <div class="modal-grid">
                <div class="modal-left">
                    <div class="modal-section-h">The Challenge</div>
                    <p class="modal-p">${data.challenge}</p>
                    
                    <div class="modal-section-h">The Solution</div>
                    <p class="modal-p">${data.solution}</p>
                    
                    <div class="modal-section-h">Key Takeaways</div>
                    <p class="modal-p">${data.learnings}</p>
                </div>
                <div class="modal-right">
                    <div class="modal-section-h">Tech Stack</div>
                    <div class="modal-tag-list">
                        ${data.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;

        bodyContent.innerHTML = html;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeBtn.onclick = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    window.onclick = (e) => {
        if (e.target === modal) closeBtn.onclick();
    };
}
