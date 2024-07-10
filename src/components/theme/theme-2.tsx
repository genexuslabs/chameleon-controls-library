import { Component, Element, Prop, Event, EventEmitter } from "@stencil/core";
import {
  ChThemeLoadedEvent,
  Theme,
  ThemeItemModel,
  ThemeModel
} from "./theme-types";
import { getTheme } from "./theme-stylesheet-2";

/**
 * It allows you to load a style sheet in a similar way to the
 * native LINK or STYLE tags, but assigning it a name so that
 * it can be reused in different contexts,
 * either in the Document or in a Shadow-Root.
 */
@Component({
  tag: "ch-theme-x"
})
export class ChTheme {
  @Element() el: HTMLChThemeXElement;

  /**
   * `true` to visually hide the contents of the root node while the control's
   * style is not loaded.
   */
  @Prop() readonly avoidFlashOfUnstyledContent: boolean = true;

  /**
   * TODO: add description
   */
  @Prop() readonly model: ThemeModel;

  /**
   * Event emitted when the theme has successfully loaded
   */
  @Event({ bubbles: true, composed: false })
  themeLoaded: EventEmitter<ChThemeLoadedEvent>;

  connectedCallback() {
    this.el.hidden = true;
  }

  componentDidLoad() {
    const themePromises = this.normalizeModel().map(item => getTheme(item));

    Promise.allSettled(themePromises).then(results => {
      results.forEach(
        result =>
          result.status === "fulfilled" && this.attachTheme(result.value)
      );

      this.themeLoaded.emit({ name: "" });
    });
  }

  private normalizeModel(): ThemeItemModel[] {
    const list = Array.isArray(this.model) ? this.model : [this.model];

    return list.map(item => {
      if (typeof item === "string") {
        return { name: item };
      }

      return item;
    });
  }

  private attachTheme(theme: Theme) {
    const root = this.el.getRootNode();

    if (root instanceof Document || root instanceof ShadowRoot) {
      if (!root.adoptedStyleSheets.includes(theme.styleSheet)) {
        root.adoptedStyleSheets.push(theme.styleSheet);
      }
    }
  }
}
