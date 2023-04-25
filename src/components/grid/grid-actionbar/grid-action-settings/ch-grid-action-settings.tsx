import { Component, Prop, h, Host, Event, EventEmitter } from "@stencil/core";

/**
 * The `ch-grid-action-settings` component represents a settings button for a grid action bar.
 */
@Component({
  tag: "ch-grid-action-settings",
  styleUrl: "ch-grid-action-settings.scss",
  shadow: false
})
export class ChGridActionSettings {
  /**
   * Indicates whether the settings button is disabled or not.
   */
  @Prop() readonly disabled: boolean;

  /**
   * Event emitted when the settings button is clicked.
   */
  @Event() settingsShowClicked: EventEmitter;

  private handleClick = (eventInfo: Event) => {
    eventInfo.stopPropagation();
    this.settingsShowClicked.emit();
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
