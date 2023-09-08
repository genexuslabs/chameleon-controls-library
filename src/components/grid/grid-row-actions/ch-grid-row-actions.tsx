import { Component, h, Host, Method, Prop } from "@stencil/core";

/**
 * The `ch-grid-row-actions` component represents a group row actions.
 */
@Component({
  tag: "ch-grid-row-actions",
  styleUrl: "ch-grid-row-actions.scss",
  shadow: true
})
export class ChGridRowActions {
  private window: HTMLChWindowElement;

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
   * Opens the row actions on row hover.
   */
  @Method()
  async openRowHover(row: HTMLElement) {
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
    this.window.container = cell;
    this.window.xAlign = "outside-start";
    this.window.yAlign = "outside-end";
    this.window.closeOnOutsideClick = true;
    this.window.hidden = false;
  }

  /**
   * Closes the row actions window.
   */
  @Method()
  async close() {
    this.window.hidden = true;
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
          exportparts="main:box"
        >
          <slot></slot>
        </ch-window>
      </Host>
    );
  }
}
