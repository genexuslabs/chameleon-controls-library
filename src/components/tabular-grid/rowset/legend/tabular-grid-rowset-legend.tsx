import { Component, Listen, Event, EventEmitter, h, Host } from "@stencil/core";

/**
 * The `ch-tabular-grid-rowset-legend` component represents a caption for the `ch-tabular-grid-rowset` element.
 */
@Component({
  tag: "ch-tabular-grid-rowset-legend",
  styleUrl: "tabular-grid-rowset-legend.scss",
  shadow: true
})
export class ChTabularGridRowsetLegend {
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
