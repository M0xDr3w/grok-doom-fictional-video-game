# Feature: combat-shoot

Shoot the way a player does. Requires a started run.

## Selectors

- `#ammoLine`, `#kills`, `#killfeed .kf-line`, `#cross`

## Steps (player-like)

1. Start run via `#startBtn`, wait for `#aliveCount` > 0.
2. `mouse.click` center of `#view` 5× with 250 ms gaps (shoot).
3. Read `#kills`, `#ammoLine`, `#killfeed` line count.

## Pass criteria

- No page errors on shoot.
- Shotgun has infinite ammo: `#ammoLine` stays `AMMO ∞` (measured).
- Either `#kills` > 0 or a `.kf-line` appears within 10 s of sustained
  fire (aim-dependent; report which, measured vs guess).
- Canvas still rendering (screenshot non-uniform).
