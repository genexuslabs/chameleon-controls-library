import {
  Component,
  Host,
  h,
  getAssetPath,
  Element,
  State,
  Event,
  EventEmitter,
  Listen,
  Prop,
} from "@stencil/core";
import { ChGridColumn } from "../grid-column/ch-grid-column";
import { ChGridRow } from "../grid-row/ch-grid-row";

@Component({
  tag: "ch-grid",
  styleUrl: "ch-grid.scss",
  shadow: true,
  assetsDirs: ["ch-grid-assets"],
})
export class ChGrid {
  @Element() el: HTMLChGridElement;

  private _actionGroup;
  private _section;
  private _chGridColumns;
  private _chGridColumIndentedIndex: number = undefined;
  @State() selectedChRow: ChGridRow = null;
  @State() rowWithHover: ChGridRow = null;
  @Prop() hideableCols: Array<Object> = []; //This prop is for internal use.
  @Prop() freezedCols: Array<Object> = []; //This prop is for internal use.
  @Prop() colsOrder: Array<ChGridColumn> = []; //This prop is for internal use.

  @Event() emitHideableCols: EventEmitter;
  @Event() emitFreezedCols: EventEmitter;
  @Event() emitColsOrder: EventEmitter;

  componentWillLoad() {}

  componentDidLoad() {
    this.init();
  }

  @Listen("toggledColumn")
  toggledColumnHandler(event: CustomEvent) {
    const toggledColumnId = event.detail["column-id"];
    const toggledColumnHidden = event.detail["hidden"];
    const chGridColumnset = this.el.querySelector("ch-grid-columnset");
    const toggledCol = chGridColumnset.querySelector(
      "[col-id='" + toggledColumnId + "']"
    );
    if (toggledColumnHidden) {
      ((toggledCol as unknown) as ChGridColumn).hidden = true;
    } else {
      ((toggledCol as unknown) as ChGridColumn).hidden = false;
    }
    this.setHideableCols();
    this.hideCols();
  }

  init() {
    const chgrid = this.el;
    const chgridSection = this.el.shadowRoot.querySelector("section");

    //chgrid.addEventListener("click", this.onClick.bind(this));
    chgridSection.addEventListener("mousemove", this.onHover.bind(this), {
      passive: true,
    });
    chgridSection.addEventListener("scroll", this.onScroll, { passive: true });

    this._section = this.el.shadowRoot.querySelector("section");
    this._actionGroup = document.querySelector("ch-grid-ag");
    if (this._actionGroup) {
      chgrid.addEventListener("mouseover", this.actionPosition.bind(this));
    }
    this.evaluateRowsetLevel();
    this.insertToggleColumn();
    this._chGridColumns = this.el.querySelectorAll("ch-grid-column"); //This assignment has to be after this.insertToggleColumn();
    this.getColumnWithIndentationIndex(); //This method has to be after this._chGridColumns = this.el.querySelectorAll("ch-grid-column"); assignment
    this.setNestedChGridCells();
    this.setHideableCols();
    this.hideCols();
    this.setFreezedCols();
  }

  setNestedChGridCells() {
    if (this._chGridColumIndentedIndex !== undefined) {
      const secondGridCellsInsideRowSet = document.querySelectorAll(
        `ch-grid-row > ch-grid-rowset ch-grid-cell:nth-child(${this._chGridColumIndentedIndex})`
      );
      secondGridCellsInsideRowSet.forEach((secondGridCellInsideRowSet) => {
        secondGridCellInsideRowSet.classList.add("nested");
      });
    }
  }

