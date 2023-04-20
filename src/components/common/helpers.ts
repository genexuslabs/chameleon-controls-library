export function mouseEventModifierKey(eventInfo: MouseEvent): boolean {
  if (navigator.userAgent.includes("Mac")) {
    return eventInfo.metaKey;
  } else {
    return eventInfo.ctrlKey;
  }
}
