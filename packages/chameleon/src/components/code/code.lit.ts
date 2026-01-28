import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import type { Root as HRoot } from "hast";
import { html, type PropertyValues } from "lit";
import { property } from "lit/decorators/property.js";

import { IS_SERVER } from "../../development-flags";
import { SCROLLABLE_CLASS } from "../../utilities/reserved-names/common";
import { DEFAULT_CODE_LANGUAGE } from "./constants";
import { getHast } from "./internal/get-hast";
import { getHastInServer } from "./internal/get-hast-server";
import { highlighter } from "./internal/highlighter";
import { languageImplementationMapping } from "./internal/language-implementation-mapping";
import { renderHast } from "./internal/render-hast";

import styles from "./code.scss?inline";

// This is a side-effect that only occurs in the server. We auto-load all
// languages, since Lit doesn't support at the moment async rendering so we
// can't lazy load code languages. This trick auto load all code languages
// as a side-effect when someone imports the ChCode class, so when anyone uses
// the ChCode class in the server, all languages are preloaded as a side effect
if (IS_SERVER) {
  await Promise.allSettled(
    [...Object.values(languageImplementationMapping)].map(language =>
      highlighter.loadLanguage(language())
    )
  );
}

/**
 * A control to highlight code blocks.
 * - It supports code highlight by parsing the incoming code string to [hast](https://github.com/syntax-tree/hast) using [Shiki](https://shiki.matsu.io). After that, it implements a reactivity layer by implementing its own render for the hast.
 *
 * - It also supports all programming languages from [Shiki.js](https://shiki.matsu.io).
 *
 * - When the code highlighting is needed at runtime, the control will load on demand the code parser and the programming language needed to parse the code.
 */
@Component({
  styles,
  tag: "ch-code"
})
export class ChCode extends KasstorElement {
  // #lastNestedChildIsRoot: boolean = true;
  #hastTree: HRoot | undefined;

  /**
   * Specifies the code language to highlight.
   */
  @property() language: string | undefined = "txt";

  // TODO: We should see what we do with this property
  /**
   *
   */
  @property() lastNestedChildClass: string = "last-nested-child";

  /**
   * Specifies if an indicator is displayed in the last element rendered.
   * Useful for streaming scenarios where a loading indicator is needed.
   */
  @property({ type: Boolean, attribute: "show-indicator" })
  showIndicator: boolean = false;

  /**
   * Specifies the code string to highlight.
   */
  @property() value: string | undefined;

  // async componentWillRender() {
  //   if (this.value) {
  //     const renderResult = await this.#parseCodeToJSX();

  //     this.JSXCodeBlock = renderResult.renderedCode;
  //     this.#lastNestedChildIsRoot = renderResult.lastNestedChildIsRoot;
  //   } else {
  //     this.JSXCodeBlock = "";
  //     this.#lastNestedChildIsRoot = true;
  //   }
  // }

  override connectedCallback(): void {
    super.connectedCallback();
    this.classList.add(SCROLLABLE_CLASS);

    // TODO: Find a way to implement this in the server
    //   adoptCommonThemes(this.el.shadowRoot.adoptedStyleSheets);
  }

  override willUpdate(changedProperties: PropertyValues): void {
    if (this.value && !this.#hastTree) {
      // Sync render for the server
      if (IS_SERVER) {
        this.#hastTree = getHastInServer(this.value, this.language!);
      }
      // The component was not rendered in the server and it is the first time
      // that it will rendered any content, so we must add a placeholder to
      // avoid CLS until the JavaScript for the language has been downloaded
      // to compute the HAST
      if (!IS_SERVER && !this.wasServerSideRendered) {
        this.#hastTree = {
          type: "root",
          children: [
            {
              type: "element",
              tagName: "pre",
              properties: {},
              children: [
                {
                  type: "element",
                  tagName: "code",
                  properties: {},
                  children: [
                    {
                      type: "element",
                      tagName: "span",
                      properties: {},
                      children: [{ type: "text", value: this.value }]
                    }
                  ]
                }
              ]
            }
          ]
        };
      }
    }

    // Only update the component here if it was not server side rendered,
    // otherwise we MUST delay the first render until the HAST has been
    // computed. We do this by overriding the scheduleUpdate. In this function
    // we wait until the HAST has been computed. This is the only async
    // function that Lit awaits before rendering the component
    if (!this.wasServerSideRendered) {
      if (changedProperties.has("value") || changedProperties.has("language")) {
        const { language, value } = this;

        if (value) {
          getHast(value, language ?? DEFAULT_CODE_LANGUAGE).then(hast => {
            // Since the getHast is async because it needs to lazy load the
            // language, we have to ensure this Hast result is for the current
            // value and language, and not for any other old computation
            if (this.value === value && this.language === language) {
              this.#hastTree = hast;
              this.requestUpdate();
            }
          });
        }
      }
    }
  }

  protected override async scheduleUpdate(): Promise<void> {
    // If the component was server side render, we MUST delay the first render
    // until the HAST has been computed. Otherwise, we will get a hydration
    // mismatch error
    if (this.wasServerSideRendered) {
      // TODO: What happens if between this await the language changes?
      // Do we have to cancel the previous await or handle it somehow?
      this.#hastTree = await getHast(
        this.value!,
        this.language ?? DEFAULT_CODE_LANGUAGE
      );
    }

    super.scheduleUpdate();
  }

  override render() {
    // const addLastNestedChildClassInHost =
    //   this.showIndicator && this.#lastNestedChildIsRoot;

    return html`<pre class="pre">
        <code part="code">${this.#hastTree
      ? renderHast(this.#hastTree)
      : undefined}</code>
      </pre>`;

    // <Host
    //   class={{
    //     "ch-code-show-indicator": this.showIndicator,
    //     [SCROLLABLE_CLASS]: true
    //   }}
    // >
    //   <code
    //     class={{
    //       [`hljs language-${language}`]: true,
    //       [this.lastNestedChildClass]: addLastNestedChildClassInHost
    //     }}
    //     part={`code language-${language}`}
    //   >
    //     {this.JSXCodeBlock}
    //   </code>
    // </Host>
  }
}

export default ChCode;

declare global {
  interface HTMLElementTagNameMap {
    "ch-code": ChCode;
  }
}


// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChCodeElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChCodeElement;
  }

  /**
   * A control to highlight code blocks.
   * - It supports code highlight by parsing the incoming code string to [hast](https://github.com/syntax-tree/hast) using [Shiki](https://shiki.matsu.io). After that, it implements a reactivity layer by implementing its own render for the hast.
   *
   * - It also supports all programming languages from [Shiki.js](https://shiki.matsu.io).
   *
   * - When the code highlighting is needed at runtime, the control will load on demand the code parser and the programming language needed to parse the code.
   */// prettier-ignore
  interface HTMLChCodeElement extends ChCode {
    // Extend the ChCode class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-code": HTMLChCodeElement;
  }

  interface HTMLElementTagNameMap {
    "ch-code": HTMLChCodeElement;
  }
}

