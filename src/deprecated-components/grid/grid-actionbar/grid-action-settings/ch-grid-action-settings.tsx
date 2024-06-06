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
 * The `ch-grid-action-settings` component represents a settings button for a grid action bar.
 * @deprecated Use `ch-tabular-grid` component instead. Use `ch-tabular-grid-action-settings` instead.
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
