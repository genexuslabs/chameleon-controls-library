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

const STYLE_TO_AVOID_FOUC = ":host,html{visibility:hidden !important}";

/**
 * The `ch-theme` component loads and manages named stylesheets that can be shared and reused across the Document or any Shadow Root via the `adoptedStyleSheets` API.
 *
 * @remarks
 * ## Features
 *  - Themes specified by name (resolved from a registry), by URL, or as inline `CSSStyleSheet` instances.
 *  - Configurable loading timeout.
 *  - Automatic attachment and detachment of stylesheets on connect/disconnect.
 *  - Built-in flash-of-unstyled-content (FOUC) prevention that hides the host until themes finish loading.
 *  - Toggle stylesheet attachment via the `attachStyleSheets` property.
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
   * The value can be overridden by the `attachStyleSheet` property of the model.
   */
  @Prop() readonly attachStyleSheets: boolean = true;
  @Watch("attachStyleSheets")
  attachStyleSheetsChanged() {
    this.#toggleAttachedModels();
  }

  /**
   * `true` to visually hide the contents of the root node while the control's
   * style is not loaded.
   */
  @Prop() readonly avoidFlashOfUnstyledContent: boolean = true;

  /**
   * Specify themes to load
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
   * Specifies the time to wait for the requested theme to load.
   */
  @Prop() readonly timeout = 10000;

  /**
   * Event emitted when the theme has successfully loaded
   */
  @Event({ bubbles: true, composed: false })
  themeLoaded: EventEmitter<ChThemeLoadedEvent>;

  connectedCallback() {
    this.el.hidden = true;
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
