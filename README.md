<p align="center">
  <img src="https://raw.githubusercontent.com/faraasat/react-adblocker-detect/main/.github/assets/banner.svg" alt="react-adblocker-detect" width="100%" />
</p>

<p align="center">
  Detect ad blockers in React and ask visitors to disable them — with a built-in, fully customizable modal.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-adblocker-detect"><img alt="npm version" src="https://img.shields.io/npm/v/react-adblocker-detect?color=cb3837&label=npm&logo=npm"></a>
  <a href="https://www.npmjs.com/package/react-adblocker-detect"><img alt="downloads" src="https://img.shields.io/npm/dm/react-adblocker-detect?color=cb3837&label=downloads"></a>
  <a href="https://bundlephobia.com/package/react-adblocker-detect"><img alt="bundle size" src="https://img.shields.io/bundlephobia/minzip/react-adblocker-detect?label=minzipped"></a>
  <a href="https://github.com/faraasat/react-adblocker-detect/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/faraasat/react-adblocker-detect/actions/workflows/ci.yml/badge.svg"></a>
  <img alt="types" src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white">
  <a href="https://github.com/faraasat/react-adblocker-detect/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/npm/l/react-adblocker-detect?color=blue"></a>
</p>

<p align="center">
  <a href="https://faraasat.github.io/react-adblocker-detect/"><b>Live demo</b></a> ·
  <a href="https://www.npmjs.com/package/react-adblocker-detect">npm</a> ·
  <a href="https://github.com/faraasat/react-adblocker-detect/blob/main/CHANGELOG.md">Changelog</a> ·
  <a href="https://github.com/faraasat/react-adblocker-detect/issues">Issues</a>
</p>

---

## Why

Ad-blocked visitors silently cost you revenue, and most detection snippets either
false-positive on slow networks or ship a wall of jQuery. This package is a
single component (plus a bare hook if you want your own UI), typed end to end,
with no runtime dependencies beyond React.

## Installation

```bash
npm install react-adblocker-detect
```

<details>
<summary>yarn / pnpm / bun</summary>

```bash
yarn add react-adblocker-detect
pnpm add react-adblocker-detect
bun add react-adblocker-detect
```
</details>

**Peer dependencies:** `react >= 17`, `react-dom >= 17`.

## Quick start

```tsx
import { AdblockDetector } from "react-adblocker-detect";
import "react-adblocker-detect/style.css";

export default function Layout({ children }) {
  return (
    <>
      {children}
      <AdblockDetector />
    </>
  );
}
```

That is the whole integration. The component renders nothing until an ad
blocker is actually detected, at which point it portals a modal into
`document.body`.

> **Next.js App Router:** the package ships the `"use client"` directive, so you
> can import it straight into a server component without wrapping it yourself.

## Just the hook

Prefer your own UI? Use the hook and skip the modal and the stylesheet.

```tsx
import { useAdblock } from "react-adblocker-detect";

function Banner() {
  const isBlocked = useAdblock(true); // pass false to skip the probe entirely

  if (!isBlocked) return null;
  return <p>Please consider disabling your ad blocker.</p>;
}
```

## Configuration

Every field is optional — pass only what you want to change.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `persistent` | `boolean` | `false` | Keep re-checking instead of accepting a dismissal. |
| `persistSetting` | `boolean` | `true` | Remember a dismissal in `localStorage` so the modal stays gone. |
| `pollingTime` | `number` | `undefined` | With `persistent`, ms to wait before re-checking. Omit to re-check at once. |
| `initialInterval` | `number` | `200` | Delay in ms before the modal may first appear. |
| `title` | `string` | `"AdBlocker Detected"` | Heading on the first screen. |
| `description` | `string` | … | Body copy on the first screen. |
| `btn1Title` | `string` | `"How to disable adblocker"` | Opens the instructions screen. |
| `btn2Title` | `string` | `"I have disabled my adblocker"` | Confirms and re-checks. |
| `howToTitle` | `string` | `"How to Disable the Adblocker"` | Heading on the instructions screen. |
| `howToSteps` | `Array<{ title, description }>` | 4 generic steps | Your own walkthrough. |
| `howToImageURL` | `string` | bundled demo gif | Illustration on the instructions screen. |
| `goBackButtonTitle` | `string` | `"Go Back"` | Returns to the first screen. |

```tsx
<AdblockDetector
  config={{
    persistent: true,
    pollingTime: 5000,
    title: "We rely on ads to stay free",
    howToSteps: [
      { title: "Open your extensions", description: "Click the puzzle icon." },
      { title: "Pause on this site", description: "Then refresh the page." },
    ],
  }}
/>
```

## How detection works

The hook issues a `HEAD` request to a well-known AdSense script. A redirect, or
a rejected request while the browser reports itself online, is treated as a
block. Being offline is **not** reported as a block.

This is a heuristic. Aggressive blockers and strict CSP setups can both affect
the result, so treat it as a strong hint rather than a guarantee, and never gate
essential functionality behind it.

## Styling

The stylesheet is published separately, so you can skip it and write your own.
All classes are prefixed with `rad-`.

```tsx
import "react-adblocker-detect/style.css";
```

| Class | Element |
| --- | --- |
| `.rad-modal` | Full-screen backdrop |
| `.rad-modal .modal` | Modal panel |
| `.rad-modal .primary-btn` | Confirm button |
| `.rad-modal .secondary-btn` | Secondary button |
| `.rad-modal .step` | One instruction step |

## Contributing

Issues and pull requests are welcome.

```bash
git clone https://github.com/faraasat/react-adblocker-detect.git
cd react-adblocker-detect
npm install
npm test          # vitest
npm run typecheck # tsc --noEmit
npm run build     # tsup
```

To run the demo site against your local build:

```bash
npm run example:dev
```

Releases are manual — nothing publishes on a push to `main`. Maintainers run
the **Release** workflow from the Actions tab.

## Privacy

The published package contains **no telemetry**. The demo site at
[faraasat.github.io/react-adblocker-detect](https://faraasat.github.io/react-adblocker-detect/) uses
Google Analytics and Aptabase; the library itself never phones home.

## License

[MIT](./LICENSE) © [Farasat Ali](https://github.com/faraasat)
