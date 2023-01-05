import { Component, Listen, Event, EventEmitter, h, Host } from "@stencil/core";

@Component({
  tag: "ch-grid-rowset-legend",
  styleUrl: "ch-grid-rowset-legend.scss",
  shadow: true,
})
export class ChGridRowsetLegend {
  static TAG_NAME = "CH-GRID-ROWSET-LEGEND";
  @Event() rowsetLegendClicked: EventEmitter<CustomEvent>;

  @Listen("click", { passive: true })
  clickHandler(_eventInfo: MouseEvent) {
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
