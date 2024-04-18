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
        // @ts-expect-error: TODO: This function will be removed when we refactor line-clamp implementation. So we are avoiding this error
        func.apply(this, args);
      }
      // @ts-expect-error: TODO: This function will be removed when we refactor line-clamp implementation. So we are avoiding this error
    }.bind(this);

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      // @ts-expect-error: TODO: This function will be removed when we refactor line-clamp implementation. So we are avoiding this error
      func.apply(this, args);
    }
  };
}

export const isRTL = () => document.documentElement.dir === "rtl";
export const isMobileDevice = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

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

/**
 * Force a value to follow CSS minimum and maximum rules. Note that the minimum
 * value can be greater than the maximum value, as implemented by the CSS
 * specification.
 * The maximum value can be `NaN`. In this case only the minimum value rule
 * will be apply.
 */
export const forceCSSMinMax = (
  value: number,
  minimum: number,
  maximum: number
): number =>
  Number.isNaN(maximum)
    ? Math.max(value, minimum)
    : Math.max(Math.min(value, maximum), minimum);
