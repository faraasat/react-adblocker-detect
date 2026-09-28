import React from 'react';

/** How the blocker is detected. */
type DetectionMethod = "bait" | "request" | "both";
interface AdblockDetectionOptions {
    /** Run detection at all. Default `true`. */
    enabled?: boolean;
    /**
     * Detection strategy. Default `"both"`.
     *
     * - `"bait"` inserts an ad-shaped element and checks whether it was hidden.
     *   Needs no network, so it is accurate offline and behind a strict CSP.
     * - `"request"` probes a well-known ad script URL. On its own this produces
     *   false positives on flaky networks and captive portals.
     * - `"both"` reports a block if either signal fires.
     */
    method?: DetectionMethod;
    /** Class names used for the bait element. */
    baitClassNames?: string[];
    /** URL used by the request probe. */
    probeUrl?: string;
    /** Abort the request probe after this many ms. Default `3000`. */
    timeout?: number;
}
/** Where the modal sits on screen. */
type ModalPosition = "center" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
interface IAdBlockerTheme {
    /** Surface colour of the modal. */
    background?: string;
    /** Body text colour. */
    text?: string;
    /** Muted/secondary text colour. */
    mutedText?: string;
    /** Primary button background. */
    primary?: string;
    /** Primary button text colour. */
    primaryText?: string;
    /** Secondary button background. */
    secondary?: string;
    /** Secondary button text colour. */
    secondaryText?: string;
    /** Backdrop colour, including alpha. */
    overlay?: string;
    /** Corner radius applied to the modal. */
    radius?: string;
    /** Max width of the modal. */
    maxWidth?: string;
}
interface IAdBlockerConfig {
    /** Keep re-checking after the visitor claims to have disabled their blocker. */
    persistent: boolean;
    /** Remember a successful dismissal in localStorage so the modal stays gone. */
    persistSetting: boolean;
    /** With `persistent`, how long to wait before re-checking. Omit to re-check at once. */
    pollingTime?: number;
    /** Delay in ms before the modal may first appear. Default `200`. */
    initialInterval: number;
    title: string;
    howToTitle: string;
    description: string;
    btn1Title: string;
    btn2Title: string;
    goBackButtonTitle: string;
    howToImageURL: string;
    howToSteps: Array<{
        title: string;
        description: string;
    }>;
    /** Accessible label for the close control. Default `"Close"`. */
    closeLabel: string;
    /** Show a close button and allow dismissing with Escape. Default `true`. */
    dismissible: boolean;
    /** Close when the backdrop is clicked. Default `false`. */
    closeOnOverlayClick: boolean;
    /** Detection options passed through to the hook. */
    detection: AdblockDetectionOptions;
    /** Where the modal sits. Default `"center"`. */
    position: ModalPosition;
    /** Stacking order of the overlay. Default `999999`. */
    zIndex: number;
    /** Colour scheme. `"auto"` follows `prefers-color-scheme`. Default `"auto"`. */
    colorScheme: "auto" | "light" | "dark";
    /** Theme overrides, applied as CSS custom properties. */
    theme: IAdBlockerTheme;
    /** Extra class name on the overlay. */
    className?: string;
    /** Fired when detection completes. */
    onDetected?: (isAdBlocked: boolean) => void;
    /** Fired when the visitor dismisses the modal. */
    onDismiss?: () => void;
    /**
     * Render your own UI instead of the bundled modal.
     *
     * Return `null` to render nothing. When supplied, the package stylesheet is
     * not required.
     */
    render?: (props: AdblockRenderProps) => React.ReactNode;
}
/** Arguments handed to a custom `render` function. */
interface AdblockRenderProps {
    /** Dismiss the modal (and persist that, when configured). */
    dismiss: () => void;
    /** Re-run detection. */
    recheck: () => Promise<boolean>;
    /** The merged configuration. */
    config: ResolvedAdBlockerConfig;
}
/**
 * The config after defaults have been applied: everything is present except
 * the genuinely optional members.
 */
type ResolvedAdBlockerConfig = Required<Omit<IAdBlockerConfig, "pollingTime" | "className" | "onDetected" | "onDismiss" | "render">> & Pick<IAdBlockerConfig, "pollingTime" | "className" | "onDetected" | "onDismiss" | "render">;
interface IAdBlocker {
    config: Partial<IAdBlockerConfig>;
}

interface UseAdblockResult {
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
declare function useAdblockDetection(enabledOrOptions?: boolean | AdblockDetectionOptions): UseAdblockResult;
/**
 * Boolean-only form of {@link useAdblockDetection}.
 *
 * Kept as the original signature so existing callers keep working; reach for
 * `useAdblockDetection` when you also want `isChecked` or `recheck`.
 */
declare function useAdblock(enabledOrOptions?: boolean | AdblockDetectionOptions): boolean;

declare const AdblockDetector: React.FC<Partial<IAdBlocker>>;

export { type AdblockDetectionOptions, AdblockDetector, type AdblockRenderProps, type DetectionMethod, type IAdBlocker, type IAdBlockerConfig, type IAdBlockerTheme, type ModalPosition, type ResolvedAdBlockerConfig, type UseAdblockResult, useAdblock, useAdblockDetection };
