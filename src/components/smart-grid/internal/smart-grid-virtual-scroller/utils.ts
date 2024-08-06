import { inBetween } from "../../../../common/utils";

export const isSmartCellVisible = (
  element: HTMLElement,
  smartGridBoundingBox: DOMRect
) => {
  const elementRect = element.getBoundingClientRect();

  const smartGridRectLeftX = smartGridBoundingBox.x;
  const smartGridRectRightX =
    smartGridBoundingBox.x + smartGridBoundingBox.width;

  const smartGridRectTopY = smartGridBoundingBox.y;
  const smartGridRectBottomY =
    smartGridBoundingBox.y + smartGridBoundingBox.height;

  const rectLeftX = elementRect.x;
  const rectRightX = elementRect.x + elementRect.width;

  const rectTopY = elementRect.y;
  const rectBottomY = elementRect.y + elementRect.height;

  return (
    // At least, the left or right edge is visible in the X axis
    (inBetween(smartGridRectLeftX, rectLeftX, smartGridRectRightX) ||
      inBetween(smartGridRectLeftX, rectRightX, smartGridRectRightX)) &&
    // At least, the top or bottom edge is visible in the Y axis
    (inBetween(smartGridRectTopY, rectTopY, smartGridRectBottomY) ||
      inBetween(smartGridRectTopY, rectBottomY, smartGridRectBottomY))
  );
};

export const emptyItems = (items: any[]) =>
  items === undefined || items.length === 0;

export const getSmartCells = (
  scroller: HTMLChSmartGridVirtualScrollerElement
) =>
  [
    ...scroller.querySelectorAll(":scope>ch-smart-grid-cell")
  ] as HTMLChSmartGridElement[];

// TODO: Use padding in the ch-smart-grid and see if this works well
export const cellsInViewportAreLoadedAndVisible = (
  scroller: HTMLChSmartGridVirtualScrollerElement,
  smartGrid: HTMLChSmartGridElement,
  inverseLoading: boolean
): boolean => {
  const cells = getSmartCells(scroller);
  const smartGridBoundingBox = smartGrid.getBoundingClientRect();

  const lastIndex = cells.length - 1;
  let startIndex = inverseLoading ? lastIndex : 0;
  const increment = inverseLoading ? -1 : 1;

  console.log("cells", cells);

  while (inBetween(0, startIndex, lastIndex)) {
    const currentCell = cells[startIndex];

    if (currentCell.hasAttribute("data-did-load")) {
      // The previous cells were visible, but we found a cell that is rendered
      // and its not in the viewport
      if (!isSmartCellVisible(currentCell, smartGridBoundingBox)) {
        return true;
      }
    }
    // There is a cell that isn't rendered, we can check its visibility, but
    // we can't ensure if when the cell is rendered, the next cells will be
    // visible or not
    else {
      return false;
    }

    startIndex += increment;
  }

  return true;
};
