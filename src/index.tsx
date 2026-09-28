import React from "react";
import { createPortal } from "react-dom";

import { useAdblock, useAdblockDetection } from "./hooks/use-adblock";
import { AdblockerModal } from "./ui/adblocker-modal";

import {
  IAdBlocker,
  IAdBlockerConfig,
  ResolvedAdBlockerConfig,
} from "./types";

import "./style.css";

const ADBLOCKER_KEY = "rad_adblocker";

const defaultConfig: ResolvedAdBlockerConfig = {
  persistent: false,
  persistSetting: true,
  initialInterval: 200,
  pollingTime: undefined,

  title: "AdBlocker Detected",
  howToTitle: "How to Disable the Adblocker",
  description:
    "We noticed you're using an ad blocker. Please disable it so we can keep the site running.",
  btn1Title: "How to disable adblocker",
  btn2Title: "I have disabled my adblocker",
  goBackButtonTitle: "Go Back",
  closeLabel: "Close",
  howToImageURL: "",
  howToSteps: [
    {
      title: "Click on the Extensions Icon",
      description:
        "At the top-right of your browser, click the puzzle piece icon to see all extensions.",
    },
    {
      title: "Open AdBlock Settings",
      description:
        "Click the AdBlock or AdBlock Plus icon from the list, then the settings gear.",
    },
    {
      title: "Pause or Whitelist",
      description: `Choose "Pause on this site" or "Don't run on this site" depending on your extension.`,
    },
    {
      title: "Refresh the Page",
      description:
        "Reload the page to check if the content is now visible. Enjoy the experience!",
    },
  ],

  dismissible: true,
  closeOnOverlayClick: false,
  detection: {},

  position: "center",
  zIndex: 999999,
  colorScheme: "auto",
  theme: {},
  className: undefined,

  onDetected: undefined,
  onDismiss: undefined,
  render: undefined,
};

const AdblockDetector: React.FC<Partial<IAdBlocker>> = ({
  config: incomingConfig = {},
}) => {
  // One level of merging for `theme` and `detection`, so overriding a single
  // field there does not wipe out its siblings.
  const config: ResolvedAdBlockerConfig = React.useMemo(
    () => ({
      ...defaultConfig,
      ...(incomingConfig as IAdBlockerConfig),
      theme: { ...defaultConfig.theme, ...incomingConfig.theme },
      detection: { ...defaultConfig.detection, ...incomingConfig.detection },
    }),
    [incomingConfig]
  );

  const [dismissed, setDismissed] = React.useState(false);
  const [readyToShow, setReadyToShow] = React.useState(false);
  const { isAdBlocked, isChecked, recheck } = useAdblockDetection(config.detection);

  const timers = React.useRef<number[]>([]);
  const clearTimers = React.useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  React.useEffect(() => clearTimers, [clearTimers]);

  // A previously persisted dismissal keeps the modal away entirely.
  React.useEffect(() => {
    const alreadyDismissed =
      config.persistSetting &&
      typeof localStorage !== "undefined" &&
      localStorage.getItem(ADBLOCKER_KEY) === "true";

    if (alreadyDismissed) {
      setDismissed(true);
      return;
    }

    const timer = window.setTimeout(
      () => setReadyToShow(true),
      config.initialInterval
    );
    timers.current.push(timer);
    return () => clearTimeout(timer);
  }, [config.persistSetting, config.initialInterval]);

  const onDetectedRef = React.useRef(config.onDetected);
  onDetectedRef.current = config.onDetected;
  React.useEffect(() => {
    if (isChecked) onDetectedRef.current?.(isAdBlocked);
  }, [isChecked, isAdBlocked]);

  const persistDismissal = React.useCallback(() => {
    if (config.persistSetting && typeof localStorage !== "undefined") {
      localStorage.setItem(ADBLOCKER_KEY, "true");
    }
  }, [config.persistSetting]);

  const dismiss = React.useCallback(() => {
    setDismissed(true);
    persistDismissal();
    config.onDismiss?.();
  }, [config, persistDismissal]);

  /** "I have disabled my adblocker" — verify rather than take their word. */
  const onDisabledAdblocker = React.useCallback(() => {
    if (!config.persistent) {
      dismiss();
      return;
    }

    clearTimers();
    const delay = config.pollingTime && config.pollingTime > 0 ? config.pollingTime : 0;
    const timer = window.setTimeout(() => void recheck(), delay);
    timers.current.push(timer);
  }, [config.persistent, config.pollingTime, dismiss, recheck, clearTimers]);

  const shouldShow = isAdBlocked && readyToShow && !dismissed;
  if (!shouldShow) return null;

  // A custom renderer opts out of the bundled modal entirely.
  if (config.render) {
    return <>{config.render({ dismiss, recheck, config })}</>;
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <AdblockerModal
      config={config}
      onDisabledAdblocker={onDisabledAdblocker}
      onDismiss={dismiss}
    />,
    document.body
  );
};

export { useAdblock, useAdblockDetection, AdblockDetector };
export type {
  IAdBlocker,
  IAdBlockerConfig,
  IAdBlockerTheme,
  ResolvedAdBlockerConfig,
  AdblockDetectionOptions,
  AdblockRenderProps,
  DetectionMethod,
  ModalPosition,
} from "./types";
export type { UseAdblockResult } from "./hooks/use-adblock";
