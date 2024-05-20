import { Component, Host, h, Prop } from "@stencil/core";
import QrCreator from "qr-creator";

@Component({
  tag: "ch-qr",
  styleUrl: "qr.scss",
  shadow: true
})
export class ChQr {
  private qrContainer!: HTMLElement;

  /**
   * Any kind of text, also links, email addresses, any thing.
   */
  @Prop() readonly text: string | undefined = undefined;

  /**
   * Defines how round the blocks should be. Numbers from 0 (squares) to 0.5 (maximum round) are supported.
   */
  @Prop() readonly radius: number = 0;

  /**
   * The four values L, M, Q, and H will use %7, 15%, 25%, and 30% of the QR
   * code for error correction respectively. So on one hand the code will get
   * bigger but chances are also higher that it will be read without errors
   * later on. This value is by default High (H).
   */
  @Prop() readonly errorCorrectionLevel: QrCreator.ErrorCorrectionLevel = "H";

  /**
   * What color you want your QR code to be. By default is black.
   */
  @Prop() readonly fill: string = "black";

  /**
   * The background color. By default is transparent.
   */
  @Prop() readonly background: string | null = null;

  /**
   * The total size of the final QR code in pixels - it will be a square. This value is by default "128"
   */
  @Prop() readonly size: number = 128;

  componentDidLoad() {
    if (this.text) {
      QrCreator.render(
        {
          text: this.text,
          radius: this.radius, // 0.0 to 0.5
          ecLevel: this.errorCorrectionLevel, // L, M, Q, H
          fill: this.fill, // foreground color
          background: this.background, // color or null for transparent
          size: this.size // in pixels
        },
        this.qrContainer
      );
    }
  }

  render() {
    return (
      <Host>
        <div
          class="qr-container"
          ref={el => (this.qrContainer = el as HTMLElement)}
        ></div>
      </Host>
    );
  }
}

export type ecLevel = "L" | "M" | "Q" | "H";
