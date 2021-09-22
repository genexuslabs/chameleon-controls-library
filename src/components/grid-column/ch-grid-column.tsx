import {
  Component,
  Host,
  h,
  Prop,
  getAssetPath,
  State,
  Listen,
} from "@stencil/core";

@Component({
  tag: "ch-grid-column",
  styleUrl: "ch-grid-column.scss",
  shadow: true,
  assetsDirs: ["ch-grid-column-assets"],
})
export class ChGridColumn {
  menu!: HTMLElement;

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

  /*******************
  FUNCTIONS/METHODS
  ********************/

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
        {this.showOptions ? (
          <div class="icon-menu-container">
            <ch-icon
              class={{ "ch-icon-show-menu": true }}
              onMouseUp={this.showMenuFunc.bind(this)}
              src={getAssetPath(`./ch-grid-column-assets/chevron-down.svg`)}
              style={{
                "--icon-size": "20px",
                "--icon-color": `white`,
              }}
            ></ch-icon>
            {this.showOptions ? (
              <ch-grid-menu
                col-id={this.colId}
                col-type={this.colType}
                hidden={!this.showMenu}
                filterable={this.filterable}
                ref={(el) => (this.menu = el as HTMLElement)}
              ></ch-grid-menu>
            ) : null}
          </div>
        ) : null}
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
