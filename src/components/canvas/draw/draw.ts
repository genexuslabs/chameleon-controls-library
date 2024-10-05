import { CanvasModel } from "../types";
import { drawCanvasItems } from "./draw-items";

export const drawCanvas = (
  context: CanvasRenderingContext2D,
  model: CanvasModel,
  width: number,
  height: number
) => {
  context.clearRect(0, 0, width, height);
  drawCanvasItems(context, model);
};
