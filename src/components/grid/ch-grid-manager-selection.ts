import HTMLChGridCellElement from "../grid-cell/ch-grid-cell";
import HTMLChGridRowElement from "../grid-row/ch-grid-row";
import { ChGrid } from "./ch-grid";

export class ChGridManagerSelection {
  private grid: ChGrid;
  private lastRow: HTMLChGridRowElement;

  constructor(grid: ChGrid) {
    this.grid = grid;
  }

  setRowHighlighted(
    eventInfo: Event,
    currentRowHighlighted: HTMLChGridRowElement
  ): HTMLChGridRowElement {
    const row =
      this.getRowEventTarget(eventInfo) ||
      (this.isRowActionsEventTarget(eventInfo) ? currentRowHighlighted : null);

    if (row) {
      if (!row.highlighted) {
        if (currentRowHighlighted) {
          currentRowHighlighted.highlighted = false;
        }
        row.highlighted = true;
      }
    } else {
      if (currentRowHighlighted) {
        currentRowHighlighted.highlighted = false;
      }
    }

    return row;
  }

  setRowsSelected(
    row: HTMLChGridRowElement,
    action: "" | "append" | "unselect",
    range: boolean,
    multiple: boolean,
    currentRowsSelected: HTMLChGridRowElement[]
  ): HTMLChGridRowElement[] {

    if (row) {
      if (range && multiple && row.parentElement == this.lastRow?.parentElement) {
        const value = !row.selected;
        const rows = this.grid.manager.getRowsRange(this.lastRow ?? row, row);

        this.lastRow = row;
        rows.forEach((row) => (row.selected = value));

        if (value) {
          return currentRowsSelected.concat(
            rows.filter((row) => !currentRowsSelected.includes(row))
          );
        } else {
          return currentRowsSelected.filter((row) => !rows.includes(row));
        }
      } else {
        this.lastRow = row;

        if (row.selected) {
          if (action == "append" || action == "unselect") {
            row.selected = false;
            return currentRowsSelected.filter((r) => r !== row);
          }
        } else {
          if (multiple) {
            if (currentRowsSelected.length == 0) {
              row.selected = true;
              return currentRowsSelected.concat([row]);
            } else {
              if (action == "append") {
                row.selected = true;
                return currentRowsSelected.concat([row]);
              } else {
                currentRowsSelected.forEach((row) => (row.selected = false));
                row.selected = true;
                return [row];
              }
            }
          } else {
            currentRowsSelected.forEach((row) => (row.selected = false));
            row.selected = true;
            return [row];
          }
        }
      }
    }

    return currentRowsSelected;
  }

  setCellSelected(
    cell: HTMLChGridCellElement,
    currentCellSelected: HTMLChGridCellElement
  ): HTMLChGridCellElement {

    if (cell && !cell.selected) {
      if (currentCellSelected) {
        currentCellSelected.selected = false;
      }
      cell.selected = true;
    }

    return cell || currentCellSelected;
  }

  refreshCellSelector(
    rows: HTMLChGridRowElement[],
    previous: HTMLChGridRowElement[] = []
  ) {
    const columnSelector = this.grid.manager.columns.getColumnSelector();

    if (columnSelector) {
      rows
        .filter((x) => !previous.includes(x))
        .forEach((row) => {
          const cell = row.children[
            columnSelector.physicalOrder - 1
          ] as HTMLChGridCellElement;
          cell.setSelectorChecked(true);
        });

      previous
        .filter((x) => !rows.includes(x))
        .forEach((row) => {
          const cell = row.children[
            columnSelector.physicalOrder - 1
          ] as HTMLChGridCellElement;
          cell.setSelectorChecked(false);
        });
    }
  }

  private getRowEventTarget(eventInfo: Event): HTMLChGridRowElement {
    return eventInfo
      .composedPath()
      .find(
        (target: HTMLElement) => target.tagName === "CH-GRID-ROW"
      ) as HTMLChGridRowElement;
  }

  private isRowActionsEventTarget(eventInfo: Event): boolean {
    return (
      eventInfo
        .composedPath()
        .find((target: HTMLElement) =>
          target.classList?.contains("row-actions")
        ) != null
    );
  }
}
