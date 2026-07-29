# Grok DOOM

Single-file browser arena FPS (software raycaster). No build step — static files only.

## Play

**Live:** [https://grokdoom.vercel.app](https://grokdoom.vercel.app)

### Best way to play: DualSense

Grok DOOM is built for the **PlayStation DualSense** controller over **WebHID** (Chrome / Chromium, HTTPS). That is the intended full experience:

- Full **haptic feedback** (rumble that tracks combat)
- **Adaptive triggers** (L2 / R2 resistance for aim and fire)
- Sticks, face buttons, and shoulder inputs mapped for the arena

Connect DualSense over USB or Bluetooth, open the live site in Chrome, then use the in-game **DS5 TRIGGERS** control (user gesture required so the browser can claim the device). Keyboard + mouse still work fine; DualSense is just the best way to play.

### Play locally

```bash
cd doom
python3 -m http.server 8765
```

Open [http://localhost:8765/](http://localhost:8765/)

**Do not open `index.html` via `file://`** if you want audio + WebHID DualSense — browsers restrict those APIs off HTTP(S).

## Controls

| Input | Action |
|--------|--------|
| WASD / L stick | Move |
| Mouse / R stick | Look |
| Click / R2 / □ | Shoot |
| RMB / F / L2 | Aim (ADS) |
| Space / ✕ | Jump |
| 1–3 / Q E / ○ R1 | Weapons |
| T | Soundtrack menu |
| [ ] | Resolution (sets auto-quality ceiling) |
| P | Toggle auto quality |
| R / ✕ (on end screen) | Restart |
| DS5 TRIGGERS button | DualSense WebHID: adaptive triggers + full haptics (Chrome) |

## Layout

```
doom/
  index.html          # game (HTML + CSS + JS)
  audio/
    music/*.wav       # soundtrack (~1.3–1.6 MB each)
    sfx/*.wav         # short effects
  _headers            # Cloudflare Pages / Netlify-compatible security headers
  vercel.json         # Vercel static headers
  netlify.toml        # Netlify publish + headers
```

Approx size: **~8 MB** (mostly music).

## Security notes (static client game)

This is a **client-only** game — no backend, no accounts, no secrets.

| Area | Status |
|------|--------|
| Network surface | Same-origin `fetch` for audio only; no third-party scripts/CDNs |
| XSS | Killfeed / end-screen stats use `textContent` / DOM APIs |
| Path traversal | Audio paths allowlisted (`safeAudioRel`) |
| Storage | `localStorage` high score + preferred track (capped / allowlisted) |
| DualSense WebHID | User-gesture device pick; reports only to selected DualSense |
| CSP | Meta CSP + host headers (inline script/style required for single-file app) |
| Framing | `frame-ancestors 'none'` / `X-Frame-Options: DENY` |

**Residual risk (acceptable for this game):** high score can be edited in DevTools (local vanity only). WebHID is privileged and Chrome-only by design.

## Deploy

Production is on **Vercel** at [https://grokdoom.vercel.app](https://grokdoom.vercel.app) (repo linked for push-to-deploy on `main`).

Root directory must be this folder (so `/` serves `index.html` and `/audio/...` works).

### Vercel

```bash
npx vercel --prod
```

Uses `vercel.json` headers. Framework: **Other** / static. Project: HeartBeatForge `grok-doom`.

### Cloudflare Pages

1. Connect repo or `npx wrangler pages deploy . --project-name=grok-doom`
2. Build command: *(none)* · Output directory: `.`
3. `_headers` is applied automatically

### Netlify

```bash
npx netlify deploy --prod --dir=.
```

Uses `netlify.toml`.

### GitHub Pages

Push this folder (or `docs/`) and enable Pages. **Note:** GH Pages does not apply `_headers`; rely on the meta CSP in `index.html`.

### Any static host (S3, nginx, Caddy)

Serve the directory as the site root. Prefer HTTPS. Example nginx snippet:

```nginx
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header Referrer-Policy strict-origin-when-cross-origin;
```

## Pre-flight checklist

- [ ] Live site [https://grokdoom.vercel.app](https://grokdoom.vercel.app) loads over HTTPS
- [ ] `python3 -m http.server` — title loads, ENTER THE ARENA works
- [ ] Audio plays (click once to unlock AudioContext)
- [ ] Wave banners / death screen / high score look correct
- [ ] Auto quality (`P`) / res `[` `]` behave
- [ ] DualSense (best path): Chrome + HTTPS + user gesture — haptics + adaptive triggers
- [ ] `/audio/music/*.wav` returns 200 on the live host

## License / assets

Code: project-local. Music/SFX: see `audio/README.md` for source notes.
