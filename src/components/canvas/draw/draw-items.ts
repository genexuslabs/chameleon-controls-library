import { CanvasItemRectModel, CanvasModel } from "../types";

const drawCanvasItemDictionary = {
  rect: (context: CanvasRenderingContext2D, item: CanvasItemRectModel) => {
    context.fillStyle = item.fill;
    context.fillRect(item.x, item.y, item.width, item.height);

    if (item.stroke || item.strokeWidth) {
      context.strokeStyle = item.stroke ?? "black";
      context.lineWidth = (item.strokeWidth ?? 1) + 0.5;
      context.strokeRect(item.x, item.y, item.width, item.height);
    }
  }
};

export const drawCanvasItems = (
  context: CanvasRenderingContext2D,
  model: CanvasModel
) => {
  if (!model) {
    return;
  }

  for (let index = 0; index < model.length; index++) {
    const itemUIModel = model[index];
    drawCanvasItemDictionary[itemUIModel.type](context, itemUIModel);
  }
};
