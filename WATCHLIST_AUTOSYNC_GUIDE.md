# Dynamic Watchlist Auto-Sync Guide (Trakt + Simkl)

This guide documents the **current implementation** in this repo and every setting you need to run it reliably.

## 1) What this integration now does

- The site calls `GET /api/watchlist` from the Big 3 Social widget.
- The API supports **two providers**:
  - **Simkl** (preferred when configured)
  - **Trakt** (automatic fallback)
- Results are merged with local fallback lists in `CONFIG.big3` so UI always renders.
- The widget text now shows as many items as possible, then compacts with `+N` when long.
- Response includes metadata: `source`, `lastSyncedAt`, and `configured` flags.

## 2) Provider priority and behavior

### Default priority (no query param)
1. Simkl
2. Trakt
3. Local fallback only

### Optional forced source
You can force provider order during debugging:

- `/api/watchlist?source=simkl`
- `/api/watchlist?source=trakt`

If the forced provider has no data, the API still falls back to the other provider.

## 3) Required environment variables

Configure in your deployment platform (e.g., Vercel Project Settings → Environment Variables).

### Common
- `TMDB_API_KEY` *(recommended for better posters)*

### Trakt
- `TRAKT_CLIENT_ID` *(required to use Trakt)*
- `TRAKT_USERNAME` *(optional, default in code is `as4d`)*

### Simkl
- `SIMKL_CLIENT_ID` *(required to use Simkl)*
- `SIMKL_USER_ID` *(required to use Simkl)*

## 4) Trakt setup (complete checklist)

1. Create/login to Trakt account: <https://trakt.tv>
2. Create API app in Trakt settings (API Apps).
3. Copy **Client ID**.
4. Set env vars:
   - `TRAKT_CLIENT_ID`
   - `TRAKT_USERNAME`
5. Populate watchlists in Trakt:
   - Shows watchlist
   - Movies watchlist
6. Redeploy after env var changes.

## 5) Simkl setup (complete checklist)

1. Create/login to Simkl account: <https://simkl.com>
2. Create/get API client in Simkl developer settings.
3. Find your Simkl user id.
4. Set env vars:
   - `SIMKL_CLIENT_ID`
   - `SIMKL_USER_ID`
5. Populate lists in Simkl:
   - TV Watching / Plan To Watch
   - Movies Plan To Watch
6. Redeploy after env var changes.

## 6) API response contract (current)

`GET /api/watchlist`

```json
{
  "shows": [{ "title": "...", "poster": "...", "progress": 52 }],
  "movies": [{ "title": "...", "poster": "..." }],
  "source": "simkl",
  "lastSyncedAt": "2026-04-06T12:00:00.000Z",
  "configured": { "trakt": true, "simkl": true }
}
```

## 7) Cache and refresh details

- API sets:
  - `Cache-Control: s-maxage=600, stale-while-revalidate`
- That means:
  - Up to 10 minutes cached
  - stale response may be served while fresh data is fetched
- Frontend does a normal fetch and re-renders on response.

## 8) UI behavior in Big 3 widget

- **Movies** and **Series** both use live API data first.
- Then local fallback entries are appended (deduped by title).
- Line text formatting:
  - Up to 4 titles rendered inline
  - Remaining count shown as `+N`
- Thumbnails:
  - First 3 only for compact layout stability

## 9) Troubleshooting matrix

### A) Widget shows only fallback items
- Cause: provider env vars missing or provider returned empty.
- Check: `/api/watchlist` response `configured` and `source`.

### B) Posters missing
- Cause: missing `TMDB_API_KEY` or no poster in upstream source.
- Fallback:
  - TV: TVmaze lookup by title
  - Movies: client-side movie poster helper

### C) Simkl configured but Trakt data appears
- Cause: Simkl request returned zero items.
- Expected: automatic fallback to Trakt.

### D) Stale data after edits
- Cause: edge caching.
- Fix: wait 10 min, or trigger a new deployment.

## 10) Production hardening recommendations

- Keep both providers configured for resilience.
- Use a dedicated service account for watchlists.
- Rotate API keys quarterly.
- Add uptime checks for `/api/watchlist` returning non-empty payload.
- Alert when `source === "error"` or both arrays empty for >24h.

## 11) Where to edit locally

- API provider logic: `api/watchlist.js`
- Big 3 frontend merge/render logic: `js/modules/widgets.js`
- Local fallback defaults: `js/modules/widgets.js` (`CONFIG.big3`)

