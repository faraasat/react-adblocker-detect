"use client";

import { useState } from "react";
import { AdblockDetector, useAdblock } from "react-adblocker-detect";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { track } from "@/components/analytics";

export default function Home() {
  const [mounted, setMounted] = useState(0);
  const [persistent, setPersistent] = useState(false);
  const detected = useAdblock(true);

  const relaunch = () => {
    // The component remembers a dismissal in localStorage; clear it so the
    // modal can be demonstrated again.
    localStorage.removeItem("rad_adblocker");
    setMounted((m) => m + 1);
    track("modal_relaunched", { persistent });
  };

  return (
    <main className="wrap">
      <Hero />

      <AdblockDetector
        key={`${mounted}-${persistent}`}
        config={{ persistent, initialInterval: 200 }}
      />

      <section className="card">
        <h2>Detection result</h2>
        <p className="sub">
          The hook probes a well-known ad script. If your browser has a blocker
          enabled, this flips to <code>true</code> and the modal appears.
        </p>
        <dl className="state">
          <dt>ad blocker</dt>
          <dd>
            <span className={`pill ${detected ? "off" : "on"}`}>
              {detected ? "detected" : "not detected"}
            </span>
          </dd>
          <dt>mode</dt>
          <dd>{persistent ? "persistent" : "dismissible"}</dd>
        </dl>
      </section>

      <section className="card">
        <h2>Configure</h2>
        <p className="sub">
          In persistent mode the modal keeps re-checking instead of accepting a
          dismissal.
        </p>
        <div className="row">
          <button
            className={`demo${persistent ? "" : " primary"}`}
            onClick={() => setPersistent(false)}
          >
            Dismissible
          </button>
          <button
            className={`demo${persistent ? " primary" : ""}`}
            onClick={() => setPersistent(true)}
          >
            Persistent
          </button>
          <button className="demo" onClick={relaunch}>
            Reset &amp; relaunch
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Usage</h2>
        <pre>{`import { AdblockDetector } from "react-adblocker-detect";
import "react-adblocker-detect/style.css";

export default function Page() {
  return <AdblockDetector config={{ persistent: false }} />;
}`}</pre>
      </section>

      <section className="card">
        <h2>Just the hook</h2>
        <p className="sub">Use your own UI instead of the bundled modal.</p>
        <pre>{`import { useAdblock } from "react-adblocker-detect";

const isBlocked = useAdblock(true);`}</pre>
      </section>

      <Footer />
    </main>
  );
}
