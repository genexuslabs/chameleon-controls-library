import { Component, h, Prop, Host, State } from "@stencil/core";
import { ActionGroupItemModel } from "./types";
import { DropdownPosition } from "../../dropdown/types";
import { ChActionGroupCustomEvent } from "../../../components";
import { ItemsOverflowBehavior } from "../../action-group/types";

@Component({
  tag: "ch-action-group-render",
  styleUrl: "action-group-render.scss",
  shadow: false // Necessary to avoid focus capture
})
export class ChActionGroupRender {
  @State() displayedItemsCount = -1;

  /**
   * This attribute lets you specify the label for the expandable button.
   * Important for accessibility.
   */
  @Prop() readonly buttonLabel: string = "Show options";

  /**
   * Determine which actions on the expandable button display the dropdown
   * section.
   */
  @Prop() readonly expandBehavior: "Click" | "ClickOrHover" = "ClickOrHover";

  /**
   * This property lets you define the model of the ch-dropdown control.
   */
  @Prop() readonly itemsModel: ActionGroupItemModel[];

  /**
   * This attribute determines how items behave when the content of the ActionGroup overflows horizontal. This property is needed
   * to make the control responsive to changes in the Width of the container of ActionGroup.
   *
   * | Value                 | Details                                                                                          |
   * | --------------------- | ------------------------------------------------------------------------------------------------ |
   * | `Add Scroll`          | The items of the ActionGroup that overflow horizontally are shown by means of a scroll.          |
   * | `Multiline`           | The ActionGroup items that overflow horizontally are shown in a second line of the control.      |
   * | `Responsive Collapse` | The Action Group items, when they start to overflow the control, are placed in the More Actions. |
   */
  @Prop() readonly itemsOverflowBehavior: ItemsOverflowBehavior =
    "ResponsiveCollapse";

  /**
   * Determine if the dropdown section should be opened when the expandable
   * button of the control is focused.
   */
  @Prop() readonly openOnFocus: boolean = false;

  /**
   * Specifies the position of the dropdown section that is placed relative to
   * the more actions button.
   */
  @Prop() readonly moreActionsDropdownPosition: DropdownPosition =
    "InsideStart_OutsideEnd";

  /**
   * Specifies the separation (in pixels) between the expandable button and the
   * dropdown section of the control.
   */
  @Prop() readonly separation: number = 0;

  // /**
  //  * Fired when the visibility of the dropdown section is changed
  //  */
  // @Event() expandedChange: EventEmitter<boolean>;

  private renderItem = (item: ActionGroupItemModel) => (
    <ch-dropdown-item
      slot="items"
      id={item.id}
      class={item.class}
      expandBehavior={this.expandBehavior}
      href={item.target}
      leftImgSrc={item.leftIcon}
      openOnFocus={this.openOnFocus}
      position={item.position || "OutsideEnd_InsideStart"}
      rightImgSrc={item.rightIcon}
    >
      {item.title}

      {item.items != null && item.items.map(this.renderItem)}
    </ch-dropdown-item>
  );

  private firstLevelRenderItem = (
    item: ActionGroupItemModel,
    index: number
  ) => (
    <ch-dropdown-item
      id={item.id}
      class={item.class}
      expandBehavior={this.expandBehavior}
      forceContainingBlock={false}
      href={item.target}
      leftImgSrc={item.leftIcon}
      openOnFocus={this.openOnFocus}
      position={item.position || "Center_OutsideEnd"}
      rightImgSrc={item.rightIcon}
    >
      {item.title}

      {this.itemsOverflowBehavior === "ResponsiveCollapse" &&
        (this.displayedItemsCount === -1 || index < this.displayedItemsCount) &&
        item.items != null &&
        item.items.map(this.renderItem)}
    </ch-dropdown-item>
  );

  private firstLevelRenderCollapsedItem = (item: ActionGroupItemModel) => (
    <ch-dropdown-item
      slot="more-items"
      id={item.id}
      class={item.class}
      expandBehavior={this.expandBehavior}
      href={item.target}
      leftImgSrc={item.leftIcon}
      openOnFocus={this.openOnFocus}
      position={item.responsiveCollapsePosition || "OutsideEnd_InsideStart"}
      rightImgSrc={item.rightIcon}
    >
      {item.title}

      {item.items != null && item.items.map(this.renderItem)}
    </ch-dropdown-item>
  );

  private handleDisplayedItemsCountChange = (
    event: ChActionGroupCustomEvent<number>
  ) => {
    this.displayedItemsCount = event.detail;
  };

  render() {
    return (
      <Host>
        <ch-action-group
          buttonLabel={this.buttonLabel}
          class="action-group"
          expandBehavior={this.expandBehavior}
          itemsOverflowBehavior={this.itemsOverflowBehavior}
          openOnFocus={this.openOnFocus}
          moreActionsDropdownPosition={this.moreActionsDropdownPosition}
          // style={{
          //   "--separation": `${this.separation}px`
          // }}
          onDisplayedItemsCountChange={this.handleDisplayedItemsCountChange}
        >
          {this.itemsModel != null &&
            this.itemsModel.map((item, index) => (
              <ch-action-group-item slot="items">
                {this.firstLevelRenderItem(item, index)}
              </ch-action-group-item>
            ))}

          {this.itemsOverflowBehavior === "ResponsiveCollapse" &&
            this.itemsModel != null &&
            this.itemsModel
              .filter(
                (_, index) =>
                  this.displayedItemsCount !== -1 &&
                  index >= this.displayedItemsCount
              )
              .map(this.firstLevelRenderCollapsedItem)}
        </ch-action-group>
      </Host>
    );
  }
}
