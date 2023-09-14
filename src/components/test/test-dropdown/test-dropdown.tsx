import { Component, h, Prop, Host } from "@stencil/core";
import { DropdownItemModel } from "./types";
import { DropdownPosition } from "../../dropdown/types";

@Component({
  tag: "ch-test-dropdown",
  styleUrl: "test-dropdown.scss",
  shadow: false // Necessary to avoid focus capture
})
export class ChTestDropdownX {
  /**
   * This attribute lets you specify the label for the expandable button.
   * Important for accessibility.
   */
  @Prop() readonly buttonLabel: string = "Show options";

  /**
   * Determine which actions on the expandable button display the dropdown
   * section.
   */
  @Prop() readonly expandBehavior: "Click" | "Click or Hover" =
    "Click or Hover";

  /**
   * This property lets you define the model of the ch-dropdown control.
   */
  @Prop() readonly itemsModel: DropdownItemModel[];

  /**
   * Determine if the dropdown section should be opened when the expandable
   * button of the control is focused.
   */
  @Prop() readonly openOnFocus: boolean = false;

  /**
   * Specifies the position of the dropdown section that is placed relative to
   * the expandable button.
   */
  @Prop() readonly position: DropdownPosition = "Center_OutsideEnd";

  /**
   * This attribute lets you specify if the control is positioned relative to
   * another containing block than the document.
   */
  @Prop() readonly relativeWindow: boolean = false;

  /**
   * Specifies the separation (in pixels) between the expandable button and the
   * dropdown section of the control.
   */
  @Prop() readonly separation: number = 0;

  // /**
  //  * Fired when the visibility of the dropdown section is changed
  //  */
  // @Event() expandedChange: EventEmitter<boolean>;

  private renderItem = (item: DropdownItemModel) => [
    <ch-dropdown-item
      slot="items"
      id={item.id}
      class={item.class}
      href={item.target}
      leftImgSrc={item.leftIcon}
      rightImgSrc={item.rightIcon}
    >
      {item.title}

      {item.items != null && item.items.map(this.renderItem)}
    </ch-dropdown-item>,

    item.showSeparator && (
      <ch-dropdown-item-separator
        class={item.separatorClass}
      ></ch-dropdown-item-separator>
    )
  ];

  render() {
    return (
      <Host>
        <ch-dropdown
          buttonLabel={this.buttonLabel}
          class="dropdown"
          expandBehavior={this.expandBehavior}
          openOnFocus={this.openOnFocus}
          position={this.position}
          relativeWindow={this.relativeWindow}
          style={{
            "--separation": `${this.separation}px`
          }}
        >
          <span slot="action">User info</span>

          <div slot="header">
            <h1>John Doe</h1>
            <span>johndoe@example.com</span>
          </div>

          {this.itemsModel != null && this.itemsModel.map(this.renderItem)}

          <div slot="footer">Footer</div>
        </ch-dropdown>
      </Host>
    );
  }
}
