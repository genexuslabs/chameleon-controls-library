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

  @Event() emitHideableCols: EventEmitter;
  @Event() emitFreezedCols: EventEmitter;

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
    this._chGridColumns.forEach((column) => {
      const colHidden = (column as ChGridColumn).hidden;
      if (!colHidden) {
        gridTemplateColumns += " " + column.size + " ";
      }
    });
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
  }

  setFreezedCols() {
    this.freezedCols = [];
    let atLeastFirstColIsFreezed = false;
    this._chGridColumns.forEach((col, i) => {
      if (i !== 0) {
        //col index 0 is the toggleRow. Do not take into account.
        const colId = (col as ChGridColumn).colId;
        let freezed = (col as ChGridColumn).freezed;
        if (freezed && i === 1) {
          atLeastFirstColIsFreezed = true;
        }
        if (this.freezedCols.length > 0 && i > 1) {
          /*A column can only be freezed if previous sibling column is also freezed
          (and previous column is not toggleRow -> i > 1). */
          const prevColumnIsFreezed = this.freezedCols[i - 2][
            Object.keys(this.freezedCols[i - 2])[0]
          ];
          if (!prevColumnIsFreezed) {
            freezed = false;
          }
        }
        this.freezedCols.push({
          [colId]: freezed,
          cellColumnIndex: i,
        });
      }
    });

    console.log(this.freezedCols);

    if (atLeastFirstColIsFreezed) {
      //freeze toggleRowCol
      this._chGridColumns[0].classList.add("freezed");
      //freeze columns
      for (let i = 0; i < this._chGridColumns.length; i++) {
        if (i !== 0) {
          //col index 0 is the toggleRow. Do not take into account.
          const colIsFreezed = this.freezedCols[i - 1][
            Object.keys(this.freezedCols[i - 1])[0]
          ];
          if (colIsFreezed) {
            this._chGridColumns[i].classList.add("freezed");
          } else {
            this._chGridColumns[i].classList.remove("freezed");
          }
        }
      }
      //freeze row cells
      const chGridRows = this.el.querySelectorAll("ch-grid-row");
      chGridRows.forEach((row) => {
        //console.log(row);
        const rowCells = row.querySelectorAll(":scope > ch-grid-cell");
        //Freeze toggleRowCell
        rowCells[0].classList.add("freezed");
        //Freeze cells
        for (let i = 1; i < rowCells.length; i++) {
          let cellIsFreezed = this.freezedCols[i - 1];
          cellIsFreezed = cellIsFreezed[Object.keys(cellIsFreezed)[0]];
          if (cellIsFreezed) {
            rowCells[i].classList.add("freezed");
          } else {
            rowCells[i].classList.remove("freezed");
          }
        }
      });
    }
    this.emitFreezedCols.emit();
  }

  @Listen("unfreezeColumn")
  unfreezeColumnHandler() {
    this.setFreezedCols();
  }
  @Listen("freezeColumn")
  freezeColumnHandler() {
    this.setFreezedCols();
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
