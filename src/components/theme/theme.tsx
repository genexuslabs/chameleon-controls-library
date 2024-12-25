import {
  Component,
  Element,
  Prop,
  Event,
  EventEmitter,
  h,
  State,
  Watch
} from "@stencil/core";
import {
  ChThemeLoadedEvent,
  Theme,
  ThemeItemModel,
  ThemeItemModelStyleSheet,
  ThemeItemModelUrl,
  ThemeModel
} from "./theme-types";
import { getTheme } from "./theme-stylesheet";
import { removeElement } from "../../common/array";

const STYLE_TO_AVOID_FOUC = ":host,html{visibility:hidden !important}";

/**
 * It allows you to load a style sheet in a similar way to the
 * native LINK or STYLE tags, but assigning it a name so that
 * it can be reused in different contexts,
 * either in the Document or in a Shadow-Root.
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
