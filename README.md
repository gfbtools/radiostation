# Studio2Radio

**Your music. Your station. On air anywhere.**

Studio2Radio is a full-stack web radio platform built for independent artists. Upload your tracks, build playlists, configure your on-air lineup, and share an embeddable widget that streams your station to the world — no DJ booth required.

---

## What It Does

- **Library** — Upload and manage your full track catalog. Drag to reorder. Edit metadata inline.
- **Playlists** — Build themed playlists from your library. Reorder tracks per playlist.
- **On Air** — Choose which tracks or playlists go live. Toggle between All Tracks or Selected mode.
- **Widget** — Embeddable iframe player with crossfade playback, theme picker, and font picker. Drop it anywhere.
- **My Station** — Upload your logo, pick your theme and font, copy your embed code, share your station URL.
- **Discover** — Browse and save other artists' stations.
- **Analytics** — Play logs and ASCAP-ready reporting.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Zustand (with persist) |
| Backend / Auth / DB | Supabase (Postgres + Storage) |
| Widget Player | Vanilla JS + Web Audio (crossfade) |
| API Proxy | Cloudflare Worker (ES Modules) |
| Widget Host | Cloudflare Pages |
| App Host | Vercel |
| Repo | GitHub |

---

## Repo Structure

```
radiostation/
├── src/
│   ├── components/
│   │   ├── Navigation.tsx          # Top nav — all panel triggers
│   │   ├── PlayerBar.tsx           # Bottom playback bar + audio engine
│   │   ├── LibraryPanel.tsx        # Track upload, edit, reorder, delete
│   │   ├── PlaylistModal.tsx       # Playlist builder
│   │   ├── OnAirPanel.tsx          # On-air config (all / selected mode)
│   │   ├── MyStationPanel.tsx      # Logo, theme, embed code, share URL
│   │   ├── DiscoverPanel.tsx       # Browse / save other stations
│   │   ├── AnalyticsPanel.tsx      # Play logs + ASCAP report export
│   │   ├── ProfileSettingsModal.tsx# PRO registration, social links
│   │   ├── DropsPanel.tsx          # (stub — feature removed)
│   │   ├── ShowBanner.tsx          # (stub — feature removed)
│   │   └── ShowSchedulerPanel.tsx  # (stub — feature removed)
│   ├── store/
│   │   └── useStore.ts             # Zustand store — all app state + Supabase calls
│   ├── types/
│   │   └── index.ts                # All TypeScript interfaces + storage constants
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client init
│   │   └── analyzeGain.ts          # Web Audio loudness analysis on upload
│   ├── pages/                      # Route-level page components
│   └── App.tsx                     # Root component
├── public/
├── index.html
├── vite.config.ts
├── vercel.json
└── package.json
```

---

## Separate Deployments

Studio2Radio runs as three independent services:

```
┌─────────────────────────────────────────────────────────┐
│  Vercel                                                 │
│  radiostation-murex.vercel.app                         │
│  Next.js / React app — auth, library, playlists, on-air│
└────────────────────────┬────────────────────────────────┘
                         │ artist sets on-air config
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase                                               │
│  ckilxbljczwiiwdkipir                                   │
│  Postgres DB + audio file storage                       │
└────────────────────────┬────────────────────────────────┘
                         │ worker reads tracks + config
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Cloudflare Worker                                      │
│  radio-station-widget.smartselleraico.workers.dev       │
│  Fetches tracks, signs URLs, returns ordered JSON       │
└────────────────────────┬────────────────────────────────┘
                         │ widget calls worker
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Cloudflare Pages                                       │
│  Embeddable widget — crossfade player, themes, fonts   │
└─────────────────────────────────────────────────────────┘
```

---

## Supabase Schema

### Tables

**`profiles`** — one row per user
```sql
id            uuid  (FK → auth.users)
name          text
logo_url      text       -- storage path, signed at runtime
radio_config  jsonb      -- { mode, trackIds, playlistIds }
bio           text
location      text
website       text
instagram_url text
twitter_url   text
soundcloud_url text
mixcloud_url  text
primary_pro   text
ascap_id      text
-- + bmi, sesac, gmr, socan, prs, sound_exchange, ipi, isni
-- + publisher_name, publisher_ipi, distributor_name, label_name
```

**`tracks`** — audio catalog
```sql
id            uuid
user_id       uuid
title         text
composer      text
duration      numeric
file_path     text       -- storage path
file_url      text
file_size     bigint
sort_order    integer    -- drag-reorder index
gain_db       numeric    -- loudness offset applied at playback
genre         text
mood          text
tags          text[]
writers       text[]
isrc_code     text
upload_date   timestamptz
updated_at    timestamptz
```

