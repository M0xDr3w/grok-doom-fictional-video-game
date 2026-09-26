# Evidence

Runtime outputs from executing this skill. **Do not commit run outputs** —
they must survive Cleanup on disk, not in git. Only `.gitkeep` is tracked.

Per-run files:

- `doctor.json` — doctor check results
- `drive-<feature>.json` — assertions, HUD before/after, console errors,
  failed requests
- `console-<feature>.log` — page console + request-failure log
- `title.png`, `gameplay-<feature>.png` — screenshots proving the run

Copy the 1–2 screenshots that prove a run to the run artifacts dir
(`/opt/cursor/artifacts`) for the final report.