  insertToggleColumn() {
    /*This method inserts the first column whith a toggle icon, which purpose is to toggle the rows that have children*/
    //First insert a ch-grid-column inside the ch-grid-columnset
    const chGridColumnset = this.el.querySelector("ch-grid-columnset");
    const chGridColumn = document.createElement("ch-grid-column");
    chGridColumn.setAttribute("show-options", "false");
    chGridColumn.setAttribute("id", "toggleRow");
    chGridColumn.setAttribute("size", "min-content");
    chGridColumnset.prepend(chGridColumn);
    //Then insert the grid-cell with a toggle button as the first child inside every ch-grid-row
    const chGridRows = this.el.querySelectorAll("ch-grid-row");
    chGridRows.forEach((row) => {
      const chGridCell = document.createElement("ch-grid-cell");
      if (row.classList.contains("expanded")) {
        chGridCell.classList.add("toggle-row--expanded");
      }
      if (row.classList.contains("has-childs")) {
        const toggleIcon = document.createElement("ch-icon");
        toggleIcon.setAttribute(
          "src",
          getAssetPath(`./ch-grid-assets/chevron-down.svg`)
        );
        chGridCell.append(toggleIcon);
        chGridCell.addEventListener(
          "click",
          function (e) {
            const chGridRow = e.srcElement.parentElement.parentElement;
            //toggle row
            if (chGridRow.classList.contains("expanded")) {
              chGridCell.classList.remove("toggle-row--expanded");
              chGridRow.classList.remove("expanded");
            } else {
              chGridRow.classList.add("expanded");
              chGridCell.classList.add("toggle-row--expanded");
            }
          }.bind(this)
        );
      }
      row.prepend(chGridCell);
    });
  }

  getColumnWithIndentationIndex() {
    for (let i = 0; i < this._chGridColumns.length; i++) {
      if ((this._chGridColumns[i] as HTMLElement).hasAttribute("indent")) {
        this._chGridColumIndentedIndex = ++i;
        break;
      }
    }
  }

  onHover(eventInfo) {
    const row = eventInfo.composedPath().find((element) => {
      if (element.tagName === "CH-GRID-ROW") {
        return element;
      } else {
        return false;
      }
    });

    if (row) {
      if (!row.classList.contains("hover")) {
        if (this.rowWithHover !== null) {
          ((this.rowWithHover as unknown) as HTMLElement).classList.remove(
            "hover"
          );
        }
        row.classList.add("hover");
        this.rowWithHover = row;
      }
    } else {
      if (this.rowWithHover !== null) {
        ((this.rowWithHover as unknown) as HTMLElement).classList.remove(
          "hover"
        );
      }
    }
  }

  onClick(eventInfo) {
    const row = eventInfo.composedPath().find((element) => {
      if (element.tagName === "CH-GRID-ROW") {
        return element;
      } else {
        return false;
      }
    });

    if (row) {
      if (this.selectedChRow !== null) {
        ((this.selectedChRow as unknown) as HTMLElement).classList.remove(
          "selected"
        );
      }
      row.classList.add("selected");
      this.selectedChRow = row;

      if (row.classList.contains("has-childs")) {
        row.classList.toggle("expanded");
      }
    }
  }

  onScroll(eventInfo) {
    eventInfo.target.style.setProperty(
      "--scrollH",
      eventInfo.target.scrollLeft + "px"
    );
  }

  evaluateRowsetLevel() {
    const rowsets = document.querySelectorAll("ch-grid-rowset");

    rowsets.forEach((rowset) => {
      if (rowset.parentElement.tagName == "CH-GRID-ROW") {
        rowset.parentElement.classList.add("has-childs");
        rowset.parentElement.classList.add("expanded");
      }
      if (rowset.parentElement.tagName == "CH-GRID") {
        (rowset as HTMLElement).style.setProperty("--level", "0");
      } else {
        const parentLevel = parseInt(
          rowset.parentElement.parentElement.style.getPropertyValue("--level")
        );
        (rowset as HTMLElement).style.setProperty(
          "--level",
          (parentLevel + 1).toString()
        );
      }
    });
  }

  actionPosition(eventInfo) {
    const target = eventInfo.composedPath().find((element) => {
      if (element.tagName) {
        return (
          element.tagName == "CH-GRID-ROW" || element.tagName == "CH-GRID-AG"
        );
      } else {
        return false;
      }
    });
    if (target) {
      if (target.tagName == "CH-GRID-ROW") {
        const cell = target.querySelector(":scope > ch-grid-cell:nth-child(2)");
        this._actionGroup.removeAttribute("hidden");
        this._actionGroup.style.top = `${
          cell.offsetTop - this._section.scrollTop
        }px`;
      }
    } else {
      this._actionGroup.setAttribute("hidden", "hidden");
    }
  }

