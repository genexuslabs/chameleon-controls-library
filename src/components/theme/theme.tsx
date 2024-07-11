import {
  Component,
  Element,
  Prop,
  Event,
  EventEmitter,
  h,
  State,
  Build
} from "@stencil/core";
import {
  ChThemeLoadedEvent,
  Theme,
  ThemeItemModel,
  ThemeModel
} from "./theme-types";
import { getTheme } from "./theme-stylesheet";

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
  @Element() el: HTMLChThemeElement;

  @State() loaded: boolean = false;

  /**
   * `true` to visually hide the contents of the root node while the control's
   * style is not loaded.
   */
  @Prop() readonly avoidFlashOfUnstyledContent: boolean = true;

  /**
   * Specify themes to load
   */
  @Prop() readonly model: ThemeModel;

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
  }

  componentWillLoad() {
    this.#loadModel();
  }

  #loadModel = async () => {
    const themePromises = this.#normalizeModel().map(item =>
      getTheme(item, this.timeout)
    );

    Promise.allSettled(themePromises).then(results => {
      const successThemes = results
        .filter(result => result.status === "fulfilled")
        .map(result => result.status === "fulfilled" && result.value);

      this.#attachThemes(successThemes);
      this.themeLoaded.emit({
        success: successThemes.map(successTheme => successTheme.name)
      });
      this.loaded = true;

      if (Build.isDev) {
        const rejected = results.filter(result => result.status === "rejected");
        if (rejected.length > 0) {
          // eslint-disable-next-line no-console
          console.error("Failed to load themes:", rejected);
        }
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

  #attachThemes = (themes: Theme[]) => {
    const root = this.el.getRootNode();

    if (root instanceof Document || root instanceof ShadowRoot) {
      themes.forEach(theme => {
        if (!root.adoptedStyleSheets.includes(theme.styleSheet)) {
          root.adoptedStyleSheets.push(theme.styleSheet);
        }
      });
    }
  };

  render() {
    return (
      this.avoidFlashOfUnstyledContent &&
      !this.loaded && <style>{STYLE_TO_AVOID_FOUC}</style>
    );
  }
}
