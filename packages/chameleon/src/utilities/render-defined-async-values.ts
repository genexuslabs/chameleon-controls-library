export const renderDefinedAsyncValues = <T>(
  renderedContent: PromiseSettledResult<T>[]
): T[] => {
  const result = [];

  // We have to filter undefined values, otherwise Lit will ender those values
  // with a comment <!----> which causes flickering, because in some occasions
  // comments are appended above DOM content, which destroys/re-creates the DOM
  // content
  for (let index = 0; index < renderedContent.length; index++) {
    const content = (renderedContent[index] as PromiseFulfilledResult<T>).value;

    if (content) {
      result.push(content);
    }
  }

  return result;
};
