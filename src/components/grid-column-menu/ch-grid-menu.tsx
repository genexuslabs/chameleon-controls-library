import {
  Component,
  Host,
  h,
  Prop,
  getAssetPath,
  Element,
  Event,
  EventEmitter,
} from "@stencil/core";
import { ChGridColumn } from "../grid-column/ch-grid-column";

@Component({
  tag: "ch-grid-menu",
  styleUrl: "ch-grid-menu.scss",
  shadow: true,
  assetsDirs: ["ch-grid-column-menu-assets"],
})
export class ChGridMenu {
  @Element() el: HTMLChGridMenuElement;
  startDate!: HTMLInputElement;
  endDate!: HTMLInputElement;

  /*******************
  PROPS
  ********************/

  /**
   * The columnd id
   */
  @Prop() colId: string = "";

  /**
   * The column data type
   */
  @Prop() colType: ColType = undefined;

  /**
   * The presence of this atribute displays a filter on the menu
   */
  @Prop() filterable: boolean = false;

  /**
   * The presence of this atribute displays an option to sort the column
   */
  @Prop() sortable: boolean = true;

  /**
   * If true, it shows the menu
   */
  @Prop() showMenu: boolean = false;

  /**
   * An array containing information about the hideable columns
   */
  @Prop() hideableCols: Array<Object> = [];

  /**
   * An array containing information about the freezed columns
   */
  @Prop() freezedCols: Array<Object> = [];

  /**
   * Whether this menu belongs to the last column
   */
  @Prop() lastCol: boolean = false;

  /**
   * Information about the columns order
   */
  @Prop() colsOrder: Array<ChGridColumn> = [];

  /*******************
  STATE
  ********************/

  /*******************
  EVENTS
  ********************/

  /**
   * Emmits the sorting event
   */
  @Event() sortChanged: EventEmitter;

  /**
   * Emmits the hideMenu event
   */
  @Event() hideMenu: EventEmitter;

  /**
   * Emmits the "freeze column" event
   */
  @Event() freezeColumn: EventEmitter;

  /**
   * Emmits the "unfreeze column" event
   */
  @Event() unfreezeColumn: EventEmitter;

  /**
   * Emmits toggled column (hidden/visible)
   */
  @Event() toggledColumn: EventEmitter;

  /**
   * Emmits the dateRangeChanged event
   */
  @Event() dateRangeChanged: EventEmitter;

  /**
   * Emmits the move column event
   */
  @Event() moveCol: EventEmitter;

  /*******************
  FUNCTIONS/METHODS
  ********************/

  componentWillLoad() {}

  componentDidLoad() {}

  sortChangedFunc(order) {
    this.sortChanged.emit({
      "column-id": this.colId,
      "sort order": order,
    });
    this.hideMenu.emit();
  }

  dateRangeChangedFunc() {
    this.dateRangeChanged.emit({
      "column-id": this.colId,
      "start-date": this.startDate.value,
      "end-date": this.endDate.value,
    });
  }

  filter() {
    let returnedContent = [<span class="menu__title">Filter</span>];
    switch (this.colType) {
      case "string":
        returnedContent.push(
          <ch-grid-input-text col-id={this.colId}></ch-grid-input-text>
        );
        break;
      case "number":
        returnedContent.push(<div>number filter</div>);
        break;
      case "date":
        function formatDate(date) {
          var d = new Date(date),
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

          if (month.length < 2) month = "0" + month;
          if (day.length < 2) day = "0" + day;

          return [year, month, day].join("-");
        }
        let today = formatDate(new Date());
        returnedContent.push([
          <span class="menu__subtitle">from:</span>,
          <input
            type="date"
            value={today}
            id="start"
            onChange={this.dateRangeChangedFunc.bind(this)}
            ref={(el) => (this.startDate = el as HTMLInputElement)}
          ></input>,
          <span class="menu__subtitle">to:</span>,
          <input
            type="date"
            value={today}
            id="end"
            onChange={this.dateRangeChangedFunc.bind(this)}
            ref={(el) => (this.endDate = el as HTMLInputElement)}
          ></input>,
        ]);
        break;
      case "date-time":
        return null; //This type of data has no filter at the time of writting.
      case "boolean":
        returnedContent.push(
          <ch-grid-select col-id={this.colId}>
            <ch-grid-select-option>True/False</ch-grid-select-option>
            <ch-grid-select-option>Only True</ch-grid-select-option>
            <ch-grid-select-option>Only False</ch-grid-select-option>
          </ch-grid-select>
        );
        break;
      case "image":
        return null; //This type of data has no filter.
      case "action":
        return null; //This type of data has no filter.
      case "custom":
        return null; //This type of data has no filter.
      default:
        return null;
    }
    returnedContent.push(<hr></hr>);
    return returnedContent;
  }

