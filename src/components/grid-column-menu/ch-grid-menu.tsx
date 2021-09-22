import {
  Component,
  Host,
  h,
  Prop,
  Element,
  Event,
  EventEmitter,
  Listen,
  State,
} from "@stencil/core";

@Component({
  tag: "ch-grid-menu",
  styleUrl: "ch-grid-menu.scss",
  shadow: true,
})
export class ChGridMenu {
  @Element() el: HTMLChGridMenuElement;

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

  /*******************
  STATE
  ********************/

  @State() columnFreezed: boolean = false;

  /**
   * An array containing information about the hideable columns
   */
  @State() hideableColumns: Array<Object> = [];

  /*******************
  EVENTS
  ********************/

  /**
   * Emmits the sorting event
   */
  @Event() sortChanged: EventEmitter;

  /**
   * Emmits the sorting event
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

  /*******************
  FUNCTIONS/METHODS
  ********************/

  @State() chGrid: HTMLElement = null;
  componentDidLoad() {
    this.chGrid = this.el.closest("ch-grid");
    console.log("this.chGrid", this.chGrid);
  }

  @Listen("passEventToMenu", { target: "document" })
  passEventToMenuHandler(event) {
    console.log(event.detail);
  }

  sortChangedFunc(order) {
    this.sortChanged.emit({
      "column-id": this.colId,
      "sort order": order,
    });
    this.showMenu = false;
  }

  freezeColumnFunc() {
    this.columnFreezed = true;
    this.freezeColumn.emit({
      "column-id": this.colId,
    });
  }

  unfreezeColumnFunc() {
    this.columnFreezed = false;
    this.unfreezeColumn.emit({
      "column-id": this.colId,
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
        returnedContent.push(
          <ch-grid-date-picker
            date-picker-id={this.colId}
            col-id={this.colId}
          ></ch-grid-date-picker>
        );
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

  toggleCol(colId, colHidden) {
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
    this.hideableColumns.forEach((col) => {
      returnedContent.push([
        <span class="menu__item">
          <input
            type="checkbox"
            checked={col["hidden"]}
            onClick={this.toggleCol.bind(this, col["colId"], col["hidden"])}
          ></input>
          {col["colDesciption"]}
        </span>,
      ]);
    });
    return returnedContent;
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
          {this.columnFreezed ? (
            <span
              class="menu__item"
              onClick={this.unfreezeColumnFunc.bind(this)}
            >
              Unfreeze column
            </span>
          ) : (
            <span class="menu__item" onClick={this.freezeColumnFunc.bind(this)}>
              Freeze column
            </span>
          )}
          {this.hideableColumns.length > 0 ? this.setHideableColumns() : null}
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
