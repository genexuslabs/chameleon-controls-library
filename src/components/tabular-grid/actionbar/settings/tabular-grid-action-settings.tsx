import {
  Component,
  Prop,
  h,
  Host,
  Event,
  EventEmitter,
  Listen
} from "@stencil/core";

/**
 * The `ch-tabular-grid-action-settings` component represents a settings button for a grid action bar.
 */
@Component({
  tag: "ch-tabular-grid-action-settings",
  styleUrl: "tabular-grid-action-settings.scss",
  shadow: false
})
export class ChTabularGridActionSettings {
  /**
   * Indicates whether the settings button is disabled or not.
   */
  @Prop() readonly disabled: boolean;

  /**
   * Event emitted when the settings button is clicked.
   */
  @Event() settingsShowClicked: EventEmitter;

  @Listen("keydown", { passive: true })
  @Listen("click", { passive: true })
  pressedHandler(eventInfo: any) {
    if (!eventInfo.key || eventInfo.key === "Enter" || eventInfo.key === " ") {
      this.settingsShowClicked.emit();
      eventInfo.stopPropagation();
    }
  }

  render() {
    return <Host role="button" tabindex="0" disabled={this.disabled}></Host>;
  }
}
