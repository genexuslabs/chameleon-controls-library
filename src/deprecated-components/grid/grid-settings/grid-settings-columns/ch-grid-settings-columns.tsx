import { Component, h, Prop } from "@stencil/core";

/**
 * The `ch-grid-settings-columns` component represents the settings for a grid's columns.
 * @deprecated Use `ch-tabular-grid` component instead. Use `ch-tabular-grid-settings-columns` instead.
 */
@Component({
  tag: "ch-grid-settings-columns",
  styleUrl: "ch-grid-settings-columns.scss",
  shadow: true
})
export class ChGridSettingsColumns {
  /**
   * An array of column elements to render.
   */
  @Prop() readonly columns!: HTMLChGridColumnElement[];

  private handleClick = (eventInfo: Event) => {
    const checkbox = eventInfo.target as HTMLInputElement;
    const column = this.columns.find(
      column => column.columnId === checkbox.name
    );

    column.hidden = !checkbox.checked;

    eventInfo.stopPropagation();
  };

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

  render() {
    const columnsSorted = this.getColumnsSorted();

    return (
      <ul>
        {columnsSorted.map(column => (
          <li part="column">
            <label part="column-label">
              <input
                part={
                  !column.hidden
                    ? "column-visible column-visible-checked"
                    : "column-visible"
                }
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
