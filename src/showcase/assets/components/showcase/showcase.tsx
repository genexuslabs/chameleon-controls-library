import { Component, Prop, Host, Watch, h } from "@stencil/core";

@Component({
  shadow: false,
  styleUrl: "showcase.scss",
  tag: "ch-showcase"
})
export class ChShowcase {
  #iframeRef: HTMLIFrameElement;

  /**
   *
   */
  @Prop() readonly pageName: string;

  /**
   *
   */
  @Prop() readonly pageSrc: string;

  /**
   * Specifies the theme used in the iframe of the control
   */
  @Prop() readonly theme: "light" | "dark";
  @Watch("theme")
  themeChange(newThemeValue: "light" | "dark") {
    this.#iframeRef.contentWindow.postMessage(
      newThemeValue,
      `${window.location.origin}/${this.pageSrc}`
    );
  }

  render() {
    return (
      <Host>
        <h1 class="heading-1">{this.pageName}</h1>

        <iframe
          src={this.pageSrc}
          frameborder="0"
          ref={el => (this.#iframeRef = el)}
        ></iframe>
      </Host>
    );
  }
}
