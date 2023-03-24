import { Component, Prop, Event, h, Host, EventEmitter } from "@stencil/core";

@Component({
  tag: "ch-grid-action-refresh",
  styleUrl: "ch-grid-action-refresh.scss",
  shadow: false
})
export class ChGridActionRefresh {
  @Prop() readonly disabled: boolean;
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
