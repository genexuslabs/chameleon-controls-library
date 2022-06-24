import { Component, h, Prop } from "@stencil/core";
import { ChGridManager } from "../../grid/ch-grid-manager";

@Component({
  tag: "ch-grid-settings-columns",
  styleUrl: "ch-grid-settings-columns.scss",
  shadow: true,
})
export class ChGridSettingsColumns {
  @Prop() gridManager: ChGridManager;

  private handleClick = (eventInfo: Event) => {
    const checkbox = eventInfo.target as HTMLInputElement;
    const column = this.gridManager.columns.find(
      (column) => column.columnId === checkbox.name
    ) as HTMLChGridColumnElement;

    column.hidden = !checkbox.checked;

    eventInfo.stopPropagation();
  };

  render() {
    return (
      <ul>
        {this.gridManager.columns.map((column) => (
          <li part="column">
            <label part="column-label">
              <input
                part="column-visible"
                type="checkbox"
                checked={!column.hidden}
                disabled={!column.hideable}
                name={column.columnId}
                onClick={this.handleClick}
              />
              {column.columnName}
            </label>
          </li>
        ))}
      </ul>
    );
  }
}
