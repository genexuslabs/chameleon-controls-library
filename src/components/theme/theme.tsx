import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Prop,
  Watch
} from "@stencil/core";
import {
  ChThemeLoadedEvent,
  instanceTheme,
  removeThemeElement
} from "./theme-stylesheet";

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

  /**
   * `true` to visually hide the contents of the root node while the control's
   * style is not loaded.
   */
  @Prop() readonly avoidFlashOfUnstyledContent: boolean = true;

  /**
   * Specifies the name of the theme to instantiate
   */
  @Prop({ reflect: true }) readonly name: string;

  /**
   * Specifies the location of the stylesheet theme
   */
  @Prop({ reflect: true }) readonly href: string;

  /**
   * A string containing the baseURL used to resolve relative URLs in the stylesheet
   */
  @Prop({ reflect: true }) readonly baseUrl: string;

  /**
   * Indicates whether the theme has successfully loaded
   */
  @Prop() readonly loaded: boolean = false;
  @Watch("loaded")
  loadedHandler() {
    if (this.loaded) {
      this.themeLoaded.emit({ name: this.name ?? "" });
    }
  }

  /**
   * Event emitted when the theme has successfully loaded
   */
  @Event({ bubbles: true, composed: false })
  themeLoaded: EventEmitter<ChThemeLoadedEvent>;

  connectedCallback() {
    this.el.hidden = true;
  }

  componentWillLoad() {
    instanceTheme(this.el);
  }

  disconnectedCallback() {
    removeThemeElement(this.el);
  }

  render() {
    return (
      this.avoidFlashOfUnstyledContent &&
      !this.loaded && <style>{STYLE_TO_AVOID_FOUC}</style>
    );
  }
}
