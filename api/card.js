export const config = { runtime: "edge" };

const PLAY = "https://grokdoom.vercel.app";

function param(url, key, fallback) {
  const v = url.searchParams.get(key);
  if (v == null || v === "") return fallback;
  return String(v).replace(/[^\w:.-]/g, "").slice(0, 24);
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export default function handler(request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const kills = param(url, "k", "0");
  const time = param(url, "t", "00:00");
  const wave = param(url, "w", "1");
  const best = param(url, "b", kills);
  const win = param(url, "v", "0") === "1";
  const seed = param(url, "s", "").toUpperCase();
  const mut = param(url, "m", "standard").toLowerCase();
  const arena = param(url, "a", "hell").toLowerCase();
  const qs = `k=${encodeURIComponent(kills)}&t=${encodeURIComponent(time)}&w=${encodeURIComponent(wave)}&b=${encodeURIComponent(best)}&v=${win ? "1" : "0"}&s=${encodeURIComponent(seed)}&m=${encodeURIComponent(mut)}&a=${encodeURIComponent(arena)}`;
  const playQs = [];
  if (seed) playQs.push("s=" + encodeURIComponent(seed));
  if (mut && mut !== "standard") playQs.push("m=" + encodeURIComponent(mut));
  if (arena && arena !== "hell") playQs.push("a=" + encodeURIComponent(arena));
  const play = PLAY + (playQs.length ? "?" + playQs.join("&") : "");
  const image = `${origin}/api/og?${qs}`;
  const title = win
    ? `RIP AND TEAR — ${kills} kills in GROK DOOM`
    : `YOU DIED — ${kills} kills in GROK DOOM`;
  const desc = "Fictional video game. Play in the browser.";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${esc(`${origin}/api/card?${qs}`)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(image)}" />
<meta http-equiv="refresh" content="0;url=${play}" />
</head>
<body style="background:#0a0a0a;color:#ddd;font-family:Courier New,monospace;padding:40px">
<p>GROK DOOM — fictional video game</p>
<p><a href="${esc(play)}" style="color:#ffb000">${esc(play)}</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
