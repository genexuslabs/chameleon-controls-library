import {
  Component,
  ComponentInterface,
  Element,
  Prop,
  Watch
} from "@stencil/core";

const RESERVED_SPACE_CUSTOM_VAR = "--ch-smart-grid-virtual-space-block-size";

@Component({
  styleUrl: "smart-grid-virtual-space-end.scss",
  tag: "ch-smart-grid-virtual-space-end",
  shadow: true
})
export class ChSmartGridVirtualSpaceEnd implements ComponentInterface {
  #lastReservedSpace: number = 0;
  #resizeObserver: ResizeObserver | undefined; // Allocated at runtime to save resources

  @Element() el: HTMLChSmartGridVirtualSpaceEndElement;

  /**
   * TODO
   */
  @Prop() readonly cellAnchorRef!: HTMLElement;
  @Watch("cellAnchorRef")
  cellAnchorRefChanged() {
    this.#updateBlockSize();
  }

  /**
   * TODO
   */
  @Prop() readonly lastCellRef!: HTMLElement;
  @Watch("lastCellRef")
  lastCellRefChanged() {
    // this.#updateBlockSize();
  }

  /**
   * Specifies a reference for the content of the smart grid.
   */
  @Prop() readonly smartGridContentRef!: HTMLElement;

  /**
   * Specifies a reference for the smart grid.
   */
  @Prop() readonly smartGridRef!: HTMLChSmartGridElement;

  #updateBlockSize = () => {
    const newReservedSpace =
      this.smartGridRef.scrollHeight -
      (this.smartGridRef.clientHeight - this.el.offsetTop);

    // this.smartGridRef.scrollHeight +
    // this.smartGridRef.clientHeight -
    // this.cellAnchorRef.offsetTop -
    // (this.el.offsetTop - this.cellAnchorRef.offsetTop);

    this.el.style.setProperty(
      RESERVED_SPACE_CUSTOM_VAR,
      `${newReservedSpace}px`
    );

    console.log(
      this.el.offsetTop,
      this.cellAnchorRef.offsetTop

      // newReservedSpace
    );

    this.#lastReservedSpace = newReservedSpace;
  };

  connectedCallback() {
    this.el.setAttribute("aria-hidden", "true");

    this.#updateBlockSize();
  }
}
