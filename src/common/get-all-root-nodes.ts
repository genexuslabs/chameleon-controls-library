/**
 * Given an `HTMLElement`, it returns all his root nodes, including `ShadowRoot`
 * nodes.
 *
 * This utility is helpful for attaching scroll event listeners for the entire
 * document and other events that don't bubble.
 */
export const getAllRootNodes = (
  element: HTMLElement
): [Document, ...ShadowRoot[]] => {
  const rootNodes: [Document, ...ShadowRoot[]] = [document];

  let rootNode = element.getRootNode();

  while (rootNode instanceof ShadowRoot) {
    rootNodes.push(rootNode);
    rootNode = rootNode.host.getRootNode();
  }

  return rootNodes;
};
