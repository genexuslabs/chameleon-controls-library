const OVER_TOP_BORDER = "over-top-border";
const OVER_RIGHT_BORDER = "over-right-border";
const OVER_BOTTOM_BORDER = "over-bottom-border";
const OVER_LEFT_BORDER = "over-left-border";

let topBorderY: number;
let rightBorderX: number;
let bottomBorderY: number;
let leftBorderX: number;

export function detectOverBorder(element, borderDragThreshold = 0) {
  document.addEventListener("mousemove", detectOverBorderHandler);
  function detectOverBorderHandler(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const overTopBorder =
      mouseY > topBorderY - borderDragThreshold &&
      mouseY < topBorderY &&
      mouseX > leftBorderX &&
      mouseX < rightBorderX;
    const overRightBorder =
      mouseX > rightBorderX &&
      mouseX < rightBorderX + borderDragThreshold &&
      mouseY > topBorderY &&
      mouseY < bottomBorderY;
    const overBottomBorder =
      mouseY > bottomBorderY &&
      mouseY < bottomBorderY + borderDragThreshold &&
      mouseX > leftBorderX &&
      mouseX < rightBorderX;
    const overLeftBorder =
      mouseX > leftBorderX - borderDragThreshold &&
      mouseX < leftBorderX &&
      mouseY > topBorderY &&
      mouseY < bottomBorderY;

    // clear classes
    element.classList.remove(
      OVER_TOP_BORDER,
      OVER_RIGHT_BORDER,
      OVER_BOTTOM_BORDER,
      OVER_LEFT_BORDER
    );

    if (
      !overTopBorder &&
      !overRightBorder &&
      !overBottomBorder &&
      !overLeftBorder
    ) {
      // this is likely to be the most common case.
      element.classList.remove(
        OVER_TOP_BORDER,
        OVER_RIGHT_BORDER,
        OVER_BOTTOM_BORDER,
        OVER_LEFT_BORDER
      );
    }
    if (overTopBorder) {
      element.classList.add(OVER_TOP_BORDER);
    } else if (overRightBorder) {
      element.classList.add(OVER_RIGHT_BORDER);
    } else if (overBottomBorder) {
      element.classList.add(OVER_BOTTOM_BORDER);
    } else if (overLeftBorder) {
      element.classList.add(OVER_LEFT_BORDER);
    }
  }
}

export function updateBordersCoordinates(element) {
  const rect = element.getBoundingClientRect();
  leftBorderX = rect.left;
  rightBorderX = rect.right;
  topBorderY = rect.top;
  bottomBorderY = rect.bottom;
}
