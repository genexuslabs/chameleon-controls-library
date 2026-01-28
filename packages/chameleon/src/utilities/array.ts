export const insertIntoIndex = <T>(array: T[], element: T, index: number) =>
  array.splice(index, 0, element);

/**
 * Removes an index from an array, returning the deleted element.
 */
export const removeIndex = <T>(array: T[], index: number): T =>
  array.splice(index, 1)[0];
