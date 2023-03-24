import { CSSProperties } from "./ch-grid-types";

export class ChGridManagerColumnDrag {
  private column: ChGridManagerColumnDragItem;
  private columns: ChGridManagerColumnDragItem[];
  private lastTargetOrder = 0;

  constructor(columnId: string, columns: HTMLChGridColumnElement[]) {
    this.columns = columns.map(column => ({
      column,
      rect: column.getBoundingClientRect(),
      translateX: 0,
      order: column.order
    }));
    this.column = this.columns.find(item => item.column.columnId == columnId);

    this.columns.forEach(this.setColumnHiddenRect.bind(this));
  }

  dragging(position: number): boolean {
    const sourceOrder = this.column.column.order;
    const sourceFreeze = this.column.column.freeze;
    let targetOrder = 0;
    let targetOrderChanged = false;

    this.column.translateX = 0;
    this.columns
      .filter(item => item.column.freeze == sourceFreeze)
      .forEach(item => {
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
    this.columns.forEach(item => {
      item.column.order = item.order;
      item.translateX = 0;
    });
  }

  getColumnStyle(column: HTMLChGridColumnElement): CSSProperties {
    return {
      [`--ch-grid-column-${column.physicalOrder}-transform`]: `translateX(${
        this.columns[column.physicalOrder - 1].translateX
      }px)`
    };
  }

  getColumnsFirstLast(): {
    columnFirst: HTMLChGridColumnElement;
    columnLast: HTMLChGridColumnElement;
  } {
    let itemFirst: ChGridManagerColumnDragItem;
    let itemLast: ChGridManagerColumnDragItem;

    this.columns.forEach(item => {
      if (!item.column.hidden && (!itemFirst || item.order < itemFirst.order)) {
        itemFirst = item;
      }
      if (!item.column.hidden && (!itemLast || item.order > itemLast.order)) {
        itemLast = item;
      }
    });

    return {
      columnFirst: itemFirst.column,
      columnLast: itemLast.column
    };
  }

  private setColumnHiddenRect(item: ChGridManagerColumnDragItem) {
    if (item.column.hidden) {
      const columnSibling =
        this.getPreviousSiblingVisible(item) ||
        this.getNextSiblingVisible(item);

      item.rect = new DOMRect(
        item.column.order < columnSibling.column.order
          ? columnSibling.rect.left
          : columnSibling.rect.right,
        columnSibling.rect.y,
        0,
        columnSibling.rect.height
      );
    }
  }

  private getPreviousSiblingVisible(
    hidden: ChGridManagerColumnDragItem
  ): ChGridManagerColumnDragItem {
    let previous: ChGridManagerColumnDragItem;

    this.columns.forEach(item => {
      if (
        !item.column.hidden &&
        item.column.order < hidden.column.order &&
        (!previous || item.column.order > previous.column.order)
      ) {
        previous = item;
      }
    });

    return previous;
  }

  private getNextSiblingVisible(
    hidden: ChGridManagerColumnDragItem
  ): ChGridManagerColumnDragItem {
    let next: ChGridManagerColumnDragItem;

    this.columns.forEach(item => {
      if (
        !item.column.hidden &&
        item.column.order > hidden.column.order &&
        (!next || item.column.order < next.column.order)
      ) {
        next = item;
      }
    });

    return next;
  }
}

interface ChGridManagerColumnDragItem {
  column: HTMLChGridColumnElement;
  rect: DOMRect;
  translateX: number;
  order: number;
}
