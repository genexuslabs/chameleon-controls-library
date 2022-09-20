import { Component, h, Prop } from "@stencil/core";

@Component({
  tag: "ch-grid-settings-columns",
  styleUrl: "ch-grid-settings-columns.scss",
  shadow: true,
})
export class ChGridSettingsColumns {
  @Prop() columns: HTMLChGridColumnElement[];

  private handleClick = (eventInfo: Event) => {
    const checkbox = eventInfo.target as HTMLInputElement;
    const column = this.columns.find(
      (column) => column.columnId === checkbox.name
    );

    column.hidden = !checkbox.checked;

    eventInfo.stopPropagation();
  };

  render() {
    const columnsSorted = this.getColumnsSorted();

    return (
      <ul>
        {columnsSorted.map((column) => (
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

  private getColumnsSorted(): HTMLChGridColumnElement[] {
    return [...this.columns].sort(
      (a: HTMLChGridColumnElement, b: HTMLChGridColumnElement) => {
        if (a.order < b.order) {
          return -1;
        }
        if (a.order > b.order) {
          return 1;
        }
        return 0;
      }
    );
  }
}
