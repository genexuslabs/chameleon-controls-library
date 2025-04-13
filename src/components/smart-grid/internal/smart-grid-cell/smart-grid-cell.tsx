import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Prop
} from "@stencil/core";

@Component({
  styleUrl: "smart-grid-cell.scss",
  tag: "ch-smart-grid-cell"
})
export class ChSmartGridCell implements ComponentInterface {
  @Element() el: HTMLChSmartGridCellElement;

  /**
   * Specifies the ID of the cell.
   *
   * We use a specific property instead of the actual id attribute, because
   * with this property we don't need this ID to be unique in the Shadow scope
   * where this cell is rendered. In other words, if there is an element with
   * `id="1"`, this cell can still have `cellId="1"`.
   */
  @Prop({ reflect: true }) readonly cellId!: string;

  /**
   * Fired when the component and all its child did render for the first time.
   *
   * It contains the `cellId`.
   */
  @Event() smartCellDidLoad: EventEmitter<string>;

  /**
   * Fired when the component is disconnected from the DOM.
   *
   * It contains the `cellId`.
   */
  @Event()
  smartCellDisconnectedCallback: EventEmitter<string>;

  connectedCallback() {
    this.el.setAttribute("role", "gridcell");
  }

  componentDidLoad() {
    this.smartCellDidLoad.emit(this.cellId);

    // DOM write operation
    this.el.setAttribute("data-did-load", "true");
  }

  disconnectedCallback() {
    console.log("EMIT EVENT....");

    this.smartCellDisconnectedCallback.emit(this.cellId);
  }
}
