/**
 * SPA routing integration for the showcase.
 * Provides History API navigation without full page reloads.
 */

type PathnameChangeCallback = (pathname: string) => void;

let registeredCallback: PathnameChangeCallback | undefined;

/**
 * Navigate to a new path using the History API.
 * Dispatches a popstate event so the router updates reactively.
 */
export function navigate(path: string) {
  if (path === window.location.pathname) {
    return;
  }

  history.pushState(null, "", path);
  // Dispatch popstate to notify the showcase root component
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/**
 * Initialize the routing integration.
 * Calls the callback with the current pathname and listens for navigation.
 */
export function initRouterIntegration(
  onPathnameChange: PathnameChangeCallback
) {
  registeredCallback = onPathnameChange;

  // Listen for browser back/forward navigation
  window.addEventListener("popstate", () => {
    onPathnameChange(window.location.pathname);
  });

  // Set initial pathname
  onPathnameChange(window.location.pathname);
}

/**
 * Intercepts click events on anchor elements to use SPA navigation.
 * Attach this as a click handler on a root element to prevent full reloads
 * for internal links.
 */
export function handleLinkClick(event: MouseEvent) {
  // Only handle left clicks without modifier keys
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
    return;
  }

  const anchor = (event.composedPath() as HTMLElement[]).find(
    (el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement
  );

  if (!anchor) {
    return;
  }

  const href = anchor.getAttribute("href");

  // Only intercept internal links (starting with /)
  if (!href || !href.startsWith("/") || anchor.target === "_blank") {
    return;
  }

  event.preventDefault();
  navigate(href);
}

/**
 * Returns the current registered callback, useful for components that need
 * to trigger navigation updates programmatically.
 */
export function getCurrentPathname(): string {
  return window.location.pathname;
}
