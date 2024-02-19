import { Component } from "./interfaces";
import { ImageRender } from "./types";

export function debounce(
  func: () => void,
  wait: number,
  immediate = false
): () => void {
  let timeout: NodeJS.Timeout;

  return function (...args) {
    const later = function () {
      timeout = null;
      if (!immediate) {
        func.apply(this, args);
      }
    }.bind(this);

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(this, args);
    }
  };
}

export const isRTL = () => document.documentElement.dir === "rtl";

export const ROOT_VIEW: null = null;

/*  This functions overrides a method adding calls before (`before()`) and
    after (`after()`) 
*/
export function overrideMethod(
  component: Component,
  methodName: string,
  { before, after }: { before?: () => void; after?: () => void }
) {
  const oldMethod = component[methodName];
  component[methodName] = () => {
    if (before !== undefined) {
      before();
    }

    if (oldMethod !== undefined) {
      oldMethod.call(component);
    }

    if (after !== undefined) {
      after();
    }
  };
}

/**
 * Converts an object mapping token keys to booleans into a space-separated
 * string containing the token keys that map to truthy values.
 */
export const tokenMap = (tokens: { [key: string]: boolean }) =>
  Object.keys(tokens)
    .filter(key => tokens[key])
    .join(" ");

/**
 * `true` if `x` <= `y` <= `z`
 */
export const inBetween = (x: number, y: number, z: number) => x <= y && y <= z;

let resetDragImage;

/* @__PURE__ */ if (!window.Image) {
  resetDragImage = "test";
}

resetDragImage ??= new Image();
export const removeDragImage = (event: DragEvent) =>
  event.dataTransfer.setDragImage(resetDragImage, 0, 0);

export const isPseudoElementImg = (src?: string, imageType?: ImageRender) =>
  src && imageType !== "img";
