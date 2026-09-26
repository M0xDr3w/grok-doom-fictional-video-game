// Zero-dependency static file server for the repo root.
// Usage: node serve.mjs --port 8765 [--root /path/to/repo]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize, sep } from "node:path";

const args = process.argv.slice(2);
const portIdx = args.indexOf("--port");
const rootIdx = args.indexOf("--root");
const PORT = portIdx >= 0 ? Number(args[portIdx + 1]) || 8765 : 8765;
const ROOT = rootIdx >= 0 ? args[rootIdx + 1] : new URL("../../../..", import.meta.url).pathname;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".wav": "audio/wav",
  ".toml": "text/plain; charset=utf-8",
};

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let rel = normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "").replace(/^\/+/, "");
    if (rel === "" || rel.endsWith(sep)) rel = join(rel, "index.html");
    const file = join(ROOT, rel);
    if (!file.startsWith(ROOT)) {
      res.writeHead(403); res.end("forbidden"); return;
    }
    const st = await stat(file);
    if (!st.isFile()) { res.writeHead(404); res.end("not found"); return; }
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404); res.end("not found");
  }
});

server.listen(PORT, () => console.log(`verify-grok-doom serving ${ROOT} on http://localhost:${PORT}/`));
