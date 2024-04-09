import { Component, forceUpdate, h, Prop, State } from "@stencil/core";
import { ActionGroupItemModel } from "./types";
import { DropdownPosition } from "../../dropdown/types";
import { ChActionGroupCustomEvent } from "../../../components";
import { ItemsOverflowBehavior } from "../../action-group/action-group/types";
import { fromGxImageToURL } from "../tree-view/genexus-implementation";
import {
  ACTION_GROUP_EXPORT_PARTS,
  DROPDOWN_EXPORT_PARTS
} from "../../../common/reserverd-names";

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
   * This attribute lets you specify the label for the more actions button.
   * Important for accessibility.
   */
  @Prop() readonly moreActionsAccessibleName: string = "Show options";

  /**
   * Specifies the parts that are exported by the internal action-group. This
   * property is useful to override the exported parts.
   */
  @Prop() readonly actionGroupExportParts: string = ACTION_GROUP_EXPORT_PARTS;

  /**
   * A CSS class to set as the `ch-action-group` element class.
   */
  @Prop() readonly cssClass: string = "action-group";

  /**
   * Specifies the parts that are exported by the internal dropdown. This
   * property is useful to override the exported parts.
   */
  @Prop() readonly dropdownExportParts: string = DROPDOWN_EXPORT_PARTS;

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
   * TODO: Add implementation
   */
  @Prop() readonly openOnFocus: boolean = false;

  /**
   * Specifies the position of the dropdown section that is placed relative to
   * the more actions button.
   */
  @Prop() readonly moreActionsDropdownPosition: DropdownPosition =
    "InsideStart_OutsideEnd";

  /**
   * A CSS class to set as the `ch-dropdown-item` element class.
   * This default class is used for the items that don't have an explicit class.
   */
  @Prop() readonly separatorCssClass: string =
    "action-group-separator-horizontal";

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly useGxRender: boolean = false;

  // /**
  //  * Fired when the visibility of the dropdown section is changed
  //  */
  // @Event() expandedChange: EventEmitter<boolean>;

  #handleItemClick = (target: string, itemId: string) => (event: UIEvent) => {
    if (this.itemClickCallback) {
      this.itemClickCallback(event, target, itemId);
    }
  };

  #getImagePath = (img: string) =>
    this.useGxRender
      ? fromGxImageToURL(img, this.gxSettings, this.gxImageConstructor)
      : img;

  #renderItem =
    (level: number, responsiveCollapse: boolean) =>
    (item: ActionGroupItemModel, index: number) => {
      const hasItems = item.items?.length > 0;

      return [
        <ch-dropdown
          exportparts={this.dropdownExportParts}
          key={item.id || item.caption || index}
          id={item.id}
          caption={item.caption}
          class={item.subActionClass || DEFAULT_SUB_ACTION_CLASS}
          endImgSrc={this.#getImagePath(item.endImgSrc)}
          endImgType={item.endImgType ?? "background"}
          href={item.link?.url}
          itemClickCallback={this.#handleItemClick(item.link?.url, item.id)}
          leaf={!hasItems}
          level={level}
          openOnFocus={this.openOnFocus}
          position={
            (responsiveCollapse
              ? item.itemsResponsiveCollapsePosition
              : item.itemsPosition) || "OutsideEnd_InsideStart"
          }
          shortcut={item.shortcut}
          startImgSrc={this.#getImagePath(item.startImgSrc)}
          startImgType={item.startImgType ?? "background"}
          onExpandedChange={
            !item.wasExpanded
              ? this.#handleItemExpanded(item, "wasExpanded")
              : null
          }
        >
          {hasItems &&
            item.wasExpanded &&
            item.items.map(this.#renderItem(level + 1, responsiveCollapse))}

          {
            // Render a dummy element if the control was not expanded and has items
            hasItems && !item.wasExpanded && <ch-dropdown></ch-dropdown>
          }
        </ch-dropdown>,

        item.showSeparator && (
          <div
            aria-hidden="true"
            class={
              "ch-dropdown-separator " +
              (item.separatorClass || this.separatorCssClass)
            }
          ></div>
        )
      ];
    };

  #firstLevelRenderItem = (
    item: ActionGroupItemModel,
    index: number,
    level: number
  ) => {
    const hasItems = item.items?.length > 0;

    // Dummy dropdown item to avoid issues when removing all items from the
    // first level. E. g., if the first level adds a chevron when the item is
    // a dropdown, by removing all items the chevron won't be displayed
    const mustRenderDummySubElement =
      hasItems && // Dropdown has items
      (!item.wasExpandedInFirstLevel || // Dropdown was not expanded and has items
        (this.itemsOverflowBehavior === "ResponsiveCollapse" && // Dropdown items are collapsed
          this.displayedItemsCount !== -1 &&
          index >= this.displayedItemsCount));

    return [
      <ch-dropdown
        exportparts={this.dropdownExportParts}
        key={item.id || item.caption || index}
        id={item.id}
        actionGroupParent={true}
        caption={item.caption}
        class={item.actionClass || DEFAULT_ACTION_CLASS}
        endImgSrc={this.#getImagePath(item.endImgSrc)}
        endImgType={item.endImgType ?? "background"}
        href={item.link?.url}
        itemClickCallback={this.#handleItemClick(item.link?.url, item.id)}
        leaf={!hasItems}
        level={level}
        openOnFocus={this.openOnFocus}
        position={item.itemsPosition || "Center_OutsideEnd"}
        startImgSrc={this.#getImagePath(item.startImgSrc)}
        startImgType={item.startImgType ?? "background"}
        onExpandedChange={
          !item.wasExpandedInFirstLevel
            ? this.#handleItemExpanded(item, "wasExpandedInFirstLevel")
            : null
        }
      >
        {item.wasExpandedInFirstLevel &&
          this.itemsOverflowBehavior === "ResponsiveCollapse" &&
          (this.displayedItemsCount === -1 ||
            index < this.displayedItemsCount) &&
          item.items != null &&
          item.items.map(this.#renderItem(level + 1, false))}

        {mustRenderDummySubElement && <ch-dropdown></ch-dropdown>}
      </ch-dropdown>,

      item.showSeparator && (
        <div
          aria-hidden="true"
          class={
            "ch-action-group-separator--vertical " +
            (item.separatorClass || this.separatorCssClass)
          }
        ></div>
      )
    ];
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

  #firstLevelRenderCollapsedItem =
    (level: number) => (item: ActionGroupItemModel, index: number) => {
      const hasItems = item.items?.length > 0;

      return [
        <ch-dropdown
          slot="more-items"
          key={item.id || item.caption || index}
          exportparts={this.dropdownExportParts}
          id={item.id}
          caption={item.caption}
          class={item.subActionClass || DEFAULT_SUB_ACTION_CLASS}
          endImgSrc={this.#getImagePath(item.endImgSrc)}
          endImgType={item.endImgType ?? "background"}
          href={item.link?.url}
          itemClickCallback={this.#handleItemClick(item.link?.url, item.id)}
          leaf={!hasItems}
          level={level}
          openOnFocus={this.openOnFocus}
          position={
            item.itemsResponsiveCollapsePosition || "OutsideEnd_InsideStart"
          }
          shortcut={item.shortcut}
          startImgSrc={this.#getImagePath(item.startImgSrc)}
          startImgType={item.startImgType ?? "background"}
          onExpandedChange={
            !item.wasExpandedInMoreActions
              ? this.#handleItemExpanded(item, "wasExpandedInMoreActions")
              : null
          }
        >
          {
            // Render items when the parent is expanded the first time
            hasItems &&
              item.wasExpandedInMoreActions &&
              item.items.map(this.#renderItem(level + 1, true))
          }

          {
            // Render a dummy element if the control was not expanded and has items
            hasItems && !item.wasExpandedInMoreActions && (
              <ch-dropdown></ch-dropdown>
            )
          }
        </ch-dropdown>,

        item.showSeparator && (
          <div
            slot="more-items"
            aria-hidden="true"
            class={
              "ch-dropdown-separator " +
              (item.separatorClass || this.separatorCssClass)
            }
          ></div>
        )
      ];
    };

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
        exportparts={this.actionGroupExportParts}
        class={this.cssClass || null}
        itemsOverflowBehavior={this.itemsOverflowBehavior}
        moreActionsAccessibleName={this.moreActionsAccessibleName}
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
              {this.#firstLevelRenderItem(item, index, 0)}
            </ch-action-group-item>
          ))}

        {thereAreCollapsedItems &&
          this.model
            .filter((_, index) => index >= this.displayedItemsCount)
            .map(this.#firstLevelRenderCollapsedItem(0))}
      </ch-action-group>
    );
  }
}
