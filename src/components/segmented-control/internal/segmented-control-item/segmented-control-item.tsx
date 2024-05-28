import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  h
} from "@stencil/core";

import { AccessibleNameComponent } from "../../../../common/interfaces";
import { ImageRender } from "../../../../common/types";
import { SEGMENTED_CONTROL_PARTS_DICTIONARY } from "../../../../common/reserverd-names";

/**
 * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.
 * This control represents and item of the ch-segmented-control-render
 *
 * @part selected - ...
 */
@Component({
  shadow: true,
  styleUrl: "segmented-control-item.scss",
  tag: "ch-segmented-control-item"
})
export class ChSegmentedControlItem implements AccessibleNameComponent {
  @Element() el: HTMLChSegmentedControlItemElement;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName?: string;

  /**
   * `true` if the control is the not the first or last item in the
   * ch-segmented-control-render.
   */
  @Prop() readonly between: boolean = false;

  /**
   * Specifies the caption that the control will display.
   */
  @Prop() readonly caption?: string;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled?: boolean = false;

  /**
   * Specifies the src of the end image.
   */
  @Prop() readonly endImgSrc: string;

  /**
   * Specifies how the end image will be rendered.
   */
  @Prop() readonly endImgType: Exclude<ImageRender, "img"> = "background";

  /**
   * `true` if the control is the first item in the ch-segmented-control-render.
   */
  @Prop() readonly first: boolean = false;

  /**
   * `true` if the control is the last item in the ch-segmented-control-render.
   */
  @Prop() readonly last: boolean = false;

  /**
   * Specifies if the control is selected.
   */
  @Prop() readonly selected: boolean;

  /**
   * Specifies the src of the start image.
   */
  @Prop() readonly startImgSrc: string;

  /**
   * Specifies how the start image will be rendered.
   */
  @Prop() readonly startImgType: Exclude<ImageRender, "img"> = "background";

  /**
   * Fired when the control is selected by user interaction.
   */
  @Event() selectedChange: EventEmitter<string>;

  #parts = () =>
    `action${
      this.disabled ? ` ${SEGMENTED_CONTROL_PARTS_DICTIONARY.DISABLED}` : ""
    } ${
      this.selected
        ? SEGMENTED_CONTROL_PARTS_DICTIONARY.SELECTED
        : SEGMENTED_CONTROL_PARTS_DICTIONARY.UNSELECTED
    }${this.first ? ` ${SEGMENTED_CONTROL_PARTS_DICTIONARY.FIRST}` : ""}${
      this.last ? ` ${SEGMENTED_CONTROL_PARTS_DICTIONARY.LAST}` : ""
    }${this.between ? ` ${SEGMENTED_CONTROL_PARTS_DICTIONARY.BETWEEN}` : ""}`;

  #handleSelectedChange = (event: MouseEvent) => {
    event.stopPropagation();
    this.selectedChange.emit(this.el.id);
  };

  render() {
    const hasStartImg = !!this.startImgSrc;
    const hasEndImg = !!this.endImgSrc;
    const hasImages = hasStartImg || hasEndImg;

    return (
      <Host role="listitem">
        <button
          aria-label={this.accessibleName || null}
          aria-selected={this.selected ? "true" : null}
          class={
            hasImages
              ? {
                  [`start-img-type--${
                    this.startImgType ?? "background"
                  } img--start`]: hasStartImg,
                  [`end-img-type--${this.endImgType ?? "background"} img--end`]:
                    hasEndImg
                }
              : undefined
          }
          part={this.#parts()}
          style={
            hasImages
              ? {
                  "--ch-start-img": hasStartImg
                    ? `url("${this.startImgSrc}")`
                    : undefined,
                  "--ch-end-img": hasEndImg
                    ? `url("${this.endImgSrc}")`
                    : undefined
                }
              : undefined
          }
          type="button"
          onClick={!this.selected ? this.#handleSelectedChange : null}
        >
          {this.caption}
        </button>
      </Host>
    );
  }
}
