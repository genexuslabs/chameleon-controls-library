import { inBetween } from "../common/utils";
import { SmartGridModel } from "../components/smart-grid/types";
import { SmartGridCellVirtualSize } from "./types";

export const cellIsRendered = (cell: HTMLElement) =>
  cell.hasAttribute("data-did-load") && cell.style.display !== "none";

export const isRenderedSmartCellVisible = (
  element: HTMLElement,
  smartGridBoundingRect: DOMRect
) => {
  const elementRect = element.getBoundingClientRect();

  const smartGridRectLeftX = smartGridBoundingRect.x;
  const smartGridRectRightX =
    smartGridBoundingRect.x + smartGridBoundingRect.width;

  const smartGridRectTopY = smartGridBoundingRect.y;
  const smartGridRectBottomY =
    smartGridBoundingRect.y + smartGridBoundingRect.height;

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

export const isVirtualSizeCellVisible = (
  virtualSize: SmartGridCellVirtualSize,
  smartGridScrollTop: number,
  smartGridBoundingRect: DOMRect
): boolean => {
  const smartGridRectTopY = smartGridScrollTop;
  const smartGridRectBottomY =
    smartGridScrollTop + smartGridBoundingRect.height;
  const rectTopY = virtualSize.offsetTop;
  const rectBottomY = virtualSize.offsetTop + virtualSize.height;

  // At least, the top or bottom edge is visible in the Y axis
  return (
    inBetween(smartGridRectTopY, rectTopY, smartGridRectBottomY) ||
    inBetween(smartGridRectTopY, rectBottomY, smartGridRectBottomY)
  );
};

export const emptyItems = (items: SmartGridModel) =>
  items === undefined || items.length === 0;

export const getSmartCells = (scroller: HTMLChVirtualScrollerElement) =>
  [
    ...scroller.querySelectorAll(":scope>ch-smart-grid-cell")
  ] as HTMLChSmartGridCellElement[];
