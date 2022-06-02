import HTMLChGridCellElement from "../grid-cell/ch-grid-cell";
import HTMLChGridRowElement from "../grid-row/ch-grid-row";

export function setRowHighlighted(
  eventInfo: Event,
  currentRowHighlighted: HTMLChGridRowElement
): HTMLChGridRowElement {
  const row = getRowEventTarget(eventInfo);

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

export function setRowsSelected(
  eventInfo: MouseEvent,
  currentRowsSelected: HTMLChGridRowElement[],
  multiple: boolean
): HTMLChGridRowElement[] {
  const row = getRowEventTarget(eventInfo);

  if (row) {
    if (row.selected) {
      if (eventInfo.ctrlKey) {
        row.selected = false;
        return currentRowsSelected.filter((r) => r !== row);
      }
    } else {
      if (multiple) {
        if (currentRowsSelected.length == 0) {
          row.selected = true;
          return currentRowsSelected.concat([row]);
        } else {
          if (eventInfo.ctrlKey) {
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

  return currentRowsSelected;
}

export function setCellSelected(
  eventInfo: Event,
  currentCellSelected: HTMLChGridCellElement
): HTMLChGridCellElement {
  const cell = getCellEventTarget(eventInfo);

  if (cell && !cell.selected) {
    if (currentCellSelected) {
      currentCellSelected.selected = false;
    }
    cell.selected = true;
  }

  return cell || currentCellSelected;
}

function getRowEventTarget(eventInfo: Event): HTMLChGridRowElement {
  return eventInfo
    .composedPath()
    .find(
      (target: HTMLElement) => target.tagName === "CH-GRID-ROW"
    ) as HTMLChGridRowElement;
}

function getCellEventTarget(eventInfo: Event): HTMLChGridCellElement {
  return eventInfo
    .composedPath()
    .find(
      (target: HTMLElement) => target.tagName === "CH-GRID-CELL"
    ) as HTMLChGridCellElement;
}
