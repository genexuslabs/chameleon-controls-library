export type CanvasPosition = {
  originX: number;
  originY: number;
  scale: number;
};

export type CanvasPositionLimit = {
  scaleLowerBound: number;
  scaleUpperBound: number;
};

export type CanvasGridSettings =
  | CanvasGridSettingsMesh
  | CanvasGridSettingsDots;

type CanvasGridSettingsBase = {
  color: string;
  size: number;

  /**
   * Specifies at which scale value the grid is visible.
   */
  minimumScale?: number;
};

export type CanvasGridSettingsMesh = CanvasGridSettingsBase & {
  type: "mesh";
};

export type CanvasGridSettingsDots = CanvasGridSettingsBase & {
  dotSize?: number;
  type: "dots";
};

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
