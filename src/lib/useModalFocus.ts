"use client";
import { useEffect } from "react";
import { acquireInert, acquireScrollLock } from "./interactionLock";

export function useModalFocus(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const background = [
      ...document.querySelectorAll<HTMLElement>(
        ".main-shell, .sidebar, .scratchpad-panel",
      ),
    ];
    const releaseBackground = acquireInert(background);
    const releaseScroll = acquireScrollLock(document.body);
    const modal = () =>
      [...document.querySelectorAll<HTMLElement>('[aria-modal="true"]')].at(-1);
    const focusables = () =>
      [
        ...(modal()?.querySelectorAll<HTMLElement>(
          'button,input,select,textarea,a[href],[tabindex="0"]',
        ) ?? []),
      ].filter(
        (e) => !e.hasAttribute("disabled") && e.getClientRects().length > 0,
      );
    const frame = requestAnimationFrame(() => focusables()[0]?.focus());
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = focusables();
      const first = nodes[0],
        last = nodes.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        event.stopPropagation();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        event.stopPropagation();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", trap, true);
      releaseBackground();
      releaseScroll();
      previous?.focus();
    };
  }, [active]);
}
