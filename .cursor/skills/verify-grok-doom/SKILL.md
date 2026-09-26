---
name: verify-grok-doom
description: Launch Grok DOOM locally, run the doctor check, drive one mapped feature like a player, capture evidence, then clean up. Use when verifying Grok DOOM behavior end to end on the real artifact.
---

# Verify Grok DOOM

Grok DOOM is a static single-file browser arena FPS (`index.html`, no build step).
This skill proves behavior on the **real artifact**: a local HTTP server plus a
headless Chromium drive. Never `file://` (audio + WebHID need HTTP(S)).

## Data shape first

Name the contract before touching the game. The DOM is the test surface:

- `#view` — canvas `960x600`, the software raycaster framebuffer.
- HUD: `#hp` (`7/7` format), `#weaponName` (`SHOTGUN`), `#ammoLine`
  (`AMMO ∞` or `AMMO n`), `#kills`, `#aliveLine` (read the parent line —
  `#aliveCount` is replaced after the first HUD tick), `#progMain`
  (Hell Arena: `BOSS k/gate`; Citadel: `WAVE n/max`), `#buffLine`, `#resLine`.
- Overlay `#msg`: `.title-mode` (title) / `.hidden` (in-game) / `.dead-mode` /
  `.win-mode` (end screens). Children: `#msgTitle`, `#msgBody`, `#msgScore`,
  `#msgRecord`, `#startBtn` (ENTER THE ARENA), `#shareBtn`, `#titleBtn`.
- `#killfeed` — kill/event lines appended as `.kf-line` (`.warn`, `.alert`).
- Title options: `#arenaRow` (`data-arena` 0/1/2), `#mutRow` (`data-mut`),
  `#seedInput`, `#seedRoll`, `#seedDaily`.
- Storage: `localStorage` `grok-doom-highscore`, `grok-doom-track`.
- Keyboard contract (`e.code`): `KeyW/A/S/D` + arrows move, `Space` jump,
  `Digit1/2/3` + `KeyQ/KeyE` weapons, `KeyT` soundtrack, `BracketLeft/Right`
  resolution, `KeyP` auto quality, `KeyR` restart, click shoot, `RMB`/`KeyF` aim.

Pass/fail is always asserted against these selectors and values, never vibes.
See `features/` for per-feature selectors, steps, and pass criteria.

## Launch

Serve the repo root over HTTP (required for audio). Default port `8765`:

```bash
node .cursor/skills/verify-grok-doom/scripts/serve.mjs --port 8765 &
# or: python3 -m http.server 8765
```

The game URL is `http://localhost:8765/`. Wait for `GET /` → `200`
before continuing. Kill the server in Cleanup.

## Doctor

Read-only health probe of the served artifact. No gameplay input:

```bash
node .cursor/skills/verify-grok-doom/scripts/doctor.mjs --url http://localhost:8765/
```

Checks: `/` returns 200 with `<canvas id="view"` and `#startBtn`; all
`audio/music/*.wav` + `audio/sfx/*.wav` referenced by the page return 200;
no `4xx/5xx` on same-origin subresources. Exits non-zero with a JSON
report on failure. Writes `evidence/doctor.json`.

## Drive

Drive exactly ONE mapped feature per run, the way a player would, using
headless Chromium (playwright-core + system Chrome, no browser download):

```bash
node .cursor/skills/verify-grok-doom/scripts/drive.mjs \
  --url http://localhost:8765/ \
  --feature game-start \
  --evidence .cursor/skills/verify-grok-doom/evidence
```

Each feature file under `features/` lists its steps and pass criteria; the
driver clicks/keys the real DOM (`#startBtn`, WASD, click-to-shoot, `1-3`,
`R`), reads back the Data-shape selectors, and fails loudly on mismatch.
Available features: `game-start`, `movement-look`, `combat-shoot`,
`weapons-hud`, `waves-restart`.

## Evidence

Every run writes to `evidence/` (git-ignored except `.gitkeep`):

- `doctor.json` — doctor check results.
- `drive-<feature>.json` — console errors, failed requests, HUD
  before/after snapshots, pass/fail per assertion.
- `title.png`, `gameplay-<feature>.png` — screenshots proving the run.
- `console-<feature>.log` — page console + request-failure log.

Copy the 1–2 screenshots that prove the run to the run artifacts dir
(`/opt/cursor/artifacts`) for the final report.

## Cleanup

1. Close the browser (the driver always does, even on failure).
2. Kill the HTTP server (`pkill -f "serve.mjs.*8765"` or the python server).
3. Confirm `evidence/*.png`, `*.log`, `*.json` from the run still exist —
   evidence must survive cleanup. Print `ls evidence/`.

## Helpers

- `scripts/serve.mjs` — zero-dependency static server for the repo root.
- `scripts/doctor.mjs` — zero-dependency HTTP health probe, writes
  `evidence/doctor.json`.
- `scripts/drive.mjs` — needs `playwright-core` resolvable
  (`npm i -D playwright-core` once, or `NODE_PATH=/tmp/verify/node_modules`).
  Uses system Chrome (`/usr/local/bin/google-chrome`, falls back to
  Chromium channel) headless. Never touches gameplay code, never deploys,
  never touches Vercel settings or env vars, never writes secrets.
