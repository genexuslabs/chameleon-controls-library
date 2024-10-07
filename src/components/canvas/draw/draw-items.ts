import { CanvasItemModel, CanvasItemRectModel, CanvasModel } from "../types";

const drawCanvasItemDictionary = {
  rect: (
    context: CanvasRenderingContext2D,
    item: CanvasItemRectModel,
    itemOver: CanvasItemModel | null
  ) => {
    context.fillStyle = item.fill;
    context.fillRect(item.x, item.y, item.width, item.height);

    if (item.stroke || item.strokeWidth) {
      context.strokeStyle = item.stroke ?? "black";
      context.lineWidth = (item.strokeWidth ?? 1) + 0.5;
      context.strokeRect(item.x, item.y, item.width, item.height);
    }

    if (itemOver === item) {
      context.strokeStyle = "#2ecc71";
      context.lineWidth = 3;
      context.strokeRect(
        item.x - 2.5,
        item.y - 2.5,
        item.width + 5,
        item.height + 5
      );
    }
  }
};

export const drawCanvasItems = (
  context: CanvasRenderingContext2D,
  model: CanvasModel,
  itemOver: CanvasItemModel | null
) => {
  if (!model) {
    return;
  }

  for (let index = 0; index < model.length; index++) {
    const itemUIModel = model[index];
    drawCanvasItemDictionary[itemUIModel.type](context, itemUIModel, itemOver);
  }
};
