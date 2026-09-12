import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { ImageResponse } from "@vercel/og";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, "..", "og.png");

const blood = "#c41e3a";
const amber = "#ffb000";

const img = new ImageResponse(
  React.createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0a0a0a",
        border: "16px solid #3a1010",
        padding: "48px 56px 40px",
        fontFamily: "Courier New, Courier, monospace",
        color: "#dddddd",
      },
    },
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      React.createElement(
        "div",
        { style: { display: "flex", fontSize: 42, fontWeight: 700, letterSpacing: 8 } },
        React.createElement("span", { style: { color: blood } }, "GROK"),
        React.createElement("span", { style: { color: amber, marginLeft: 18 } }, "DOOM")
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            marginTop: 10,
            fontSize: 18,
            letterSpacing: 4,
            color: "#888888",
            textTransform: "uppercase",
          },
        },
        "Fictional Video Game"
      )
    ),
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      React.createElement("div", { style: { display: "flex", fontSize: 36, fontWeight: 700, color: "#dddddd" } }, "Browser arena FPS"),
      React.createElement("div", { style: { display: "flex", marginTop: 12, fontSize: 22, color: "#999999" } }, "Hell Arena  ·  Hell Lord  ·  Iron Citadel")
    ),
    React.createElement(
      "div",
      { style: { display: "flex", fontSize: 20, letterSpacing: 2, color: amber } },
      "grokdoom.vercel.app"
    )
  ),
  { width: 1200, height: 630 }
);

const buf = Buffer.from(await img.arrayBuffer());
writeFileSync(out, buf);
console.log("wrote", out, buf.length);
