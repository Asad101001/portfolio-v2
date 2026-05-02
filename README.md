```
    _    ____    _    ____  
   / \  / ___|  / \  |  _ \ 
  / _ \ \___ \ / _ \ | | | |
 / ___ \ ___) / ___ \| |_| |
/_/   \_\____/_/   \_\____/ 
   P O R T F O L I O
```

<div align="center">

**`muhammadasad-portfolio.vercel.app`**

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://muhammadasad-portfolio.vercel.app)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Build-Vite%207-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![License](https://img.shields.io/badge/License-ISC-00ff41?style=flat-square)](#)

*CS Student · UBIT, University of Karachi '28 · Python · AWS · AI/ML*

</div>

---

```
asad@2006:~/portfolio-v2$ cat OVERVIEW.md
```

A performance-obsessed personal portfolio with live data widgets, 4 runtime themes, serverless API functions, and a single master `requestAnimationFrame` loop. **Deliberately vanilla** — no React, no Vue, no overhead. Every architectural choice was a conscious tradeoff documented below.
## $ ls -la

```
portfolio-v2/
|
+-- api/                        <-- Vercel serverless functions (Node 18 ESM)
|   +-- spotify.js              <-- OAuth refresh -> Now Playing + Recently Played
|   +-- current-show.js         <-- Trakt watching -> TMDB -> TVmaze poster chain
|   +-- watchlist.js            <-- Trakt watchlist -> poster resolution
|   +-- search-artist.js        <-- Spotify API artist search with caching
|   \-- linkedin-post.js        <-- Upstash Redis KV: GET (public) / POST
|
+-- components/                 <-- HTML partials (inlined at build)
|   +-- loading-screen.html     <-- 3D CSS cube intro animation
|   +-- nav.html                <-- Fixed glassmorphism nav + mobile drawer
|   +-- hero.html               <-- 2x3 grid: main card, terminal, clock
|   +-- about.html              <-- Stats, WIP cards, GitHub heatmap
|   +-- projects.html           <-- 2-col card grid + animations
|   +-- experience.html         <-- Accordion-gated humor section
|   +-- tech-stack.html         <-- Filterable arsenal grid
|   +-- education.html          <-- Staggered timeline
|   +-- contact.html            <-- Social chips + 2-col widget layout
|   \-- overlays.html           <-- Cursor glow, toast, certs drawer
|
+-- css/
|   +-- style.css               <-- Master stylesheet (@import chain)
|   +-- base.css                <-- Variables, resets, typography
|   +-- themes.css              <-- Theme definitions
|   +-- modules.css             <-- Barrel file for component modules
|   +-- modules/                <-- Granular component styles
|   |   +-- hero.css, arsenal.css, barca.css, etc. (25+ modules)
|   +-- perf.css                <-- PERFORMANCE OVERRIDES (last)
|   +-- mobile.css              <-- Touch-optimized overrides
|   \-- desktop.css             <-- Desktop-only enhancements
|
+-- js/
|   +-- app.js                  <-- Global state + master rAF loop
|   \-- modules/
|       +-- loader.js           <-- 3D intro + particle system
|       +-- canvas.js           <-- Star/nebula canvas (30fps capped)
|       +-- animations.js       <-- Magnetic effects, parallax
|       +-- ui.js               <-- Nav, typewriter, counters
|       +-- widgets.js          <-- ALL live data widgets
|       +-- twitter.js          <-- RSS Proxy for X/Twitter feed
|       +-- theme.js            <-- 4-theme engine + Transitions API
|       +-- mobile.js           <-- Touch feedback logic
|       \-- desktop.js          <-- Smooth scrolling + desktop polish
|
+-- projects/                   <-- Case study pages
+-- index.html                  <-- Entry point
+-- vite.config.js              <-- Multi-page build logic
\-- vercel.json                 <-- Deployment configuration
```ile.js               ← Touch feedback & mobile-specific logic
│       └── desktop.js              ← Smooth scrolling & desktop-only polish
│
├── 🗂️  projects/                   ← Case study pages (standalone HTML)
├── index.html                      ← Entry point
├── vite.config.js                  ← Multi-page build + HTML include logic
└── vercel.json                     ← Deployment configuration
```

---

## `$ cat ARCHITECTURE.md`

### The rAF Loop

Everything per-frame runs through **one** loop, registered in `app.js`:

```
window._scrollTasks = []   <-- modules push tasks onto this array
          |
          v
requestAnimationFrame(loop)
    +-- update window._lerpY   (lerp factor: 0.068)
    +-- run canvas.js draw()   (star field, 30fps gated)
    +-- run animations.js      (parallax, hero shrink)
    +-- run ui.js tasks        (nav hide/show, back-to-top ring)
    \-- run cursor glow        (smooth follower)
