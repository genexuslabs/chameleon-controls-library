import { inBetween } from "../../common/utils";
import { DraggableViewInfo } from "./types";

type DroppableArea =
  | "block-start"
  | "block-end"
  | "inline-start"
  | "inline-end"
  | "center";

type DroppableAreaSizes = [number, number, number, number];

// Custom vars
const BLOCK_START = "--ch-flexible-layout-drop-area-block-start";
const BLOCK_END = "--ch-flexible-layout-drop-area-block-end";
const INLINE_START = "--ch-flexible-layout-drop-area-inline-start";
const INLINE_END = "--ch-flexible-layout-drop-area-inline-end";

/**
 * If the mouse position is in the interval [0%, 30%] the droppable area should
 * be displayed at the START position with half the size.
 */
const START_HALF_THRESHOLD = 30; // In percentage
const START_HALF_THRESHOLD_FRACTION = START_HALF_THRESHOLD / 100;

/**
 * If the mouse position is in the interval [70%, 100%] the droppable area
 * should be displayed at the END position with half the size.
 */
const END_HALF_THRESHOLD = 100 - START_HALF_THRESHOLD; // In percentage
const END_HALF_THRESHOLD_FRACTION = 1 - START_HALF_THRESHOLD_FRACTION;

const setProperty = (element: HTMLElement, property: string, value: number) =>
  element.style.setProperty(property, `${value}px`);

const droppableAreaMap: {
  [key in DroppableArea]: (
    documentRect: DOMRect,
    mainViewRect: DOMRect
  ) => DroppableAreaSizes;
} = {
  "block-start": (documentRect, mainViewRect) => [
    mainViewRect.top,
    documentRect.height -
      (mainViewRect.top + mainViewRect.height * START_HALF_THRESHOLD_FRACTION),
    mainViewRect.left,
    documentRect.width - (mainViewRect.left + mainViewRect.width)
  ],

  "block-end": (documentRect, mainViewRect) => [
    mainViewRect.top + mainViewRect.height * END_HALF_THRESHOLD_FRACTION,
    documentRect.height - (mainViewRect.top + mainViewRect.height),
    mainViewRect.left,
    documentRect.width - (mainViewRect.left + mainViewRect.width)
  ],

  "inline-start": (documentRect, mainViewRect) => [
    mainViewRect.top,
    documentRect.height - (mainViewRect.top + mainViewRect.height),
    mainViewRect.left,
    documentRect.width -
      (mainViewRect.left + mainViewRect.width * START_HALF_THRESHOLD_FRACTION)
  ],

  "inline-end": (documentRect, mainViewRect) => [
    mainViewRect.top,
    documentRect.height - (mainViewRect.top + mainViewRect.height),
    mainViewRect.left + mainViewRect.width * END_HALF_THRESHOLD_FRACTION,
    documentRect.width - (mainViewRect.left + mainViewRect.width)
  ],

  center: (documentRect, mainViewRect) => [
    mainViewRect.top,
    documentRect.height - (mainViewRect.top + mainViewRect.height),
    mainViewRect.left,
    documentRect.width - (mainViewRect.left + mainViewRect.width)
  ]
};

let lastDroppableArea: DroppableArea;

export const handleDraggableViewMouseMove =
  (draggableView: DraggableViewInfo, droppableAreaRef: HTMLElement) =>
  (event: MouseEvent) => {
    // - - - - - - - - - - - DOM read operations - - - - - - - - - - -
    const documentRect = document.documentElement.getBoundingClientRect();
    const mainViewRect = draggableView.mainView.getBoundingClientRect();
    const positionX = event.clientX; // Mouse position X
    const positionY = event.clientY; // Mouse position Y

    const distanceToTheLeftEdge = positionX - mainViewRect.left;
    const distanceToTheTopEdge = positionY - mainViewRect.top;

    const relativePositionX =
      (distanceToTheLeftEdge / mainViewRect.width) * 100;
    const relativePositionY =
      (distanceToTheTopEdge / mainViewRect.height) * 100;

    let droppableArea: DroppableArea;

    // Block start (Most likely droppable area)
    if (
      relativePositionY <= START_HALF_THRESHOLD &&
      inBetween(relativePositionY, relativePositionX, 100 - relativePositionY)
    ) {
      droppableArea = "block-start";
    }

    // Inline End (second most likely droppable area)
    else if (
      relativePositionX >= END_HALF_THRESHOLD &&
      inBetween(100 - relativePositionX, relativePositionY, relativePositionX)
    ) {
      droppableArea = "inline-end";
    }

    // Inline Start
    else if (
      relativePositionX <= START_HALF_THRESHOLD &&
      inBetween(relativePositionX, relativePositionY, 100 - relativePositionX)
    ) {
      droppableArea = "inline-start";
    }

    // Block end
    else if (
      relativePositionY >= END_HALF_THRESHOLD &&
      inBetween(100 - relativePositionY, relativePositionX, relativePositionY)
    ) {
      droppableArea = "block-end";
    }

    // Center
    else {
      droppableArea = "center";
    }

    // If the droppable area did not change, there is no need to update the DOM
    if (lastDroppableArea === droppableArea) {
      return;
    }
    lastDroppableArea = droppableArea;

    const droppableAreaSizes = droppableAreaMap[droppableArea](
      documentRect,
      mainViewRect
    );

    // - - - - - - - - - - - DOM write operations - - - - - - - - - - -
    setProperty(droppableAreaRef, BLOCK_START, droppableAreaSizes[0]);
    setProperty(droppableAreaRef, BLOCK_END, droppableAreaSizes[1]);

    setProperty(droppableAreaRef, INLINE_START, droppableAreaSizes[2]);
    setProperty(droppableAreaRef, INLINE_END, droppableAreaSizes[3]);
  };

export const removeDroppableAreaStyles = (droppableAreaRef: HTMLElement) => {
  lastDroppableArea = undefined;
  droppableAreaRef.removeAttribute("style");
};
