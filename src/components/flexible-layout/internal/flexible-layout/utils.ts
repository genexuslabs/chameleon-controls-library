import { inBetween } from "../../../../common/utils";
import {
  DraggableViewExtendedInfo,
  DroppableArea,
  WidgetDropInfo
} from "./types";

/**
 * [block-start, block-end, inline-start, inline-end]
 */
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

/**
 * If the mouse position is in the interval [70%, 100%] the droppable area
 * should be displayed at the END position with half the size.
 */
const END_HALF_THRESHOLD = 100 - START_HALF_THRESHOLD; // In percentage

const EDGE_SIZE = 0.5;

const setProperty = (element: HTMLElement, property: string, value: number) =>
  element.style.setProperty(property, `${value}px`);

const inlineStart = (mainViewRect: DOMRect, rtl: boolean) =>
  rtl ? mainViewRect.left + mainViewRect.width * EDGE_SIZE : mainViewRect.left;

const inlineEnd = (
  documentRect: DOMRect,
  mainViewRect: DOMRect,
  rtl: boolean
) =>
  rtl
    ? documentRect.width - mainViewRect.right
    : documentRect.width - (mainViewRect.left + mainViewRect.width * EDGE_SIZE);

const droppableAreaMap: {
  [key in DroppableArea]: (
    documentRect: DOMRect,
    mainViewRect: DOMRect,
    rtl: boolean
  ) => DroppableAreaSizes;
} = {
  "block-start": (documentRect, mainViewRect) => [
    mainViewRect.top,
    documentRect.height - (mainViewRect.top + mainViewRect.height * EDGE_SIZE),
    mainViewRect.left,
    documentRect.width - mainViewRect.right
  ],

  "block-end": (documentRect, mainViewRect) => [
    mainViewRect.top + mainViewRect.height * EDGE_SIZE,
    documentRect.height - (mainViewRect.top + mainViewRect.height),
    mainViewRect.left,
    documentRect.width - mainViewRect.right
  ],

  "inline-start": (documentRect, mainViewRect, rtl) => [
    mainViewRect.top,
    documentRect.height - (mainViewRect.top + mainViewRect.height),
    inlineStart(mainViewRect, rtl),
    inlineEnd(documentRect, mainViewRect, rtl)
  ],

  "inline-end": (documentRect, mainViewRect, rtl) => [
    mainViewRect.top,
    documentRect.height - (mainViewRect.top + mainViewRect.height),
    inlineStart(mainViewRect, !rtl),
    inlineEnd(documentRect, mainViewRect, !rtl)
  ],

  center: (documentRect, mainViewRect) => [
    mainViewRect.top,
    documentRect.height - (mainViewRect.top + mainViewRect.height),
    mainViewRect.left,
    documentRect.width - mainViewRect.right
  ]
};

let lastDroppableArea: DroppableArea;
let lastViewId: string;

export const handleWidgetDrag =
  (
    draggableView: DraggableViewExtendedInfo,
    droppableAreaRef: HTMLElement,
    rtl: boolean
  ) =>
  (event: MouseEvent) => {
    event.stopPropagation(); // Prevents the remove of the droppable area

    // - - - - - - - - - - - DOM read operations - - - - - - - - - - -
    const documentRect = document.documentElement.getBoundingClientRect();
    const mainViewRect = draggableView.mainView.getBoundingClientRect();
    const positionX = event.clientX; // Mouse position X
    const positionY = event.clientY; // Mouse position Y

    const distanceToTheLeftEdge = rtl
      ? mainViewRect.width - (positionX - mainViewRect.left)
      : positionX - mainViewRect.left;
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
    if (
      lastViewId === draggableView.viewId &&
      lastDroppableArea === droppableArea
    ) {
      return;
    }
    lastDroppableArea = droppableArea;
    lastViewId = draggableView.viewId;

    const droppableAreaSizes = droppableAreaMap[droppableArea](
      documentRect,
      mainViewRect,
      rtl
    );

    // - - - - - - - - - - - DOM write operations - - - - - - - - - - -
    setProperty(droppableAreaRef, BLOCK_START, droppableAreaSizes[0]);
    setProperty(droppableAreaRef, BLOCK_END, droppableAreaSizes[1]);

    setProperty(droppableAreaRef, INLINE_START, droppableAreaSizes[2]);
    setProperty(droppableAreaRef, INLINE_END, droppableAreaSizes[3]);
  };

export const removeDroppableAreaStyles = (droppableAreaRef: HTMLElement) => {
  lastDroppableArea = undefined;
  lastViewId = undefined;
  droppableAreaRef.removeAttribute("style");
};

export const getWidgetDropInfo = (): WidgetDropInfo | undefined =>
  lastDroppableArea === undefined
    ? undefined
    : { dropAreaTarget: lastDroppableArea, viewIdTarget: lastViewId };
