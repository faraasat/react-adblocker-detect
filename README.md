# 📛 React Adblock Detector

A lightweight, customizable React component that detects AdBlock usage and shows a user-friendly modal with instructions to disable it. Supports persistent detection and polling behavior.

![npm version](https://img.shields.io/npm/v/react-adblocker-detect.svg)
![package size minified](https://img.shields.io/bundlephobia/min/react-adblocker-detect?style=plastic)
[![](https://data.jsdelivr.com/v1/package/npm/react-adblocker-detect/badge)](https://www.jsdelivr.com/package/npm/react-adblocker-detect)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![total downloads](https://img.shields.io/npm/dt/react-adblocker-detect.svg)
![total downloads per year](https://img.shields.io/npm/dy/react-adblocker-detect.svg)
![total downloads per week](https://img.shields.io/npm/dw/react-adblocker-detect.svg)
![total downloads per month](https://img.shields.io/npm/dm/react-adblocker-detect.svg)

[download-image]: https://img.shields.io/npm/dm/react-adblocker-detect.svg
[download-url]: https://npmjs.org/package/react-adblocker-detect

[![react-adblocker-detect](https://nodei.co/npm/react-adblocker-detect.png)](https://npmjs.org/package/react-adblocker-detect)

---

## 📦 Installation

```bash
npm i react-adblocker-detect

yarn add react-adblocker-detect

pnpm i react-adblocker-detect

bun add react-adblocker-detect
```

---

## ⚙️ Demo

Access Demos at:

[Demo](https://react-adblocker-detect.vercel.app/)

[Demo Persistent](https://react-adblocker-detect.vercel.app/persistent)

[Demo Persistent With Polling](https://react-adblocker-detect.vercel.app/persistent-with-polling)

---

## 📸 Screenshot

![Modal 1](https://github.com/faraasat/react-adblocker-detect/blob/main/images/modal1.jpg)

![Modal 2](https://github.com/faraasat/react-adblocker-detect/blob/main/images/modal2.jpg)

---

## ✨ Features

- Detects common adblockers
- Beautiful modal UI with step-by-step disable instructions
- Persistent and polling behavior options
- Fully configurable via props
- Written in TypeScript

---

## 🚀 Usage

### For React/Vite

```tsx
// app.tsx or main.tsx
import React from "react";

import { AdblockDetector } from "react-adblock-detector";

import "react-adblock-detector/dist/index.css";

const App = () => {
  return (
    <div>
      <AdblockDetector
        config={{
          persistent: true,
          pollingTime: 10000, // in milliseconds
          title: "AdBlocker Detected!",
        }}
      />
    </div>
  );
};

export default App;
```

### For Next.js (Pages Router)

```jsx
// _app.tsx
import React from "react";
import type { AppProps } from "next/app";
import { CookieConsent } from "react-consent-management-banner";

import "react-consent-management-banner/dist/index.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Component {...pageProps} />

      <AdblockDetector
        config={{
          persistent: true,
          pollingTime: 10000, // in milliseconds
          title: "AdBlocker Detected!",
        }}
      />
    </React.Fragment>
  );
}
```

### For Next.js App Router

```tsx
// layout.tsx
import React from "react";

import { AdblockDetector } from "react-adblock-detector";

import "react-adblock-detector/dist/index.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        {children}
        <AdblockDetector
          config={{
            persistent: true,
            pollingTime: 10000, // in milliseconds
            title: "AdBlocker Detected!",
          }}
        />
      </body>
    </html>
  );
}
```

---

## ⚙️ Configuration

The `AdblockDetector` component accepts a `config` prop of type `Partial<IAdBlockerConfig>`.

### Default Config

```ts
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
  pollingTime: undefined, // in milliseconds
  initialInterval: 200, // delay before showing the modal initially
  persistSetting: true, // store detection state in localStorage
};
```

---

## 🪝 Hook

### `useAdblock(shouldDetect: boolean): boolean`

A custom React hook that returns `true` if adblocker is detected. Used internally by `AdblockDetector`, but can be used separately if you need raw detection logic.

---

## 💡 Modal Behavior

- **Closeable**: If `persistent: false`, the modal can be closed after user claims they disabled adblock.
- **Persistent**: If `persistent: true`, the modal keeps rechecking adblock status at intervals using `pollingTime`.

---

## 🗃 Local Storage

This library stores a flag (`rad_adblocker`) in `localStorage` to avoid showing the modal again unnecessarily when not in persistent mode.

---

## 🧑‍🎓 Credits

Developed with ❤️ by **[Farasat Ali](https://github.com/faraasat)**
Feedback and contributions welcome!
