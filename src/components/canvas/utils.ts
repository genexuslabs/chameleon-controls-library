export const ZOOM_FACTOR = 1.05;
export const DEFAULT_SCALE_LOWER_BOUND_LIMIT = 0.1;
export const DEFAULT_SCALE_UPPER_BOUND_LIMIT = 5;

export const getMousePosition = (event: MouseEvent, elementRect: DOMRect) => ({
  x: event.clientX - elementRect.left,
  y: event.clientY - elementRect.top
});

export const getLimitedScaleValue = (
  currentScale: number,
  canvasRef: HTMLChCanvasElement
) => {
  const scalerLowerBoundLimit =
    canvasRef.contextPositionLimit.scaleLowerBound ??
    DEFAULT_SCALE_LOWER_BOUND_LIMIT;
  const scalerUpperBoundLimit =
    canvasRef.contextPositionLimit.scaleUpperBound ??
    DEFAULT_SCALE_UPPER_BOUND_LIMIT;

  return Math.min(
    Math.max(currentScale, scalerLowerBoundLimit),
    scalerUpperBoundLimit
  );
};