**`playlists`**
```sql
id            uuid
user_id       uuid
name          text
description   text
track_ids     uuid[]     -- ordered array — widget respects this order
is_shuffled   boolean
loop_mode     text
created_date  timestamptz
updated_date  timestamptz
```

**`play_logs`** — analytics
```sql
id                uuid
user_id           uuid
track_id          uuid
play_timestamp    timestamptz
duration_played   numeric
percentage_played numeric
session_id        text
counted           boolean
```

**`saved_stations`** — Discover feature
```sql
user_id         uuid
station_user_id uuid
name            text
logo_url        text
saved_at        timestamptz
```

### Storage Buckets

| Bucket | Contents | Quota |
|---|---|---|
| `audio` | Track files + logo images | 300MB per user |

---

## Cloudflare Worker

**File:** `worker.js`  
**Deploy:** Cloudflare Dashboard → Workers → Paste → Save & Deploy  
**No Wrangler. No CLI.**

### Environment Variables (set in dashboard)
```
SUPABASE_URL        https://ckilxbljczwiiwdkipir.supabase.co
SUPABASE_SERVICE_KEY  <service role key>
```

### What the Worker Does

1. Receives `?userId=` query param from widget
2. Fetches all tracks ordered by `sort_order ASC, upload_date ASC`
3. Reads `radio_config` from profile to determine on-air mode
4. Builds ordered track list — playlist `track_ids` array order is respected exactly
5. Signs Supabase storage URLs (1-hour expiry)
6. Returns `{ stationName, logoUrl, tracks }` as JSON with CORS headers

### On-Air Modes

| Mode | Behavior |
|---|---|
| `all` | All tracks, sort_order ASC |
| `selected` (orderedTrackIds set) | Explicit order from config |
| `selected` (playlist-based) | Walks `track_ids` arrays in playlist order |

---

## Widget

**File:** `index.html` (single file, no build step)  
**Deploy:** Cloudflare Pages → Upload file

### URL Parameters

| Param | Values | Default |
|---|---|---|
| `userId` | Supabase user UUID | demo account |
| `theme` | `dark` `green` `purple` `warm` `midnight` | `dark` |
| `font` | `inter` `mono` `serif` `orbitron` `oswald` | `inter` |

### Embed Code
```html
<iframe
  src="https://your-widget.pages.dev?userId=YOUR_UUID&theme=dark&font=mono"
  width="380"
  height="520"
  frameborder="0"
  allow="autoplay"
  style="border-radius:16px;"
></iframe>
```

### Playback Engine

- **Two audio elements** ping-pong between tracks
- **Preload** starts 45 seconds before current track ends
- **2-second crossfade** using `requestAnimationFrame` volume ramp
- No gap between tracks

---

## Local Development

```bash
git clone https://github.com/gfbtools/radiostation
cd radiostation
npm install
```

Create `.env.local`:
```
VITE_SUPABASE_URL=https://ckilxbljczwiiwdkipir.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

```bash
npm run dev
```

---

## Deploy

### App (Vercel)
```bash
git add .
git commit -m "your message"
git push origin main
# Vercel auto-deploys on push
```

### Worker (Cloudflare Dashboard)
1. Cloudflare → Workers & Pages → `radio-station-widget`
2. Edit code → paste updated `worker.js` → Save & Deploy

### Widget (Cloudflare Pages)
1. Cloudflare → Workers & Pages → your Pages project
2. Deployments → Upload → drop `index.html`

---

## Beta Testers

5 active testers at 200MB each. Storage quota: 300MB per account.  
Quota enforcement is client-side in `useStore.ts` via `STORAGE_QUOTA_FREE_BYTES`.

---

## Known Issues / Future

- `sort_order` is written on drag-reorder. Tracks uploaded before the reorder feature was added may need the Supabase backfill SQL:

```sql
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY upload_date ASC) - 1 AS rn
  FROM tracks WHERE sort_order IS NULL
)
UPDATE tracks SET sort_order = ranked.rn
FROM ranked WHERE tracks.id = ranked.id;
```

- Widget crossfade does not apply on manual track skip (intentional — hard cut on user action)
- Signed URLs expire after 1 hour; long sessions may need a page refresh

---

## Part of the Drop10 Suite

Studio2Radio is one of several browser-based music tools built under the Drop10 brand.

| App | Description | Status |
|---|---|---|
| Studio2Radio | Web radio platform | ✅ Live |
| MixNMaster | Browser-based AI mastering | ✅ Complete |
| SynthLab | Subtractive synthesizer | 🔧 In progress |
| Mix Health | Track analysis tool | ✅ Complete |
| DrumLab | Step sequencer + beat generator | 📋 Planned |

---

*Built by an independent artist, for independent artists.*
