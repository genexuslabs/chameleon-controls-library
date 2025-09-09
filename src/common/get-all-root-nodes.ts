/**
 * Given an `HTMLElement`, it returns all his shadow root nodes, it includes
 * the shadow root nodes that are even in the assigned slots. For example, in
 * the following HTML:
 * ```html
 * <body>
 *   <ch-tabular-grid>
 *     #shadow-root (open)
 *     | <div>
 *     |   <slot></slot>
 *     | </div>
 *     <ch-tabular-grid-row>
 *       <ch-tabular-grid-cell>
 *         <ch-combo-box-render>
 *           #shadow-root (open)
 *           | <ch-popover></ch-popover>
 *         </ch-combo-box-render>
 *       </ch-tabular-grid-cell>
 *     </ch-tabular-grid-row>
 *   </ch-tabular-grid>
 * </body>
 * ```
 *
 * It returns `[document, #shadow-root of the ch-combo-box-render, #shadow-root of the ch-tabular-grid]`.
 *
 * This utility is helpful for attaching scroll event listeners for the entire
 * document and other events that don't bubble.
 */
export const getAllShadowRootAncestors = (
  node: HTMLElement
): [Document, ...ShadowRoot[]] => {
  const ancestors: [Document, ...ShadowRoot[]] = [document];
  let current: ParentNode = node;

  while (current) {
    // If a Node is projected as a slot, we need to traverse the slot's
    // assigned nodes to find the next real ancestor.
    if (current instanceof Element && current.assignedSlot) {
      current = current.assignedSlot;
      continue;
    }

    // Get next parentNode
    const parent = current.parentNode;

    if (parent) {
      current = parent;
    }
    // If we are on a ShadowRoot the next ancestor is the host
    else if (current instanceof ShadowRoot) {
      ancestors.push(current);
      current = current.host;
    }
    // If the current node is the Document or it doesn't exists, return all ancestors
    else {
      break;
    }
  }

  return ancestors;
};
