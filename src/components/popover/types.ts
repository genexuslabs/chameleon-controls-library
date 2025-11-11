export type PopoverActionElement = HTMLButtonElement | HTMLInputElement;

export type ChPopoverAlign =
  | "outside-start"
  | "inside-start"
  | "center"
  | "inside-end"
  | "outside-end";

export type ChPopoverResizeElement =
  | "block-start" // Top
  | "inline-end" // Right
  | "block-end" // Bottom
  | "inline-start" // Left
  | "block-start-inline-start" // Top Left
  | "block-start-inline-end" // Top Right
  | "block-end-inline-start" // Bottom Left
  | "block-end-inline-end"; // Bottom Right

export type ChPopoverSizeMatch =
  | "content"
  | "action-element"
  | "action-element-as-minimum";

export type ChPopoverPositionTry = "flip-block" | "flip-inline" | "none";

export type PopoverClosedInfo = {
  reason:
    | "click-outside"
    | "escape-key"
    | "popover-no-longer-visible"
    | "toggle";
};
