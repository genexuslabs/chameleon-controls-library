import { Component, Element, Host, h, Prop } from "@stencil/core";
import QrCreator from "qr-creator";
import { ErrorCorrectionLevel } from "./types";

/**
 * The `ch-qr` component generates a QR code from any text, URL, or data
 * string and renders it as a canvas element in the Shadow DOM.
 *
 * @remarks
 * ## Features
 *  - Customizable foreground and background colors with `currentColor` support for theme integration.
 *  - Configurable error correction levels (L, M, Q, H).
 *  - Adjustable block radius for rounded aesthetics.
 *  - Scalable pixel size.
 *  - Automatic re-render when any property changes.
 *  - Accessible via `role="img"` and `aria-label`.
 *
 * ## Use when
 *  - Displaying a QR code for a URL, text, or data string.
 *  - Generating a machine-readable QR code from a URL, text, or identifier for mobile scanning.
 *
 * ## Do not use when
 *  - Scanning or reading QR codes — use `ch-barcode-scanner` instead.
 *  - Scanning a QR code from camera input is needed — prefer `ch-barcode-scanner`.
 *
 * ## Accessibility
 *  - The generated QR code is rendered as an `<img>` element with an `aria-label` derived from the `accessibleName` property.
 *
 * @status developer-preview
 */
@Component({
  tag: "ch-qr",
  styleUrl: "qr.scss",
  shadow: true
})
export class ChQr {
  #localKeyToDestroyPreviousQR = 0;

  @Element() el!: HTMLChQrElement;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName: string;

  /**
   * The background color of the render QR. If not specified, "transparent"
   * will be used.
   */
  @Prop() readonly background: string = "white";

  /**
   * The four values L, M, Q, and H will use %7, 15%, 25%, and 30% of the QR
   * code for error correction respectively. So on one hand the code will get
   * bigger but chances are also higher that it will be read without errors
   * later on. This value is by default High (H).
   */
  @Prop() readonly errorCorrectionLevel: ErrorCorrectionLevel = "High";

  /**
   * What color you want your QR code to be.
   */
  @Prop() readonly fill: string = "black";

  /**
   * Defines how round the blocks should be. Numbers from 0 (squares) to 0.5
   * (maximum round) are supported.
   */
  @Prop() readonly radius: number = 0;

  /**
   * The total size of the final QR code in pixels.
   */
  @Prop() readonly size: number = 128;

  /**
   * Any kind of text, also links, email addresses, any thing.
   */
  @Prop() readonly value: string | undefined = undefined;

  #getColorValue = (color: string) =>
    color?.includes("currentColor")
      ? color.replace("currentColor", getComputedStyle(this.el).color)
      : color;

  componentDidRender() {
    if (!this.value) {
      return;
    }

    QrCreator.render(
      {
        text: this.value,
        radius: this.radius, // 0.0 to 0.5
        ecLevel: (this.errorCorrectionLevel ||
          "High")[0] as QrCreator.ErrorCorrectionLevel, // L, M, Q, H
        fill: this.#getColorValue(this.fill), // foreground color
        background: this.#getColorValue(this.background), // color or null for transparent
        size: this.size // in pixels
      },
      // Using a JSX' ref will give an error at runtime after the second re-render
      this.el.shadowRoot.querySelector("div")
    );
    this.#localKeyToDestroyPreviousQR++;
  }

  render() {
    return (
      <Host
        role={this.value ? "img" : null}
        aria-label={this.value ? this.accessibleName : null}
      >
        {this.value && <div key={this.#localKeyToDestroyPreviousQR}></div>}
      </Host>
    );
  }
}
