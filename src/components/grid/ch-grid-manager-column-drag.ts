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
    this.column = this.columns.find(item => item.column.columnId === columnId);

    this.columns.forEach(this.setColumnHiddenRect.bind(this));
  }

  dragging(position: number): boolean {
    /**
     * Indica el orden inicial de la columna que se está arrastrando
     */
    const sourceOrder = this.column.column.order;

    /**
     * Indica a qué grupo de fijación pertenece la columna que se está arrastrando
     */
    const sourceFreeze = this.column.column.freeze;

    let targetOrder = 0;
    let targetOrderChanged = false;

    this.column.translateX = 0;
    this.columns
      .filter(item => item.column.freeze === sourceFreeze)
      .forEach(item => {
        /**
         * Indica el orden de la columna actual
         */
        const columnOrder = item.column.order;

        /**
         * Indica si la columna que se está arrastrando estaba a la derecha o
         * a la izquierda de la actual cuando se inició el arrastre para
         * trasladarla en la dirección correspondiente.
         */
        const dragDirection = sourceOrder > columnOrder ? -1 : 1;

        /**
         * Indica si la columna actual hay que desplazarla a la derecha o
         * a la izquierda cuando se cruce con la columna arrastrada.
         */
        const shiftDirection = sourceOrder > columnOrder ? 1 : -1;

        if (
          item.rect.left < position &&
          position < item.rect.right &&
          columnOrder !== sourceOrder
        ) {
          /*
            La posicion actual del mouse está dentro de la columna actual y
            no es la columna que se está arrastrando
          */
          this.swapColumnPosition(item, dragDirection, shiftDirection);
          targetOrder = columnOrder;
        } else if (position < item.rect.left && columnOrder < sourceOrder) {
          /*
            La posicion actual del mouse está a la izquierda de la columna actual
            haciendo que la columna arrastrada cruce la actual.
          */
          this.swapColumnPosition(item, dragDirection, shiftDirection);

          if (!targetOrder || columnOrder < targetOrder) {
            targetOrder = columnOrder;
          }
        } else if (position > item.rect.right && columnOrder > sourceOrder) {
          /*
            La posicion actual del mouse está a la derecha de la columna actual
            haciendo que la columna arrastrada cruce la actual.
          */
          this.swapColumnPosition(item, dragDirection, shiftDirection);

          if (!targetOrder || columnOrder > targetOrder) {
            targetOrder = columnOrder;
          }
        } else if (columnOrder !== sourceOrder) {
          /*
            La posicion actual del mouse NO está dentro de la columna actual ni
            la cruza.
          */
          this.resetColumnPosition(item);
        }
      });

    this.column.order = targetOrder ? targetOrder : this.column.column.order;

    targetOrderChanged = targetOrder !== this.lastTargetOrder;
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

  private swapColumnPosition(
    column: ChGridManagerColumnDragItem,
    dragDirection: number,
    shiftDirection: number
  ) {
    // desplazo la columna actual para ocupar el espacio que dejó
    // la columna arrastrada
    column.translateX = this.column.rect.width * shiftDirection;

    // actualizo el orden de la columna actual
    column.order = column.column.order + shiftDirection;

    // desplazo la columna que se está arrastrando para que ocupe el
    // espacio que dejó la columna actual
    this.column.translateX += column.rect.width * dragDirection;
  }

  private resetColumnPosition(column: ChGridManagerColumnDragItem) {
    // no desplazo la columna actual
    column.translateX = 0;

    // asigno su posición original
    column.order = column.column.order;
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
