export const mouseEventModifierKey = (
  eventInfo: MouseEvent | KeyboardEvent
): boolean =>
  navigator.userAgent.includes("Mac") ? eventInfo.metaKey : eventInfo.ctrlKey;

export function mouseEventHasButtonPressed(
  eventInfo: MouseEvent,
  button: MouseEventButtons
): boolean {
  return (eventInfo.buttons & button) === button;
}

export enum MouseEventButton {
  KEY_SHORTCUT = -1,
  LEFT = 0,
  WHEEL = 1,
  RIGHT = 2,
  BACK = 3,
  FORWARD = 4
}

export enum MouseEventButtons {
  LEFT = 1,
  RIGHT = 2,
  WHEEL = 4,
  BACK = 8,
  FORWARD = 16
}

/**
 * Traverses the DOM's composed focus path across shadow boundaries.
 * Returns the active elements from innermost to outermost shadow root.
 */
export function focusComposedPath(): HTMLElement[] {
  const composedPath: HTMLElement[] = [];
  let root: Document | ShadowRoot | null = document;

  while (root && root.activeElement) {
    composedPath.push(root.activeElement as HTMLElement);
    root = root.activeElement.shadowRoot;
  }

  return composedPath.reverse();
}
