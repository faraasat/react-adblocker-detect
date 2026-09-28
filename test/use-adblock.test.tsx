import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAdblock, useAdblockDetection, AdblockDetector } from "../src";

const ADBLOCKER_KEY = "rad_adblocker";

/**
 * jsdom lays nothing out, so every element reports offsetHeight 0 — which the
 * bait check reads as "blocked". Force a non-zero height so the default state
 * is "not blocked", and let individual tests opt into a block.
 */
const setBaitBlocked = (blocked: boolean) => {
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return blocked ? 0 : 250;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      return blocked ? 0 : 250;
    },
  });
};

beforeEach(() => {
  localStorage.clear();
  setBaitBlocked(false);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ redirected: false } as Response));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useAdblockDetection", () => {
  it("does not run when disabled", async () => {
    renderHook(() => useAdblockDetection({ enabled: false }));
    await new Promise((r) => setTimeout(r, 20));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports no blocker when neither signal fires", async () => {
    const { result } = renderHook(() => useAdblockDetection());
    await waitFor(() => expect(result.current.isChecked).toBe(true));
    expect(result.current.isAdBlocked).toBe(false);
  });

  it("reports a blocker when the bait element is collapsed", async () => {
    setBaitBlocked(true);
    const { result } = renderHook(() => useAdblockDetection({ method: "bait" }));
    await waitFor(() => expect(result.current.isAdBlocked).toBe(true));
  });

  it("reports a blocker when the probe is redirected", async () => {
    vi.mocked(fetch).mockResolvedValue({ redirected: true } as Response);
    const { result } = renderHook(() => useAdblockDetection({ method: "request" }));
    await waitFor(() => expect(result.current.isAdBlocked).toBe(true));
  });

  it("ignores a merely failed probe in 'both' mode", async () => {
    // A refused request has innocent causes; the bait signal is authoritative.
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    vi.mocked(fetch).mockRejectedValue(new Error("firewall"));
    const { result } = renderHook(() => useAdblockDetection({ method: "both" }));
    await waitFor(() => expect(result.current.isChecked).toBe(true));
    expect(result.current.isAdBlocked).toBe(false);
  });

  it("treats a rejected probe as blocked only while online", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    vi.mocked(fetch).mockRejectedValue(new Error("blocked"));
    const { result } = renderHook(() => useAdblockDetection({ method: "request" }));
    await waitFor(() => expect(result.current.isAdBlocked).toBe(true));
  });

  it("does not report a blocker when the probe fails while offline", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useAdblockDetection({ method: "request" }));
    await waitFor(() => expect(result.current.isChecked).toBe(true));
    expect(result.current.isAdBlocked).toBe(false);
  });

  it("skips the network entirely in bait-only mode", async () => {
    const { result } = renderHook(() => useAdblockDetection({ method: "bait" }));
    await waitFor(() => expect(result.current.isChecked).toBe(true));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("cleans up its bait element", async () => {
    const { result } = renderHook(() => useAdblockDetection({ method: "bait" }));
    await waitFor(() => expect(result.current.isChecked).toBe(true));
    expect(document.querySelector(".adsbox")).toBeNull();
  });

  it("exposes a manual recheck", async () => {
    const { result } = renderHook(() => useAdblockDetection({ method: "bait" }));
    await waitFor(() => expect(result.current.isChecked).toBe(true));
    setBaitBlocked(true);
    await result.current.recheck();
    await waitFor(() => expect(result.current.isAdBlocked).toBe(true));
  });
});

describe("useAdblock", () => {
  it("keeps its original boolean signature", async () => {
    setBaitBlocked(true);
    const { result } = renderHook(() => useAdblock(true));
    await waitFor(() => expect(result.current).toBe(true));
    expect(typeof result.current).toBe("boolean");
  });
});

describe("AdblockDetector", () => {
  beforeEach(() => setBaitBlocked(true));

  it("renders nothing when a previous dismissal was persisted", async () => {
    localStorage.setItem(ADBLOCKER_KEY, "true");
    render(<AdblockDetector config={{ initialInterval: 0 }} />);
    await new Promise((r) => setTimeout(r, 30));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the modal once a blocker is detected", async () => {
    render(<AdblockDetector config={{ initialInterval: 0 }} />);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("exposes the modal as an accessible dialog", async () => {
    render(<AdblockDetector config={{ initialInterval: 0, title: "Please disable" }} />);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Please disable");
  });

  it("closes on Escape when dismissible", async () => {
    render(<AdblockDetector config={{ initialInterval: 0 }} />);
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("ignores Escape when not dismissible", async () => {
    render(<AdblockDetector config={{ initialInterval: 0, dismissible: false }} />);
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("hides the close button when not dismissible", async () => {
    render(<AdblockDetector config={{ initialInterval: 0, dismissible: false }} />);
    await screen.findByRole("dialog");
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });

  it("navigates to the how-to steps and back", async () => {
    render(<AdblockDetector config={{ initialInterval: 0 }} />);
    await screen.findByRole("dialog");
    await userEvent.click(screen.getByText(/How to disable/i));
    expect(screen.getByText(/Click on the Extensions Icon/i)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/Go Back/i));
    expect(screen.getByText(/AdBlocker Detected/i)).toBeInTheDocument();
  });

  it("reports detection through onDetected", async () => {
    const onDetected = vi.fn();
    render(<AdblockDetector config={{ initialInterval: 0, onDetected }} />);
    await waitFor(() => expect(onDetected).toHaveBeenCalledWith(true));
  });

  it("supports a custom renderer instead of the bundled modal", async () => {
    render(
      <AdblockDetector
        config={{
          initialInterval: 0,
          render: ({ dismiss }) => <button onClick={dismiss}>my own ui</button>,
        }}
      />
    );
    expect(await screen.findByText("my own ui")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("applies the configured position and zIndex", async () => {
    render(<AdblockDetector config={{ initialInterval: 0, position: "bottom", zIndex: 42 }} />);
    const overlay = (await screen.findByRole("dialog")).parentElement!;
    expect(overlay.className).toContain("rad-overlay--bottom");
    expect(overlay.style.zIndex).toBe("42");
  });

  it("applies theme overrides as custom properties", async () => {
    render(<AdblockDetector config={{ initialInterval: 0, theme: { primary: "#ff0000" } }} />);
    const overlay = (await screen.findByRole("dialog")).parentElement!;
    expect(overlay.style.getPropertyValue("--rad-primary")).toBe("#ff0000");
  });

  it("restores body scrolling after the modal closes", async () => {
    const { unmount } = render(<AdblockDetector config={{ initialInterval: 0 }} />);
    await screen.findByRole("dialog");
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
