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
 * @example
 *   part={tokenMap({
 *     header: true,
 *     disabled: this.disabled,
 *     selected: this.selected,
 *     [levelPart]: canShowLines,
 *     "expand-button":
 *       canShowLines && !this.leaf && this.expandableButton !== "no"
 *   })}
 */
export const tokenMap = (tokens: { [key: string]: boolean }) => {
  const keys = Object.keys(tokens);
  let result = "";

  for (let index = 0; index < keys.length; index++) {
    const tokenKey = keys[index];
    const tokenValue = tokens[tokenKey];

    if (tokenValue) {
      result += result === "" ? tokenKey : ` ${tokenKey}`;
    }
  }

  return result;
};

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

// - - - - - - - - - - - - - - - - - - - -
//                RTL utils
// - - - - - - - - - - - - - - - - - - - -
export const isRTL = () => document.documentElement.dir === "rtl";

let RTLWatcher: MutationObserver | undefined; // Don't allocate memory until needed
let RTLSubscribers: Map<string, (rtl: boolean) => void> | undefined; // Don't allocate memory until needed

const setRTLWatcher = () => {
  if (RTLWatcher) {
    return;
  }

  RTLWatcher = new MutationObserver(() => {
    // Defensive programming. Check if there are subscribers
    if (!RTLSubscribers || RTLSubscribers.size === 0) {
      return;
    }

    const rtlDirection = isRTL();
    const subscribers = [...RTLSubscribers.values()];

    // Notify all subscribers
    for (let index = 0; index < subscribers.length; index++) {
      const subscriberCallback = subscribers[index];
      subscriberCallback(rtlDirection);
    }
  });

  // Observe the dir attribute in the document
  RTLWatcher.observe(document.documentElement, {
    attributeFilter: ["dir"]
  });
};

export const subscribeToRTLChanges = (
  subscriberId: string,
  callback: (rtl: boolean) => void
) => {
  setRTLWatcher();

  RTLSubscribers ??= new Map();
  RTLSubscribers.set(subscriberId, callback);
};

export const unsubscribeToRTLChanges = (subscriberId: string) => {
  RTLSubscribers.delete(subscriberId);

  // Free the memory if no subscribers remaining
  if (RTLSubscribers.size === 0) {
    RTLWatcher.disconnect();
    RTLWatcher = undefined;
    RTLSubscribers = undefined;
  }
};
