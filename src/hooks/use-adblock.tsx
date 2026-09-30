import { useCallback, useEffect, useRef, useState } from "react";

import { AdblockDetectionOptions, DetectionMethod } from "../types";

/**
 * Class names and ids that virtually every filter list hides.
 *
 * The bait element is styled inline to a known non-zero size; if a blocker
 * hides or collapses it, the measurements below come back zero.
 */
const DEFAULT_BAIT_CLASSES = [
  "adsbox",
  "ad-banner",
  "ad-placement",
  "advertisement",
  "banner_ad",
  "sponsored-ad",
  "pub_300x250",
];

const DEFAULT_PROBE_URL =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

/**
 * Bait detection: append an element that looks like an ad and see whether
 * something removed, hid or collapsed it.
 *
 * This is the reliable signal. It needs no network, so it works offline,
 * behind a strict CSP and on corporate proxies — all cases where a bare
 * network probe produces false positives.
 */
const runBaitCheck = (classNames: string[]): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof document === "undefined" || !document.body) {
      resolve(false);
      return;
    }

    const bait = document.createElement("div");
    bait.className = classNames.join(" ");
    bait.setAttribute("aria-hidden", "true");

    // Positioning is !important so the host page cannot move the bait into
    // view, but the *dimensions* deliberately are not: a blocker's cosmetic
    // rule has to be able to win. Marking width/height !important here made
    // this element out-specify the very thing it exists to detect.
    bait.style.cssText =
      "position:absolute!important;left:-9999px!important;top:-9999px!important;" +
      "pointer-events:none!important;width:300px;height:250px;";
    document.body.appendChild(bait);

    // Give extensions a frame to act on the newly inserted node.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const style = window.getComputedStyle(bait);
        const rect = bait.getBoundingClientRect();
        const blocked =
          !bait.parentNode ||
          bait.offsetHeight === 0 ||
          bait.clientHeight === 0 ||
          rect.height === 0 ||
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0";

        bait.remove();
        resolve(blocked);
      });
    });
  });

/**
 * Network probe: load a well-known ad script and see whether it is refused.
 *
 * A `<script>` element is used rather than `fetch`, because a `no-cors` fetch
 * returns an *opaque* response — `status` is always 0 and `redirected` always
 * `false`, even on success — so it cannot distinguish a blocked request from a
 * served one. A script element reports refusal through its `error` event,
 * which is exactly the signal network-level blockers produce.
 */
const runRequestCheck = (url: string, timeoutMs: number): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof document === "undefined" || !document.head) {
      resolve(false);
      return;
    }

    // Offline is not ad blocking, and would otherwise look identical.
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      resolve(false);
      return;
    }

    const script = document.createElement("script");
    let settled = false;

    const done = (blocked: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      script.remove();
      resolve(blocked);
    };

    const timer = setTimeout(() => done(false), timeoutMs);

    script.onload = () => done(false);
    script.onerror = () => done(true);
    script.async = true;
    script.src = url;
    document.head.appendChild(script);
  });

export interface UseAdblockResult {
  /** Whether an ad blocker was detected. */
  isAdBlocked: boolean;
  /** False until the first check has completed. */
  isChecked: boolean;
  /** Run the detection again. */
  recheck: () => Promise<boolean>;
}

/**
 * Detects whether an ad blocker is active, with detection state and a manual
 * re-check.
 *
 * Pass `false` (or `{ enabled: false }`) to skip detection entirely.
 */
export function useAdblockDetection(
  enabledOrOptions: boolean | AdblockDetectionOptions = true
): UseAdblockResult {
  const options: AdblockDetectionOptions =
    typeof enabledOrOptions === "boolean"
      ? { enabled: enabledOrOptions }
      : enabledOrOptions;

  const {
    enabled = true,
    method = "both" as DetectionMethod,
    baitClassNames = DEFAULT_BAIT_CLASSES,
    probeUrl = DEFAULT_PROBE_URL,
    timeout = 3000,
  } = options;

  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Kept in a ref so `recheck` stays stable across renders.
  const settings = useRef({ method, baitClassNames, probeUrl, timeout });
  settings.current = { method, baitClassNames, probeUrl, timeout };

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const detect = useCallback(async (): Promise<boolean> => {
    const s = settings.current;

    const checks: Array<Promise<boolean>> = [];
    if (s.method === "bait" || s.method === "both") {
      checks.push(runBaitCheck(s.baitClassNames));
    }
    if (s.method === "request" || s.method === "both") {
      // Unlike the old opaque-fetch probe, a script `error` event is a
      // specific signal: the request was refused. Offline is excluded inside
      // the check, so this can be trusted in "both" mode too.
      checks.push(runRequestCheck(s.probeUrl, s.timeout));
    }

    const results = await Promise.all(checks);
    return results.some(Boolean);
  }, []);

  const recheck = useCallback(async () => {
    const blocked = await detect();
    if (mounted.current) {
      setIsAdBlocked(blocked);
      setIsChecked(true);
    }
    return blocked;
  }, [detect]);

  useEffect(() => {
    if (!enabled) return;
    void recheck();
  }, [enabled, recheck]);

  return { isAdBlocked, isChecked, recheck };
}

/**
 * Boolean-only form of {@link useAdblockDetection}.
 *
 * Kept as the original signature so existing callers keep working; reach for
 * `useAdblockDetection` when you also want `isChecked` or `recheck`.
 */
export function useAdblock(
  enabledOrOptions: boolean | AdblockDetectionOptions = true
): boolean {
  return useAdblockDetection(enabledOrOptions).isAdBlocked;
}

export default useAdblock;
