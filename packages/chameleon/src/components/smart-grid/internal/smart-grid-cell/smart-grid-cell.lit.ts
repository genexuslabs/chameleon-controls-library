import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { html } from "lit";
import { property } from "lit/decorators/property.js";

import styles from "./smart-grid-cell.scss?inline";

@Component({
  shadow: false,
  styles,
  tag: "ch-smart-grid-cell"
})
export class ChSmartGridCell extends KasstorElement {
  #actualSmartGridRef!: HTMLChSmartGridElement;

  /**
   * Specifies the ID of the cell.
   *
   * We use a specific property instead of the actual id attribute, because
   * with this property we don't need this ID to be unique in the Shadow scope
   * where this cell is rendered. In other words, if there is an element with
   * `id="1"`, this cell can still have `cellId="1"`.
   */
  @property({ reflect: true, attribute: "cell-id" }) readonly cellId!: string;

  /**
   * Specifies the reference for the smart grid parent.
   *
   * This property is useful to avoid the cell from queering the ch-smart-grid
   * ref on the initial load.
   */
  @property({ attribute: false }) readonly smartGridRef?:
    | HTMLChSmartGridElement
    | undefined;

  /**
   * Fired when the component and all its child did render for the first time.
   *
   * It contains the `cellId`.
   */
  @Event() protected smartCellDidLoad!: EventEmitter<string>;

  override connectedCallback() {
    super.connectedCallback();

    this.setAttribute("role", "gridcell");

    this.#actualSmartGridRef =
      (this.smartGridRef ?? this.closest("ch-smart-grid")!) as HTMLChSmartGridElement;
  }

  override firstUpdated() {
    this.smartCellDidLoad.emit(this.cellId);

    // DOM write operation
    this.setAttribute("data-did-load", "true");
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    this.#actualSmartGridRef.dispatchEvent(
      new CustomEvent("smartCellDisconnectedCallback", { detail: this })
    );
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-smart-grid-cell": ChSmartGridCell;
  }
}

// ######### Auto generated below #########

declare global {
  // prettier-ignore
  interface HTMLChSmartGridCellElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChSmartGridCellElement;
  }

  /** Type of the `ch-smart-grid-cell`'s `smartCellDidLoad` event. */
  // prettier-ignore
  type HTMLChSmartGridCellElementSmartCellDidLoadEvent = HTMLChSmartGridCellElementCustomEvent<
    HTMLChSmartGridCellElementEventMap["smartCellDidLoad"]
  >;

  interface HTMLChSmartGridCellElementEventMap {
    smartCellDidLoad: string;
  }

  interface HTMLChSmartGridCellElementEventTypes {
    smartCellDidLoad: HTMLChSmartGridCellElementSmartCellDidLoadEvent;
  }

  /**
   * @fires smartCellDidLoad Fired when the component and all its child did render for the first time.
   *   
   *   It contains the `cellId`.
   */
  // prettier-ignore
  interface HTMLChSmartGridCellElement extends ChSmartGridCell {
    // Extend the ChSmartGridCell class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof HTMLChSmartGridCellElementEventTypes>(type: K, listener: (this: HTMLChSmartGridCellElement, ev: HTMLChSmartGridCellElementEventTypes[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof HTMLChSmartGridCellElementEventTypes>(type: K, listener: (this: HTMLChSmartGridCellElement, ev: HTMLChSmartGridCellElementEventTypes[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-smart-grid-cell": HTMLChSmartGridCellElement;
  }

  interface HTMLElementTagNameMap {
    "ch-smart-grid-cell": HTMLChSmartGridCellElement;
  }
}

