import {
  Component,
  h,
  Host,
  Listen,
  Prop,
  Event,
  EventEmitter
} from "@stencil/core";

@Component({
  tag: "ch-grid-settings",
  styleUrl: "ch-grid-settings.scss",
  shadow: true
})
export class ChGridSettings {
  @Prop() readonly grid!: HTMLChGridElement;
  @Prop({ reflect: true, mutable: true }) show = false;
  @Event() settingsCloseClicked: EventEmitter;

  @Listen("windowClosed")
  windowClosedHandler(eventInfo: Event) {
    eventInfo.stopPropagation();
    this.show = false;

    this.settingsCloseClicked.emit();
  }

  render() {
    return (
      <Host>
        <ch-window
          modal={true}
          container={this.grid}
          caption="Options"
          closeText="Close"
          closeOnOutsideClick={true}
          closeOnEscape={true}
          allowDrag="header"
          hidden={!this.show}
          exportparts="mask,window,header,caption,close,main,footer"
        >
          <slot></slot>
        </ch-window>
      </Host>
    );
  }
}
