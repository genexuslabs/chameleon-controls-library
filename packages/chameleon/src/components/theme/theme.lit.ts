import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { html } from "lit";
import { property } from "lit/decorators.js";
import { state } from "lit/decorators/state.js";

import { removeIndex } from "../../utilities/array";
import { getTheme } from "./theme-stylesheet";
import type {
  ChThemeLoadedEvent,
  Theme,
  ThemeItemModel,
  ThemeItemModelStyleSheet,
  ThemeItemModelUrl,
  ThemeModel
} from "./theme-types";

/**
 * It allows you to load a style sheet in a similar way to the
 * native LINK or STYLE tags, but assigning it a name so that
 * it can be reused in different contexts,
 * either in the Document or in a Shadow-Root.
 */
@Component({
  tag: "ch-theme",
  shadow: false
})
export class ChTheme extends KasstorElement {
  #successThemes: Theme[] = [];

  @state() protected loaded: boolean = false;

  /**
   * Indicates whether the theme should be attached to the Document or
   * the ShadowRoot after loading.
   * The value can be overridden by the `attachStyleSheet` property of the model.
   */
  @property({ type: Boolean }) attachStyleSheets: boolean = true;
  @Observe("attachStyleSheets")
  protected attachStyleSheetsChanged() {
    this.#toggleAttachedModels();
  }

  /**
   * `true` to visually hide the contents of the root node while the control's
   * style is not loaded.
   */
  @property({ type: Boolean }) avoidFlashOfUnstyledContent: boolean = true;

  /**
   * Specifies an accessor for the attribute `hidden` of the `ch-theme`. This
   * accessor is useful for SSR scenarios were the DOM is shimmed and we don't
   * have access to is limited (since Lit does not provide the Host declarative
   * component), so we have to find a way to reflect the hidden property in the
   * `ch-theme` tag.
   *
   * Without this accessor, the initial load in SSR scenarios would flicker.
   */
  @property({ attribute: "hidden", type: Boolean, reflect: true })
  override hidden: boolean = false;

  /**
   * Specify themes to load
   */
  @property({ attribute: false }) model: ThemeModel | undefined | null;
  @Observe("model")
  protected modelChanged(_, oldModel: ThemeModel) {
    // TODO: Make fully reactive the model property
    if (!oldModel) {
      this.#loadModel();
    }
  }

  /**
   * Specifies the time to wait for the requested theme to load.
   */
  @property({ type: Number }) timeout = 10000;

  /**
   * Event emitted when the theme has successfully loaded
   */
  @Event({ bubbles: true, composed: false })
  protected themeLoaded!: EventEmitter<ChThemeLoadedEvent>;

