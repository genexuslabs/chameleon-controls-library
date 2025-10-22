/**
 * Gets the width and height of the document's viewport.
 * This uses the `window.innerWidth` and `window.innerHeight` properties to get
 * the current size of the viewport. These values represent the width and
 * height of the visible area, excluding any scrollbars.
 *
 * IMPORTANT: This function must not use `getBoundingClientRect` or similar
 * methods that depend on the DOM layout, and not in the actual viewport size.
 *
 * @returns An object containing the width and height of the document's
 * viewport.
 */
export const getDocumentSizes = () => ({
  width: window.innerWidth,
  height: window.innerHeight
});
