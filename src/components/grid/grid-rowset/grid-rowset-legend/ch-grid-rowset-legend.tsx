import { Component, Listen, Event, EventEmitter, h, Host } from "@stencil/core";

/**
 * The `ch-grid-rowset-legend` component represents a caption for the `ch-grid-rowset` element.
 */
@Component({
  tag: "ch-grid-rowset-legend",
  styleUrl: "ch-grid-rowset-legend.scss",
  shadow: true
})
export class ChGridRowsetLegend {
  public static readonly TAG_NAME = "CH-GRID-ROWSET-LEGEND";

  /**
   * Event emitted when the legend is clicked.
   */
  @Event() rowsetLegendClicked: EventEmitter<CustomEvent>;

  @Listen("click", { passive: true })
  clickHandler() {
    this.rowsetLegendClicked.emit();
  }

  render() {
    return (
      <Host>
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
