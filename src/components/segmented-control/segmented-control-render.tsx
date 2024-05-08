import {
  Component,
  Event,
  EventEmitter,
  Host,
  Listen,
  Prop,
  h
} from "@stencil/core";
import { SegmentedControlItem } from "./types";
import { ChSegmentedControlItemCustomEvent } from "../../components";
import { SEGMENTED_CONTROL_EXPORT_PARTS } from "../../common/reserverd-names";

/**
 * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.
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
  @Prop() readonly model?: SegmentedControlItem[];

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

  #itemRender = (item: SegmentedControlItem, index: number) => {
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
