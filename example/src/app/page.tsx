"use client";

import { useState } from "react";
import { AdblockDetector, useAdblockDetection } from "react-adblocker-detect";
import type { ModalPosition } from "react-adblocker-detect";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { track } from "@/components/analytics";

const POSITIONS: ModalPosition[] = [
  "center",
  "top",
  "bottom",
  "top-right",
  "bottom-left",
];

const THEMES: Record<string, Record<string, string>> = {
  Default: {},
  Emerald: { primary: "#22c55e", primaryText: "#04140a" },
  Crimson: { primary: "#ef4444", primaryText: "#fff5f5" },
  Amber: { primary: "#f59e0b", primaryText: "#1a1204" },
};

export default function Home() {
  const [mounted, setMounted] = useState(0);
  const [persistent, setPersistent] = useState(false);
  const [position, setPosition] = useState<ModalPosition>("center");
  const [scheme, setScheme] = useState<"auto" | "light" | "dark">("auto");
  const [theme, setTheme] = useState("Default");
  const [dismissible, setDismissible] = useState(true);

  const { isAdBlocked, isChecked, recheck } = useAdblockDetection();

  const relaunch = () => {
    localStorage.removeItem("rad_adblocker");
    setMounted((m) => m + 1);
    track("modal_relaunched", { position, persistent });
  };

  return (
    <main className="wrap">
      <Hero />

      <AdblockDetector
        key={`${mounted}-${persistent}-${position}-${scheme}-${theme}-${dismissible}`}
        config={{
          persistent,
          position,
          colorScheme: scheme,
          dismissible,
          theme: THEMES[theme],
          initialInterval: 200,
        }}
      />

      <section className="card">
        <h2>Detection result</h2>
        <p className="sub">
          Two signals: a bait element (works offline) and a network probe. If
          your browser has a blocker enabled, this flips to{" "}
          <code>true</code> and the dialog appears.
        </p>
        <dl className="state">
          <dt>status</dt>
          <dd>
            {!isChecked ? (
              <span className="pill">checking…</span>
            ) : (
              <span className={`pill ${isAdBlocked ? "off" : "on"}`}>
                {isAdBlocked ? "blocker detected" : "no blocker"}
              </span>
            )}
          </dd>
          <dt>mode</dt>
          <dd>{persistent ? "persistent" : "dismissible"}</dd>
        </dl>
        <div className="row" style={{ marginTop: 16 }}>
          <button className="demo" onClick={() => void recheck()}>
            Re-check
          </button>
          <button className="demo primary" onClick={relaunch}>
            Reset &amp; show dialog
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Position</h2>
        <p className="sub">
          The dialog is positionable. On screens under 480px it becomes a
          bottom sheet regardless — resize this page to see it.
        </p>
        <div className="row">
          {POSITIONS.map((p) => (
            <button
              key={p}
              className={`demo${position === p ? " primary" : ""}`}
              onClick={() => setPosition(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Theme</h2>
        <p className="sub">
          Colours are CSS custom properties, set from the <code>theme</code>{" "}
          option. <code>colorScheme</code> follows the OS by default.
        </p>
        <div className="field">
          <label>Accent</label>
          <div className="row">
            {Object.keys(THEMES).map((t) => (
              <button
                key={t}
                className={`demo${theme === t ? " primary" : ""}`}
                onClick={() => setTheme(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Colour scheme</label>
          <div className="row">
            {(["auto", "light", "dark"] as const).map((s) => (
              <button
                key={s}
                className={`demo${scheme === s ? " primary" : ""}`}
                onClick={() => setScheme(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Behaviour</h2>
        <div className="row">
          <button
            className={`demo${persistent ? "" : " primary"}`}
            onClick={() => setPersistent(false)}
          >
            Dismissible mode
          </button>
          <button
            className={`demo${persistent ? " primary" : ""}`}
            onClick={() => setPersistent(true)}
          >
            Persistent mode
          </button>
          <button className="demo" onClick={() => setDismissible((d) => !d)}>
            {dismissible ? "Disable close button" : "Enable close button"}
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Usage</h2>
        <pre>{`import { AdblockDetector } from "react-adblocker-detect";
import "react-adblocker-detect/style.css";

<AdblockDetector
  config={{
    position: "bottom",
    theme: { primary: "#22c55e" },
    detection: { method: "bait" },
  }}
/>`}</pre>
      </section>

      <section className="card">
        <h2>Just the hook</h2>
        <pre>{`import { useAdblockDetection } from "react-adblocker-detect";

const { isAdBlocked, isChecked, recheck } = useAdblockDetection();`}</pre>
      </section>

      <Footer />
    </main>
  );
}
