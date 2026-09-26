# Feature: movement-look

Move and look like a player. Requires a started run (driver starts one first).

## Selectors

- `#view` canvas (screenshot diff target)
- Movement keys: `KeyW/A/S/D`, arrows; `Space` jump

## Steps (player-like)

1. Start run via `#startBtn`.
2. Hold `KeyW` 800 ms (screenshot A → B; frame pixels must change).
3. Tap `Space` (jump; no error, game keeps running).
4. Send 3× `ArrowLeft` 150 ms taps (look turn; frame pixels must change).

## Pass criteria

- No page errors during movement.
- Canvas framebuffer differs between A and B (player pose changed).
- `#hp` still matches `/\d+\/\d+/` (HUD alive, game not crashed).
