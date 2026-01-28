import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { property } from "lit/decorators/property.js";
import { keyed } from "lit/directives/keyed.js";
import QrCreator from "qr-creator";

import type { ErrorCorrectionLevel } from "./types";

import styles from "./qr.scss?inline";

/**
 * @status developer-preview
 */
@Component({
  styles,
  tag: "ch-qr"
})
export class ChQr extends KasstorElement {
  #localKeyToDestroyPreviousQR = 0;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @property({ attribute: "accessible-name" }) accessibleName:
    | string
    | undefined;
  @Observe("accessibleName")
  protected accessibleNameChanged() {
    this.#conditionalSetAriaLabel();
  }

  /**
   * The background color of the render QR. If not specified, "transparent"
   * will be used.
   */
  @property() background: string = "white";

  /**
   * The four values L, M, Q, and H will use %7, 15%, 25%, and 30% of the QR
   * code for error correction respectively. So on one hand the code will get
   * bigger but chances are also higher that it will be read without errors
   * later on. This value is by default High (H).
   */
  @property({ attribute: "error-correction-level" })
  errorCorrectionLevel: ErrorCorrectionLevel = "High";

  /**
   * What color you want your QR code to be.
   */
  @property() fill: string = "black";

  /**
   * Defines how round the blocks should be. Numbers from 0 (squares) to 0.5
   * (maximum round) are supported.
   */
  @property({ type: Number }) radius: number = 0;

  /**
   * The total size of the final QR code in pixels.
   */
  @property({ type: Number }) size: number = 128;

  /**
   * Any kind of text, also links, email addresses, any thing.
   */
  @property() value: string | undefined;

  #getColorValue = (color: string) =>
    color?.includes("currentColor")
      ? color.replace("currentColor", getComputedStyle(this).color)
      : color;

  #conditionalSetAriaLabel = () =>
    this.accessibleName
      ? this.setAttribute("aria-label", this.accessibleName)
      : this.removeAttribute("aria-label");

  override connectedCallback(): void {
    super.connectedCallback();

    this.setAttribute("role", "img");
    this.#conditionalSetAriaLabel();
  }

  override updated() {
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
      // TODO: Test if this still happens with Lit: Using a JSX' ref will give
      // an error at runtime after the second re-render
      this.shadowRoot! as unknown as HTMLElement
    );
    this.#localKeyToDestroyPreviousQR++;
  }

  override render() {
    // We use keyed with an empty template to destroy the current DOM in order
    // to not keep rendered the previous canvas that the QrCreator injected
    return this.value ? keyed(this.#localKeyToDestroyPreviousQR, "") : null;
  }
}

export default ChQr;

declare global {
  interface HTMLElementTagNameMap {
    "ch-qr": ChQr;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChQrElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChQrElement;
  }

  /**
   * @status developer-preview
   */// prettier-ignore
  interface HTMLChQrElement extends ChQr {
    // Extend the ChQr class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-qr": HTMLChQrElement;
  }

  interface HTMLElementTagNameMap {
    "ch-qr": HTMLChQrElement;
  }
}

