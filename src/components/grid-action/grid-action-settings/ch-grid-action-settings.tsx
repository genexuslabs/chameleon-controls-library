import { Component, Prop, h, Host } from "@stencil/core";

@Component({
  tag: "ch-grid-action-settings",
  styleUrl: "ch-grid-action-settings.scss",
  shadow: true,
})
export class ChGridActionSettings {
  @Prop() disabled: boolean;
  private window: HTMLChWindowElement;

  private handleClick = (eventInfo: Event) => {
    eventInfo.stopPropagation();
    this.window.visible = true;
  };

  render() {
    return (
      <Host
        role="button"
        tabindex="0"
        disabled={this.disabled}
        onClick={this.handleClick}
      >
        <ch-window
          caption="Options"
          closeText="Close"
          ref={(el) => (this.window = el)}
        >
          Hola Mundo !!!
        </ch-window>
      </Host>
    );
  }
}
