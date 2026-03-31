# Project Context: Portfolio-V2

## Project Structure
- `index.html`: Main entry point, including multiple HTML components.
- `components/`: UI modules (hero, about, projects, tech-stack, education, contact, etc.).
- `js/modules/`: Core functionality split by concern (widgets, ui, animations, theme, twitter).
- `api/`: Serverless functions (Vercel) for Trakt, Spotify, and LinkedIn data fetching.
- `css/`: Main styles (`style.css`) and experimental additions (`additions.css`).

## Key Integrations & APIs
- **Trakt**: `/api/current-show.js` and `/api/watchlist.js`.
- **Spotify**: `/api/spotify.js`.
- **Last.fm**: Client-side fetch in `widgets.js`.
- **GitHub**: Client-side fetch in `widgets.js`.
- **ESP/Scoreboard**: Client-side fetch for football (FCB).
- **RSS2JSON**: Proxying Letterboxd RSS.

## Deployment
Hosted on Vercel with serverless functions for secure API proxying.

## Development Constraints
- Use local `/api/` endpoints where possible.
- Fallbacks in `js/modules/widgets.js` for all widgets.
- Responsive design for mobile/tablet.
- Vanilla everything (no frameworks beyond Vite).
- Theme: Glassmorphism with neon accents.
