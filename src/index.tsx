import React, { useEffect } from "react";
import { createPortal } from "react-dom";

import useAdblock from "./hooks/use-adblock";
import { AdblockerModal } from "./ui/adblocker-modal";

import { IAdBlocker, IAdBlockerConfig } from "./types";

import "./style.css";

const defaultConfig = {
  persistent: false,
  title: "AdBlocker Detected",
  howToTitle: "How to Disable the Adblocker",
  description:
    "We noticed you're using an ad blocker. Please disable it so we can keep the site running.",
  btn1Title: "How to disable adblocker",
  btn2Title: "I have disabled my adblocker",
  howToSteps: [
    {
      title: "Step 1: Click on the Extensions Icon",
      description:
        "At the top-right of your browser, click the puzzle piece icon to see all extensions.",
    },
    {
      title: "Step 2: Open AdBlock Settings",
      description:
        "Click the AdBlock or AdBlock Plus icon from the list. Then click the settings gear or options.",
    },
    {
      title: "Step 3: Pause or Whitelist",
      description: `Choose "Pause on this site" or "Don't run on this site" depending on your extension.`,
    },
    {
      title: "Step 4: Refresh the Page",
      description:
        "Reload the page to check if the content is now visible. Enjoy the experience!",
    },
  ],
  pollingTime: undefined,
  initialInterval: 200,
  persistSetting: true,
} satisfies IAdBlockerConfig;

const ADBLOCKER_KEY = "rad_adblocker";

const AdblockDetector: React.FC<Partial<IAdBlocker>> = ({
  config: incomingConfig = {},
}) => {
  const config = {
    ...defaultConfig,
    ...incomingConfig,
  };
  const [showModal, setShowModal] = React.useState(false);
  const [isFirstIteration, setIsFirstIteration] = React.useState(false);
  const [shouldCheckForAdblocker, setShouldCheckForAdblocker] =
    React.useState(true);
  const isAdblock = useAdblock(shouldCheckForAdblocker);

  const onDisabledAdblocker = () => {
    if (!config.persistent) {
      setShowModal(false);
      localStorage.setItem(ADBLOCKER_KEY, "true");
    } else {
      if (config.pollingTime && config.pollingTime > 0) {
        setShowModal(false);
        const timeout = setTimeout(() => {
          setShouldCheckForAdblocker(true);
          const timeout2 = setTimeout(() => {
            setShowModal(true);
            clearTimeout(timeout2);
          }, 0);
          clearTimeout(timeout);
        }, config.pollingTime);
      } else {
        setShouldCheckForAdblocker(true);
      }
    }
  };

  useEffect(() => {
    if (!isFirstIteration) {
      const isAdblocker = localStorage.getItem(ADBLOCKER_KEY);

      if (isAdblocker == "true") {
        setIsFirstIteration(true);
        return;
      }

      let timeout = setTimeout(() => {
        setShowModal(true);
        setIsFirstIteration(true);
      }, config.initialInterval);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, []);

  return (
    <React.Fragment>
      {isAdblock &&
        showModal &&
        createPortal(
          <AdblockerModal
            config={config}
            onDisabledAdblocker={onDisabledAdblocker}
          />,
          document.body
        )}
    </React.Fragment>
  );
};

export { useAdblock, AdblockDetector };
