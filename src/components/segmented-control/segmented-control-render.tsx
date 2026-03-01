import {
  Component,
  Event,
  EventEmitter,
  Host,
  Listen,
  Prop,
  h
} from "@stencil/core";
import { SegmentedControlItemModel, SegmentedControlModel } from "./types";
import { ChSegmentedControlItemCustomEvent } from "../../components";
import { SEGMENTED_CONTROL_EXPORT_PARTS } from "../../common/reserved-names";

/**
 * The `ch-segmented-control-render` component presents a horizontal set of
 * mutually exclusive options as a row of connected segments.
 *
 * @remarks
 * ## Features
 *  - Connected segment buttons for mutually exclusive selection.
 *  - Each segment supports a caption, start and end images.
 *  - Individual segment disabling.
 *  - Delegates rendering to `ch-segmented-control-item` elements with re-exported parts via `exportParts`.
 *
 * ## Use when
 *  - Toggling between views, modes, or filters with a small number of options (typically 2 to 5).
 *  - Immediate selection feedback is desired.
 *  - Switching between 2–5 mutually exclusive views of the same content (e.g., list vs. grid, day/week/month).
 *  - The result changes immediately without a confirmation step.
 *
 * ## Do not use when
 *  - The option list is long — prefer `ch-combo-box-render` or `ch-radio-group-render` instead.
 *  - More than 5 options are needed — prefer `ch-radio-group-render` or `ch-combo-box-render`.
 *  - Used inside a form where the selection must be saved — prefer radio buttons.
 *  - The segments navigate to different pages or routes — prefer `ch-tab` or navigation links.
 *  - Confusing with `ch-tab`: segmented controls switch the FORMAT or VIEW of the same data; tabs switch to DIFFERENT content sections.
 *
 * ## Accessibility
 *  - The host element has `role="list"`, and each segment item acts as a list item.
 *  - Selection changes are communicated via events to assistive technology.
 *
 * @part action - The `<button>` element for each segment. Receives the `selected`, `unselected`, `disabled`, `first`, `last`, and `between` state parts.
 *
 * @part selected - Present in the `action` part when the segment is the currently selected one.
 * @part unselected - Present in the `action` part when the segment is not selected.
 * @part disabled - Present in the `action` part when the segment is disabled.
 * @part first - Present in the `action` part when the segment is the first item in the group.
 * @part last - Present in the `action` part when the segment is the last item in the group.
 * @part between - Present in the `action` part when the segment is neither the first nor the last item.
 *
 * @status experimental
 */
@Component({
  shadow: false,
  styleUrl: "segmented-control-render.scss",
  tag: "ch-segmented-control-render"
})
export class ChSegmentedControl {
  /**
   * Specifies the parts that are exported by the internal
   * segmented-control-item. This property is useful to override the exported
   * parts.
   */
  @Prop() readonly exportParts: string = SEGMENTED_CONTROL_EXPORT_PARTS;

  /**
   * A CSS class to set as the `ch-segmented-control-item` element class.
   * This default class is used for the items that don't have an explicit class.
   */
  @Prop() readonly itemCssClass: string = "segmented-control-item";

  /**
   * This property lets you define the items of the ch-segmented-control-render
   * control.
   */
  @Prop() readonly model?: SegmentedControlModel;

  /**
   * Specifies the ID of the selected item
   */
  @Prop({ mutable: true }) selectedId: string;

  /**
   * Fired when the selected item change. It contains the information about the
   * new selected id.
   */
  @Event() selectedItemChange: EventEmitter<string>;

  @Listen("selectedChange")
  handleSelectedChange(event: ChSegmentedControlItemCustomEvent<string>) {
    event.stopPropagation();

    this.selectedId = event.detail;
    this.selectedItemChange.emit(event.detail);
  }

  #itemRender = (item: SegmentedControlItemModel, index: number) => {
    const first = index === 0;
    const last = index === this.model.length - 1;
    const between = !first && !last;

    return (
      <ch-segmented-control-item
        id={item.id}
        accessibleName={item.accessibleName}
        between={between}
        caption={item.caption}
        class={item.class || this.itemCssClass}
        disabled={item.disabled}
        exportparts={this.exportParts}
        endImgSrc={item.endImgSrc}
        endImgType={item.endImgType}
        first={first}
        last={last}
        selected={this.selectedId === item.id}
        startImgSrc={item.startImgSrc}
        startImgType={item.startImgType}
      ></ch-segmented-control-item>
    );
  };

  render() {
    return <Host role="list">{this.model?.map(this.#itemRender)}</Host>;
  }
}
