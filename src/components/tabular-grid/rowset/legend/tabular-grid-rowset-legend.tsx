import {
  Component,
  Element,
  Listen,
  Event,
  EventEmitter,
  h,
  Host,
  Prop
} from "@stencil/core";
import { tokenMap } from "../../../../common/utils";
import { TABULAR_GRID_PARTS_DICTIONARY } from "../../../../common/reserved-names";
import HTMLChTabularGridRowsetElement from "../tabular-grid-rowset";

/**
 * The `ch-tabular-grid-rowset-legend` component represents a caption for the `ch-tabular-grid-rowset` element.
 */
@Component({
  tag: "ch-tabular-grid-rowset-legend",
  styleUrl: "tabular-grid-rowset-legend.scss",
  shadow: true
})
export class ChTabularGridRowsetLegend {
  @Element() el: HTMLChTabularGridRowsetLegendElement;

  /**
   * A boolean or string that controls the parts applied to the legend.
   * - When `true`, it automatically applies the part names "column" and the column's unique ID.
   * - When a string is provided, it appends that string to the default part names "column" and the column's ID.
   */
  @Prop() readonly parts: boolean | string;

  /**
   * Event emitted when the legend is clicked.
   */
  @Event() rowsetLegendClicked: EventEmitter<CustomEvent>;

  @Listen("click", { passive: true })
  clickHandler() {
    this.rowsetLegendClicked.emit();
  }

  #getRowsetId = () => {
    const rowset = this.el.parentElement as HTMLChTabularGridRowsetElement;
    return rowset?.rowsetId;
  };

  render() {
    return (
      <Host
        part={
          this.parts &&
          tokenMap({
            [TABULAR_GRID_PARTS_DICTIONARY.ROWSET_LEGEND]: true,
            [this.#getRowsetId()]: !!this.#getRowsetId(),
            [this.parts.toString()]: typeof this.parts === "string"
          })
        }
      >
        <div part="caret"></div>
        <label part="selector-label">
          <input type="checkbox" part="selector"></input>
        </label>
        <div part="icon"></div>
        <slot></slot>
      </Host>
    );
  }
}
