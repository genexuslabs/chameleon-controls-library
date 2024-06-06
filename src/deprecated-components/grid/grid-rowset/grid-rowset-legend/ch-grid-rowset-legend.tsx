import { Component, Listen, Event, EventEmitter, h, Host } from "@stencil/core";

/**
 * The `ch-grid-rowset-legend` component represents a caption for the `ch-grid-rowset` element.
 * @deprecated Use `ch-tabular-grid` component instead. Use `ch-tabular-grid-rowset-legend` instead.
 */
@Component({
  tag: "ch-grid-rowset-legend",
  styleUrl: "ch-grid-rowset-legend.scss",
  shadow: true
})
export class ChGridRowsetLegend {
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
