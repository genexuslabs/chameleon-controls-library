import { CanvasModel, CanvasPosition } from "../types";
import { drawCanvasItems } from "./draw-items";

export const drawCanvas = (
  context: CanvasRenderingContext2D,
  contextPosition: CanvasPosition,
  model: CanvasModel,
  width: number,
  height: number
) => {
  context.clearRect(0, 0, width, height);

  context.save();

  context.translate(contextPosition.originX, contextPosition.originY);
  context.scale(contextPosition.scale, contextPosition.scale);

  drawCanvasItems(context, model);

  context.restore();
};
