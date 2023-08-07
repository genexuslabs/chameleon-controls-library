import {
  Component,
  Prop,
  Event,
  EventEmitter,
  h,
  Host,
  Listen
} from "@stencil/core";
import {
  ChPaginatorNavigateClickedEvent,
  ChPaginatorNavigateType
} from "./ch-paginator-navigate-types";

/**
 * The 'ch-paginator-navigate' component represents the navigation buttons for the 'ch-paginator' component.
 */
@Component({
  tag: "ch-paginator-navigate",
  styleUrl: "ch-paginator-navigate.scss",
  shadow: false
})
export class ChPaginatorNavigate {
  /**
   * The type of navigation button.
   */
  @Prop({ reflect: true }) readonly type: ChPaginatorNavigateType;

  /**
   * Flag indicating if the button is disabled.
   */
  @Prop() readonly disabled: boolean;

  /**
   * Event emitted when the navigation button is pressed.
   */
  @Event() navigateClicked: EventEmitter<ChPaginatorNavigateClickedEvent>; // prettier-ignore

  @Listen("keydown", { passive: true })
  @Listen("click", { passive: true })
  pressedHandler(eventInfo) {
    if (!eventInfo.key || eventInfo.key === "Enter" || eventInfo.key === " ") {
      this.navigateClicked.emit({ type: this.type });
      eventInfo.stopPropagation();
    }
  }

  render() {
    return <Host role="button" tabindex="0" disabled={this.disabled}></Host>;
  }
}
