import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, render, screen } from "@testing-library/react";
import { useAdblock, AdblockDetector } from "../src";

const ADBLOCKER_KEY = "rad_adblocker";

describe("useAdblock", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("does not probe the network when checking is disabled", () => {
    renderHook(() => useAdblock(false));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports no ad blocker when the probe resolves un-redirected", async () => {
    vi.mocked(fetch).mockResolvedValue({ redirected: false } as Response);
    const { result } = renderHook(() => useAdblock(true));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(result.current).toBe(false);
  });

  it("reports an ad blocker when the probe is redirected", async () => {
    vi.mocked(fetch).mockResolvedValue({ redirected: true } as Response);
    const { result } = renderHook(() => useAdblock(true));
    await waitFor(() => expect(result.current).toBe(true));
  });

  it("reports an ad blocker when the probe is rejected while online", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    vi.mocked(fetch).mockRejectedValue(new Error("blocked"));
    const { result } = renderHook(() => useAdblock(true));
    await waitFor(() => expect(result.current).toBe(true));
  });

  it("does not report an ad blocker when the probe is rejected while offline", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useAdblock(true));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(result.current).toBe(false);
  });
});

describe("AdblockDetector", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ redirected: true } as Response));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("renders nothing when a previous dismissal was persisted", async () => {
    localStorage.setItem(ADBLOCKER_KEY, "true");
    render(<AdblockDetector config={{ initialInterval: 0 }} />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText("AdBlocker Detected")).not.toBeInTheDocument();
  });

  it("shows the modal with custom copy once an ad blocker is detected", async () => {
    render(<AdblockDetector config={{ initialInterval: 0, title: "Please disable" }} />);
    expect(await screen.findByText("Please disable")).toBeInTheDocument();
  });
});
