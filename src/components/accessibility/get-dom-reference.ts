export const getDOMReferenceUsingPath = (
  path: string[]
): HTMLElement | null => {
  let lastElementInPath = document.querySelector(path[0]);

  for (let index = 1; index < path.length; index++) {
    const nextSelector = path[index];

    if (!lastElementInPath || !lastElementInPath.shadowRoot) {
      return null;
    }
    lastElementInPath =
      lastElementInPath.shadowRoot.querySelector(nextSelector);
  }

  return lastElementInPath as HTMLElement;
};
