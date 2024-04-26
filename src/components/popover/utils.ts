import { ChPopoverAlign, ChPopoverPositionTry } from "./types";

const POPOVER_SEPARATION_X = "--ch-popover-separation-x";
const POPOVER_SEPARATION_Y = "--ch-popover-separation-y";

// Position try
const positionTryFlipMap = {
  "outside-start": "outside-end",
  "outside-end": "outside-start",
  "inside-start": "inside-end",
  "inside-end": "inside-start"
} as const satisfies {
  [key in Exclude<ChPopoverAlign, "center">]: string;
};

const checkIfContentOverflowsWindowY = (
  actionStartPosition: number,
  documentSize: number,
  popoverSize: number,
  popoverRelativePosition: number
) =>
  documentSize < popoverSize + actionStartPosition + popoverRelativePosition ||
  actionStartPosition + popoverRelativePosition < 0;

const alignToImplementationMap: {
  [key in ChPopoverAlign]: (
    actionSize: number,
    popoverSize: number,
    separation: number
  ) => number;
} = {
  "outside-start": (_, popoverSize, separation) => -popoverSize - separation,

  "inside-start": (_, __, separation) => separation,

  center: (actionSize, popoverSize, separation) =>
    actionSize * 0.5 + separation - popoverSize * 0.5,

  "inside-end": (actionSize, popoverSize, separation) =>
    actionSize - (separation + popoverSize),

  "outside-end": (actionSize, _, separation) => actionSize + separation
};

export const fromPxToNumber = (pxValue: string) =>
  Number(pxValue.replace("px", "").trim());

const getAlignmentValue = (
  align: ChPopoverAlign,
  actionStartPosition: number,
  actionSize: number,
  popoverSize: number,
  documentSize: number,
  separation: number,
  flipSupport: boolean
) => {
  const popoverRelativePosition = alignToImplementationMap[align](
    actionSize,
    popoverSize,
    separation
  );

  // The configuration does not support flip
  if (!flipSupport) {
    return popoverRelativePosition;
  }

  // Check if the current alignment overflows the document window
  const alignmentOverflowsWindow = checkIfContentOverflowsWindowY(
    actionStartPosition,
    documentSize,
    popoverSize,
    popoverRelativePosition
  );

  if (!alignmentOverflowsWindow) {
    return popoverRelativePosition;
  }

  // Check the alignment with the opposite alignment
  const oppositeAlign = positionTryFlipMap[align];
  const oppositePopoverRelativePosition = alignToImplementationMap[
    oppositeAlign
  ](actionSize, popoverSize, separation);

  const oppositeAlignmentOverflowsWindow = checkIfContentOverflowsWindowY(
    actionStartPosition,
    documentSize,
    popoverSize,
    oppositePopoverRelativePosition
  );

  return oppositeAlignmentOverflowsWindow
    ? popoverRelativePosition
    : oppositePopoverRelativePosition;
};

export const setResponsiveAlignment = (
  documentRect: DOMRect,
  actionRect: DOMRect,
  actionInlineStart: number,
  popoverWidth: number,
  popoverHeight: number,
  computedStyle: CSSStyleDeclaration,
  inlineAlign: ChPopoverAlign,
  blockAlign: ChPopoverAlign,
  positionTry: ChPopoverPositionTry
): [number, number] => {
  const separationX = computedStyle.getPropertyValue(POPOVER_SEPARATION_X);
  const separationY = computedStyle.getPropertyValue(POPOVER_SEPARATION_Y);

  // Alignment
  const inlineAlignmentValue = getAlignmentValue(
    inlineAlign,
    actionInlineStart,
    actionRect.width,
    popoverWidth,
    documentRect.width,
    fromPxToNumber(separationX),
    inlineAlign !== "center" && positionTry === "flip-inline"
  );

  const blockAlignmentValue = getAlignmentValue(
    blockAlign,
    actionRect.top,
    actionRect.height,
    popoverHeight,
    documentRect.height,
    fromPxToNumber(separationY),
    blockAlign !== "center" && positionTry === "flip-block"
  );

  return [inlineAlignmentValue, blockAlignmentValue];
};
