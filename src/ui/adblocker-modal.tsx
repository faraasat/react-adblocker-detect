import React, { useCallback, useEffect, useRef, useState } from "react";

import { ResolvedAdBlockerConfig } from "../types";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/**
 * Keeps keyboard focus inside the dialog while it is open, and restores it to
 * whatever was focused before on close.
 *
 * Without this, tabbing walks out of a modal that the visitor cannot dismiss,
 * which strands keyboard and screen-reader users entirely.
 */
const useFocusTrap = (
  ref: React.RefObject<HTMLDivElement | null>,
  onEscape?: () => void
) => {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Visibility is checked via computed style rather than `offsetParent`:
    // that is null for any `position: fixed` element, which would silently
    // empty this list inside a fixed overlay.
    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
        if (el.hasAttribute("hidden") || el.getAttribute("aria-hidden") === "true")
          return false;
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });

    focusables()[0]?.focus();

    // Escape is handled on the document, so it works even if focus has
    // wandered outside the dialog.
    const onDocumentKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        e.stopPropagation();
        onEscape();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      node.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keydown", onDocumentKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [ref, onEscape]);
};

const Intro: React.FC<{
  config: ResolvedAdBlockerConfig;
  onShowHowTo: () => void;
  onDisabledAdblocker: () => void;
  titleId: string;
  descId: string;
}> = ({ config, onShowHowTo, onDisabledAdblocker, titleId, descId }) => (
  <>
    <h2 className="rad-title" id={titleId}>
      {config.title}
    </h2>
    <p className="rad-desc" id={descId}>
      {config.description}
    </p>
    <div className="rad-actions">
      <button type="button" className="rad-btn rad-btn--secondary" onClick={onShowHowTo}>
        {config.btn1Title}
      </button>
      <button type="button" className="rad-btn rad-btn--primary" onClick={onDisabledAdblocker}>
        {config.btn2Title}
      </button>
    </div>
  </>
);

const HowTo: React.FC<{
  config: ResolvedAdBlockerConfig;
  onBack: () => void;
  titleId: string;
}> = ({ config, onBack, titleId }) => (
  <>
    <h2 className="rad-title" id={titleId}>
      {config.howToTitle}
    </h2>

    {config.howToImageURL ? (
      <img
        className="rad-figure"
        src={config.howToImageURL}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    ) : null}

    <ol className="rad-steps">
      {config.howToSteps?.map((step, i) => (
        <li className="rad-step" key={i}>
          <span className="rad-step__index" aria-hidden="true">
            {i + 1}
          </span>
          <span className="rad-step__body">
            <span className="rad-step__title">{step.title}</span>
            <span className="rad-step__desc">{step.description}</span>
          </span>
        </li>
      ))}
    </ol>

    <div className="rad-actions">
      <button type="button" className="rad-btn rad-btn--primary" onClick={onBack}>
        {config.goBackButtonTitle}
      </button>
    </div>
  </>
);

export const AdblockerModal: React.FC<{
  config: ResolvedAdBlockerConfig;
  onDisabledAdblocker: () => void;
  onDismiss: () => void;
}> = ({ config, onDisabledAdblocker, onDismiss }) => {
  const [showHowTo, setShowHowTo] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const ids = useRef({
    title: `rad-title-${Math.random().toString(36).slice(2, 8)}`,
    desc: `rad-desc-${Math.random().toString(36).slice(2, 8)}`,
  });

  const escapeHandler = useCallback(() => {
    if (config.dismissible) onDismiss();
  }, [config.dismissible, onDismiss]);

  useFocusTrap(dialogRef, escapeHandler);

  // A modal that covers the page should not leave the page behind it
  // scrollable — on mobile especially, that reads as a broken overlay.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const themeVars: React.CSSProperties = {
    zIndex: config.zIndex,
    ...(config.theme.background && { ["--rad-bg" as string]: config.theme.background }),
    ...(config.theme.text && { ["--rad-fg" as string]: config.theme.text }),
    ...(config.theme.mutedText && { ["--rad-muted" as string]: config.theme.mutedText }),
    ...(config.theme.primary && { ["--rad-primary" as string]: config.theme.primary }),
    ...(config.theme.primaryText && { ["--rad-primary-fg" as string]: config.theme.primaryText }),
    ...(config.theme.secondary && { ["--rad-secondary" as string]: config.theme.secondary }),
    ...(config.theme.secondaryText && { ["--rad-secondary-fg" as string]: config.theme.secondaryText }),
    ...(config.theme.overlay && { ["--rad-overlay" as string]: config.theme.overlay }),
    ...(config.theme.radius && { ["--rad-radius" as string]: config.theme.radius }),
    ...(config.theme.maxWidth && { ["--rad-max-width" as string]: config.theme.maxWidth }),
  };

  return (
    <div
      className={[
        "rad-overlay",
        `rad-overlay--${config.position}`,
        config.colorScheme !== "auto" ? `rad-scheme--${config.colorScheme}` : "",
        config.className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={themeVars}
      onMouseDown={(e) => {
        if (config.closeOnOverlayClick && e.target === e.currentTarget) onDismiss();
      }}
    >
      <div
        className="rad-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={ids.current.title}
        aria-describedby={showHowTo ? undefined : ids.current.desc}
        ref={dialogRef}
      >
        {config.dismissible && (
          <button
            type="button"
            className="rad-close"
            onClick={onDismiss}
            aria-label={config.closeLabel}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path
                d="M2 2l12 12M14 2L2 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        {showHowTo ? (
          <HowTo
            config={config}
            onBack={() => setShowHowTo(false)}
            titleId={ids.current.title}
          />
        ) : (
          <Intro
            config={config}
            onShowHowTo={() => setShowHowTo(true)}
            onDisabledAdblocker={onDisabledAdblocker}
            titleId={ids.current.title}
            descId={ids.current.desc}
          />
        )}
      </div>
    </div>
  );
};
