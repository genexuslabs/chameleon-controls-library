import { ChGridManager } from "./ch-grid-manager";

export class ChGridManagerColumnResize {
  private manager: ChGridManager;
  private column: HTMLChGridColumnElement;
  private columnWidthStart: number;
  private columnSizeStart: CssValue;
  private columnAfter: HTMLChGridColumnElement;
  private columnAfterWidthStart: number;
  private columnAfterSizeStart: CssValue;
  private dragDirection: number;
  private resizingFn: (deltaWidth: number) => void;
  private resizeEndFn: () => void;

  constructor(manager: ChGridManager, columnId: string, isRTL: boolean) {
    this.manager = manager;
    this.dragDirection = isRTL ? -1 : 1;

    if (this.manager.grid.columnResizeMode === "splitter") {
      this.resizingFn = this.resizingSplitter;
      this.resizeEndFn = this.resizeEndSplitter;
    } else {
      this.resizingFn = this.resizingSingle;
      this.resizeEndFn = null;
    }

    this.column = this.manager.columns.getColumn(columnId);
    this.columnWidthStart = this.column.getBoundingClientRect().width;
    this.columnSizeStart = this.parseCSSValue(this.column.size);

    this.columnAfter = this.manager.getNextColumn(this.column);
    this.columnAfterWidthStart =
      this.columnAfter?.getBoundingClientRect().width;
    this.columnAfterSizeStart = this.parseCSSValue(this.columnAfter.size);
  }

  resizing(deltaWidth: number) {
    this.resizingFn(deltaWidth);
  }

  resizeEnd() {
    if (this.resizeEndFn) {
      this.resizeEndFn();
    }
  }

  private resizingSingle = (deltaWidth: number) => {
    const columnWidth = this.columnWidthStart - deltaWidth * this.dragDirection;
    if (columnWidth >= 0) {
      this.column.size = `minmax(min-content, ${columnWidth}px)`;
    }
  };

  private resizingSplitter = (deltaWidth: number) => {
    const columnWidth = this.columnWidthStart - deltaWidth * this.dragDirection;
    if (columnWidth >= 0) {
      if (this.columnSizeStart) {
        this.column.size = this.convertUnit(
          this.columnSizeStart,
          this.columnWidthStart,
          columnWidth
        );
      } else {
        this.column.size = `minmax(min-content, ${columnWidth}px)`;
      }
    }

    if (this.columnAfter) {
      const columnAfterWidth =
        this.columnAfterWidthStart + deltaWidth * this.dragDirection;
      if (columnAfterWidth >= 0) {
        if (this.columnAfterSizeStart) {
          this.columnAfter.size = this.convertUnit(
            this.columnAfterSizeStart,
            this.columnAfterWidthStart,
            columnAfterWidth
          );
        } else {
          this.columnAfter.size = `minmax(min-content, ${columnAfterWidth}px)`;
        }
      }
    }
  };

  private resizeEndSplitter() {
    const columnWidthEnd = this.column.getBoundingClientRect().width;
    this.column.size = this.convertUnit(
      this.columnSizeStart,
      this.columnWidthStart,
      columnWidthEnd
    );

    if (this.columnAfter) {
      const columnAfterWidthEnd =
        this.columnAfterWidthStart - (columnWidthEnd - this.columnWidthStart);
      this.columnAfter.size = this.convertUnit(
        this.columnSizeStart,
        this.columnWidthStart,
        columnAfterWidthEnd
      );
    }
  }

  private parseCSSValue(cssValue: string): CssValue {
    const match = cssValue.match(/([+-]?[\d.]+)([\w%]+)/);
    if (match) {
      const number = parseFloat(match[1]);
      const unit = match[2];
      return { number, unit };
    } else {
      return null;
    }
  }

  private convertUnit(
    startSize: CssValue,
    startWidth: number,
    newWidth: number
  ): string {
    return `${(newWidth * startSize.number) / startWidth}${startSize.unit}`;
  }
}

type CssValue = {
  number: number;
  unit: string;
};
