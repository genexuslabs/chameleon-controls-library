import {
  Component,
  Prop,
  Event,
  EventEmitter,
  h,
  Host,
  Element
} from "@stencil/core";
import {
  ChPaginatorNavigationClickedEvent,
  ChPaginatorNavigationType
} from "./ch-paginator-navigate-types";

@Component({
  tag: "ch-paginator-navigate",
  styleUrl: "ch-paginator-navigate.scss",
  shadow: false
})
export class ChPaginatorNavigate {
  @Element() el: HTMLChPaginatorNavigateElement;
  @Prop() readonly type: ChPaginatorNavigationType;
  @Prop() readonly disabled: boolean;
  @Event() navigationClicked: EventEmitter<ChPaginatorNavigationClickedEvent>; // prettier-ignore

  private handleClick = (eventInfo: Event) => {
    eventInfo.stopPropagation();
    this.navigationClicked.emit({ navigationType: this.type });
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
