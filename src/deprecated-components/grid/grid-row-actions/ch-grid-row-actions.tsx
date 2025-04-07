import {
  Component,
  h,
  Host,
  Method,
  Prop,
  Event,
  EventEmitter
} from "@stencil/core";

/**
 * The `ch-grid-row-actions` component represents a group row actions.
 * @deprecated Use `ch-tabular-grid` component instead. Use `ch-tabular-grid-row-actions` instead.
 */
@Component({
  tag: "ch-grid-row-actions",
  styleUrl: "ch-grid-row-actions.scss",
  shadow: true
})
export class ChGridRowActions {
  private window: HTMLChWindowElement;
  private mousePosition: HTMLDivElement;

  /**
   * Indicates to show row actions when hovering over row.
   */
  @Prop({ reflect: true }) readonly showOnRowHover: boolean;

  /**
   * Indicates that the row actions are displayed when the row-actions-button is pressed.
   */
  @Prop({ reflect: true }) readonly showOnRowActions: boolean;

  /**
   * Indicates that the row actions are displayed when right-clicks on the row.
   */
  @Prop({ reflect: true }) readonly showOnRowContext: boolean;

  /**
   * Event emitted when row actions is opened.
   */
  @Event() rowActionOpened: EventEmitter;

  /**
   * Opens the row actions on row hover.
   */
  @Method()
  async openRowHover(row: HTMLElement) {
    this.rowActionOpened.emit();

    this.window.container = row;
    this.window.xAlign = "inside-end";
    this.window.yAlign = "center";
    this.window.closeOnOutsideClick = false;
    this.window.hidden = false;
  }

  /**
   * Opens the row actions on the row-actions-button cell.
   */
  @Method()
  async openRowActions(cell: HTMLElement) {
    this.rowActionOpened.emit();

    this.window.container = cell;
    this.window.xAlign = "outside-start";
    this.window.yAlign = "outside-end";
    this.window.closeOnOutsideClick = true;
    this.window.closeOnEscape = true;
    this.window.hidden = false;
  }

  /**
   * Opens the row actions on the row-actions-button cell.
   */
  @Method()
  async openRowContext(clientX: number, clientY: number) {
    const eventInfo = this.rowActionOpened.emit();

    if (!eventInfo.defaultPrevented) {
      this.window.hidden = true;
      this.mousePosition.style.top = `${clientY}px`;
      this.mousePosition.style.left = `${clientX}px`;
      this.mousePosition.hidden = false;

      this.window.container = this.mousePosition;
      this.window.xAlign = "outside-end";
      this.window.yAlign = "outside-end";
      this.window.closeOnOutsideClick = true;
      this.window.closeOnEscape = true;
      this.window.hidden = false;
    }
  }

  /**
   * Closes the row actions window.
   */
  @Method()
  async close() {
    this.window.hidden = true;
    this.mousePosition.hidden = true;
  }

  render() {
    return (
      <Host slot="row-actions">
        <ch-window
          ref={el => (this.window = el)}
          xAlign="inside-end"
          modal={false}
          showHeader={false}
          showFooter={false}
          exportparts="mask,window,header,caption,close,main,footer"
        >
          <slot></slot>
        </ch-window>
        <div
          class="mouse-position"
          hidden
          ref={el => (this.mousePosition = el)}
        ></div>
      </Host>
    );
  }
}
