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
    // Off-screen but genuinely laid out, so the measurements below are real.
    bait.style.cssText =
      "position:absolute!important;left:-9999px!important;top:-9999px!important;" +
      "width:300px!important;height:250px!important;pointer-events:none!important;";
    document.body.appendChild(bait);

    // Give extensions a frame to act on the newly inserted node.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const style = window.getComputedStyle(bait);
        const blocked =
          !bait.parentNode ||
          bait.offsetHeight === 0 ||
          bait.clientHeight === 0 ||
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0";

        bait.remove();
        resolve(blocked);
      });
    });
  });

/**
 * Network probe: request a well-known ad script and see whether it is
 * redirected or refused.
 *
 * Secondary, because a failure here is ambiguous — it can equally mean the
 * visitor is offline, on a captive portal, or behind a firewall.
 */
const runRequestCheck = async (
  url: string,
  timeoutMs: number,
  /**
   * Whether a failed request on its own counts as a block.
   *
   * False when a bait check is also running: a refused request has many
   * innocent causes (captive portal, firewall, offline, CSP), and pairing it
   * with the reliable DOM signal is what keeps false positives down.
   */
  failureCountsAsBlock: boolean
): Promise<boolean> => {
  if (typeof fetch === "undefined") return false;

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const res = await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: controller?.signal,
    });
    return res.redirected;
  } catch {
    if (!failureCountsAsBlock) return false;
    // Only treat a failure as a block when the browser believes it is online;
    // an offline visitor is not running an ad blocker.
    return typeof navigator !== "undefined" ? navigator.onLine : false;
  } finally {
    if (timer) clearTimeout(timer);
  }
};

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
      // In "both" mode the bait check is the authoritative signal, so the
      // network probe only contributes an explicit redirect — not a mere
      // failure, which would otherwise flag every offline or firewalled
      // visitor as an ad-block user.
      checks.push(
        runRequestCheck(s.probeUrl, s.timeout, s.method === "request")
      );
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
