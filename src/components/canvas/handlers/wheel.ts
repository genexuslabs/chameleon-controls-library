import { getMousePosition } from "../utils";

const ZOOM_FACTOR = 1.05;
const SCALE_LOWER_BOUND_LIMIT = 0.1;
const SCALE_UPPER_BOUND_LIMIT = 5;

export const handleCanvasWheel = (
  canvasRef: HTMLChCanvasElement,
  event: WheelEvent
) => {
  // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -
  const { x, y } = getMousePosition(event, canvasRef.getBoundingClientRect());
  const mouseX = x;
  const mouseY = y;
  const currentScale = canvasRef.contextPosition.scale;
  const delta = event.deltaY < 0 ? 1 : -1;
  const newScale = currentScale * (delta > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR);

  if (
    newScale < SCALE_LOWER_BOUND_LIMIT ||
    newScale > SCALE_UPPER_BOUND_LIMIT
  ) {
    return;
  }
  const currentOriginX = canvasRef.contextPosition.originX;
  const currentOriginY = canvasRef.contextPosition.originY;

  // - - - - - - - - - - - - - DOM write operations - - - - - - - - - - - - -
  // Update origin taking into account the mouse position
  canvasRef.contextPosition.originX =
    mouseX - (mouseX - currentOriginX) * (newScale / currentScale);
  canvasRef.contextPosition.originY =
    mouseY - (mouseY - currentOriginY) * (newScale / currentScale);

  // After that update the scale
  canvasRef.contextPosition.scale = newScale;
};
