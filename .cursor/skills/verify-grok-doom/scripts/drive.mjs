// Headless player drive for Grok DOOM (needs `playwright-core` resolvable +
// a system Chrome/Chromium; no browser download).
// Usage: node drive.mjs --url http://localhost:8765/ --feature game-start [--evidence ../evidence]
// Writes evidence/drive-<feature>.json, console-<feature>.log, title.png, gameplay-<feature>.png.
// Exits 0 when every assertion passes, 1 otherwise.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const val = (f, d) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : d;
};
const BASE = val("--url", "http://localhost:8765/");
const FEATURE = val("--feature", "game-start");
const EVIDENCE = val("--evidence", join(HERE, "..", "evidence"));

const CHROME_CANDIDATES = [
  "/usr/local/bin/google-chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];
const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p));

let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  console.error("drive.mjs needs playwright-core: npm i -D playwright-core (once), then re-run.");
  process.exit(2);
}

await mkdir(EVIDENCE, { recursive: true });
const consoleLines = [];
const requestFailures = [];
const pageErrors = [];
const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
const text = async (page, sel) => {
  try { return (await page.textContent(sel))?.trim() ?? null; } catch { return null; }
};
const shotDiffers = async (a, b) => {
  if (!a || !b || a.length !== b.length) return true;
  let diff = 0;
  for (let i = 0; i < a.length; i += 997) if (a[i] !== b[i] && ++diff > 3) return true;
  return diff > 0;
};

const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("console", (m) => {
  const line = `[${m.type()}] ${m.text()}`;
  consoleLines.push(line);
  if (m.type() === "error") console.log("CONSOLE:", line.slice(0, 300));
});
page.on("pageerror", (e) => { pageErrors.push(String(e).slice(0, 500)); });
page.on("requestfailed", (r) => {
  requestFailures.push(`${r.url().slice(0, 160)} :: ${r.failure()?.errorText}`);
});
page.on("response", (r) => {
  if (r.status() >= 400 && new URL(r.url()).origin === new URL(BASE).origin) {
    requestFailures.push(`${r.url().slice(0, 160)} :: HTTP ${r.status()}`);
  }
});

