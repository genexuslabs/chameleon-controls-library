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

/**
 * Returns how much (in negative value) the content overflows the window size
 * in the "start" and "end" directions.
 */
const getOverflowingSize = (
  actionStartPosition: number,
  documentSize: number,
  popoverSize: number,
  popoverRelativePosition: number
) => ({
  start:
    documentSize -
    (popoverSize + actionStartPosition + popoverRelativePosition),
  end: actionStartPosition + popoverRelativePosition
});

const contentOverflowsWindow = (overflowingSize: {
  start: number;
  end: number;
}) => overflowingSize.start < 0 || overflowingSize.end < 0;

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
): { alignmentPosition: number; alignmentOverflow: number } => {
  const popoverRelativePosition = alignToImplementationMap[align](
    actionSize,
    popoverSize,
    separation
  );

  // Check if the current alignment overflows the document window
  const alignmentOverflowingSize = getOverflowingSize(
    actionStartPosition,
    documentSize,
    popoverSize,
    popoverRelativePosition
  );

  // Find which alignment is the best fit, even if both alignments overflow the
  // window
  const alignmentWorstOverflowingSize = Math.min(
    alignmentOverflowingSize.start,
    alignmentOverflowingSize.end
  );

  // The configuration does not support flip or the alignment does not overflow
  if (!flipSupport || !contentOverflowsWindow(alignmentOverflowingSize)) {
    return {
      alignmentPosition: popoverRelativePosition,
      alignmentOverflow: alignmentWorstOverflowingSize
    };
  }

  // Check the alignment with the opposite alignment
  const oppositeAlign = positionTryFlipMap[align];
  const oppositePopoverRelativePosition: number = alignToImplementationMap[
    oppositeAlign
  ](actionSize, popoverSize, separation);

  const oppositeAlignmentOverflowingSize = getOverflowingSize(
    actionStartPosition,
    documentSize,
    popoverSize,
    oppositePopoverRelativePosition
  );

  // Find which alignment is the best fit, even if both alignments overflow the
  // window
  const oppositeAlignmentWorstOverflowingSize = Math.min(
    oppositeAlignmentOverflowingSize.start,
    oppositeAlignmentOverflowingSize.end
  );

  // The opposite alignment is the best fit
  if (!contentOverflowsWindow(oppositeAlignmentOverflowingSize)) {
    return {
      alignmentPosition: oppositePopoverRelativePosition,
      alignmentOverflow: oppositeAlignmentWorstOverflowingSize
    };
  }

  return alignmentWorstOverflowingSize < oppositeAlignmentWorstOverflowingSize
    ? {
        alignmentPosition: oppositePopoverRelativePosition,
        alignmentOverflow: oppositeAlignmentWorstOverflowingSize
      }
    : {
        alignmentPosition: popoverRelativePosition,
        alignmentOverflow: alignmentWorstOverflowingSize
      };
};

export const setResponsiveAlignment = (
  documentRect: { width: number; height: number },
  actionRect: DOMRect,
  actionInlineStart: number,
  popoverWidth: number,
  popoverHeight: number,
  computedStyle: CSSStyleDeclaration,
  inlineAlign: ChPopoverAlign,
  blockAlign: ChPopoverAlign,
  positionTry: ChPopoverPositionTry
): [
  { alignmentPosition: number; alignmentOverflow: number },
  { alignmentPosition: number; alignmentOverflow: number }
] => {
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
