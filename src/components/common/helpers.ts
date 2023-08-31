export const mouseEventModifierKey = (
  eventInfo: MouseEvent | KeyboardEvent
): boolean =>
  navigator.userAgent.includes("Mac") ? eventInfo.metaKey : eventInfo.ctrlKey;
