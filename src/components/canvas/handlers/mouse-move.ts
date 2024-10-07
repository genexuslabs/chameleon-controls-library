import { isOverACanvasItem } from "../utils";

export const handleMouseMoveWithoutDrag = (
  canvasRef: HTMLChCanvasElement,
  event: MouseEvent
) => isOverACanvasItem(canvasRef, event);
