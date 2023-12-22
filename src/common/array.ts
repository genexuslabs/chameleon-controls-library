export const insertIntoIndex = <T>(array: T[], element: T, index: number) =>
  array.splice(index, 0, element);

/**
 * Removes an element from an array, returning the deleted element.
 */
export const removeElement = (array: any[], index: number) =>
  array.splice(index, 1);
