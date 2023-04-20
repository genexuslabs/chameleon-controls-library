import { Component, h, Host, Listen, Prop } from "@stencil/core";

@Component({
  tag: "ch-grid-column-settings",
  styleUrl: "ch-grid-column-settings.scss",
  shadow: true
})
export class ChGridColumnSettings {
  @Prop() readonly column!: HTMLChGridColumnElement;
  @Prop({ reflect: true }) readonly show: boolean = false;

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
          modal={true}
          container={this.column}
          xAlign="inside-start"
          yAlign="outside-end"
          caption={this.column.columnName}
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
