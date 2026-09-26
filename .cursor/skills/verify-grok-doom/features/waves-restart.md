# Feature: waves-restart

Wave progress display, end screen, and restart. Requires a started run.

## Selectors

- `#progMain` (`WAVE n` / boss text), `#aliveLine`, `#buffLine`
- `#msg.dead-mode` / `#msg.win-mode`, `#msgScore`, `#titleBtn`
- Key `KeyR` restart; `T` soundtrack menu; `P` auto quality;
  `BracketLeft/Right` resolution ceiling (`#resLine`)

## Steps (player-like)

1. Start run via `#startBtn`. Assert `#progMain` = `WAVE 1`.
2. Press `T` (soundtrack menu opens/closes without error).
3. Press `P` twice (auto-quality toggle round-trips).
4. Press `KeyR` (restart per key contract) — game keeps running,
   `#progMain` shows a wave title again, no errors.

## Pass criteria

- Wave title renders on fresh and restarted runs (measured).
- Overlay toggles (`T`, restart) never throw page errors.
- `localStorage grok-doom-highscore` readable (vanity only, capped).
- Full death → end-screen → restart loop is timing-dependent; if the
  player does not die during the run, report survival as measured and
  the end-screen path as not exercised (not a failure).
