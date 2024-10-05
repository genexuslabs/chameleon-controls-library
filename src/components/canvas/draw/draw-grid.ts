const DEFAULT_GRID_SIZE = 40;
const DEFAULT_GRID_COLOR = "#000";
const DEFAULT_MINIMUM_SCALE_LEVEL = 0.0625;

export const drawGrid = (
  canvasRef: HTMLChCanvasElement,
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) => {
  const { originX, originY, scale } = canvasRef.contextPosition;

  if (
    scale < (canvasRef.gridSettings.minimumScale ?? DEFAULT_MINIMUM_SCALE_LEVEL)
  ) {
    return;
  }

  const gridSize =
    canvasRef.gridSettings.size > 0
      ? canvasRef.gridSettings.size
      : DEFAULT_GRID_SIZE;

  // Compute current bounds depending on the scale and translation
  const startX = -originX / scale;
  const startY = -originY / scale;
  const endX = startX + canvasWidth / scale;
  const endY = startY + canvasHeight / scale;

  // Adjusts the start of lines to the nearest multiple of the grid size
  const firstLineX = Math.floor(startX / gridSize) * gridSize;
  const firstLineY = Math.floor(startY / gridSize) * gridSize;

  context.strokeStyle = canvasRef.gridSettings.color ?? DEFAULT_GRID_COLOR;

  // Vertical lines
  for (let x = firstLineX; x < endX; x += gridSize) {
    context.beginPath();
    context.moveTo(x, startY);
    context.lineTo(x, endY);
    context.stroke();
  }

  // Horizontal lines
  for (let y = firstLineY; y < endY; y += gridSize) {
    context.beginPath();
    context.moveTo(startX, y);
    context.lineTo(endX, y);
    context.stroke();
  }
};
