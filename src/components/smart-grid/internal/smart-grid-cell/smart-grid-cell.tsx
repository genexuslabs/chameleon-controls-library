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
   */
  @Prop() readonly cellId!: string;

  /**
   * Fired when the component and all its child did render for the first time.
   */
  @Event() smartCellDidLoad: EventEmitter<string>;

  connectedCallback() {
    this.el.setAttribute("role", "gridcell");
  }

  componentDidLoad() {
    this.smartCellDidLoad.emit(this.cellId);

    // DOM write operation
    this.el.setAttribute("data-did-load", "true");
  }
}
