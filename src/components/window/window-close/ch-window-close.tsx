import { Component, Prop, h, Host, Event, EventEmitter } from "@stencil/core";

@Component({
  tag: "ch-window-close",
  styleUrl: "ch-window-close.scss",
  shadow: false
})
export class ChWindowClose {
  @Prop() readonly disabled: boolean;
  @Event() windowCloseClicked: EventEmitter;

  private handleClick = (eventInfo: Event) => {
    eventInfo.stopPropagation();
    this.windowCloseClicked.emit();
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
