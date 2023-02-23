import { Component, Prop, h, Host, Event, EventEmitter } from "@stencil/core";

@Component({
  tag: "ch-grid-action-settings",
  styleUrl: "ch-grid-action-settings.scss",
  shadow: false,
})
export class ChGridActionSettings {
  @Prop() disabled: boolean;
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
