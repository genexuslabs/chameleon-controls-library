import {
  Component,
  h,
  Host,
  Listen,
  Prop,
  Event,
  EventEmitter,
} from "@stencil/core";
import { ChGridManager } from "../ch-grid-manager";

@Component({
  tag: "ch-grid-settings",
  styleUrl: "ch-grid-settings.scss",
  shadow: true,
})
export class ChGridSettings {
  @Prop() gridManager: ChGridManager;
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
          caption="Options"
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
