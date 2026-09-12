import React from "react";
import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

function param(url, key, fallback) {
  const v = url.searchParams.get(key);
  if (v == null || v === "") return fallback;
  return String(v).slice(0, 24);
}

export default function handler(request) {
  const url = new URL(request.url);
  const kills = param(url, "k", "0");
  const time = param(url, "t", "00:00");
  const wave = param(url, "w", "1");
  const best = param(url, "b", kills);
  const win = param(url, "v", "0") === "1";
  const headline = win ? "RIP AND TEAR" : "YOU DIED";
  const blood = "#c41e3a";
  const amber = "#ffb000";
  const green = "#39ff14";
  const border = win ? "#1a3a20" : "#3a1010";
  const barBg = win ? "#081208" : "#120808";

  return new ImageResponse(
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
          border: `16px solid ${border}`,
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
        { style: { display: "flex", alignItems: "flex-end", justifyContent: "space-between" } },
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column" } },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                fontSize: 52,
                fontWeight: 700,
                letterSpacing: 4,
                color: win ? green : blood,
              },
            },
            headline
          ),
          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "baseline", marginTop: 8 } },
            React.createElement("div", { style: { display: "flex", fontSize: 120, fontWeight: 700, color: "#ffffff", lineHeight: 1 } }, kills),
            React.createElement("div", { style: { display: "flex", marginLeft: 16, fontSize: 22, letterSpacing: 3, color: amber } }, "KILLS")
          )
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              background: barBg,
              border: `2px solid ${border}`,
              padding: "18px 28px",
              gap: 36,
            },
          },
          ...[["TIME", time], ["WAVE", wave], ["BEST", best]].map(([label, val]) =>
            React.createElement(
              "div",
              { style: { display: "flex", flexDirection: "column", alignItems: "center" } },
              React.createElement("div", { style: { display: "flex", fontSize: 14, letterSpacing: 2, color: "#888888" } }, label),
              React.createElement("div", { style: { display: "flex", fontSize: 32, fontWeight: 700, color: "#ffffff", marginTop: 6 } }, val)
            )
          )
        )
      ),
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "flex-end", fontSize: 20, letterSpacing: 2, color: amber } },
        "grokdoom.vercel.app"
      )
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    }
  );
}
