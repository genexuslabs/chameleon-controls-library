import {
  Component,
  Prop,
  Event,
  h,
  Host,
  EventEmitter,
  Listen
} from "@stencil/core";

/**
 * The `ch-grid-action-refresh` component represents a refresh button for a grid action bar.
 * @deprecated Use `ch-tabular-grid` component instead. Use `ch-tabular-grid-action-refresh` instead.
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

  @Listen("keydown", { passive: true })
  @Listen("click", { passive: true })
  pressedHandler(eventInfo: any) {
    if (!eventInfo.key || eventInfo.key === "Enter" || eventInfo.key === " ") {
      this.refreshClicked.emit();
      eventInfo.stopPropagation();
    }
  }

  render() {
    return <Host role="button" tabindex="0" disabled={this.disabled}></Host>;
  }
}