  setGridTemplateColumns() {
    let gridTemplateColumns = "";
    let atLeastOneColIsHidden = false;
    this._chGridColumns.forEach((column) => {
      const colHidden = (column as ChGridColumn).hidden;
      if (!colHidden) {
        gridTemplateColumns += column.size + " ";
      } else {
        atLeastOneColIsHidden = true;
      }
    });
    /*If at least one col is hidden, set last visibile col size to "minmax(max-content,auto)"
    to prevent empty space at the end of the grid.*/
    if (atLeastOneColIsHidden) {
      const gridTemplateColumnsArray = gridTemplateColumns.trim().split(" ");
      gridTemplateColumnsArray.pop();
      gridTemplateColumnsArray.push("minmax(max-content,auto)");
      gridTemplateColumns = gridTemplateColumnsArray.join(" ");
    }
    (this
      ._section as HTMLElement).style.gridTemplateColumns = gridTemplateColumns;
  }

  setHideableCols() {
    this.hideableCols = [];
    this._chGridColumns.forEach((column) => {
      if (column.hideable) {
        let colInfo = {
          colId: (column as ChGridColumn).colId,
          colDesciption: (column as HTMLElement).innerHTML,
          hidden: (column as ChGridColumn).hidden,
        };
        this.hideableCols.push(colInfo);
      }
    });
    this.emitHideableCols.emit();
  }

  hideCols() {
    let hiddenCols = [];
    this._chGridColumns.forEach((column, i) => {
      if (column.hideable && column.hidden) {
        hiddenCols[i] = true;
      } else {
        hiddenCols[i] = false;
      }
    });

    //Hide/Show Columns
    this._chGridColumns.forEach((col, i) => {
      if (hiddenCols[i] === true) {
        (col as HTMLElement).classList.add("hidden");
      } else {
        (col as HTMLElement).classList.remove("hidden");
      }
    });

    //Hide/Show Row Cells
    const rows = this.el.querySelectorAll("ch-grid-row");
    rows.forEach((row) => {
      const rowCells = row.querySelectorAll(":scope > ch-grid-cell");
      rowCells.forEach((cell, i) => {
        if (hiddenCols[i] === true) {
          (cell as HTMLElement).classList.add("hidden");
        } else {
          (cell as HTMLElement).classList.remove("hidden");
        }
      });
    });

    //Redefine section grid-template-columns value
    this.setGridTemplateColumns();

    //Redefine ch-grid-rowset-legend "grid-column-end" value
    let rowSetsLegend = [];
    let visibleCols = this._chGridColumns.length;
    this._chGridColumns.forEach((col) => {
      if (col.hideable && col.hidden) {
        visibleCols--;
      }
    });
    const rowSets = this.el.querySelectorAll("ch-grid-rowset");
    if (rowSets.length > 0) {
      rowSets.forEach((rowSet) => {
        const rowSetLegend = rowSet.querySelector(
          ":scope > ch-grid-rowset-legend"
        );
        if (rowSetLegend) {
          rowSetsLegend.push(rowSetLegend);
        }
      });
    }
    if (rowSetsLegend.length > 0) {
      rowSetsLegend.forEach((rowSetLegend) => {
        (rowSetLegend as HTMLElement).style.gridColumnEnd = (
          visibleCols + 1
        ).toString();
      });
    }
    this.setGridColumnsOrder();
    this.setGridCellsOrder();
  }

  clearFreezedCols() {
    //Clear freezed cols
    this._chGridColumns.forEach((col) => {
      if (col.classList.contains("freezed")) {
        col.classList.remove("freezed");
      }
    });
    //Clear freezed cells
    const chGridRows = this.el.querySelectorAll("ch-grid-row");
    chGridRows.forEach((row) => {
      const rowCells = row.querySelectorAll(":scope > ch-grid-cell");
      for (let i = 0; i <= rowCells.length; i++) {
        if (rowCells[i].classList.contains("freezed")) {
          rowCells[i].classList.remove("freezed");
          if (rowCells[i].classList.contains("last-freezed-col")) {
            rowCells[i].classList.remove("last-freezed-col");
          }
        } else {
          break;
        }
      }
    });
  }

