import { Component, Element, Prop, State, Watch, h } from "@stencil/core";
import { getSvgContent, iconContent } from "./requests";

@Component({
  tag: "ch-icon",
  styleUrl: "icon.scss",
  shadow: true,
  assetsDirs: ["ch-icon-assets"],
})
export class ChIcon {
  private io?: IntersectionObserver;

  @Element() element: HTMLChIconElement;

  /*********************************
  PROPERTIES & STATE
  *********************************/
  /**
   * The color of the icon.
   *
   */
  @Prop() color: Color;
  /**
   * If enabled, the icon will be loaded lazily when it's visible in the viewport.
   */
  @Prop() lazy = false;

  /**
   * If enabled, the icon will display its inherent/natural color
   */
  @Prop({ reflect: true }) autoColor = false;

  /**
   * The URL of the icon.
   */
  @Prop({ reflect: true }) src = "";

  /**
   * The size of the icon. Possible values: regular, small.
   */
  @Prop() size: Size = "regular";

  @State() private isVisible = false;

  @State() private svgContent?: string;

  /*********************************
  METHODS
  *********************************/

  connectedCallback() {
    // purposely do not return the promise here because loading
    // the svg file should not hold up loading the app
    // only load the svg if it's visible
    this.waitUntilVisible(this.element, "50px", () => {
      this.isVisible = true;
      this.getIcon();
    });
  }

  disconnectedCallback() {
    if (this.io !== undefined) {
      this.io.disconnect();
      this.io = undefined;
    }
  }

  private waitUntilVisible(
    el: HTMLElement,
    rootMargin: string,
    callback: () => void
  ) {
    if (
      this.lazy &&
      typeof window !== "undefined" &&
      (window as any).IntersectionObserver
    ) {
      const io = (this.io = new (window as any).IntersectionObserver(
        (data: IntersectionObserverEntry[]) => {
          if (data[0].isIntersecting) {
            io.disconnect();
            this.io = undefined;
            callback();
          }
        },
        { rootMargin }
      ));

      io.observe(el);
    } else {
      // browser doesn't support IntersectionObserver
      // so just fallback to always show it
      callback();
    }
  }

  @Watch("src")
  private async getIcon() {
    if (this.isVisible) {
      if (this.src) {
        if (iconContent.has(this.src)) {
          this.svgContent = iconContent.get(this.src);
        } else {
          this.svgContent = await getSvgContent(this.src);
        }
      } else {
        this.svgContent = "";
        return;
      }
    }
  }

  render() {
    return <div innerHTML={this.svgContent} />;
  }
}

export type Color =
  | "primary-enabled"
  | "primary-active"
  | "primary-hover"
  | "onbackground"
  | "negative"
  | "disabled"
  | "ondisabled"
  | "error"
  | "success"
  | "warning"
  | "alwaysblack"
  | "auto";

export type Size = "regular" | "small";
