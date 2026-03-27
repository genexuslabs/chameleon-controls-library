import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Prop,
  State,
  Watch
} from "@stencil/core";
import { removeElement } from "../../common/array";
import { getTheme } from "./theme-stylesheet";
import {
  ChThemeLoadedEvent,
  Theme,
  ThemeItemModel,
  ThemeItemModelStyleSheet,
  ThemeItemModelUrl,
  ThemeModel
} from "./theme-types";

const LOADING_ATTRIBUTE = "data-ch-theme-loading";

const STYLE_TO_AVOID_FOUC = `:host,:has(>ch-theme[${LOADING_ATTRIBUTE}]){visibility:hidden !important}`;

/**
 * The `ch-theme` component loads and manages named stylesheets that can be shared and reused across the Document or any Shadow Root via the `adoptedStyleSheets` API.
 *
 * @remarks
 * ## Features
 *  - Themes specified by name (resolved from a registry), by URL, or as inline `CSSStyleSheet` instances.
 *  - Configurable loading timeout with `Promise.allSettled` — partial failures do not block other themes from loading.
 *  - Automatic attachment and detachment of stylesheets on connect/disconnect.
 *  - Built-in flash-of-unstyled-content (FOUC) prevention that hides the host until themes finish loading.
 *  - Toggle stylesheet attachment via the `attachStyleSheets` property.
 *  - Attaches to the nearest `Document` or `ShadowRoot` via `adoptedStyleSheets`, enabling cross-component theme sharing.
 *
 * ## Use when
 *  - Applying shared design tokens or theme stylesheets across components.
 *  - Loading external CSS themes by URL at runtime.
 *  - Loading one or more CSS theme files lazily at runtime (e.g., dark mode, brand themes, component skins).
 *  - Preventing flash of unstyled content before themes are applied.
 *
 * ## Do not use when
 *  - Styling a single component with scoped CSS — use the component's own `styleUrl` instead.
 *  - Styles can be included as a static stylesheet link at build time — no runtime loading needed.
 *
 * ## Accessibility
 *  - The host element is hidden (`hidden` attribute) and does not render visible content. It is a purely structural theming component.
 *
 * @status experimental
 */
@Component({
  tag: "ch-theme"
})
export class ChTheme {
  #successThemes: Theme[] = [];

  @Element() el: HTMLChThemeElement;

  @State() loaded: boolean = false;

  /**
   * Indicates whether the theme should be attached to the Document or
   * the ShadowRoot after loading.
   * The value can be overridden by the `attachStyleSheet` property of each
   * individual item in the model. When toggled at runtime, already-loaded
   * themes are attached or detached accordingly without re-fetching.
   */
  @Prop() readonly attachStyleSheets: boolean = true;
  @Watch("attachStyleSheets")
  attachStyleSheetsChanged() {
    this.#toggleAttachedModels();
  }

  /**
   * `true` to visually hide the contents of the root node while the control's
   * style is not loaded. When enabled, a `<style>` element with
   * `visibility: hidden !important` is rendered into the host until all themes
   * resolve. Set to `false` if the initial unstyled flash is acceptable or
   * if the themes are expected to be cached.
   */
  @Prop() readonly avoidFlashOfUnstyledContent: boolean = true;

  /**
   * Specifies the themes to load. Accepts a single theme name (string), an
   * array of theme names, a single `ThemeItemModel` object, or an array of
   * `ThemeItemModel` objects. Each item may specify a `name`, `url`,
   * `styleSheet`, `themeBaseUrl`, and per-item `attachStyleSheet` override.
   *
   * When set to `undefined` or `null`, no themes are loaded.
   *
   * **Note:** The model is only processed on the first non-null assignment.
   * Subsequent changes to an already-loaded model are currently not reactive.
   */
  @Prop() readonly model: ThemeModel | undefined | null;
  @Watch("model")
  modelChanged(_, oldModel: ThemeModel) {
    // TODO: Make fully reactive the model property
    if (!oldModel) {
      this.#loadModel();
    }
  }

  /**
   * Specifies the maximum time (in milliseconds) to wait for each requested
   * theme to load. If a theme does not resolve within this window, it is
   * treated as a rejected promise and logged to the console.
   *
   * Defaults to `10000` (10 seconds). This is an init-only property; changing
   * it after the initial load has no effect.
   */
  @Prop() readonly timeout = 10000;

  /**
   * Emitted after all theme loading promises have settled (via
   * `Promise.allSettled`). The event payload contains a `success` array with
   * the names of the themes that loaded successfully. Themes that failed are
   * logged to the console but not included in the payload.
   *
   * Bubbles: `true`. Composed: `false` — the event does not cross shadow DOM
   * boundaries.
   */
  @Event({ bubbles: true, composed: false })
  themeLoaded: EventEmitter<ChThemeLoadedEvent>;

  connectedCallback() {
    this.el.hidden = true;
    this.#toggleLoadingAttribute();
    this.#loadModel();
  }

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
      this.#toggleLoadingAttribute();

      const rejected = results.filter(result => result.status === "rejected");
      if (rejected.length > 0) {
        // eslint-disable-next-line no-console
        console.error("Failed to load themes:", rejected);
      }
    });
  };

  #toggleLoadingAttribute = () => {
    if (this.loaded) {
      this.el.removeAttribute(LOADING_ATTRIBUTE);
    } else {
      this.el.setAttribute(LOADING_ATTRIBUTE, "");
    }
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
    const root = this.el.getRootNode();

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
    const root = this.el.getRootNode();

    if (!(root instanceof Document || root instanceof ShadowRoot)) {
      return;
    }

    this.#successThemes.forEach(successTheme => {
      const themeIndex = root.adoptedStyleSheets.findIndex(
        adoptedStyleSheet => adoptedStyleSheet === successTheme.styleSheet
      );

      if (themeIndex > -1) {
        removeElement(root.adoptedStyleSheets, themeIndex);
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

  render() {
    return (
      this.avoidFlashOfUnstyledContent &&
      !this.loaded && <style>{STYLE_TO_AVOID_FOUC}</style>
    );
  }
}
