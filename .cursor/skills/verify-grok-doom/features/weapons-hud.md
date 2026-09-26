# Feature: weapons-hud

Weapon switching and HUD readback. Requires a started run.

## Selectors

- `#weaponName`, `#ammoLine` (`AMMO ∞` vs `AMMO n`)
- Keys: `Digit1`, `Digit2`, `Digit3`, `KeyQ`, `KeyE`

## Steps (player-like)

1. Start run via `#startBtn`.
2. Assert `#weaponName` = `SHOTGUN`, `#ammoLine` = `AMMO ∞`.
3. Press `Digit2` (chaingun, 0 ammo at spawn — must stay SHOTGUN).
4. Press `KeyQ` / `KeyE` (cycle; with one owned weapon, stays SHOTGUN).

## Pass criteria

- Initial HUD exactly `SHOTGUN` / `AMMO ∞` (measured).
- Switching to an unowned weapon does not blank `#weaponName`
  (still a known weapon name, game not soft-locked).
- No page errors.
