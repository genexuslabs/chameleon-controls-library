export const mapDefinedValues = <T, S>(
  collection: T[],
  mappingFunction: (child: T) => S | undefined
): S[] => {
  const result: S[] = [];

  // We have to filter undefined values, otherwise Lit will ender those values
  // with a comment <!----> which causes flickering, because in some occasions
  // comments are appended above DOM content, which destroys/re-creates the DOM
  // content
  for (let index = 0; index < collection.length; index++) {
    const content = mappingFunction(collection[index]);

    if (content) {
      result.push(content);
    }
  }

  return result;
};
