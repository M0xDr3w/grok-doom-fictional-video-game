# Feature: game-start

Start a run from the title screen.

## Selectors

- `#msg.title-mode` visible on load, `#msgTitle` = `GROK DOOM`
- `#startBtn` (ENTER THE ARENA)
- `#msg.hidden` after start; `#progMain`, `#hp`, `#ammoLine` live

## Steps (player-like)

1. Load `/`. Assert title overlay visible, canvas `#view` 960x600 present.
2. Click `#startBtn`.
3. Wait 1500 ms for first wave spawn.

## Pass criteria

- `#msg` gains `.hidden` (overlay gone, game running).
- `#progMain` shows progress: Hell Arena gates on kills (`BOSS k/gate`,
  e.g. `BOSS 0/15` on a fresh run); Iron Citadel shows `WAVE n/max`.
- `#hp` matches `/\d+\/\d+/` (fresh run: `7/7`).
- Enemies spawn: parse the count out of `#aliveLine` (do NOT read the
  `#aliveCount` span — `updateHud()` sets `#aliveLine.textContent`, which
  replaces that child span after the first tick) and expect > 0 within 5 s.
- Screenshot shows raycaster frame (not black/title).
- Known tolerated noise (recorded, not failures): the soundtrack loader
  probes `.ogg`/`.mp3` before `.wav` per track, so expect 404s for those
  two extensions; only other same-origin failures count.
