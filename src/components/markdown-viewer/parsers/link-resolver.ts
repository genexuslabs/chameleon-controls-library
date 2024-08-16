const linkDefinitions = new Map<string, string>();

const linkDefinitionPromises = new Map<
  string,
  { promise: Promise<string>; resolver: (url: string) => void }
>();

export const getLinkDefinition = (id: string): Promise<string> | string => {
  // See if we already have the definition
  const linkDefinition = linkDefinitions.get(id);

  if (linkDefinition !== undefined) {
    return linkDefinition;
  }

  // See if we already have a Promise for this definition
  const definitionRequest = linkDefinitionPromises.get(id);

  if (definitionRequest !== undefined) {
    return definitionRequest.promise;
  }

  let resolver: (value: string | PromiseLike<string>) => void;

  // Create the promise and store the resolver to resolve the promise when the
  // definition is encounter in the parser
  const definitionPromise = new Promise<string>(resolve => {
    resolver = resolve;

    // TODO: Should resolve after 10s or so to avoid dead lock?
  });

  linkDefinitionPromises.set(id, {
    promise: definitionPromise,
    resolver: resolver
  });

  return definitionPromise;
};

export const setLinkDefinition = (id: string, url: string) => {
  // Store the url
  linkDefinitions.set(id, url);

  // See if are pending Promises to be resolved
  const pendingPromise = linkDefinitionPromises.get(id);

  if (pendingPromise !== undefined) {
    pendingPromise.resolver(url);
  }
};

export const clearLinkDefinitions = () => {
  linkDefinitions.clear();
  linkDefinitionPromises.clear();
};
