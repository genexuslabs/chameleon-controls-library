import {
  Component,
  Host,
  h,
  Prop,
  getAssetPath,
  State,
  Element,
  Listen,
  Watch,
} from "@stencil/core";
import { ChGrid } from "../grid/ch-grid";

@Component({
  tag: "ch-grid-column",
  styleUrl: "ch-grid-column.scss",
  shadow: true,
  assetsDirs: ["ch-grid-column-assets"],
})
export class ChGridColumn {
  menu!: HTMLElement;
  @Element() el: HTMLChGridColumnElement;
  chGrid: ChGrid;

  /*******************
  PROPS
  ********************/

  /**
   * The columnd id (required)
   */
  @Prop() colId: string = null;

  /**
   * The column data type
   */
  @Prop() colType: ColType = undefined;

  /**
   * The presence of this attribute makes this column hideable
   */
  @Prop() hideable: boolean = false;

  /**
   * The presence of this attribute hides the column
   */
  @Prop() hidden: boolean = false;

  /**
   * The presence of this attribute sets the indentation on this column (You should apply this attribute on one column only, usually on the first column that displays data)
   */
  @Prop() indent: boolean = false;

  /**
   * The presence of this atribute displays a filter on the menu
   */
  @Prop() filterable: boolean = false;

  /**
   * Displays a menu with options
   */
  @Prop() showOptions: boolean = true;

  /**
   * The column size
   */
  @Prop() size: string = "minmax(max-content,auto)";

  /**
   * The prescence of this property makes this column freezed
   */
  @Prop() freezed: boolean = false;

  /*******************
  STATE
  ********************/

  /**
   * If true, it shows the menu
   */
  @State() showMenu: boolean = false;

  /**
   * If true, it shows the menu
   */
  @State() clickedOnShowMenuIcon: boolean = false;

  /**
   * Information about the hideable cols
   */
  @State() hideableCols: Array<Object> = [];

  /**
   * Information about the freezed cols
   */
  @State() freezedCols: Array<Object> = [];

  /**
   * Information about the freezed cols
   */
  @State() menuPositionRight: boolean = false;

  /*******************
  FUNCTIONS/METHODS
  ********************/

  @Watch("showMenu")
  setMenuPosition(newValue: boolean, oldValue: boolean) {
    /*When the menu is visible, calculate the menu width, and the remaining space
    to the right, to determine the menu position (left or right).*/
    if (newValue) {
      //if menu is visible...
      setTimeout(
        function () {
          const menuWidth = this.menu.offsetWidth;
          const chGridWidth = this.chGrid.offsetWidth;
          const colOffsetLeft = this.el.offsetLeft;
          if (chGridWidth - colOffsetLeft < menuWidth) {
            this.menuPositionRight = true;
          } else {
            this.menuPositionRight = false;
          }
        }.bind(this),
        0
      );
    }
  }

  componentWillLoad() {
    this.chGrid = this.el.assignedSlot["data-chGrid"];
  }

  @Listen("emitHideableCols", { target: "document" })
  emitHideableColsHandler() {
    if (this.chGrid !== undefined) {
      this.hideableCols = this.chGrid.hideableCols;
    }
  }

  @Listen("emitFreezedCols", { target: "document" })
  emitFreezedColsHandler() {
    if (this.chGrid !== undefined) {
      this.freezedCols = this.chGrid.freezedCols;
    }
  }

  @Listen("unfreezeColumn")
  unfreezeColumnHandler() {
    console.log("unfreezeColumn at chGridColumn");
    this.freezed = false;
  }

  @Listen("freezeColumn")
  freezeColumnHandler() {
    console.log("freezeColumn at chGridColumn");
    this.freezed = true;
  }

  @Listen("hideMenu")
  hideMenuHandler() {
    this.showMenu = false;
  }

  showMenuFunc() {
    this.clickedOnShowMenuIcon = true;
    this.showMenu = true;
  }

  detectClickOutsideMenu(event) {
    const menu = this.menu.shadowRoot.querySelector(".menu");

    if (menu != null) {
      const x = event.x;
      const y = event.y;

      //Menu coordinates
      const MenuArea = menu.getBoundingClientRect();
      if (
        x > MenuArea.left &&
        x < MenuArea.right &&
        y > MenuArea.top &&
        y < MenuArea.bottom
      ) {
        //Click happened inside the menu
      } else {
        if (!this.clickedOnShowMenuIcon) {
          this.showMenu = false;
        }
        this.clickedOnShowMenuIcon = false;
      }
    }
  }

  componentDidLoad() {
    if (this.showOptions) {
      document.addEventListener(
        "click",
        this.detectClickOutsideMenu.bind(this)
      );
    }
  }

  componentDidUnload() {
    if (this.showOptions) {
      document.removeEventListener("click", this.detectClickOutsideMenu);
    }
  }

  render() {
    return (
      <Host>
        <slot></slot>
        {this.showOptions
          ? [
              <ch-icon
                class={{ "ch-icon-show-menu": true }}
                onMouseUp={this.showMenuFunc.bind(this)}
                src={getAssetPath(`./ch-grid-column-assets/chevron-down.svg`)}
                style={{
                  "--icon-size": "20px",
                  "--icon-color": `white`,
                }}
              ></ch-icon>,
              this.showOptions ? (
                <ch-grid-menu
                  class={{ "position-right": this.menuPositionRight }}
                  col-id={this.colId}
                  col-type={this.colType}
                  hidden={!this.showMenu}
                  hideableCols={this.hideableCols}
                  freezedCols={this.freezedCols}
                  filterable={this.filterable}
                  ref={(el) => (this.menu = el as HTMLElement)}
                ></ch-grid-menu>
              ) : null,
            ]
          : null}
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