```

> Each module registers its task once. No competing rAF loops. No redundant layout reads.

### The Modular Refactor

The codebase has been refactored from a monolithic structure into a strictly modular one:
- **CSS**: 25+ independent modules imported via `modules.css`, ensuring clean separation of concerns.
- **JS**: Logical split into utility-based modules, preventing the "God object" pattern.
- **HTML**: Component-driven architecture using Vite's build-time inlining.

---

### Performance Contract

| Rule | How it's enforced |
|------|-------------------|
| No `backdrop-filter` on cards | `css/perf.css` overrides `none !important` site-wide |
| No `getBoundingClientRect` in loops | Zero instances in scroll/rAF paths |
| No lerp scroll on mobile | `window._isMobile` guard in `app.js` |
| Canvas pauses when off-screen | `IntersectionObserver` gated logic |
| Star canvas capped at 30fps | Timestamp-based frame skip in `canvas.js` |
| `body.is-scrolling` class | Disables pointer-events during scroll for 60fps |
| **High-Contrast Typography** | WCAG AA compliant contrast in all themes |
| **Unified UI Borders** | Standardized 1px neo-brutalist border system |
| **Optimized Image Chain** | Multi-source fallback (Spotify → iTunes → Wikipedia) |

---

## `$ cat WIDGETS.md`

### Widget Map (`js/modules/widgets.js`)

```
CONFIG object (top of widgets.js)
+-- usernames        -> { letterboxd, lastfm, github, twitter }
+-- currently        -> { reading: string, series: string[] }
\-- big3             -> { players: [...], watchlist: [...], seriesWatchlist: [...] }

Live widgets (DOM-targeting, self-initialising IIFEs)
+-- GitHub Commit Line        -> api.github.com (Live repo status)
+-- Book Cover                -> openlibrary.org (Currently reading)
+-- Letterboxd Last Watched   -> rss2json + letterboxd RSS
+-- TV Tracking               -> /api/current-show -> Trakt -> TVmaze
+-- Barca Scorecard           -> site.api.espn.com (Live match data)
+-- Last.fm Recently Played   -> ws.audioscrobbler.com (4-track history)
+-- Spotify Now Playing       -> /api/spotify (OAuth-secured)
+-- Visitor XP System         -> localStorage visit persistence
+-- GitHub Heatmap            -> github-contributions-api (Live activity)
+-- Coding Clock (PKT)        -> Zone-aware status strings
\-- Big 3 Social Widget       -> SportsDB + iTunes + Wikipedia
```

---

## `$ cat SETUP.md`

### Prerequisites

- Node.js ≥ 20 (Vite 7 requirement)
- Vercel CLI (optional, for local API testing)

### Local Development

```bash
git clone https://github.com/Asad101001/portfolio-v2.git
cd portfolio-v2
npm install
npm run dev          # → http://localhost:5173
```

API functions won't execute locally without env vars. Use `vercel dev` for full local testing.

### Environment Variables

```env
# Spotify (OAuth)
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REFRESH_TOKEN=...

# Trakt + TMDB
TRAKT_CLIENT_ID=...
TRAKT_USERNAME=...
TMDB_API_KEY=...

# LinkedIn post storage (Upstash Redis)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
LINKEDIN_POST_SECRET=...
```

---

## `$ cat GOTCHAS.md`

```diff
- DON'T add backdrop-filter to glass cards
  Caused ~50x scroll slowdown. Removed from all cards in perf.css.

- DON'T call getBoundingClientRect() inside scroll listeners or rAF
  Forces synchronous layout recalc. Use IntersectionObserver instead.

- DON'T use Last.fm image endpoints
  Deprecated in 2024. Code uses iTunes Search API + Wikipedia fallbacks.

- DON'T use Sofascore CDN for headshots
  CORS-blocked. Replaced with TheSportsDB + Wikipedia Rest API.

! Windows flag emoji
  Renders as two-letter codes on Windows. Use neutral icons in UI.

! Twitter/X widget reliability
  Nitter instances are unstable. Implemented a "Pinned Fallback" mechanism.

! Theme Accessibility
  Cyberpunk and Professional themes use high-contrast overrides for readability.
```

---

## `$ cat CONTEXT.md`

### Social Handles Reference

| Platform | Handle / Link |
|----------|---------------|
| **GitHub** | [Asad101001](https://github.com/Asad101001) |
| **LinkedIn** | [muhammadasadk](https://www.linkedin.com/in/muhammadasadk/) |
| **Email** | muhammadasadk42@gmail.com |
| **Discord** | asad101001 |
| **Instagram** | @muhammadasad.k_ |
| **Medium** | @muhammadasadk42 |
| **Last.fm** | Asad991 |
| **Trakt** | as4d |
| **Letterboxd** | asad_k |
| **Twitter/X** | As4d_41 |

---

<div align="center">

```
asad@2006:~/portfolio-v2$ █
```

[![GitHub](https://img.shields.io/badge/GitHub-Asad101001-181717?style=flat-square&logo=github)](https://github.com/Asad101001)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-muhammadasadk-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/muhammadasadk/)
[![Portfolio](https://img.shields.io/badge/Portfolio-Live-00ff41?style=flat-square)](https://muhammadasad-portfolio.vercel.app)

*Build broken things. Understand why they broke. Spend ages unbreaking them.*

</div>