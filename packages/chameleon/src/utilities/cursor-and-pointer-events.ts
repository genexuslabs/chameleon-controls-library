import type { CssCursorProperty } from "../typings/css-properties";

export const addCursorInDocument = (cursor: CssCursorProperty) => {
  document.documentElement.style.cursor = cursor;
};

export const resetCursorInDocument = () =>
  document.documentElement.style.removeProperty("cursor");

export const removePointerEventsInDocumentBody = () => {
  document.body.style.pointerEvents = "none";
};

// TODO: Add a unit test for this
export const resetPointerEventsInDocumentBody = () =>
  document.body.style.removeProperty("pointer-events");
