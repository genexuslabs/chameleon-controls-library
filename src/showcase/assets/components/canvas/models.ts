import { CanvasModel } from "../../../../components/canvas/types";

export const canvasSimpleModel: CanvasModel = [
  {
    id: "1",
    x: 0,
    y: 0,
    fill: "yellow",
    width: 100,
    height: 100,

    type: "rect"
  }
];

export const canvasSimple2Model: CanvasModel = [
  {
    id: "2",
    x: 50,
    y: 20,
    fill: "red",
    width: 150,
    height: 100,
    strokeWidth: 1,
    type: "rect"
  }
];

export const canvasSimple3Model: CanvasModel = [
  {
    id: "2",
    x: 150,
    y: 20,
    fill: "green",
    width: 150,
    height: 200,
    strokeWidth: 4,
    type: "rect"
  }
];
