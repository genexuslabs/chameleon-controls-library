export type CanvasModel = CanvasItemModel[];

export type CanvasItemModel = CanvasItemCircleModel | CanvasItemRectModel;

export type CanvasItemBaseModel = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  draggable?: boolean;

  // Customization
  fill: string;
  stroke?: string;
  strokeWidth?: number;
};

export type CanvasItemRectModel = CanvasItemBaseModel & {
  type: "rect";
};

export type CanvasItemCircleModel = CanvasItemBaseModel & {
  type: "circle";
};
