import { getLimitedScaleValue, getMousePosition, ZOOM_FACTOR } from "../utils";

export const handleCanvasWheel = (
  canvasRef: HTMLChCanvasElement,
  event: WheelEvent
) => {
  // - - - - - - - - - - - - - DOM read operations - - - - - - - - - - - - -

  const { mouseX, mouseY } = getMousePosition(
    canvasRef.getBoundingClientRect(),
    event
  );
  const currentScale = canvasRef.contextPosition.scale;
  const delta = event.deltaY < 0 ? 1 : -1;
  let newScale = currentScale * (delta > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR);

  // Limit the scale to its min and max values
  newScale = getLimitedScaleValue(newScale, canvasRef);

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
