import { Component, h, Host, Listen, Prop, Event, EventEmitter } from "@stencil/core";
import { ChGridColumn } from "../grid-column/ch-grid-column";

@Component({
  tag: "ch-grid-column-settings",
  styleUrl: "ch-grid-column-settings.scss",
  shadow: true,
})
export class ChGridColumnSettings {
  @Prop() column: ChGridColumn;
  @Prop({ reflect: true}) show = false;
  @Event() settingsCloseClicked: EventEmitter;

  @Listen("windowClosed")
  windowClosedHandler(eventInfo: Event) {
    eventInfo.stopPropagation();
    this.settingsCloseClicked.emit();
  }
  
  render() {
    return (
      <Host>
        <ch-window
          caption={this.column.columnName}
          closeText="Close"
          closeAuto={true}
          hidden={!this.show}
          exportparts="mask,window,header,caption,close,main,footer"
        >
          <slot></slot>
        </ch-window>
      </Host>
    );
  }
}
