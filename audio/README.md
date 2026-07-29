# Grok DOOM — audio drop-in

The game loads files from this folder first, then falls back to the built-in Web Audio synth if a file is missing.

## Layout

```
audio/
  music/
    iron-pulse.wav      ← track 1 IRON PULSE (default)
    ambient-hell.wav    ← track 2 AMBIENT HELL
    bone-saw.wav        ← track 3 BONE SAW
    crimson-drone.wav   ← track 4 CRIMSON DRONE
    ash-choir.wav       ← track 5 ASH CHOIR
    (also tries .ogg / .mp3 for each basename)
  sfx/
    shoot.wav  hit.wav  kill.wav  explode.wav
    pain.wav   jump.wav die.wav   wave.wav
    win.wav    growl.wav
```

## In-game soundtrack controls

| Key | Action |
|-----|--------|
| **T** | Open / close soundtrack menu |
| **↑↓** / **W S** | Highlight track |
| **Enter** / **Space** | Play selected track |
| **1–5** | Jump to track |
| **N** | Next available track (no menu) |
| **△** (PS5) | Toggle music menu |
| **L1** (PS5) | Next track |

Default is **Iron Pulse**. Choice is saved in `localStorage` (`grok-doom-track`).

## Replace with your own (Suno later)

1. Export seamless loops named like `ambient-hell.ogg`, `bone-saw.ogg`, etc.
2. Or add a new entry in the `TRACKS` array in `index.html`.
3. Hard refresh. Prefer `.ogg` / `.mp3` over large WAVs.

**Tip:** Match loop start/end so seamless looping doesn’t click.

## Serve over HTTP

Browsers often block `file://` audio loads. From the `doom/` folder:

```bash
cd /Users/drewmax/projects/doom
python3 -m http.server 8765
```

Then open: http://localhost:8765/

## License notes

- Placeholder WAVs in this folder were **generated for this project** (simple synth tones) — free to replace.
- When you add Suno / Freesound / etc., keep licenses you can use (CC0 or your own export ToS).
- Prefer **CC0** or **you own it** if you ship or stream.

## How the game picks audio

| Type | Tries first | Fallback |
|------|-------------|----------|
| SFX | Decode to `AudioBuffer` (`sfx/<name>.{wav,ogg,mp3}`) | HTMLAudio clone, then Web Audio beep/noise |
| Music | `music/<basename>.{ogg,mp3,wav}` | Procedural techno sequencer |

Playback features (runtime):

- SFX bus + soft master compressor (with music)
- Pitch / volume micro-variation on repeated shots
- Stereo pan + distance falloff for world SFX (hits, kills, growls, explosions)
- Combat music duck (nearby enemies + short duck after loud SFX)
- Low-HP heartbeat thump (pairs with DualSense rumble)

Mute (**M** / Create) silences both file audio and synth.
