import { CSSProperties } from "./tabular-grid-types";

export class TabularGridManagerColumnDrag {
  private column: TabularGridManagerColumnDragItem;
  private columns: TabularGridManagerColumnDragItem[];
  private isRTL: boolean;
  private lastTargetOrder = 0;

  constructor(
    columnId: string,
    columns: HTMLChTabularGridColumnElement[],
    isRTL: boolean
  ) {
    this.isRTL = isRTL;
    this.columns = columns.map(column => ({
      element: column,
      rect: column.getBoundingClientRect(),
      translateX: 0,
      order: column.order
    }));
    this.column = this.columns.find(item => item.element.columnId === columnId);

    this.columns.forEach(this.setColumnHiddenRect.bind(this));
  }

  dragging(position: number): boolean {
    /**
     * Indica el orden inicial de la columna que se está arrastrando
     */
    const sourceOrder = this.column.element.order;

    /**
     * Indica a qué grupo de fijación pertenece la columna que se está arrastrando
     */
    const sourceFreeze = this.column.element.freeze;

    let targetOrder = 0;
    let targetOrderChanged = false;

    this.column.translateX = 0;
    this.columns
      .filter(column => column.element.freeze === sourceFreeze)
      .forEach(column => {
        /**
         * Indica el orden de la columna actual
         */
        const columnOrder = column.element.order;

        /**
         * Indica si la columna que se está arrastrando estaba a la derecha o
         * a la izquierda de la actual cuando se inició el arrastre para
         * incrementar el orden según corresponda.
         */
        const dragDirection = sourceOrder > columnOrder ? 1 : -1;

        /**
         * Indica si la columna actual hay que desplazarla a la derecha o
         * a la izquierda cuando se cruce con la columna arrastrada.
         */
        const shiftDirection =
          (sourceOrder > columnOrder ? 1 : -1) * (this.isRTL ? -1 : 1);

        if (
          column.rect.left < position &&
          position < column.rect.right &&
          columnOrder !== sourceOrder
        ) {
          /*
            La posicion actual del mouse está dentro de la columna actual y
            no es la columna que se está arrastrando
          */
          this.swapColumnPosition(column, shiftDirection);

          // actualizo el orden de la columna actual
          column.order = column.element.order + dragDirection;

          targetOrder = columnOrder;
        } else if (
          position < column.rect.left &&
          (this.isRTL ? columnOrder > sourceOrder : columnOrder < sourceOrder)
        ) {
          /*
            La posicion actual del mouse está a la izquierda de la columna actual
            haciendo que la columna arrastrada cruce la actual.
          */
          this.swapColumnPosition(column, shiftDirection);

          // actualizo el orden de la columna actual
          column.order = column.element.order + dragDirection;

          if (
            !targetOrder ||
            (this.isRTL ? columnOrder > targetOrder : columnOrder < targetOrder)
          ) {
            targetOrder = columnOrder;
          }
        } else if (
          position > column.rect.right &&
          (this.isRTL ? columnOrder < sourceOrder : columnOrder > sourceOrder)
        ) {
          /*
            La posicion actual del mouse está a la derecha de la columna actual
            haciendo que la columna arrastrada cruce la actual.
          */
          this.swapColumnPosition(column, shiftDirection);

          // actualizo el orden de la columna actual
          column.order = column.element.order + dragDirection;

          if (
            !targetOrder ||
            (this.isRTL ? columnOrder < targetOrder : columnOrder > targetOrder)
          ) {
            targetOrder = columnOrder;
          }
        } else if (columnOrder !== sourceOrder) {
          /*
            La posicion actual del mouse NO está dentro de la columna actual ni
            la cruza.
          */
          this.resetColumnPosition(column);
        }
      });

    this.column.order = targetOrder ? targetOrder : this.column.element.order;

    targetOrderChanged = targetOrder !== this.lastTargetOrder;
    this.lastTargetOrder = targetOrder;

    return targetOrderChanged;
  }

  dragEnd() {
    this.columns.forEach(column => {
      column.element.order = column.order;
      column.translateX = 0;
    });
  }

  getColumnStyle(column: HTMLChTabularGridColumnElement): CSSProperties {
    return {
      [`--ch-tabular-grid-column-${column.physicalOrder}-transform`]: `translateX(${
        this.columns.find(columnItem => columnItem.element === column)
          .translateX
      }px)`
    };
  }

  getColumnsFirstLast(): {
    columnFirst: HTMLChTabularGridColumnElement;
    columnLast: HTMLChTabularGridColumnElement;
  } {
    let itemFirst: TabularGridManagerColumnDragItem;
    let itemLast: TabularGridManagerColumnDragItem;

    this.columns.forEach(item => {
      if (
        !item.element.hidden &&
        (!itemFirst || item.order < itemFirst.order)
      ) {
        itemFirst = item;
      }
      if (!item.element.hidden && (!itemLast || item.order > itemLast.order)) {
        itemLast = item;
      }
    });

    return {
      columnFirst: itemFirst.element,
      columnLast: itemLast.element
    };
  }

  private swapColumnPosition(
    column: TabularGridManagerColumnDragItem,
    shiftDirection: number
  ) {
    // desplazo la columna actual para ocupar el espacio que dejó
    // la columna arrastrada
    column.translateX = this.column.rect.width * shiftDirection;

    // desplazo la columna que se está arrastrando para que ocupe el
    // espacio que dejó la columna actual
    this.column.translateX += column.rect.width * (shiftDirection * -1);
  }

  private resetColumnPosition(column: TabularGridManagerColumnDragItem) {
    // no desplazo la columna actual
    column.translateX = 0;

    // asigno su posición original
    column.order = column.element.order;
  }

  private setColumnHiddenRect(column: TabularGridManagerColumnDragItem) {
    if (column.element.hidden) {
      const columnSibling =
        this.getPreviousSiblingVisible(column) ||
        this.getNextSiblingVisible(column);

      column.rect = new DOMRect(
        column.element.order < columnSibling.element.order
          ? columnSibling.rect.left
          : columnSibling.rect.right,
        columnSibling.rect.y,
        0,
        columnSibling.rect.height
      );
    }
  }

  private getPreviousSiblingVisible(
    hidden: TabularGridManagerColumnDragItem
  ): TabularGridManagerColumnDragItem {
    let previous: TabularGridManagerColumnDragItem;

    this.columns.forEach(column => {
      if (
        !column.element.hidden &&
        column.element.order < hidden.element.order &&
        (!previous || column.element.order > previous.element.order)
      ) {
        previous = column;
      }
    });

    return previous;
  }

  private getNextSiblingVisible(
    hidden: TabularGridManagerColumnDragItem
  ): TabularGridManagerColumnDragItem {
    let next: TabularGridManagerColumnDragItem;

    this.columns.forEach(column => {
      if (
        !column.element.hidden &&
        column.element.order > hidden.element.order &&
        (!next || column.element.order < next.element.order)
      ) {
        next = column;
      }
    });

    return next;
  }
}

interface TabularGridManagerColumnDragItem {
  element: HTMLChTabularGridColumnElement;
  rect: DOMRect;
  translateX: number;
  order: number;
}
