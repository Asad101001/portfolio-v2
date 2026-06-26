const iconMapping = {
  // Languages
  python: { source: 'devicon', name: 'python', color: '#3776AB', type: 'original' },
  cpp: { source: 'devicon', name: 'cplusplus', color: '#00599C', type: 'original' },
  cs: { source: 'devicon', name: 'csharp', color: '#178600', type: 'original' },
  java: { source: 'devicon', name: 'java', color: '#ED8B00', type: 'original' },
  js: { source: 'devicon', name: 'javascript', color: '#F7DF1E', type: 'plain' },
  html: { source: 'devicon', name: 'html5', color: '#E34F26', type: 'original' },
  css: { source: 'devicon', name: 'css3', color: '#1572B6', type: 'original' },
  r: { source: 'devicon', name: 'r', color: '#276DC3', type: 'original' },
  assembly: { source: 'custom', name: 'assembly', color: '#6E4C13', path: 'M16 0H8v4h8V0zm0 4h3v2h-3V4zM5 4h3v2H5V4zm11 16H8v4h8v-4zm0-2h3v-2h-3v2zM5 18h3v-2H5v2zm7-11c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z', viewBox: '0 0 24 24' },

  // Cloud
  aws: { source: 'devicon', name: 'amazonwebservices', color: '#FF9900', type: 'original' },
  linux: { source: 'devicon', name: 'linux', color: '#FCC624', type: 'original' },
  docker: { source: 'devicon', name: 'docker', color: '#2496ED', type: 'original' },
  nginx: { source: 'devicon', name: 'nginx', color: '#009639', type: 'original' },
  ec2: { source: 'custom', name: 'ec2', color: '#FF9900', path: 'M19 15v4H5v-4h14m1-2H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 18.5c-.82 0-1.5-.68-1.5-1.5s.68-1.5 1.5-1.5 1.5.68 1.5 1.5-.68 1.5-1.5 1.5zM12 3L2 8l10 5 10-5-10-5z', viewBox: '0 0 24 24' },
  s3: { source: 'custom', name: 's3', color: '#569A31', path: 'M12 2L4 5v14l8 3 8-3V5l-8-3zm0 18l-6-2.25V6.75L12 4.5l6 2.25v11L12 20z', viewBox: '0 0 24 24' },
  rds: { source: 'custom', name: 'rds', color: '#2E71B8', path: 'M12 2C6.48 2 2 4.02 2 6.5v11c0 2.48 4.48 4.5 10 4.5s10-2.02 10-4.5v-11C22 4.02 17.52 2 12 2zm0 18c-4.42 0-8-1.79-8-4V7.93c1.92 1.15 4.79 1.82 8 1.82s6.08-.67 8-1.82V16c0 2.21-3.58 4-8 4zm0-11c-4.42 0-8-1.79-8-4s3.58-4 8-4 8 1.79 8 4-3.58 4-8 4z', viewBox: '0 0 24 24' },
  iam: { source: 'custom', name: 'iam', color: '#DD344C', path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z', viewBox: '0 0 24 24' },

  // AI
  pytorch: { source: 'devicon', name: 'pytorch', color: '#EE4C2C', type: 'original' },
  langchain: { source: 'simpleicons', name: 'langchain', color: '#10B981' },
  faiss: { source: 'custom', name: 'faiss', color: '#00C3FF', path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', viewBox: '0 0 24 24' },
  groq: { source: 'simpleicons', name: 'groq', color: '#F75049' },
  gemini: { source: 'simpleicons', name: 'google-gemini', color: '#8E75FF' },
  pandas: { source: 'devicon', name: 'pandas', color: '#150458', type: 'original' },
  numpy: { source: 'devicon', name: 'numpy', color: '#013243', type: 'original' },
  sklearn: { source: 'devicon', name: 'scikitlearn', color: '#F7931E', type: 'original' },
  seaborn: { source: 'custom', name: 'seaborn', color: '#3776AB', path: 'M12 0L2.1 5.7v12.6L12 24l9.9-5.7V5.7L12 0zm0 3.2L18.8 7v10L12 20.8 5.2 17V7L12 3.2zM12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z', viewBox: '0 0 24 24' },

  // Backend
  fastapi: { source: 'devicon', name: 'fastapi', color: '#05998B', type: 'original' },
  node: { source: 'devicon', name: 'nodejs', color: '#339933', type: 'original' },
  mysql: { source: 'devicon', name: 'mysql', color: '#4479A1', type: 'original' },
  git: { source: 'devicon', name: 'git', color: '#F05032', type: 'original' },
  github: { source: 'devicon', name: 'github', color: '#FFFFFF', type: 'original' },
  vscode: { source: 'devicon', name: 'vscode', color: '#007ACC', type: 'original' },
  jupyter: { source: 'devicon', name: 'jupyter', color: '#F37626', type: 'original' },
  bash: { source: 'devicon', name: 'bash', color: '#4EAA25', type: 'plain' },
};

async function fetchRawSvg(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  const { name = 'python' } = req.query;
  const key = name.toLowerCase().trim();
  
  let icon = iconMapping[key];
  if (!icon) {
    // If not found in mapping, create a dynamic fallback
    icon = { source: 'devicon', name: key, color: '#AAAAAA', type: 'original' };
  }

  let viewBox = '0 0 128 128';
  let innerContent = '';
  let isOriginal = icon.source === 'devicon' && icon.type !== 'plain';
  let isStroke = icon.isStroke || false;

  if (icon.source === 'custom') {
    viewBox = icon.viewBox || '0 0 24 24';
    innerContent = `<path d="${icon.path}" />`;
    isOriginal = false;
  } else if (icon.source === 'simpleicons') {
    const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${icon.name}.svg`;
    const raw = await fetchRawSvg(url);
    if (raw) {
      const svgMatch = raw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
      innerContent = svgMatch ? svgMatch[1] : '';
      viewBox = '0 0 24 24';
    } else {
      // Fallback
      innerContent = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#fff">${icon.name.substring(0, 2).toUpperCase()}</text>`;
    }
    isOriginal = false;
  } else {
    // Devicon fetch
    const types = [icon.type || 'original', 'plain', 'original-wordmark'];
    let raw = null;
    let selectedType = types[0];

    for (const t of types) {
      const url = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${icon.name}/${icon.name}-${t}.svg`;
      raw = await fetchRawSvg(url);
      if (raw) {
        selectedType = t;
        break;
      }
    }

    if (raw) {
      const svgMatch = raw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
      innerContent = svgMatch ? svgMatch[1] : '';
      const vbMatch = raw.match(/viewBox=["']([^"']+)["']/i);
      viewBox = vbMatch ? vbMatch[1] : '0 0 128 128';
      isOriginal = selectedType !== 'plain';
    } else {
      // Last-resort fallback to SimpleIcons
      const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${icon.name}.svg`;
      const rawSimple = await fetchRawSvg(url);
      if (rawSimple) {
        const svgMatch = rawSimple.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
        innerContent = svgMatch ? svgMatch[1] : '';
        viewBox = '0 0 24 24';
        isOriginal = false;
      } else {
        innerContent = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#fff">${icon.name.substring(0, 2).toUpperCase()}</text>`;
        isOriginal = false;
      }
    }
  }

  // Build the premium themed card SVG response
  const cardColor = '#0D0D0D';
  const borderColor = '#1F1F1F';
  const glowColor = icon.color;

  // Set the fill/stroke based on icon characteristics
  let styledInner = innerContent;
  if (!isOriginal) {
    if (isStroke) {
      styledInner = `<g stroke="${glowColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">${innerContent}</g>`;
    } else {
      styledInner = `<g fill="${glowColor}">${innerContent}</g>`;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <!-- Card background gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${cardColor}" />
      <stop offset="100%" stop-color="#141414" />
    </linearGradient>

    <!-- Radial Glow under the icon -->
    <radialGradient id="iconGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.22" />
      <stop offset="100%" stop-color="${glowColor}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Premium card base -->
  <rect x="1" y="1" width="62" height="62" rx="14" fill="url(#bgGrad)" stroke="${borderColor}" stroke-width="1" />
  
  <!-- Sleek brand accent border glow -->
  <rect x="1" y="1" width="62" height="62" rx="14" fill="none" stroke="${glowColor}" stroke-width="1.2" stroke-opacity="0.35" />

  <!-- Ambient Glow Behind Icon -->
  <circle cx="32" cy="32" r="20" fill="url(#iconGlow)" />

  <!-- Nested icon scaling -->
  <svg viewBox="${viewBox}" x="14" y="14" width="36" height="36">
    ${styledInner}
  </svg>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800, immutable');
  res.status(200).send(svg);
}
