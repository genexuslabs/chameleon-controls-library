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
 * The 'ch-window-close' component represents the close button for the 'ch-window' component.
 */
@Component({
  tag: "ch-window-close",
  styleUrl: "ch-window-close.scss",
  shadow: false
})
export class ChWindowClose {
  /** Specifies whether the close button is disabled. */
  @Prop() readonly disabled: boolean;

  /** Emitted when the close button is clicked. */
  @Event() windowCloseClicked: EventEmitter;

  @Listen("keydown", { passive: true })
  @Listen("click", { passive: true })
  pressedHandler(eventInfo: any) {
    if (!eventInfo.key || eventInfo.key == "Enter" || eventInfo.key == " ") {
      this.windowCloseClicked.emit();
      eventInfo.stopPropagation();
    }
  }

  render() {
    return <Host role="button" tabindex="0" disabled={this.disabled}></Host>;
  }
}
