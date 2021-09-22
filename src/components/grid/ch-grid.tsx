import {
  Component,
  Host,
  h,
  Element,
  State,
  Event,
  EventEmitter,
  Listen,
} from "@stencil/core";
import { ChGridColumn } from "../grid-column/ch-grid-column";
import { ChGridRow } from "../grid-row/ch-grid-row";

@Component({
  tag: "ch-grid",
  styleUrl: "ch-grid.scss",
  shadow: true,
})
export class ChGrid {
  @Element() el: HTMLChGridElement;

  private _actionGroup;
  private _section;
  private _chGridColumns;
  private _chGridColumIndentedIndex: number = undefined;
  @State() selectedChRow: ChGridRow = null;
  @State() rowWithHover: ChGridRow = null;

  @Event() passEventToMenu: EventEmitter;

  componentDidLoad() {
    this.init();

    this.passEventToMenu.emit("pass event to menu");
  }

  @Listen("toggledColumn")
  toggledColumnHandler(event: CustomEvent) {
    console.log("Received the toggledColumn event: ", event.detail);
    const toggledColumnId = event.detail["column-id"];
    const toggledColumnHidden = event.detail["hidden"];
    const chGridColumnset = this.el.querySelector("ch-grid-columnset");
    const toggledCol = chGridColumnset.querySelector(`#${toggledColumnId}`);
    if (toggledColumnHidden) {
      ((toggledCol as unknown) as ChGridColumn).hidden = true;
    } else {
      ((toggledCol as unknown) as ChGridColumn).hidden = false;
    }
    this.setHideableColsOnMenu();
    this.hideCols();
  }

  init() {
    console.log("init");
    const chgrid = this.el;
    const chgridSection = this.el.shadowRoot.querySelector("section");
    this._chGridColumns = this.el.querySelectorAll("ch-grid-column");

    this.getColumnWithIndentationIndex();
    this.evaluateRowsetLevel();

    chgrid.addEventListener("click", this.onClick.bind(this));
    chgridSection.addEventListener("mousemove", this.onHover.bind(this), {
      passive: true,
    });
    chgridSection.addEventListener("scroll", this.onScroll, { passive: true });

    this._section = this.el.shadowRoot.querySelector("section");
    this._actionGroup = document.querySelector("ch-grid-ag");
    if (this._actionGroup) {
      chgrid.addEventListener("mouseover", this.actionPosition.bind(this));
    }

    this.setHideableColsOnMenu();
    this.hideCols();
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

    if (this._chGridColumIndentedIndex !== undefined) {
      const secondGridCellsInsideRowSet = document.querySelectorAll(
        `ch-grid-row > ch-grid-rowset ch-grid-cell:nth-child(${this._chGridColumIndentedIndex})`
      );
      secondGridCellsInsideRowSet.forEach((secondGridCellInsideRowSet) => {
        secondGridCellInsideRowSet.classList.add("nested");
      });
    }
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
        gridTemplateColumns += column.size + " ";
      }
    });
    (this
      ._section as HTMLElement).style.gridTemplateColumns = gridTemplateColumns;
  }

  setHideableColsOnMenu() {
    /*
    This method saves on ch-grid-store.ts the hideable and hidden cols, and then
    this is information is used on ch-grid-menu.tsx to display the hideable columns on the menu
    */
    let hidenColumns = [];
    this._chGridColumns.forEach((column) => {
      if (column.hideable) {
        let colInfo = {
          colId: null,
          colDesciption: null,
          hidden: false,
        };
        colInfo.colId = (column as ChGridColumn).colId;
        colInfo.colDesciption = (column as HTMLElement).innerHTML;
        colInfo.hidden = (column as ChGridColumn).hidden;
        hidenColumns.push(colInfo);
      }
    });
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

  render() {
    return (
      <Host>
        <slot name="header"></slot>
        <section>
          <slot></slot>
        </section>
        <aside>
          <slot name="row-hover"></slot>
        </aside>
        <slot name="footer"></slot>
      </Host>
    );
  }
}