try {
  await page.goto(BASE, { waitUntil: "load", timeout: 30000 });
  await page.waitForSelector("#startBtn", { timeout: 15000 });
  const msgTitle = await text(page, "#msgTitle");
  check("title-visible", (await page.locator("#msg.title-mode").count()) === 1, `#msgTitle=${msgTitle}`);
  await page.screenshot({ path: join(EVIDENCE, "title.png") });

  const hudBefore = {
    hp: await text(page, "#hp"),
    weapon: await text(page, "#weaponName"),
    ammo: await text(page, "#ammoLine"),
    prog: await text(page, "#progMain"),
  };

  await page.click("#startBtn");
  await page.waitForFunction(
    () => document.querySelector("#msg")?.classList.contains("hidden"),
    { timeout: 10000 },
  ).catch(() => {});
  await page.waitForTimeout(1500);
  const overlayHidden = (await page.locator("#msg.hidden").count()) === 1;
  check("game-start-overlay-hidden", overlayHidden, "#msg.hidden after ENTER THE ARENA");
  const prog = await text(page, "#progMain");
  check("game-start-wave", !!prog && (/WAVE \d+/.test(prog) || /BOSS/.test(prog)),
    `#progMain=${prog} (Hell Arena gates on kills: "BOSS k/gate"; Citadel shows WAVE n/max)`);
  const hp = await text(page, "#hp");
  check("game-start-hp", !!hp && /\d+\/\d+/.test(hp), `#hp=${hp}`);

  if (FEATURE === "game-start") {
    // NOTE: updateHud() sets #aliveLine.textContent, which replaces the
    // #aliveCount child span — so read the parent line, not the span.
    const aliveNum = async () => {
      const line = await text(page, "#aliveLine");
      const m = line && line.match(/(\d+)/);
      return m ? Number(m[1]) : null;
    };
    let alive = await aliveNum();
    for (let i = 0; alive === 0 && i < 10; i++) {
      await page.waitForTimeout(500);
      alive = await aliveNum();
    }
    check("game-start-enemies", (alive ?? 0) > 0, `#aliveLine=${await text(page, "#aliveLine")}`);
    await page.screenshot({ path: join(EVIDENCE, "gameplay-game-start.png") });
  }

  if (FEATURE === "movement-look") {
    const a = await page.locator("#view").screenshot();
    await page.keyboard.down("KeyW");
    await page.waitForTimeout(800);
    await page.keyboard.up("KeyW");
    const b = await page.locator("#view").screenshot();
    check("movement-changes-frame", await shotDiffers(a, b), "W hold alters framebuffer");
    await page.keyboard.press("Space");
    await page.waitForTimeout(400);
    for (let i = 0; i < 3; i++) {
      await page.keyboard.down("ArrowLeft");
      await page.waitForTimeout(150);
      await page.keyboard.up("ArrowLeft");
    }
    const hpAfter = await text(page, "#hp");
    check("movement-hud-alive", !!hpAfter && /\d+\/\d+/.test(hpAfter), `#hp=${hpAfter}`);
    await page.screenshot({ path: join(EVIDENCE, "gameplay-movement-look.png") });
  }

  if (FEATURE === "combat-shoot") {
    const box = await page.locator("#view").boundingBox();
    for (let i = 0; i < 5; i++) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(250);
    }
    const ammo = await text(page, "#ammoLine");
    check("combat-shotgun-infinite", ammo === "AMMO ∞", `#ammoLine=${ammo}`);
    const kills = await text(page, "#kills");
    const feed = await page.locator("#killfeed .kf-line").count().catch(() => 0);
    check("combat-no-crash", (await text(page, "#hp")) != null, `kills=${kills} feed=${feed}`);
    await page.screenshot({ path: join(EVIDENCE, "gameplay-combat-shoot.png") });
  }

  if (FEATURE === "weapons-hud") {
    const w0 = await text(page, "#weaponName");
    const a0 = await text(page, "#ammoLine");
    check("weapons-initial", w0 === "SHOTGUN" && a0 === "AMMO ∞", `${w0} / ${a0}`);
    await page.keyboard.press("Digit2");
    await page.waitForTimeout(300);
    const w1 = await text(page, "#weaponName");
    check("weapons-unowned-safe", !!w1 && w1.length > 0, `after Digit2: ${w1}`);
    await page.keyboard.press("KeyQ");
    await page.waitForTimeout(200);
    await page.keyboard.press("KeyE");
    await page.waitForTimeout(200);
    check("weapons-cycle-safe", ((await text(page, "#weaponName")) ?? "").length > 0, "");
    await page.screenshot({ path: join(EVIDENCE, "gameplay-weapons-hud.png") });
  }

  if (FEATURE === "waves-restart") {
    check("waves-initial", (await text(page, "#progMain")) === "WAVE 1", await text(page, "#progMain"));
    await page.keyboard.press("KeyT");
    await page.waitForTimeout(300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    await page.keyboard.press("KeyP");
    await page.waitForTimeout(200);
    await page.keyboard.press("KeyP");
    await page.waitForTimeout(200);
    await page.keyboard.press("KeyR");
    await page.waitForTimeout(800);
    check("waves-restart-runs", !!((await text(page, "#progMain")) ?? "").match(/WAVE \d+/),
      `#progMain=${await text(page, "#progMain")}`);
    const hs = await page.evaluate(() => {
      try { return localStorage.getItem("grok-doom-highscore"); } catch { return "unreadable"; }
    });
    check("waves-highscore-readable", hs !== "unreadable", `grok-doom-highscore=${hs}`);
    await page.screenshot({ path: join(EVIDENCE, "gameplay-waves-restart.png") });
  }

  check("no-page-errors", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | ") || "none");
  // The soundtrack loader probes .ogg/.mp3 before .wav per track ("first
  // existing file wins"); those 404s are by-design fallback noise. Tolerate
  // exactly those, fail on anything else, and record them as measured.
  const audioFallback404s = requestFailures.filter((l) => /\/audio\/.+\.(ogg|mp3) :: HTTP 404/.test(l));
  const realFails = requestFailures.filter((l) =>
    !l.includes("favicon") && !/\/audio\/.+\.(ogg|mp3) :: HTTP 404/.test(l));
  check("no-failed-requests", realFails.length === 0, realFails.slice(0, 3).join(" | ") || "none");

  const failed = results.filter((r) => !r.pass);
  await writeFile(join(EVIDENCE, `drive-${FEATURE}.json`), JSON.stringify({
    feature: FEATURE, url: BASE, at: new Date().toISOString(),
    hudBefore, pass: failed.length === 0,
    assertions: results, pageErrors, requestFailures, audioFallback404s,
    consoleErrors: consoleLines.filter((l) => l.startsWith("[error]")),
  }, null, 2));
  await writeFile(join(EVIDENCE, `console-${FEATURE}.log`),
    [...consoleLines, "", "--- pageerrors ---", ...pageErrors, "", "--- request failures ---", ...requestFailures].join("\n"));
  console.log(failed.length === 0 ? `DRIVE(${FEATURE}): PASS` : `DRIVE(${FEATURE}): FAIL (${failed.length})`);
  await browser.close();
  process.exit(failed.length === 0 ? 0 : 1);
} catch (e) {
  console.error("DRIVE ERROR:", String(e).slice(0, 1000));
  try { await page.screenshot({ path: join(EVIDENCE, `gameplay-${FEATURE}-error.png`) }); } catch {}
  await browser.close();
  process.exit(1);
}
