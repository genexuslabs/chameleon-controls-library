import { Component, Prop, Event, h, Host, EventEmitter } from "@stencil/core";

/**
 * The `ch-grid-action-refresh` component represents a refresh button for a grid action bar.
 */
@Component({
  tag: "ch-grid-action-refresh",
  styleUrl: "ch-grid-action-refresh.scss",
  shadow: false
})
export class ChGridActionRefresh {
  /**
   * Indicates whether the refresh button is disabled or not.
   */
  @Prop() readonly disabled: boolean;

  /**
   * Event emitted when the refresh button is clicked.
   */
  @Event() refreshClicked: EventEmitter;

  private handleClick = (eventInfo: Event) => {
    eventInfo.stopPropagation();
    this.refreshClicked.emit();
  };

  render() {
    return (
      <Host
        role="button"
        tabindex="0"
        disabled={this.disabled}
        onClick={this.handleClick}
      ></Host>
    );
  }
}
