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

## Upgrading from 1.x

`2.0.0` rewrites the modal for accessibility, theming and responsiveness, and
replaces the network-only detection. Most integrations need no code change —
`<AdblockDetector />` and `useAdblock()` keep their signatures — but two things
will affect you.

### Custom CSS needs remapping

Every class was renamed. If you styled the modal yourself:

| 1.x | 2.0 |
| --- | --- |
| `.rad-modal` (backdrop) | `.rad-overlay` |
| `.modal` | `.rad-modal` |
| `.modal2` | *(gone — `.rad-modal` scrolls on its own)* |
| `.modal-buttons` | `.rad-actions` |
| `.primary-btn` | `.rad-btn--primary` |
| `.secondary-btn` | `.rad-btn--secondary` |
| `.back-btn` | `.rad-btn--primary` (the back control is a normal button now) |
| `.modal-step` | `.rad-steps` |
| `.step` | `.rad-step` |
| `.step-title` | `.rad-step__title` |
| `.step-desc` | `.rad-step__desc` |
| `.step-content` | `.rad-step__body` |

Most overrides are no longer necessary: colours are CSS custom properties, so
prefer `theme` or the `--rad-*` variables over rewriting rules.

### Detection changed

Detection now runs a DOM bait check as well as the network probe, and in the
default `"both"` mode a *failed* request no longer counts on its own — only an
explicit redirect does. This removes false positives for visitors who are
offline, behind a firewall, or on a captive portal.

To keep the old behaviour exactly:

```tsx
<AdblockDetector config={{ detection: { method: "request" } }} />
```

### Smaller notes

- `howToImageURL` defaults to empty, so the illustration is skipped unless you
  supply one. The old default pointed at a GitHub `/blob/` page, which serves
  HTML rather than an image and never rendered.
- `persistSetting: false` now genuinely skips `localStorage`; previously the
  option was ignored and a dismissal was always written.

## Why

Ad-blocked visitors quietly cost you revenue, and most detection snippets
either false-positive on flaky networks or ship a wall of jQuery. This is one
component (plus hooks if you want your own UI): typed end to end, themeable,
accessible, and with no runtime dependencies beyond React.

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

The component renders nothing until a blocker is actually detected, then
portals an accessible dialog into `document.body`.

> **Next.js App Router:** the package ships the `"use client"` directive, so it
> imports straight into a server component.

## How detection works

Two independent signals, combined:

| Method | How | Trade-off |
| --- | --- | --- |
| **bait** | Inserts an ad-shaped element and checks whether it was hidden or collapsed. | Reliable. Needs no network, so it is accurate offline, behind a strict CSP, and on corporate proxies. |
| **request** | `HEAD`s a well-known ad script URL and looks for a redirect or refusal. | Catches network-level blockers (Pi-hole, DNS filtering) that leave the DOM alone. |

Default is `"both"`, where the **bait check is authoritative**: the network
probe contributes only an explicit redirect, never a mere failure. That matters
because a refused request has plenty of innocent causes — captive portals,
firewalls, offline, strict CSP — and counting those as a block is the main
source of false positives in naive detectors.

In `"request"`-only mode a failure does count, but only while the browser
reports itself **online**.

```tsx
<AdblockDetector config={{ detection: { method: "bait" } }} />
```

This is still a heuristic. Treat it as a strong hint, and never gate essential
functionality behind it.

## Hooks

### `useAdblock(enabled?)`

Boolean, for the simple case:

```tsx
import { useAdblock } from "react-adblocker-detect";

const isBlocked = useAdblock();
```

### `useAdblockDetection(options?)`

Full state plus a manual re-check:

```tsx
import { useAdblockDetection } from "react-adblocker-detect";

const { isAdBlocked, isChecked, recheck } = useAdblockDetection({
  method: "bait",
});

if (!isChecked) return <Spinner />;
```

| Returns | Type | Description |
| --- | --- | --- |
| `isAdBlocked` | `boolean` | Whether a blocker was detected. |
| `isChecked` | `boolean` | `false` until the first check completes — use it to avoid flashing UI. |
| `recheck` | `() => Promise<boolean>` | Run detection again. |

## Configuration

Every field is optional. `theme` and `detection` are merged one level deep, so
overriding one field keeps its siblings.

### Behaviour

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `persistent` | `boolean` | `false` | Keep re-checking instead of accepting a dismissal. |
| `persistSetting` | `boolean` | `true` | Remember a dismissal in `localStorage`. |
| `pollingTime` | `number` | — | With `persistent`, ms before re-checking. |
| `initialInterval` | `number` | `200` | Delay before the modal may first appear. |
| `dismissible` | `boolean` | `true` | Show a close button and allow Escape. |
| `closeOnOverlayClick` | `boolean` | `false` | Close when the backdrop is clicked. |
| `detection` | `AdblockDetectionOptions` | `{}` | See above. |

