/**
 * @todo TODO: Test this function when the element has an iframe as its parent element.
 *
 * Recursively look for a parent element in the `node`'s tree to calculate the
 * infinite scroll visibility and attach the scroll event listener.
 *
 * Considerations:
 *  - This algorithm starts with `node` === `this.el`.
 *  - If the parent grid has auto-grow = False, the return value should be
 *    the virtual scroller that is used in the parent grid.
 * @param node An element that will serve to recursively look up the parent element of `this.el` to attach the scroll event listener.
 * @returns A parent element of `node` in which the scroll event listener must be attached.
 */
export const getScrollableParentToAttachInfiniteScroll = (
  node: Element | HTMLElement
): ["ch-smart-grid" | "other" | "window", Element | HTMLElement] => {
  let nodeToCheck = node;

  // TODO: Add support for using getRootNode() to ensure node === null does
  // not mean we hit a shadow boundary
  while (
    nodeToCheck !== null &&
    nodeToCheck !== window.document.documentElement
  ) {
    // We try to search for first scrollable parent element.
    const overflowY = window.getComputedStyle(node).overflowY;

    // The last condition must be used, as the parent container could clip
    // (overflow: hidden) its overflow. In that scenario, the scroll is "hidden"
    // or "locked" but set
    if (overflowY === "auto" || overflowY === "scroll") {
      return [
        nodeToCheck.tagName === "ch-smart-grid" ? "ch-smart-grid" : "other",
        nodeToCheck
      ];
    }

    nodeToCheck = nodeToCheck.parentElement as Element;
  }

  return ["window", window.document.documentElement];
};
