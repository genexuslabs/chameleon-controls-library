import { Component, Host, h, Prop, State } from "@stencil/core";
import { Component as ChComponent } from "../../common/interfaces";
import { ChWindowAlign } from "../window/ch-window";

export type TooltipAlign =
  | "OutsideStart"
  | "InsideStart"
  | "Center"
  | "InsideEnd"
  | "OutsideEnd";

const mapTooltipAlignToChWindowAlign: {
  [key in TooltipAlign]: ChWindowAlign;
} = {
  OutsideStart: "outside-start",
  InsideStart: "inside-start",
  Center: "center",
  InsideEnd: "inside-end",
  OutsideEnd: "outside-end"
};

const EXPORT_PARTS = "window:section,mask";

@Component({
  tag: "ch-tooltip",
  styleUrl: "tooltip.scss",
  shadow: false
})
export class ChTooltip implements ChComponent {
  /** The container element for ch-window.
   */
  private container!: HTMLDivElement;
  /** Determines if the window and the tooltip is hidden or visible.
   * Inherited from ch-window.
   */
  @State() hidden = true;
  /**
   * Specifies the tooltip description.
   */
  @Prop() readonly tooltipId: string = "Tooltip";
  /**
   * Specifies the separation (in px)
   * between the tooltip and the container element.
   */
  @Prop() readonly separation: number = 12;
  /**
   * Specifies the delay (in ms)
   * for the tooltip to be displayed.
   */
  @Prop() readonly delay: number = 100;
  /**
   * Specifies the position of the tooltip relative to
   * the container element.
   */
  @Prop() readonly position:
    | "OutsideStart_OutsideStart"
    | "InsideStart_OutsideStart"
    | "Center_OutsideStart"
    | "InsideEnd_OutsideStart"
    | "OutsideEnd_OutsideStart"
    | "OutsideStart_InsideStart"
    | "OutsideEnd_InsideStart"
    | "OutsideStart_Center"
    | "OutsideEnd_Center"
    | "OutsideStart_InsideEnd"
    | "OutsideEnd_InsideEnd"
    | "OutsideStart_OutsideEnd"
    | "InsideStart_OutsideEnd"
    | "Center_OutsideEnd"
    | "InsideEnd_OutsideEnd"
    | "OutsideEnd_OutsideEnd" = "OutsideStart_Center";

  private showWithDelay = () => {
    setTimeout(() => {
      this.hidden = false;
    }, this.delay);
  };

  private handleEnter = () => {
    if (!this.hidden) {
      return;
    }
    this.showWithDelay();
  };

  private handleLeave = () => {
    if (this.container === document.activeElement) {
      this.hidden = false;
    }
    this.hidden = true;
  };

  private addListeners = () => {
    this.container.addEventListener("focus", this.handleEnter);
    this.container.addEventListener("focusout", this.handleLeave);
    this.container.addEventListener("mouseover", this.handleEnter);
    this.container.addEventListener("mouseleave", this.handleLeave);
  };

  private removeListeners = () => {
    this.container.removeEventListener("focus", this.handleEnter);
    this.container.removeEventListener("focusout", this.handleLeave);
    this.container.removeEventListener("mouseover", this.handleEnter);
    this.container.removeEventListener("mouseleave", this.handleLeave);
  };

  componentDidLoad() {
    this.container = document.querySelector(
      '[slot="container"] > :first-child'
    );
    this.addListeners();
  }

  disconnectedCallback() {
    this.removeListeners();
  }

  render() {
    const aligns = this.position.split("_");
    const alignX = aligns[0] as TooltipAlign;
    const alignY = aligns[1] as TooltipAlign;

    const isLeft = alignX === "OutsideStart";
    const isRight = alignX === "OutsideEnd";
    const isSide = isLeft || isRight;
    const isTop = alignY === "OutsideStart";
    const isBottom = alignY === "OutsideEnd";

    let offsetX = null;
    if (isSide && !isTop && !isBottom) {
      offsetX = isLeft ? `-${this.separation}px` : `${this.separation}px`;
    }

    let offsetY = null;
    if (!isSide) {
      offsetY = isTop ? `-${this.separation}px` : `${this.separation}px`;
    }

    return (
      <Host>
        <slot name="container"></slot>
        <ch-window
          exportparts={EXPORT_PARTS}
          show-header={false}
          show-footer={false}
          modal={false}
          close-on-escape
          hidden={this.hidden}
          container={this.container}
          xAlign={mapTooltipAlignToChWindowAlign[alignX]}
          yAlign={mapTooltipAlignToChWindowAlign[alignY]}
          style={{
            "--ch-window-offset-x": offsetX,
            "--ch-window-offset-y": offsetY
          }}
        >
          <div
            role="tooltip"
            class={{
              "tooltip-content": true
            }}
            id={this.tooltipId}
          >
            <slot name="content"></slot>
          </div>
        </ch-window>
      </Host>
    );
  }
}