### Presentation

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `"center" \| "top" \| "bottom" \| "top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | `"center"` | Where the dialog sits. |
| `zIndex` | `number` | `999999` | Overlay stacking order. |
| `colorScheme` | `"auto" \| "light" \| "dark"` | `"auto"` | `auto` follows `prefers-color-scheme`. |
| `theme` | `IAdBlockerTheme` | `{}` | Colour overrides (below). |
| `className` | `string` | — | Extra class on the overlay. |

### Copy

| Option | Type | Description |
| --- | --- | --- |
| `title` / `description` | `string` | First screen. |
| `btn1Title` / `btn2Title` | `string` | "How to disable" / "I have disabled". |
| `howToTitle` / `howToSteps` | `string` / `Array<{ title, description }>` | Instructions screen. |
| `howToImageURL` | `string` | Optional illustration. Omit to hide it. |
| `goBackButtonTitle` | `string` | Returns to the first screen. |
| `closeLabel` | `string` | Accessible label for the close button. |

### Callbacks

| Option | Type | Description |
| --- | --- | --- |
| `onDetected` | `(isAdBlocked: boolean) => void` | Fires when detection completes. |
| `onDismiss` | `() => void` | Fires when the visitor dismisses. |
| `render` | `(props) => ReactNode` | Replace the bundled modal entirely. |

## Theming

Colours are CSS custom properties, so you can theme without overriding rules:

```tsx
<AdblockDetector
  config={{
    colorScheme: "dark",
    theme: {
      primary: "#22c55e",
      primaryText: "#04140a",
      background: "#0b0f17",
      radius: "20px",
      maxWidth: "440px",
    },
  }}
/>
```

Or in CSS:

```css
.rad-overlay {
  --rad-primary: #22c55e;
  --rad-bg: #0b0f17;
}
```

| Property | Purpose |
| --- | --- |
| `--rad-bg` / `--rad-fg` / `--rad-muted` | Surface and text |
| `--rad-primary` / `--rad-primary-fg` | Primary button |
| `--rad-secondary` / `--rad-secondary-fg` | Secondary button, step cards |
| `--rad-overlay` | Backdrop |
| `--rad-radius` / `--rad-max-width` | Shape and size |

## Bring your own UI

`render` replaces the modal completely — the stylesheet is then optional:

```tsx
<AdblockDetector
  config={{
    render: ({ dismiss, recheck }) => (
      <aside className="my-banner">
        Please disable your ad blocker.
        <button onClick={() => recheck()}>I have disabled it</button>
        <button onClick={dismiss}>Dismiss</button>
      </aside>
    ),
  }}
/>
```

## Accessibility

The bundled modal is a real dialog, not a styled `div`:

- `role="dialog"` with `aria-modal`, labelled by its heading and described by
  its body copy.
- **Focus is trapped** while it is open, and restored to the previously focused
  element on close.
- **Escape** closes it when `dismissible` (handled on the document, so it works
  wherever focus is).
- Background scrolling is locked while it is open, and restored after.
- Honours `prefers-reduced-motion` and `prefers-color-scheme`.

## Responsive

On screens narrower than 480px the dialog becomes a bottom sheet: full width,
rounded at the top, respecting `env(safe-area-inset-bottom)`, with buttons
stacked full width and `100dvh`-aware height so mobile browser chrome does not
clip it.

## Styling

```tsx
import "react-adblocker-detect/style.css";
```

| Class | Element |
| --- | --- |
| `.rad-overlay` | Backdrop (carries the theme properties) |
| `.rad-modal` | Dialog panel |
| `.rad-title` / `.rad-desc` | Heading and body copy |
| `.rad-btn--primary` / `.rad-btn--secondary` | Buttons |
| `.rad-close` | Close control |
| `.rad-steps` / `.rad-step` | Instruction list |

## Contributing

Issues and pull requests are welcome.

```bash
git clone https://github.com/faraasat/react-adblocker-detect.git
cd react-adblocker-detect
npm install
npm test          # vitest unit tests
npm run typecheck # tsc --noEmit
npm run build     # tsup
```

End-to-end tests run against the built demo in a real browser (desktop and
mobile viewports), and cover the things unit tests cannot: layout, CSS and
keyboard behaviour.

```bash
npm run build && npm --prefix example install && npm --prefix example run build
npm run test:e2e      # playwright
npm run test:e2e:ui   # interactive
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
