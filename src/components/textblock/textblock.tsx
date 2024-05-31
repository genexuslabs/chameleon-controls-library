import { Component, Element, Host, Prop, State, h } from "@stencil/core";

import {
  LineClampComponent,
  makeLinesClampable
} from "../../common/line-clamp";

import {
  HEIGHT_MEASURING,
  LINE_CLAMP,
  LINE_MEASURING
} from "../../common/reserved-names";

/**
 * @part content - The main content displayed in the control. This part only applies when `format="Text"` and lineClamp="true".
 *
 * @slot - The slot for the content.
 */
@Component({
  shadow: true,
  styleUrl: "textblock.scss",
  tag: "ch-textblock"
})
export class TextBlock implements LineClampComponent {
  constructor() {
    makeLinesClampable(
      this,
      "." + LINE_CLAMP,
      "." + HEIGHT_MEASURING,
      "." + LINE_MEASURING,
      true
    );
  }

  @Element() element: HTMLChTextblockElement;

  @State() contentLines = 0;
  @State() maxLines = 0;

  /**
   * It specifies the format that will have the textblock control.
   *
   *  - If `format` = `HTML`, the textblock control works as an HTML div and
   *    the innerHTML will be taken from the default slot.
   *
   *  - If `format` = `Text`, the control works as a normal textblock control
   *    and it is affected by most of the defined properties.
   */
  @Prop() readonly format: "Text" | "HTML" = "Text";

  /**
   * True to cut text when it overflows, showing an ellipsis.
   */
  @Prop() readonly lineClamp: boolean = false;

  /**
   * Determine the tooltip text that will be displayed when the pointer is over
   * the control
   */
  @Prop() readonly tooltip: string;

  /**
   * Determine the way that the tooltip text will be displayed
   */
  @Prop() readonly tooltipShowMode: "always" | "line-clamp" = "always";

  private getTooltip() {
    const noNeedToDisplayTooltip =
      !this.tooltip ||
      (this.tooltipShowMode === "line-clamp" &&
        this.lineClamp &&
        this.contentLines <= this.maxLines);

    return noNeedToDisplayTooltip ? null : this.tooltip;
  }

  render() {
    const justRenderTheSlot = this.format === "HTML" || !this.lineClamp;

    return (
      <Host
        role={this.format === "Text" && !this.lineClamp ? "paragraph" : null}
        title={this.getTooltip()}
      >
        {justRenderTheSlot ? (
          <slot />
        ) : (
          [
            <div class={LINE_MEASURING}>A</div>,
            <div class={HEIGHT_MEASURING}></div>,
            <p
              class={`content ${LINE_CLAMP}`}
              part="content"
              style={{ "--max-lines": this.maxLines.toString() }}
            >
              <slot />
            </p>
          ]
        )}
      </Host>
    );
  }
}
