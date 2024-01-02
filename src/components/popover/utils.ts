import { ChPopoverAlign } from "./types";

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

export const getAlignmentValue = (
  align: ChPopoverAlign,
  actionSize: number,
  popoverSize: number,
  separation: number
) => alignToImplementationMap[align](actionSize, popoverSize, separation);
