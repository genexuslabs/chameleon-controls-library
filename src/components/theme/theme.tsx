import { Component, Element, Prop } from "@stencil/core";
import { instanceTheme, removeThemeElement } from "./theme-stylesheet";

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

  connectedCallback() {
    this.el.hidden = true;
  }

  componentDidLoad() {
    instanceTheme(this.el);
  }

  disconnectedCallback() {
    removeThemeElement(this.el);
  }
}
