import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter
} from "@stencil/core";

@Component({
  styleUrl: "smart-grid-cell.scss",
  tag: "ch-smart-grid-cell"
})
export class ChSmartGridCell implements ComponentInterface {
  @Element() el: HTMLChSmartGridCellElement;

  /**
   * Fired when the component and all its child did render for the first time.
   */
  @Event() smartCellDidLoad: EventEmitter;

  connectedCallback() {
    this.el.setAttribute("role", "gridcell");
  }

  componentDidLoad() {
    this.el.setAttribute("data-did-load", "true");
    this.smartCellDidLoad.emit();
  }
}
