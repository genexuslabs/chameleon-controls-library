import { Component, h, Prop, State } from "@stencil/core";
import { ActionGroupItemModel } from "./types";
import { DropdownPosition } from "../../dropdown/types";
import { ChActionGroupCustomEvent } from "../../../components";
import { ItemsOverflowBehavior } from "../../action-group/types";

const DEFAULT_ACTION_CLASS = "action-group-item";
const DEFAULT_SUB_ACTION_CLASS = "dropdown-item";

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
   * A CSS class to set as the `ch-action-group` element class.
   */
  @Prop() readonly cssClass: string = "action-group";

  /**
   * Determine which actions on the expandable button display the dropdown
   * section.
   */
  @Prop() readonly expandBehavior: "Click" | "ClickOrHover" = "ClickOrHover";

  /**
   * This callback is executed when an item is clicked.
   */
  @Prop() readonly itemClickCallback: (
    event: UIEvent,
    target: string,
    itemId: string
  ) => void;

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
   * This property lets you define the model of the ch-action-group control.
   */
  @Prop() readonly model: ActionGroupItemModel[];

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

  private handleItemClick =
    (target: string, itemId: string) => (event: UIEvent) => {
      this.itemClickCallback(event, target, itemId);
    };

  private renderItem = (item: ActionGroupItemModel) => (
    <ch-dropdown-item
      slot="items"
      id={item.id}
      class={item.subActionClass || DEFAULT_SUB_ACTION_CLASS}
      expandBehavior={this.expandBehavior}
      href={item.target}
      leftImgSrc={item.startImage}
      openOnFocus={this.openOnFocus}
      position={item.position || "OutsideEnd_InsideStart"}
      rightImgSrc={item.endImage}
      onClick={this.handleItemClick(item.target, item.id)}
    >
      {item.caption}

      {item.items != null && item.items.map(this.renderItem)}
    </ch-dropdown-item>
  );

  private firstLevelRenderItem = (
    item: ActionGroupItemModel,
    index: number
  ) => (
    <ch-dropdown-item
      id={item.id}
      class={item.actionClass || DEFAULT_ACTION_CLASS}
      expandBehavior={this.expandBehavior}
      forceContainingBlock={false}
      href={item.target}
      leftImgSrc={item.startImage}
      openOnFocus={this.openOnFocus}
      position={item.position || "Center_OutsideEnd"}
      rightImgSrc={item.endImage}
      onClick={this.handleItemClick(item.target, item.id)}
    >
      {item.caption}

      {this.itemsOverflowBehavior === "ResponsiveCollapse" &&
        (this.displayedItemsCount === -1 || index < this.displayedItemsCount) &&
        item.items != null &&
        item.items.map(this.renderItem)}

      {
        // Dummy dropdown item to avoid issues when removing all items from the
        // first level. E. g., if the first level adds a chevron when the item is
        // a dropdown, by removing all items the chevron won't be displayed
        this.itemsOverflowBehavior === "ResponsiveCollapse" &&
          this.displayedItemsCount !== -1 &&
          index >= this.displayedItemsCount &&
          item.items != null &&
          item.items.length !== 0 && <ch-dropdown-item></ch-dropdown-item>
      }
    </ch-dropdown-item>
  );

  private firstLevelRenderCollapsedItem = (item: ActionGroupItemModel) => (
    <ch-dropdown-item
      slot="more-items"
      id={item.id}
      class={item.subActionClass || DEFAULT_SUB_ACTION_CLASS}
      expandBehavior={this.expandBehavior}
      href={item.target}
      leftImgSrc={item.startImage}
      openOnFocus={this.openOnFocus}
      position={item.responsiveCollapsePosition || "OutsideEnd_InsideStart"}
      rightImgSrc={item.endImage}
      onClick={this.handleItemClick(item.target, item.id)}
    >
      {item.caption}

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
      <ch-action-group
        buttonLabel={this.buttonLabel}
        class={this.cssClass || null}
        expandBehavior={this.expandBehavior}
        itemsOverflowBehavior={this.itemsOverflowBehavior}
        moreActionsDropdownPosition={this.moreActionsDropdownPosition}
        openOnFocus={this.openOnFocus}
        onDisplayedItemsCountChange={this.handleDisplayedItemsCountChange}
      >
        {this.model != null &&
          this.model.map((item, index) => (
            <ch-action-group-item slot="items">
              {this.firstLevelRenderItem(item, index)}
            </ch-action-group-item>
          ))}

        {this.itemsOverflowBehavior === "ResponsiveCollapse" &&
          this.model != null &&
          this.model
            .filter(
              (_, index) =>
                this.displayedItemsCount !== -1 &&
                index >= this.displayedItemsCount
            )
            .map(this.firstLevelRenderCollapsedItem)}
      </ch-action-group>
    );
  }
}
