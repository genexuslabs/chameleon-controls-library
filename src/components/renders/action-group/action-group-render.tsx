import { Component, forceUpdate, h, Prop, State } from "@stencil/core";
import { ActionGroupItemModel } from "./types";
import { DropdownPosition } from "../../dropdown/types";
import { ChActionGroupCustomEvent } from "../../../components";
import { ItemsOverflowBehavior } from "../../action-group/action-group/types";
import { fromGxImageToURL } from "../tree-view/genexus-implementation";

const DEFAULT_ACTION_CLASS = "action-group-item";
const DEFAULT_SUB_ACTION_CLASS = "dropdown-item";

@Component({
  tag: "ch-action-group-render",
  styleUrl: "action-group-render.scss",
  shadow: false // Necessary to avoid focus capture
})
export class ChActionGroupRender {
  @State() displayedItemsCount = -1;
  @State() moreActionsButtonWasExpanded = false;

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
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxImageConstructor: (name: string) => any;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxSettings: any;

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

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly useGxRender: boolean = false;

  // /**
  //  * Fired when the visibility of the dropdown section is changed
  //  */
  // @Event() expandedChange: EventEmitter<boolean>;

  #handleItemClick = (target: string, itemId: string) => (event: UIEvent) => {
    this.itemClickCallback(event, target, itemId);
  };

  #renderImg = (img: string) =>
    this.useGxRender
      ? fromGxImageToURL(img, this.gxSettings, this.gxImageConstructor)
      : img;

  #renderItem =
    (responsiveCollapse: boolean) =>
    (item: ActionGroupItemModel, index: number) =>
      (
        <ch-dropdown-item
          slot="items"
          key={item.id || item.caption || index}
          id={item.id}
          class={item.subActionClass || DEFAULT_SUB_ACTION_CLASS}
          expandBehavior={this.expandBehavior}
          href={item.link?.url}
          leftImgSrc={this.#renderImg(item.startImage)}
          openOnFocus={this.openOnFocus}
          position={
            (responsiveCollapse
              ? item.itemsResponsiveCollapsePosition
              : item.itemsPosition) || "OutsideEnd_InsideStart"
          }
          rightImgSrc={this.#renderImg(item.endImage)}
          shortcut={item.shortcut}
          onClick={this.#handleItemClick(item.link?.url, item.id)}
          onExpandedChange={
            !item.wasExpanded
              ? this.#handleItemExpanded(item, "wasExpanded")
              : null
          }
        >
          {item.caption}

          {item.items?.length > 0 &&
            item.wasExpanded &&
            item.items.map(this.#renderItem(responsiveCollapse))}

          {
            // Render a dummy element if the control was not expanded and has items
            item.items?.length > 0 && !item.wasExpanded && (
              <ch-dropdown-item></ch-dropdown-item>
            )
          }
        </ch-dropdown-item>
      );

  #firstLevelRenderItem = (item: ActionGroupItemModel, index: number) => {
    // Dummy dropdown item to avoid issues when removing all items from the
    // first level. E. g., if the first level adds a chevron when the item is
    // a dropdown, by removing all items the chevron won't be displayed
    const mustRenderDummySubElement =
      item.items?.length > 0 && // Dropdown has items
      (!item.wasExpanded || // Dropdown was not expanded and has items
        (this.itemsOverflowBehavior === "ResponsiveCollapse" && // Dropdown items are collapsed
          this.displayedItemsCount !== -1 &&
          index >= this.displayedItemsCount));

    return (
      <ch-dropdown-item
        key={item.id || item.caption || index}
        id={item.id}
        class={item.actionClass || DEFAULT_ACTION_CLASS}
        expandBehavior={this.expandBehavior}
        forceContainingBlock={false}
        href={item.link?.url}
        leftImgSrc={this.#renderImg(item.startImage)}
        openOnFocus={this.openOnFocus}
        position={item.itemsPosition || "Center_OutsideEnd"}
        rightImgSrc={this.#renderImg(item.endImage)}
        onClick={this.#handleItemClick(item.link?.url, item.id)}
        onExpandedChange={
          !item.wasExpandedInFirstLevel
            ? this.#handleItemExpanded(item, "wasExpandedInFirstLevel")
            : null
        }
      >
        {item.caption}

        {item.wasExpandedInFirstLevel &&
          this.itemsOverflowBehavior === "ResponsiveCollapse" &&
          (this.displayedItemsCount === -1 ||
            index < this.displayedItemsCount) &&
          item.items != null &&
          item.items.map(this.#renderItem(false))}

        {mustRenderDummySubElement && <ch-dropdown-item></ch-dropdown-item>}
      </ch-dropdown-item>
    );
  };

  #handleItemExpanded =
    (
      item: ActionGroupItemModel,
      propertyName: Extract<
        keyof ActionGroupItemModel,
        "wasExpanded" | "wasExpandedInFirstLevel" | "wasExpandedInMoreActions"
      >
    ) =>
    () => {
      item[propertyName] = true;
      forceUpdate(this);
    };

  #firstLevelRenderCollapsedItem = (
    item: ActionGroupItemModel,
    index: number
  ) => (
    <ch-dropdown-item
      slot="more-items"
      key={item.id || item.caption || index}
      id={item.id}
      class={item.subActionClass || DEFAULT_SUB_ACTION_CLASS}
      expandBehavior={this.expandBehavior}
      href={item.link?.url}
      leftImgSrc={this.#renderImg(item.startImage)}
      openOnFocus={this.openOnFocus}
      position={
        item.itemsResponsiveCollapsePosition || "OutsideEnd_InsideStart"
      }
      rightImgSrc={this.#renderImg(item.endImage)}
      shortcut={item.shortcut}
      onClick={this.#handleItemClick(item.link?.url, item.id)}
      onExpandedChange={
        !item.wasExpandedInMoreActions
          ? this.#handleItemExpanded(item, "wasExpandedInMoreActions")
          : null
      }
    >
      {item.caption}

      {
        // Render items when the parent is expanded the first time
        item.items?.length > 0 &&
          item.wasExpandedInMoreActions &&
          item.items.map(this.#renderItem(true))
      }

      {
        // Render a dummy element if the control was not expanded and has items
        item.items?.length > 0 && !item.wasExpandedInMoreActions && (
          <ch-dropdown-item></ch-dropdown-item>
        )
      }
    </ch-dropdown-item>
  );

  #handleDisplayedItemsCountChange = (
    event: ChActionGroupCustomEvent<number>
  ) => {
    this.displayedItemsCount = event.detail;
  };

  #handleMoreActionButtonExpandedChange = () => {
    this.moreActionsButtonWasExpanded = true;
  };

  render() {
    const thereAreCollapsedItems =
      this.itemsOverflowBehavior === "ResponsiveCollapse" &&
      this.moreActionsButtonWasExpanded &&
      this.model != null &&
      this.displayedItemsCount !== -1;

    return (
      <ch-action-group
        buttonLabel={this.buttonLabel}
        class={this.cssClass || null}
        expandBehavior={this.expandBehavior}
        itemsOverflowBehavior={this.itemsOverflowBehavior}
        moreActionsDropdownPosition={this.moreActionsDropdownPosition}
        openOnFocus={this.openOnFocus}
        onDisplayedItemsCountChange={this.#handleDisplayedItemsCountChange}
        onMoreActionsButtonExpandedChange={
          !this.moreActionsButtonWasExpanded
            ? this.#handleMoreActionButtonExpandedChange
            : null
        }
      >
        {this.model != null &&
          this.model.map((item, index) => (
            <ch-action-group-item
              slot="items"
              key={item.id || item.caption || index}
            >
              {this.#firstLevelRenderItem(item, index)}
            </ch-action-group-item>
          ))}

        {thereAreCollapsedItems &&
          this.model
            .filter((_, index) => index >= this.displayedItemsCount)
            .map(this.#firstLevelRenderCollapsedItem)}
      </ch-action-group>
    );
  }
}
