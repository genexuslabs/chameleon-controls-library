import type { ChatActionButtonPosition } from "./types";

export const SEND_CONTAINER_BEFORE =
  "send-container-additional-content-before" satisfies ChatActionButtonPosition["container"];
export const SEND_CONTAINER_AFTER =
  "send-container-additional-content-after" satisfies ChatActionButtonPosition["container"];

export const SEND_INPUT_BEFORE =
  "send-input-additional-content-before" satisfies ChatActionButtonPosition["container"];
export const SEND_INPUT_AFTER =
  "send-input-additional-content-after" satisfies ChatActionButtonPosition["container"];

export const DEFAULT_SEND_BUTTON_POSITION = {
  container: SEND_CONTAINER_AFTER,
  position: "end"
} as const satisfies ChatActionButtonPosition;

export const DEFAULT_STOP_RESPONSE_BUTTON_POSITION = {
  container: SEND_CONTAINER_BEFORE,
  position: "start"
} as const satisfies ChatActionButtonPosition;
