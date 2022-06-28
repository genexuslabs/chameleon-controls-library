import { CSSProperties } from "./types";

export class ChGridManagerColumnDrag {
  private column: ChGridManagerColumnDragItem;
  private columns: ChGridManagerColumnDragItem[];
  private lastTargetOrder = 0;

  constructor(columnId: string, columns: HTMLChGridColumnElement[]) {
    this.columns = columns.map((column) => ({
      column,
      rect: column.getBoundingClientRect(),
      translateX: 0,
      order: column.order,
    }));
    this.column = this.columns.find((item) => item.column.columnId == columnId);
  }

  dragging(position: number): boolean {
    const sourceOrder = this.column.column.order;
    let targetOrder = 0;
    let targetOrderChanged = false;

    this.column.translateX = 0;
    this.columns.forEach((item) => {
      const columnOrder = item.column.order;
      const dragDirection = sourceOrder > columnOrder ? -1 : 1;
      const shiftDirection = sourceOrder > columnOrder ? 1 : -1;

      if (
        item.rect.left < position &&
        position < item.rect.right &&
        columnOrder != sourceOrder
      ) {
        item.translateX = this.column.rect.width * shiftDirection;
        item.order = item.column.order + shiftDirection;
        this.column.translateX += item.rect.width * dragDirection;

        targetOrder = columnOrder;
      } else if (position < item.rect.left && columnOrder < sourceOrder) {
        item.translateX = this.column.rect.width * shiftDirection;
        item.order = item.column.order + shiftDirection;
        this.column.translateX += item.rect.width * dragDirection;
      } else if (position > item.rect.right && columnOrder > sourceOrder) {
        item.translateX = this.column.rect.width * shiftDirection;
        item.order = item.column.order + shiftDirection;
        this.column.translateX += item.rect.width * dragDirection;
      } else if (columnOrder != sourceOrder) {
        item.translateX = 0;
        item.order = item.column.order;
      }
    });
    this.column.order = targetOrder ? targetOrder : this.column.column.order;

    targetOrderChanged = targetOrder != this.lastTargetOrder;
    this.lastTargetOrder = targetOrder;

    return targetOrderChanged;
  }

  dragEnd() {
    this.columns.forEach((item) => {
      item.column.order = item.order;
      item.translateX = 0;
    });
  }

  getColumnStyle(column: HTMLChGridColumnElement): CSSProperties {
    return {
      [`--ch-grid-column-${column.physicalOrder}-transform`]: `translateX(${
        this.columns[column.physicalOrder - 1].translateX
      }px)`,
    };
  }

  getColumnsFirstLast(): {
    columnFirst: HTMLChGridColumnElement;
    columnLast: HTMLChGridColumnElement;
  } {
    let itemFirst: ChGridManagerColumnDragItem;
    let itemLast: ChGridManagerColumnDragItem;

    this.columns.forEach((item) => {
      if (!item.column.hidden && (!itemFirst || item.order < itemFirst.order)) {
        itemFirst = item;
      }
      if (!item.column.hidden && (!itemLast || item.order > itemLast.order)) {
        itemLast = item;
      }
    });

    return {
      columnFirst: itemFirst.column,
      columnLast: itemLast.column,
    };
  }
}

interface ChGridManagerColumnDragItem {
  column: HTMLChGridColumnElement;
  rect: DOMRect;
  translateX: number;
  order: number;
}
