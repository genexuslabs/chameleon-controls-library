import {
  Component,
  h,
  Host,
  Listen,
  Prop,
  Event,
  EventEmitter
} from "@stencil/core";

/**
 * The `ch-tabular-grid-settings` component represents a settings window for a grid component.
 */
@Component({
  tag: "ch-tabular-grid-settings",
  styleUrl: "tabular-grid-settings.scss",
  shadow: true
})
export class ChTabularGridSettings {
  /**
   * The `HTMLChTabularGridElement` that the settings window is associated with.
   */
  @Prop() readonly grid!: HTMLChTabularGridElement;

  /**
   * Indicates whether the settings window is currently shown or not.
   */
  @Prop({ reflect: true, mutable: true }) show = false;

  /**
   * Event emitted when the close button of the settings window is clicked.
   */
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