  #initializeComponentFromProperties = () => {
    this.hidden = true;
    this.#loadModel();
  };

  #loadModel = async () => {
    if (!this.model || (Array.isArray(this.model) && this.model.length === 0)) {
      return;
    }

    const normalizeModel = this.#normalizeModel();
    const themePromises = normalizeModel.map(item =>
      getTheme(item, this.timeout)
    );

    Promise.allSettled(themePromises).then(results => {
      this.#successThemes = results
        .filter(result => result.status === "fulfilled")
        .map(result => result.status === "fulfilled" && result.value);

      this.#attachThemes();
      this.themeLoaded.emit({
        success: this.#successThemes.map(successTheme => successTheme.name)
      });
      this.loaded = true;

      const rejected = results.filter(result => result.status === "rejected");
      if (rejected.length > 0) {
        // eslint-disable-next-line no-console
        console.error("Failed to load themes:", rejected);
      }
    });
  };

  #normalizeModel = (): ThemeItemModel[] => {
    const list = Array.isArray(this.model) ? this.model : [this.model];

    return list.map(item => {
      if (typeof item === "string") {
        return { name: item };
      }

      return item;
    });
  };

  #attachThemes = () => {
    const root = this.getRootNode();

    if (!(root instanceof Document || root instanceof ShadowRoot)) {
      return;
    }
    const normalizeModel = this.#normalizeModel();

    this.#successThemes.forEach(successTheme => {
      if (
        this.#mustAttachTheme(normalizeModel, successTheme) &&
        !root.adoptedStyleSheets.includes(successTheme.styleSheet)
      ) {
        root.adoptedStyleSheets.push(successTheme.styleSheet);
      }
    });
  };

  #detachThemes = () => {
    const root = this.getRootNode();

    if (!(root instanceof Document || root instanceof ShadowRoot)) {
      return;
    }

    this.#successThemes.forEach(successTheme => {
      const themeIndex = root.adoptedStyleSheets.findIndex(
        adoptedStyleSheet => adoptedStyleSheet === successTheme.styleSheet
      );

      if (themeIndex > -1) {
        removeIndex(root.adoptedStyleSheets, themeIndex);
      }
    });
  };

  #mustAttachTheme = (normalizedModel: ThemeItemModel[], theme: Theme) => {
    // TODO: "normalizedModel" should be a Set to reduce lookup times
    const themeItemModel = normalizedModel.find(
      item => item.name === theme.name
    );

    // TODO: What's the meaning of this condition?
    if (
      (themeItemModel as ThemeItemModelUrl).url ||
      (themeItemModel as ThemeItemModelStyleSheet).styleSheet
    ) {
      return themeItemModel.attachStyleSheet ?? this.attachStyleSheets;
    }

    // TODO: Why do we return `true` instead of `false`?
    return true;
  };

  #toggleAttachedModels = () => {
    if (!this.loaded || !this.model) {
      return;
    }

    // TODO: We should unify this condition to iterate only over the successful
    // themes using "themeItemModel.attachStyleSheet ?? this.attachStyleSheets".
    // For this, we should see the TODOs in `#mustAttachTheme` method
    if (this.attachStyleSheets) {
      this.#attachThemes();
    } else {
      this.#detachThemes();
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    this.#initializeComponentFromProperties();
  }

  protected override willUpdate(): void {
    if (this.wasServerSideRendered) {
      this.wasServerSideRendered = false;
      this.#initializeComponentFromProperties();
    }
  }

  override render() {
    return (
      this.avoidFlashOfUnstyledContent &&
      !this.loaded &&
      html`<style>
        :host,
        html {
          visibility: hidden !important;
        }
      </style>`
    );
  }
}

export default ChTheme;

declare global {
  interface HTMLElementTagNameMap {
    "ch-theme": ChTheme;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChThemeElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChThemeElement;
  }

  /** Type of the `ch-theme`'s `themeLoaded` event. */
  // prettier-ignore
  type HTMLChThemeElementThemeLoadedEvent = HTMLChThemeElementCustomEvent<
    HTMLChThemeElementEventMap["themeLoaded"]
  >;

  interface HTMLChThemeElementEventMap {
    themeLoaded: ChThemeLoadedEvent;
  }

  interface HTMLChThemeElementEventTypes {
    themeLoaded: HTMLChThemeElementThemeLoadedEvent;
  }

  /**
   * It allows you to load a style sheet in a similar way to the
   * native LINK or STYLE tags, but assigning it a name so that
   * it can be reused in different contexts,
   * either in the Document or in a Shadow-Root.
   *
   * @fires themeLoaded Event emitted when the theme has successfully loaded
   */
  // prettier-ignore
  interface HTMLChThemeElement extends ChTheme {
    // Extend the ChTheme class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChThemeElementEventTypes>(type: K, listener: (this: HTMLChThemeElement, ev: HTMLChThemeElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChThemeElementEventTypes>(type: K, listener: (this: HTMLChThemeElement, ev: HTMLChThemeElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-theme": HTMLChThemeElement;
  }

  interface HTMLElementTagNameMap {
    "ch-theme": HTMLChThemeElement;
  }
}

