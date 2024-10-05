export const getMousePosition = (event: MouseEvent, elementRect: DOMRect) => ({
  x: event.clientX - elementRect.left,
  y: event.clientY - elementRect.top
});
