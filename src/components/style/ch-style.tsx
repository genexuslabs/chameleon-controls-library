import { Component, Element, Prop } from "@stencil/core";
import { appendStyle, enableStyleSheet } from "./ch-global-stylesheet";

/**
 * It allows to include styles in the shadow-root of chameleon components,
 * for example, to style the scrollbars.
 * Use it in a similar way to the html STYLE tag or
 * referencing an external stylesheet in a similar way to the html LINK tag.
 */
@Component({
  tag: "ch-style",
  styleUrl: "ch-style.scss",
  shadow: true
})
export class ChStyle {
  @Element() el: HTMLChStyleElement;

  /**
   * Specifies the location of the stylesheet document
   */
  @Prop() readonly href: string;

  componentDidLoad() {
    if (this.href) {
      fetch(this.href).then(response => {
        if (response.ok) {
          response.text().then(style => {
            appendStyle(style);
            enableStyleSheet();
          });
        }
      });
    } else {
      appendStyle(this.el.innerText);
      enableStyleSheet();
    }
  }
}
