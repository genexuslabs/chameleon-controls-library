import { inBetween } from "../../common/utils";
import { CanvasGridSettings, CanvasItemModel } from "./types";

export const ZOOM_FACTOR = 1.05;

export const DEFAULT_SCALE_LOWER_BOUND_LIMIT = 0.1;
export const DEFAULT_SCALE_UPPER_BOUND_LIMIT = 5;

export const DEFAULT_GRID_SETTINGS_SIZE = 40;
export const DEFAULT_GRID_SETTINGS_TYPE: CanvasGridSettings["type"] = "mesh";
export const DEFAULT_GRID_SETTINGS_DOT_SIZE = 2;

export const getMousePosition = (elementRect: DOMRect, event: MouseEvent) => ({
  mouseX: event.clientX - elementRect.left,
  mouseY: event.clientY - elementRect.top
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

export const getCanvasBounds = (
  canvasRef: HTMLChCanvasElement,
  canvasWidth: number,
  canvasHeight: number
) => {
  const { originX, originY, scale } = canvasRef.contextPosition;

  const startX = -originX / scale;
  const startY = -originY / scale;

  return {
    startX: startX,
    startY: startY,
    endX: startX + canvasWidth / scale,
    endY: startY + canvasHeight / scale
  };
};

export const isOverACanvasItem = (
  canvasRef: HTMLChCanvasElement,
  event: MouseEvent
): CanvasItemModel | null => {
  const { scale, originX, originY } = canvasRef.contextPosition;
  const canvasModel = canvasRef.model;
  const elementRect = canvasRef.getBoundingClientRect();
  const { mouseX, mouseY } = getMousePosition(elementRect, event);
  const scaledMouseX = (mouseX - originX) / scale;
  const scaledMouseY = (mouseY - originY) / scale;

  // console.log();

  // Start from the last element, as elements at the end of the model are
  // placed above the others
  for (let index = canvasModel.length - 1; index >= 0; index--) {
    const itemUIModel = canvasModel[index];

    const itemStartX = itemUIModel.x;
    const itemEndX = itemStartX + itemUIModel.width;
    const itemStartY = itemUIModel.y;
    const itemEndY = itemStartY + itemUIModel.height;

    if (
      inBetween(itemStartX, scaledMouseX, itemEndX) &&
      inBetween(itemStartY, scaledMouseY, itemEndY)
    ) {
      return itemUIModel;
    }
  }

  return null;
};
