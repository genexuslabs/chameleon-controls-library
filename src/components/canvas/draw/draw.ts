import { CanvasItemModel } from "../types";
import { drawGrid } from "./draw-grid";
import { drawCanvasItems } from "./draw-items";

export const drawCanvas = (
  canvasRef: HTMLChCanvasElement,
  context: CanvasRenderingContext2D,
  itemOver: CanvasItemModel | null,
  width: number,
  height: number
) => {
  const contextPosition = canvasRef.contextPosition;
  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(contextPosition.originX, contextPosition.originY);
  context.scale(contextPosition.scale, contextPosition.scale);

  if (canvasRef.drawGrid) {
    drawGrid(canvasRef, context, width, height);
  }

  drawCanvasItems(context, canvasRef.model, itemOver);

  context.restore();
};
