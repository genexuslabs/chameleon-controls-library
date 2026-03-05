import { Component, Element, h, Host, Prop } from "@stencil/core";
import QrCreator from "qr-creator";
import { ErrorCorrectionLevel } from "./types";

/**
 * The `ch-qr` component generates a QR code from any text, URL, or data string and renders it as a canvas element in the Shadow DOM.
 *
 * @remarks
 * ## Features
 *  - Customizable foreground (`fill`) and background colors with `currentColor` support for seamless theme integration.
 *  - Configurable error correction levels: `"Low"` (7%), `"Medium"` (15%), `"Quartile"` (25%), `"High"` (30%).
 *  - Adjustable block radius (0 to 0.5) for rounded or square aesthetics.
 *  - Scalable output size via the `size` property (in pixels).
 *  - Automatic re-render when any property changes — the canvas is regenerated on every render cycle.
 *  - Accessible via `role="img"` and `aria-label` when `value` is set.
 *  - When `value` is `undefined` or empty, the component renders nothing and removes ARIA attributes.
 *
 * ## Use when
 *  - Displaying a QR code for a URL, text, or data string.
 *  - Generating a machine-readable QR code from a URL, text, or identifier for mobile scanning.
 *
 * ## Do not use when
 *  - Scanning or reading QR codes — use `ch-barcode-scanner` instead.
 *
 * ## Accessibility
 *  - When `value` is set, the host element has `role="img"` and `aria-label` derived from the `accessibleName` property. Always provide `accessibleName` to describe the QR code content for screen readers.
 *  - When `value` is unset, ARIA attributes are removed.
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
   * for the element. This value is applied as `aria-label` on the host when
   * `value` is set. If omitted, the QR code will have `role="img"` but no
   * accessible name, which is a WCAG violation.
   *
   */
  @Prop() readonly accessibleName: string;

  /**
   * The background color of the rendered QR code. Accepts any valid CSS color
   * string. The special value `"currentColor"` is resolved at render time to
   * the computed `color` of the host element, enabling theme-aware coloring.
   */
  @Prop() readonly background: string = "white";

  /**
   * Controls how much of the QR code is used for error correction:
   *  - `"Low"`: ~7% error correction. Smallest code size.
   *  - `"Medium"`: ~15% error correction.
   *  - `"Quartile"`: ~25% error correction.
   *  - `"High"`: ~30% error correction. Largest code size but most resilient.
   *
   * Higher correction levels increase the QR code's density but allow it to
   * remain scannable even when partially obscured or damaged.
   */
  @Prop() readonly errorCorrectionLevel: ErrorCorrectionLevel = "High";

  /**
   * The foreground color of the QR code blocks. Accepts any valid CSS color
   * string. The special value `"currentColor"` is resolved at render time to
   * the computed `color` of the host element.
   */
  @Prop() readonly fill: string = "black";

  /**
   * Defines how round the QR code blocks should be. Valid range is `0`
   * (squares) to `0.5` (maximum rounding / circles). Values outside this
   * range may produce unexpected visual results.
   */
  @Prop() readonly radius: number = 0;

  /**
   * The total size (width and height) of the rendered QR code canvas in
   * pixels. The canvas is always square.
   */
  @Prop() readonly size: number = 128;

  /**
   * The text, URL, or data to encode into the QR code. Accepts any string
   * value. When set to `undefined` or an empty string, no QR code is rendered
   * and the ARIA `role` and `aria-label` attributes are removed from the host.
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
