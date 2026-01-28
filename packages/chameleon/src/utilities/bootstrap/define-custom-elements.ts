import type { ChameleonPublicControlsTagName } from "../../typings/chameleon-components";
import type { FilterKeys } from "../../typings/types";

import { LIBRARY_PREFIX } from "../reserved-names/common.js";
import { getChameleonComponentPath } from "./web-components-path.js";

const lazyLoadedElements = new Set<ChameleonPublicControlsTagName>();

const autoLoadErrorMessage = (tagName: string, reason: string) => {
  const errorMessage = `Unable to autoload <${tagName}>. ${reason}`;
  console.warn(errorMessage);
  return errorMessage;
};

const observer = new MutationObserver(mutations => {
  for (let index = 0; index < mutations.length; index++) {
    const mutation = mutations[index];

    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        discover(node as Element);
      }
    }
  }
});

/**
 * Checks a node for undefined elements and attempts to register them.
 */
export async function discover(root: Element | ShadowRoot) {
  const rootTagName = root instanceof Element ? root.tagName.toLowerCase() : "";
  const rootIsChameleonElement = rootTagName.startsWith(LIBRARY_PREFIX);

  const undefinedCustomElements = root.querySelectorAll(":not(:defined)");
  const tagsToRegister = new Set<ChameleonPublicControlsTagName>();

  console.log(
    "discover...",
    [...undefinedCustomElements].map(el => el.tagName.toLowerCase())
  );

  for (const element of undefinedCustomElements) {
    const tagName = element.tagName.toLowerCase();

    if (
      tagName.startsWith(LIBRARY_PREFIX) &&
      !lazyLoadedElements.has(tagName as never)
    ) {
      tagsToRegister.add(tagName as never);
    }
  }

  // If the root element is an undefined Chameleon component, add it to the list
  if (rootIsChameleonElement && !lazyLoadedElements.has(rootTagName as never)) {
    tagsToRegister.add(rootTagName as never);
  }

  await Promise.allSettled(
    tagsToRegister.keys().map(tagName => register(tagName))
  );
}

/**
 * Registers an element by tag name.
 */
function register(tagName: ChameleonPublicControlsTagName): Promise<void> {
  // The element has been already defined in the page without using the lazy
  // loader, so we only have to add it to the `lazyLoadedElements` Set
  if (customElements.get(tagName)) {
    lazyLoadedElements.add(tagName);
    return Promise.resolve();
  }

  // Register it
  return new Promise((resolve, reject) => {
    const lazyLoadFunction = getChameleonComponentPath(tagName);

    if (lazyLoadFunction === undefined) {
      return reject(
        new Error(
          autoLoadErrorMessage(
            tagName,
            `The component doesn't exists in Chameleon. Please, verify that the "${tagName}" element exists in the version of Chameleon that you are using.`
          )
        )
      );
    }

    lazyLoadFunction
      .then(component => {
        component.default.define();
        lazyLoadedElements.add(tagName);
        resolve();
      })
      .catch(err => reject(new Error(autoLoadErrorMessage(tagName, err))));
  });
}

// TODO: Add support for awaiting element definitions. Example:
// if (!customElements.get(tag)) {
//   await customElements.whenDefined(tag)
// }
export const defineCustomElements = () => {
  // Initial discovery
  discover(document.body);

  // Listen for new undefined elements
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true
  });
};

type LibraryComponents<Prefix extends string> = FilterKeys<
  HTMLElementTagNameMap,
  `${Prefix}${string}`
>;

export type CustomElementOptions<Prefix extends string> = {
  libraryPrefix: Prefix;

  customElements: {
    lazyLoadPaths: Record<LibraryComponents<Prefix>, () => Promise<unknown>>;

    /**
     * Include your library's custom element tags that don't need to be observed.
     * You don't need to include other custom elements tags outside of your
     * library, as those are already excluded by each library's author.
     *
     * This property is important to optimize the lazy loading performance of
     * your library, by avoid observing mutations in custom elements that don't
     * use any other custom element.
     *
     * **IMPORTANT!!**: Be careful with custom elements that their render can
     * be customized with properties that provides a function to render
     * arbitrary templates, as you **MUST ALWAYS** observe those custom
     * elements. This is the case for the Chameloen's `ch-chat`, the internal
     * render of messages can be customized with the `renderItem` function, so
     * we can avoid observing that custom element.
     *
     * Example of usage:
     * ```ts
     * {
     *   dependencies: {
     *     "ch-action-menu-render": ["ch-popover"],
     *     "ch-combo-box-render": ["ch-popover"],
     *     "ch-flexible-layout-render": ["ch-layout-splitter", "ch-tab-render"],
     *     "ch-markdown-viewer": ["ch-code"],
     *     "ch-tree-view-render": ["ch-checkbox"],
     *     "ch-tooltip": ["ch-popover"]
     *   }
     * }
     * ```
     */
    dependencies?: {
      [key in LibraryComponents<Prefix>]?: Exclude<
        keyof HTMLElementTagNameMap | (string & {}),
        key
      >[];
    };

    neverWatchDOMChanges?: LibraryComponents<Prefix>[];
  };
};
