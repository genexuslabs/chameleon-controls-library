import { Component, Host, h, Prop } from "@stencil/core";
import QRCode from "qrcode";

@Component({
  tag: "ch-qr",
  styleUrl: "ch-qr.scss",
  shadow: true,
})
export class ChQr {
  qrContainer!: HTMLDivElement;

  //The qr code value
  @Prop() value: string = null;

  //Define how much wide the quiet zone should be
  @Prop() margin: string = "0";

  /*
   * Forces a specific width for the output image.
   * If width is too small to contain the qr symbol, this option will be ignored.
   */
  @Prop() width: string = "100";

  componentDidLoad() {
    if (this.value !== null) {
      this.generateQR();
    }
  }

  generateQR() {
    QRCode.toCanvas(
      this.value,
      {
        //options
        errorCorrectionLevel: "M",
        margin: this.margin,
        width: this.width,
      },
      function (err, canvas) {
        if (err) throw err;
        this.qrContainer.appendChild(canvas);
      }.bind(this)
    );
  }

  render() {
    return (
      <Host>
        <div
          class="qr-container"
          ref={(el) => (this.qrContainer = el as HTMLDivElement)}
        ></div>
      </Host>
    );
  }
}