  sort() {
    switch (this.colType) {
      case "string":
        return [
          <span
            class="menu__item"
            onClick={this.sortChangedFunc.bind(this, "a-z")}
          >
            Sort A to Z
          </span>,
          <span
            class="menu__item"
            onClick={this.sortChangedFunc.bind(this, "z-a")}
          >
            Sort Z to A
          </span>,
        ];
      case "number":
        return <div>sort by number</div>;
      case "date":
        return [
          <span
            class="menu__item"
            onClick={this.sortChangedFunc.bind(this, "min-max")}
          >
            Sort Min. to Max.
          </span>,
          <span
            class="menu__item"
            onClick={this.sortChangedFunc.bind(this, "max-min")}
          >
            Sort Max. to Min.
          </span>,
        ];
      case "date-time":
        return null; //This type of data has no sorting method at the time of writting
      case "boolean":
        return [
          <span
            class="menu__item"
            onClick={this.sortChangedFunc.bind(this, "true/false")}
          >
            Sort True/False
          </span>,
          <span
            class="menu__item"
            onClick={this.sortChangedFunc.bind(this, "false/true")}
          >
            Sort False/True
          </span>,
        ];
      case "image":
        return null; //This type of data has no sorting method
      case "action":
        return null; //This type of data has no sorting method
      case "custom":
        return null; //This type of data has no sorting method
      default:
        return null;
    }
  }

  toggleColVisibility(colId, colHidden) {
    this.toggledColumn.emit({
      "column-id": colId,
      hidden: !colHidden,
    });
  }

  setHideableColumns() {
    let returnedContent = [
      <hr></hr>,
      <span class="menu__title">Hide Columns</span>,
    ];
    this.hideableCols.forEach((col) => {
      returnedContent.push([
        <span class="menu__item">
          <input
            type="checkbox"
            checked={col["hidden"]}
            onClick={this.toggleColVisibility.bind(
              this,
              col["colId"],
              col["hidden"]
            )}
          ></input>
          {col["colDesciption"]}
        </span>,
      ]);
    });
    return returnedContent;
  }

  toggleColumnFreeze(colIsFreezed) {
    if (colIsFreezed) {
      //If col is freezed, emit the unfreezeColum event
      this.unfreezeColumn.emit();
    } else {
      //If col is unfreezed, emit the freezeColumn event
      this.freezeColumn.emit();
    }
    this.hideMenu.emit();
  }

  freezeColumnLogic() {
    //If this menu belongs to the last column, do not allow to freeze the columnd
    if (!this.lastCol) {
      let colIsFreezed = this.freezedCols.includes(this.colId);
      return (
        <span class="menu__item">
          <label htmlFor="">
            <input
              type="checkbox"
              checked={colIsFreezed}
              onClick={this.toggleColumnFreeze.bind(this, colIsFreezed)}
            ></input>
            Freeze column
          </label>
        </span>
      );
    }
  }

  moveColLeftFunc() {
    this.moveCol.emit({
      "column-id": this.colId,
      "move-direction": "left",
    });
    this.hideMenu.emit();
  }
  moveColRightFunc() {
    this.moveCol.emit({
      "column-id": this.colId,
      "move-direction": "right",
    });
    this.hideMenu.emit();
  }

  moveColumnLogic() {
    let moveLeftDisabled = false;
    let moveRightDisabled = false;
    if (this.colsOrder.length > 0) {
      let prevColIsFreezed = false;
      const thisCol = this.colsOrder.find((col) => col.colId === this.colId);
      const thisColIndex = this.colsOrder.findIndex(
        (col) => col.colId === this.colId
      );
      if (thisColIndex > 0) {
        const prevCol = this.colsOrder[thisColIndex - 1];
        prevColIsFreezed = ((prevCol as unknown) as HTMLElement).classList.contains(
          "freezed"
        );
      }
      if (thisCol !== undefined) {
        if (
          ((thisCol as unknown) as HTMLElement).classList.contains("freezed")
        ) {
          moveLeftDisabled = true;
          moveRightDisabled = true;
        } else {
          if (thisColIndex === this.colsOrder.length - 1) {
            //This is the last col
            moveRightDisabled = true;
          }
          if (thisColIndex === 0) {
            //This is the first col
            moveLeftDisabled = true;
          }
          if (prevColIsFreezed) {
            //The previous col is freezed. Disable move to the left
            moveLeftDisabled = true;
          }
        }
      }
    }

    return (
      <div class={{ "move-container": true }}>
        <span
          class={{
            menu__item: true,
            "move-left": true,
            disabled: moveLeftDisabled,
          }}
          onClick={this.moveColLeftFunc.bind(this)}
        >
          <ch-icon
            src={getAssetPath(`./ch-grid-column-menu-assets/chevron-left.svg`)}
            style={{
              "--icon-size": "25px",
              "--icon-color": `#696ef2`,
            }}
          ></ch-icon>
          move left
        </span>
        <span
          class={{
            menu__item: true,
            "move-right": true,
            disabled: moveRightDisabled,
          }}
          onClick={this.moveColRightFunc.bind(this)}
        >
          move right
          <ch-icon
            src={getAssetPath(`./ch-grid-column-menu-assets/chevron-right.svg`)}
            style={{
              "--icon-size": "25px",
              "--icon-color": `#696ef2`,
            }}
          ></ch-icon>
        </span>
      </div>
    );
  }

  render() {
    return (
      <Host>
        <div
          class={{
            menu: true,
          }}
        >
          {this.filterable ? this.filter() : null}
          <span class="menu__title">Options</span>
          {this.sortable ? this.sort() : null}
          {this.freezeColumnLogic()}
          {this.moveColumnLogic()}
          {this.hideableCols.length > 0 ? this.setHideableColumns() : null}
        </div>
      </Host>
    );
  }
}

export type ColType =
  | "string"
  | "number"
  | "date"
  | "date-time"
  | "boolean"
  | "image"
  | "action"
  | "custom";