  setFreezedCols() {
    this.clearFreezedCols();
    let lastFreezedColIndex: number = null;
    this.freezedCols = [];
    this._chGridColumns.forEach((col, i) => {
      //Determine the last freezed col
      //(The last col should not be freezed)
      if (i !== this._chGridColumns.length - 1) {
        let colIsfreezed = (col as ChGridColumn).freezed;
        if (colIsfreezed) {
          lastFreezedColIndex = i;
        }
      }
    });

    if (lastFreezedColIndex !== null) {
      //At least one column is freezed. Freeze all columns, up to the last freezed column.
      for (let i = 0; i <= lastFreezedColIndex; i++) {
        this._chGridColumns[i].classList.add("freezed");
        this.freezedCols.push((this._chGridColumns[i] as ChGridColumn).colId);
      }
      //Then freeze the cells
      const chGridRows = this.el.querySelectorAll("ch-grid-row");
      chGridRows.forEach((row) => {
        const rowCells = row.querySelectorAll(":scope > ch-grid-cell");
        for (let i = 0; i <= lastFreezedColIndex; i++) {
          rowCells[i].classList.add("freezed");
          if (i === lastFreezedColIndex) {
            rowCells[i].classList.add("last-freezed-col");
          }
        }
      });
    }
    this.emitFreezedCols.emit();
  }

  setGridColumnsOrder() {
    this.colsOrder = [];
    let i = 1;
    let firstCol = true;
    this._chGridColumns.forEach((col) => {
      const colHidden = (col as HTMLElement).classList.contains("hidden");
      if (!colHidden) {
        (col as HTMLElement).style.gridColumn = i.toString();
        if (!firstCol) {
          //first col is "#toggleRow". Do not take into account.
          this.colsOrder.push(col);
        }
        firstCol = false;
        i++;
      } else {
        (col as HTMLElement).style.gridColumn = null;
      }
    });
    this.emitColsOrder.emit();
  }
  setGridCellsOrder() {
    const rows = this.el.querySelectorAll("ch-grid-row");
    rows.forEach((row) => {
      const rowCells = row.querySelectorAll(":scope > ch-grid-cell");
      let i = 1;
      rowCells.forEach((cell) => {
        const cellHidden = cell.classList.contains("hidden");
        if (!cellHidden) {
          (cell as HTMLElement).style.gridColumn = i.toString();
          i++;
        } else {
          (cell as HTMLElement).style.gridColumn = null;
        }
      });
    });
  }

  @Listen("unfreezeColumn")
  unfreezeColumnHandler() {
    this.setFreezedCols();
  }
  @Listen("freezeColumn")
  freezeColumnHandler() {
    this.setFreezedCols();
  }
  @Listen("moveCol")
  moveColHandler(e) {
    const movingColId = e.detail["column-id"];
    const moveDirection = e.detail["move-direction"];

    // let movingColGridColumnValue = undefined;
    // const columns = this.el.querySelector("ch-grid-columnset").querySelectorAll(":scope > ch-grid-column");
    // let movingCol = undefined;
    // for (let i = 0; i < columns.length; i++) {
    //   //get a reference to the moving
    //   const colId = columns[i].getAttribute("col-id");
    //   if(colId === movingColId) {
    //     movingCol = columns[i];
    //     movingColGridColumnValue = (movingCol as HTMLElement).style.gridColumn;
    //     break;
    //   }
    // }
    // if(movingCol){
    //   //get a reference to the previous and next col
    //   let prevCol = undefined;
    //   let next = undefined;
    //   for (let i = 0; i < columns.length; i++) {
    //     const colGridColumnValue = (columns[i] as HTMLElement).style.gridColumn;
    //     if(colGridColumnValue === movingColGridColumnValue);
    //   }
    //   if(moveDirection === "left") {
    //     //moving direction left

    //   } else {
    //     //moving direction right
    //   }
    // }
  }

  render() {
    return (
      <Host>
        <slot name="header"></slot>
        <section>
          <slot data-chGrid={this.el}></slot>
        </section>
        <aside>
          <slot name="row-hover"></slot>
        </aside>
        <slot name="footer"></slot>
      </Host>
    );
  }
}
