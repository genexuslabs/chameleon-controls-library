import {
  Component,
  Element,
  Event,
  EventEmitter,
  Prop,
  Watch
} from "@stencil/core";
import {
  ChThemeLoadedEvent,
  instanceTheme,
  removeThemeElement
} from "./theme-stylesheet";

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
}
