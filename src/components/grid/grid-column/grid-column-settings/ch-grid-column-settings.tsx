import { Component, h, Host, Listen, Prop } from "@stencil/core";
import { ChGridColumn } from "../ch-grid-column";

@Component({
  tag: "ch-grid-column-settings",
  styleUrl: "ch-grid-column-settings.scss",
  shadow: true
})
export class ChGridColumnSettings {
  @Prop() readonly column: ChGridColumn;
  @Prop({ reflect: true }) readonly show = false;

  @Listen("windowClosed")
  windowClosedHandler(eventInfo: Event) {
    eventInfo.stopPropagation();
    this.column.showSettings = false;
  }

  @Listen("columnSettingsChanged")
  columnSettingsChangedHandler() {
    this.column.showSettings = false;
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
