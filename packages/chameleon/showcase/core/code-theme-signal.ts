import { computed } from "@genexus/kasstor-signals/core/computed.js";
import { signal } from "@genexus/kasstor-signals/core/signal.js";

const STORAGE_KEY = "chameleon-showcase-code-theme";

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "chameleon-theme-dark" || stored === "chameleon-theme-light") {
    return stored;
  }

  // Compute from OS preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "chameleon-theme-dark" : "chameleon-theme-light";
}

/**
 * Reactive signal holding the current code theme for the showcase.
 * Persisted to localStorage and initialized from OS preference on first visit.
 */
export const codeTheme = signal(getInitialTheme());

/**
 * Whether the current code theme is dark. Useful for binding to `ch-switch`.
 */
export const isCodeThemeDark = computed(
  () => codeTheme() === "chameleon-theme-dark"
);

/**
 * Toggles between `"chameleon-theme-dark"` and `"chameleon-theme-light"`,
 * persisting the choice to localStorage.
 */
export function toggleCodeTheme() {
  const next =
    codeTheme() === "chameleon-theme-dark"
      ? "chameleon-theme-light"
      : "chameleon-theme-dark";
  codeTheme(next);
  localStorage.setItem(STORAGE_KEY, next);
}

