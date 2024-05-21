import { Component, Element, Host, h, Prop } from "@stencil/core";
import QrCreator from "qr-creator";
import { ErrorCorrectionLevel } from "./types";

@Component({
  tag: "ch-qr",
  styleUrl: "qr.scss",
  shadow: true
})
export class ChQr {
  #localKeyToDestroyPreviousQR = 0;

  @Element() el!: HTMLChQrElement;

  /**
   * The background color. By default is transparent.
   */
  @Prop() readonly background: string | null = null;

  /**
   * The four values L, M, Q, and H will use %7, 15%, 25%, and 30% of the QR
   * code for error correction respectively. So on one hand the code will get
   * bigger but chances are also higher that it will be read without errors
   * later on. This value is by default High (H).
   */
  @Prop() readonly errorCorrectionLevel: ErrorCorrectionLevel = "H";

  /**
   * What color you want your QR code to be. By default is black.
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
        ecLevel: this.errorCorrectionLevel, // L, M, Q, H
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
      <Host role={this.value ? "img" : null}>
        {this.value && <div key={this.#localKeyToDestroyPreviousQR}></div>}
      </Host>
    );
  }
}
