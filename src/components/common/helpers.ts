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
  LEFT,
  WHEEL,
  RIGHT,
  BACK,
  FORWARD
}

export enum MouseEventButtons {
  LEFT = 1,
  RIGHT = 2,
  WHEEL = 4,
  BACK = 8,
  FORWARD = 16
}
