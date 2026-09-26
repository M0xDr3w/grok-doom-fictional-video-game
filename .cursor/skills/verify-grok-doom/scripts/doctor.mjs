// Zero-dependency HTTP health probe for the served Grok DOOM artifact.
// Usage: node doctor.mjs --url http://localhost:8765/ [--evidence ../evidence]
// Exits 0 on pass, 1 on failure. Writes evidence/doctor.json.
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const urlIdx = args.indexOf("--url");
const evIdx = args.indexOf("--evidence");
const BASE = (urlIdx >= 0 ? args[urlIdx + 1] : "http://localhost:8765/").replace(/\/$/, "") + "/";
const EVIDENCE = evIdx >= 0 ? args[evIdx + 1] : join(HERE, "..", "evidence");

const checks = [];
const ok = (name, pass, detail = "") => {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const get = async (path) => {
  const res = await fetch(BASE + path.replace(/^\//, ""));
  const text = path === "" || path === "/" || path.endsWith(".html")
    ? await res.text() : null;
  return { status: res.status, text };
};

const failures = [];

// 1. Root serves the game.
try {
  const { status, text } = await get("/");
  ok("root-200", status === 200, `GET / -> ${status}`);
  ok("root-has-canvas", !!text && text.includes('<canvas id="view"'), "canvas#view present");
  ok("root-has-startBtn", !!text && text.includes('id="startBtn"'), "#startBtn present");
  ok("root-has-hud", !!text && ["id=\"hp\"", "id=\"kills\"", "id=\"progMain\""]
    .every((s) => text.includes(s)), "#hp/#kills/#progMain present");
} catch (e) {
  ok("root-200", false, String(e));
}

// 2. Audio files on disk are served with 200.
try {
  const repoRoot = join(HERE, "..", "..", "..", "..");
  for (const dir of ["audio/music", "audio/sfx"]) {
    let files = [];
    try { files = (await readdir(join(repoRoot, dir))).filter((f) => f.endsWith(".wav")); } catch {}
    ok(`${dir}-nonempty`, files.length > 0, `${files.length} wav`);
    for (const f of files) {
      try {
        const { status } = await get(`${dir}/${f}`);
        ok(`serve-${dir}/${f}`, status === 200, `-> ${status}`);
      } catch (e) {
        ok(`serve-${dir}/${f}`, false, String(e));
      }
    }
  }
} catch (e) {
  ok("audio-sweep", false, String(e));
}

const failed = checks.filter((c) => !c.pass);
await mkdir(EVIDENCE, { recursive: true });
await writeFile(join(EVIDENCE, "doctor.json"), JSON.stringify({
  base: BASE, at: new Date().toISOString(),
  pass: failed.length === 0, checks,
}, null, 2));
console.log(failed.length === 0 ? "DOCTOR: PASS" : `DOCTOR: FAIL (${failed.length} checks)`);
process.exit(failed.length === 0 ? 0 : 1);
