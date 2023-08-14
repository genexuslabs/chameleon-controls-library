import { Component, Host, h, Prop } from "@stencil/core";
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

const EXPORT_PARTS = "window:section,mask,header,footer";

@Component({
  tag: "ch-tooltip",
  styleUrl: "tooltip.scss",
  shadow: true
})
export class ChTooltip implements ChComponent {
  /**
   * Specifies the tooltip description.
   */
  @Prop() readonly caption: string = "Tooltip";
  /**
   * Specifies the separation (in px)
   * between the tooltip and the container element.
   */
  @Prop() readonly separation: number = 12;

  /** Determines if the window and the tooltip is hidden or visible.
   * Inherited from ch-window.
   */
  @Prop({ reflect: true, mutable: true }) hidden = true;

  /** The container element for the window.
   * Inherited from ch-window.
   */
  @Prop() readonly container?: HTMLElement;

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

  render() {
    const aligns = this.position.split("_");
    const alignX = aligns[0] as TooltipAlign;
    const alignY = aligns[1] as TooltipAlign;
    const accessibilityAttributes = {
      role: "tooltip",
      "aria-labelledby": this.caption
    };

    return (
      <Host
        {...accessibilityAttributes}
        style={{
          "--separation-between-button": `-${this.separation}px`,
          "--separation-between-button-size": `${this.separation}px`
        }}
      >
        <ch-window
          exportparts={EXPORT_PARTS}
          show-header={false}
          show-footer={false}
          modal={false}
          hidden={this.hidden}
          container={this.container}
          xAlign={mapTooltipAlignToChWindowAlign[alignX]}
          yAlign={mapTooltipAlignToChWindowAlign[alignY]}
          style={{
            "--ch-window-offset-x": `${this.separation}px`,
            "--ch-window-offset-y": `${this.separation}px`
          }}
        >
          <slot>{this.caption}</slot>
        </ch-window>
      </Host>
    );
  }
}
