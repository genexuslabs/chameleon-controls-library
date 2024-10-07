import { CanvasGridSettings, CanvasGridSettingsDots } from "../types";
import {
  DEFAULT_GRID_SETTINGS_DOT_SIZE,
  DEFAULT_GRID_SETTINGS_SIZE,
  DEFAULT_GRID_SETTINGS_TYPE,
  getCanvasBounds
} from "../utils";

const DEFAULT_GRID_COLOR = "#000";
const DEFAULT_MINIMUM_SCALE_LEVEL = 0.25;

const drawGridTypeDictionary = {
  dots: (canvasRef, context, options) => {
    const pointRadius =
      (canvasRef.gridSettings as CanvasGridSettingsDots).dotSize ??
      DEFAULT_GRID_SETTINGS_DOT_SIZE;

    context.fillStyle = canvasRef.gridSettings.color ?? DEFAULT_GRID_COLOR;

    for (let x = options.firstLineX; x < options.endX; x += options.gridSize) {
      for (
        let y = options.firstLineY;
        y < options.endY;
        y += options.gridSize
      ) {
        context.beginPath();
        context.arc(x, y, pointRadius, 0, Math.PI * 2);
        context.fill();
      }
    }
  },

  mesh: (canvasRef, context, options) => {
    context.strokeStyle = canvasRef.gridSettings.color ?? DEFAULT_GRID_COLOR;

    // Vertical lines
    for (let x = options.firstLineX; x < options.endX; x += options.gridSize) {
      context.beginPath();
      context.moveTo(x, options.startY);
      context.lineTo(x, options.endY);
      context.stroke();
    }

    // Horizontal lines
    for (let y = options.firstLineY; y < options.endY; y += options.gridSize) {
      context.beginPath();
      context.moveTo(options.startX, y);
      context.lineTo(options.endX, y);
      context.stroke();
    }
  }
} as const satisfies {
  [key in CanvasGridSettings["type"]]: (
    canvasRef: HTMLChCanvasElement,
    context: CanvasRenderingContext2D,
    options: {
      firstLineX: number;
      firstLineY: number;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      gridSize: number;
    }
  ) => void;
};

export const drawGrid = (
  canvasRef: HTMLChCanvasElement,
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) => {
  const { scale } = canvasRef.contextPosition;

  if (
    scale < (canvasRef.gridSettings.minimumScale ?? DEFAULT_MINIMUM_SCALE_LEVEL)
  ) {
    return;
  }

  const gridSize =
    canvasRef.gridSettings.size > 0
      ? canvasRef.gridSettings.size
      : DEFAULT_GRID_SETTINGS_SIZE;

  // Compute current bounds depending on the scale and translation
  const { startX, startY, endX, endY } = getCanvasBounds(
    canvasRef,
    canvasWidth,
    canvasHeight
  );

  // Adjusts the start of lines to the nearest multiple of the grid size
  const firstLineX = Math.floor(startX / gridSize) * gridSize;
  const firstLineY = Math.floor(startY / gridSize) * gridSize;

  drawGridTypeDictionary[
    canvasRef.gridSettings?.type ?? DEFAULT_GRID_SETTINGS_TYPE
  ](canvasRef, context, {
    firstLineX,
    firstLineY,
    startX,
    startY,
    endX,
    endY,
    gridSize
  });
};
