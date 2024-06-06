import { Component, h, Host, Listen, Prop } from "@stencil/core";

/**
 * The `ch-tabular-grid-column-settings` component represents a settings window for a column.
 */
@Component({
  tag: "ch-tabular-grid-column-settings",
  styleUrl: "tabular-grid-column-settings.scss",
  shadow: true
})
export class ChTabularGridColumnSettings {
  /**
   * The `HTMLChTabularGridColumnElement` that the settings window is associated with.
   */
  @Prop() readonly column!: HTMLChTabularGridColumnElement;

  /**
   * Indicates whether the settings window is currently shown or not.
   */
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
