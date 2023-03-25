import { Component, Listen, Event, EventEmitter, h, Host } from "@stencil/core";

@Component({
  tag: "ch-grid-rowset-legend",
  styleUrl: "ch-grid-rowset-legend.scss",
  shadow: true
})
export class ChGridRowsetLegend {
  public static readonly TAG_NAME = "CH-GRID-ROWSET-LEGEND";
  @Event() rowsetLegendClicked: EventEmitter<CustomEvent>;

  @Listen("click", { passive: true })
  clickHandler() {
    this.rowsetLegendClicked.emit();
  }

  inputClicked(e) {
    e.target.checked
      ? e.target.setAttribute("part", "selector selector-checked")
      : e.target.setAttribute("part", "selector");
  }

  render() {
    return (
      <Host>
        <div part="caret"></div>
        <label part="selector-label">
          <input
            type="checkbox"
            part="selector"
            onClick={this.inputClicked}
          ></input>
        </label>
        <div part="icon"></div>
        <slot></slot>
      </Host>
    );
  }
}
