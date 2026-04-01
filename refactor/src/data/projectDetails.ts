export interface ProjectDetail {
  slug: string;
  title: string;
  subtitle: string;
  desc: string;
  problem: string;
  features: string[];
  tech: { name: string; icon: string; color: string }[];
  images: { src: string; alt: string; label?: string }[];
  github: string;
  demo?: string;
  color: string;
}

export const projectDetails: Record<string, ProjectDetail> = {
  legaleaseai: {
    slug: 'legaleaseai',
    title: 'LegalEaseAI',
    subtitle: 'اردو قانونی معاون — Urdu Legal Assistant',
    desc: 'Upload contracts for rapid AI risk-rating. Provides plain Urdu explanations, a RAG-powered document chatbot, and downloadable PDF reports.',
    problem: 'Millions sign contracts written in dense English legalese they cannot understand, leading to exploitation. LegalEaseAI bridges this gap by allowing users to upload any legal document and receive instant, plain-Urdu explanations of every clause, color-coded risk ratings, and a full Q&A chatbot that answers questions directly from the document itself.',
    features: [
      'Risk Detection: Clauses auto-classified as High, Medium, or Safe.',
      'Urdu Explanations: Plain, culturally appropriate Urdu translations and summaries.',
      'RAG Chatbot: Ask anything in Urdu or English, grounded only in your document.',
      'PDF Reports: Downloadable color-coded risk report with actionable insights.',
      'Concurrent Processing: Heavy AI calls fire simultaneously using asyncio for speed.'
    ],
    tech: [
      { name: 'FastAPI', icon: 'fastapi', color: '#009688' },
      { name: 'LangChain', icon: 'python', color: '#00ff41' },
      { name: 'FAISS', icon: 'python', color: '#00c3ff' },
      { name: 'Gemini/Groq', icon: 'python', color: '#f75049' },
      { name: 'React', icon: 'react', color: '#61DAFB' }
    ],
    images: [
      { src: '/images/projects/legalease.png', alt: 'LegalEaseAI Interface' },
      { src: '/images/projects/legalease-qa.png', alt: 'QA Chatbot Interface', label: 'Urdu Retrieval-Augmented Generation (RAG) Chatbot' },
      { src: '/images/projects/legalease-report.png', alt: 'Risk Assessment Report Outline', label: 'Automated Contract Risk Audit Report Engine' }
    ],
    github: 'https://github.com/Asad101001/LegalEaseAI',
    demo: 'https://legal-ease-ai-iota.vercel.app/',
    color: '#00ff41'
  },
  pollpulse: {
    slug: 'pollpulse',
    title: 'PollPulse',
    subtitle: 'Cloud-Deployed Capstone Project',
    desc: 'Real-time polling platform built on AWS. Features a custom VPC with EC2 and RDS MySQL isolation.',
    problem: 'Standard polling apps lack infrastructure transparency and data security. PollPulse was built as a capstone to demonstrate full-stack cloud deployment, featuring a multi-tier architecture with private database subnets and public web servers, all secured with IAM and security groups.',
    features: [
      'AWS Infrastructure: Provisioned VPC with isolated subnets and load balancing.',
      'Real-time Updates: Socket.io for live vote tallying without page refreshes.',
      'Data Visualization: Dynamic charts using Chart.js to show election results.',
      'Security: Encrypted auth with JWT and RDS MySQL data persistence.',
      'Nginx Reverse Proxy: Hardened web server configuration on Ubuntu EC2.'
    ],
    tech: [
      { name: 'AWS', icon: 'amazonwebservices', color: '#FF9900' },
      { name: 'Node.js', icon: 'nodejs', color: '#339933' },
      { name: 'MySQL', icon: 'mysql', color: '#4479A1' },
      { name: 'Nginx', icon: 'nginx', color: '#009639' },
      { name: 'Socket.io', icon: 'javascript', color: '#ffffff' }
    ],
    images: [
      { src: '/images/projects/pollpulse.png', alt: 'PollPulse Dashboard' }
    ],
    github: 'https://github.com/Asad101001/pollpulse',
    color: '#a855f7'
  },
  devpulse: {
    slug: 'devpulse',
    title: 'DevPulse',
    subtitle: 'Industrial Commit Telemetry Dashboard',
    desc: 'Developer telemetry dashboard analyzing commit narratives with Llama 3.3 to calculate cognitive load.',
    problem: 'Traditional dev dashboards only track velocity, not the mental effort or complexity behind changes. DevPulse uses Groq-powered LLMs to analyze natural language in commit messages, classifying them by cognitive load (Refactoring, Logic, Feature, etc.) and visualizing the "mental burn" of a project over time.',
    features: [
      'LLM Narrative Analysis: Llama 3.3 70B analyzing commit complexity.',
      'Industrial UI: High-contrast, dashboard-style interface with real-time feedback.',
      'Commit Stream: Live-fetching from GitHub API with categorised load bars.',
      'Complexity Trends: Visualising technical debt vs development speed.',
      'MongoDB Persistence: Storing historical load metrics for team analytics.'
    ],
    tech: [
      { name: 'React', icon: 'react', color: '#61DAFB' },
      { name: 'Groq AI', icon: 'python', color: '#f75049' },
      { name: 'Express', icon: 'nodejs', color: '#ffffff' },
      { name: 'MongoDB', icon: 'mongodb', color: '#47A248' },
      { name: 'Framer', icon: 'javascript', color: '#f500ff' }
    ],
    images: [
      { src: '/images/projects/devpulse.png', alt: 'DevPulse Industrial Dashboard' }
    ],
    github: 'https://github.com/Asad101001/devpulse',
    demo: 'https://devpulse-app.onrender.com',
    color: '#FFD600'
  },
  mogscope: {
    slug: 'mogscope',
    title: 'Mogscope',
    subtitle: '68-point AI Facial Analytics',
    desc: 'Facial analytics platform using face-api.js for 68-point landmark detection and AI-satirical analysis.',
    problem: 'Mogscope explores the intersection of computer vision and meme culture. It uses TensorFlow-based models to map facial landmarks in real-time, then feeds those coordinates to a "Mogging" engine (Groq/LLM) that generates a satirical, exaggerated analysis of the user\'s "physiognomy" for entertainment.',
    features: [
      'Landmark Tracking: 68-point real-time facial mesh using face-api.js.',
      'AI Roast Engine: Generating high-context roasts based on facial ratios.',
      'Three.js Overlay: Dynamic 3D wireframe rendering over the camera feed.',
      'Audio Synthesis: Text-to-speech output for the satirical analysis results.',
      'Privacy First: All facial mapping data stays on the client side.'
    ],
    tech: [
      { name: 'TensorFlow', icon: 'tensorflow', color: '#FF6F00' },
      { name: 'Three.js', icon: 'javascript', color: '#ffffff' },
      { name: 'face-api.js', icon: 'javascript', color: '#61DAFB' },
      { name: 'Groq', icon: 'python', color: '#f75049' },
      { name: 'Tailwind', icon: 'tailwindcss', color: '#38B2AC' }
    ],
    images: [
      { src: '/images/projects/mogscope.png', alt: 'Mogscope AI Interface' }
    ],
    github: 'https://github.com/Asad101001/mogscope',
    demo: 'https://mogscope.vercel.app/',
    color: '#6366f1'
  },
  aws: {
    slug: 'aws',
    title: 'AWS Static Infrastructure',
    subtitle: 'Cloud Hosting Deep Dive',
    desc: 'Manual provisioning of Ubuntu EC2 instances with Nginx configuration and SSH hardening.',
    problem: 'High-level cloud services obscure how infrastructure actually works. This project involved manually building the base layer of a web server: configuring security groups, setting up VPC routing tables, hardening Nginx headers, and managing SSH keys—a purely infrastructure-focused deep dive into production-ready hosting.',
    features: [
      'Manual Provisioning: No automated scripts; purely CLI/Console-based setup.',
      'Nginx Hardening: Custom headers for security and performance optimization.',
      'SSH Hardening: Custom ports, key-only auth, and fail2ban implementation.',
      'VPC Isolation: Proper public/private subnet routing configuration.',
      'Ubuntu Server: Full management of the Linux environment and dist-upgrades.'
    ],
    tech: [
      { name: 'AWS EC2', icon: 'amazonwebservices', color: '#FF9900' },
      { name: 'Ubuntu', icon: 'linux', color: '#E95420' },
      { name: 'Nginx', icon: 'nginx', color: '#009639' },
      { name: 'SSH', icon: 'bash', color: '#ffffff' },
      { name: 'Networking', icon: 'bash', color: '#00c3ff' }
    ],
    images: [
      { src: '/images/projects/aws.png', alt: 'AWS Architecture Diagram' }
    ],
    github: 'https://github.com/Asad101001/aws-static-website',
    color: '#FF9900'
  }
};
