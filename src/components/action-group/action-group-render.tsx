import { Component, h, Host, Prop, State, Watch } from "@stencil/core";
import type { ActionGroupDisplayedMarkers, ActionGroupModel } from "./types";
import type { ItemsOverflowBehavior } from "./internal/action-group/types";
// import { fromGxImageToURL } from "../tree-view/genexus-implementation";

import {
  ACTION_GROUP_PARTS_DICTIONARY,
  ACTION_MENU_ITEM_EXPORT_PARTS
} from "../../common/reserved-names";
import { SyncWithRAF } from "../../common/sync-with-frames";
import { MARKER_CLASS_SELECTOR, renderItems } from "./renders";
import { tokenMap } from "../../common/utils";
import { ChPopoverAlign } from "../popover/types";
import { ActionMenuImagePathCallback } from "../action-menu/types";

// const FLOATING_POINT_ERROR = 1;

const INTERSECTION_OPTIONS: IntersectionObserverInit = { threshold: 1 };

@Component({
  tag: "ch-action-group-render",
  styleUrl: "action-group-render.scss",
  shadow: true // Necessary to avoid focus capture
})
export class ChActionGroupRender {
  #collapsedModel: ActionGroupModel = [];
  #isResponsiveCollapse = false;
  #shouldCheckResponsiveCollapseWatcher = true;

  // Responsive collapse variables
  #displayedMarkers: ActionGroupDisplayedMarkers[] | undefined;
  #responsiveActionsWatcher: IntersectionObserver | undefined;
  #updateActionsRAF: SyncWithRAF | undefined; // Don't allocate memory until needed when dragging

  // Refs
  #actionsContainerRef: HTMLUListElement;

  /**
   * 0 means no collapsed items. 1 means the first items is collapsed. And so
   * on.
   */
  @State() collapsedItems = 0;
  @Watch("collapsedItems")
  collapsedItemsChanged() {
    this.#setModels();
  }

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled: boolean = false;

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc or endImgSrc (of an item) needs to be resolved.
   */
  @Prop() readonly getImagePathCallback?: ActionMenuImagePathCallback;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxImageConstructor: (name: string) => any;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxSettings: any;

  /**
   * This attribute determines how items behave when the content of the ActionGroup overflows horizontal. This property is needed
   * to make the control responsive to changes in the Width of the container of ActionGroup.
   *
   * | Value                 | Details                                                                                          |
   * | --------------------- | ------------------------------------------------------------------------------------------------ |
   * | `add-scroll`          | The items of the ActionGroup that overflow horizontally are shown by means of a scroll.          |
   * | `multiline`           | The ActionGroup items that overflow horizontally are shown in a second line of the control.      |
   * | `responsive-collapse` | The Action Group items, when they start to overflow the control, are placed in the More Actions. |
   */
  @Prop() readonly itemsOverflowBehavior: ItemsOverflowBehavior =
    "responsive-collapse";
  @Watch("itemsOverflowBehavior")
  itemsOverflowBehaviorChanged() {
    this.#shouldCheckResponsiveCollapseWatcher = true;
    this.#isResponsiveCollapse =
      this.itemsOverflowBehavior === "responsive-collapse";

    this.#disconnectActionsObserver();
    this.#removeOrInitializeMarkersVisibility();
  }

  /**
   * This property lets you define the model of the ch-action-group control.
   */
  @Prop() readonly model: ActionGroupModel | undefined;
  @Watch("model")
  modelChanged() {
    this.#shouldCheckResponsiveCollapseWatcher = true;

    this.#disconnectActionsObserver();
    this.#removeOrInitializeMarkersVisibility();
    this.#setModels();
  }

  /**
   * This property lets you specify the label for the more actions button.
   * Important for accessibility.
   */
  @Prop() readonly moreActionsAccessibleName: string = "Show more actions";

  /**
   * Specifies the block alignment of the more actions dropdown that is
   * placed relative to the "more actions" button.
   */
  @Prop() readonly moreActionsBlockAlign: ChPopoverAlign = "outside-end";

  /**
   * This attribute lets you specify the caption for the more actions button.
   */
  @Prop() readonly moreActionsCaption: string | undefined;

  /**
   * Specifies the inline alignment of the more actions dropdown that is
   * placed relative to the "more actions" button.
   */
  @Prop() readonly moreActionsInlineAlign: ChPopoverAlign = "inside-start";

  // /**
  //  * Determine if the dropdown section should be opened when the expandable
  //  * button of the control is focused.
  //  * TODO: Add implementation
  //  */
  // @Prop() readonly openOnFocus: boolean = false;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly useGxRender: boolean = false;

  // #getImagePath = (img: string) =>
  //   this.useGxRender
  //     ? fromGxImageToURL(img, this.gxSettings, this.gxImageConstructor)
  //     : img;

  // #renderItem =
  //   (level: number, responsiveCollapse: boolean) =>
  //   (item: ActionGroupItemModel, index: number) => {
  //     // const hasItems = item.items?.length > 0;

  //     return "";
  //     // return [
  //     //   <ch-dropdown
  //     //     exportparts={this.dropdownExportParts}
  //     //     key={item.id || item.caption || index}
  //     //     id={item.id}
  //     //     caption={item.caption}
  //     //     class={item.subActionClass || DEFAULT_SUB_ACTION_CLASS}
  //     //     endImgSrc={this.#getImagePath(item.endImgSrc)}
  //     //     endImgType={item.endImgType ?? "background"}
  //     //     href={item.link?.url}
  //     //     itemClickCallback={this.#handleItemClick(item.link?.url, item.id)}
  //     //     leaf={!hasItems}
  //     //     level={level}
  //     //     openOnFocus={this.openOnFocus}
  //     //     position={
  //     //       (responsiveCollapse
  //     //         ? item.itemsResponsiveCollapsePosition
  //     //         : item.itemsPosition) || "OutsideEnd_InsideStart"
  //     //     }
  //     //     shortcut={item.shortcut}
  //     //     startImgSrc={this.#getImagePath(item.startImgSrc)}
  //     //     startImgType={item.startImgType ?? "background"}
  //     //     onExpandedChange={
  //     //       !item.wasExpanded
  //     //         ? this.#handleItemExpanded(item, "wasExpanded")
  //     //         : null
  //     //     }
  //     //   >
  //     //     {hasItems &&
  //     //       item.wasExpanded &&
  //     //       item.items.map(this.#renderItem(level + 1, responsiveCollapse))}

  //     //     {
  //     //       // Render a dummy element if the control was not expanded and has items
  //     //       hasItems && !item.wasExpanded && <ch-dropdown></ch-dropdown>
  //     //     }
  //     //   </ch-dropdown>,

  //     //   item.showSeparator && (
  //     //     <div
  //     //       aria-hidden="true"
  //     //       class={
  //     //         "ch-dropdown-separator " +
  //     //         (item.separatorClass || this.separatorCssClass)
  //     //       }
  //     //     ></div>
  //     //   )
  //     // ];
  //   };

  // #firstLevelRenderItem = (
  //   item: ActionGroupItemModel,
  //   index: number,
  //   level: number
  // ) => {
  //   // const hasItems = item.items?.length > 0;

  //   // // Dummy dropdown item to avoid issues when removing all items from the
  //   // // first level. E. g., if the first level adds a chevron when the item is
  //   // // a dropdown, by removing all items the chevron won't be displayed
  //   // const mustRenderDummySubElement =
  //   //   hasItems && // Dropdown has items
  //   //   (!item.wasExpandedInFirstLevel || // Dropdown was not expanded and has items
  //   //     (this.itemsOverflowBehavior === "ResponsiveCollapse" && // Dropdown items are collapsed
  //   //       this.displayedItemsCount !== -1 &&
  //   //       index >= this.displayedItemsCount));
  //   return "";
  //   // return [
  //   //   <ch-dropdown
  //   //     exportparts={this.dropdownExportParts}
  //   //     key={item.id || item.caption || index}
  //   //     id={item.id}
  //   //     actionGroupParent={true}
  //   //     caption={item.caption}
  //   //     class={item.actionClass || DEFAULT_ACTION_CLASS}
  //   //     endImgSrc={this.#getImagePath(item.endImgSrc)}
  //   //     endImgType={item.endImgType ?? "background"}
  //   //     href={item.link?.url}
  //   //     itemClickCallback={this.#handleItemClick(item.link?.url, item.id)}
  //   //     leaf={!hasItems}
  //   //     level={level}
  //   //     openOnFocus={this.openOnFocus}
  //   //     position={item.itemsPosition || "Center_OutsideEnd"}
  //   //     startImgSrc={this.#getImagePath(item.startImgSrc)}
  //   //     startImgType={item.startImgType ?? "background"}
  //   //     onExpandedChange={
  //   //       !item.wasExpandedInFirstLevel
  //   //         ? this.#handleItemExpanded(item, "wasExpandedInFirstLevel")
  //   //         : null
  //   //     }
  //   //   >
  //   //     {item.wasExpandedInFirstLevel &&
  //   //       this.itemsOverflowBehavior === "ResponsiveCollapse" &&
  //   //       (this.displayedItemsCount === -1 ||
  //   //         index < this.displayedItemsCount) &&
  //   //       item.items != null &&
  //   //       item.items.map(this.#renderItem(level + 1, false))}

  //   //     {mustRenderDummySubElement && <ch-dropdown></ch-dropdown>}
  //   //   </ch-dropdown>,

  //   //   item.showSeparator && (
  //   //     <div
  //   //       aria-hidden="true"
  //   //       class={
  //   //         "ch-action-group-separator--vertical " +
  //   //         (item.separatorClass || this.separatorCssClass)
  //   //       }
  //   //     ></div>
  //   //   )
  //   // ];
  // };

  // #handleItemExpanded =
  //   (
  //     item: ActionGroupItemModel,
  //     propertyName: Extract<
  //       keyof ActionGroupItemModel,
  //       "wasExpanded" | "wasExpandedInFirstLevel" | "wasExpandedInMoreActions"
  //     >
  //   ) =>
  //   () => {
  //     // item[propertyName] = true;
  //     forceUpdate(this);
  //   };

  // #firstLevelRenderCollapsedItem =
  //   (level: number) => (item: ActionGroupItemModel, index: number) => {
  //     // const hasItems = item.items?.length > 0;

  //     return "";

  //     // return [
  //     //   <ch-dropdown
  //     //     slot="more-items"
  //     //     // key={item.id || item.caption || index}
  //     //     // exportparts={this.dropdownExportParts}
  //     //     // id={item.id}
  //     //     // caption={item.caption}
  //     //     // class={item.subActionClass || DEFAULT_SUB_ACTION_CLASS}
  //     //     // endImgSrc={this.#getImagePath(item.endImgSrc)}
  //     //     // endImgType={item.endImgType ?? "background"}
  //     //     // href={item.link?.url}
  //     //     // itemClickCallback={this.#handleItemClick(item.link?.url, item.id)}
  //     //     // leaf={!hasItems}
  //     //     // level={level}
  //     //     // openOnFocus={this.openOnFocus}
  //     //     // position={
  //     //     //   item.itemsResponsiveCollapsePosition || "OutsideEnd_InsideStart"
  //     //     // }
  //     //     // shortcut={item.shortcut}
  //     //     // startImgSrc={this.#getImagePath(item.startImgSrc)}
  //     //     // startImgType={item.startImgType ?? "background"}
  //     //     // onExpandedChange={
  //     //     //   !item.wasExpandedInMoreActions
  //     //     //     ? this.#handleItemExpanded(item, "wasExpandedInMoreActions")
  //     //     //     : null
  //     //     // }
  //     //   >
  //     //     {
  //     //       // Render items when the parent is expanded the first time
  //     //       hasItems &&
  //     //         item.wasExpandedInMoreActions &&
  //     //         item.items.map(this.#renderItem(level + 1, true))
  //     //     }

  //     //     {/* {
  //     //       // Render a dummy element if the control was not expanded and has items
  //     //       hasItems && !item.wasExpandedInMoreActions && (
  //     //         <ch-dropdown></ch-dropdown>
  //     //       )
  //     //     } */}
  //     //   </ch-dropdown>,

  //     //   // item.showSeparator && (
  //     //   //   <div
  //     //   //     slot="more-items"
  //     //   //     aria-hidden="true"
  //     //   //     class={
  //     //   //       "ch-dropdown-separator " +
  //     //   //       (item.separatorClass || this.separatorCssClass)
  //     //   //     }
  //     //   //   ></div>
  //     //   // )
  //     // ];
  //   };

  // #handleDisplayedItemsCountChange = (
  //   event: ChActionGroupCustomEvent<number>
  // ) => {
  //   this.collapsedItems = event.detail;
  // };

  // #handleMoreActionButtonExpandedChange = () => {
  //   this.moreActionsButtonWasExpanded = true;
  // };

  #removeOrInitializeMarkersVisibility = () => {
    this.#displayedMarkers = this.#isResponsiveCollapse
      ? this.model?.map((_, index) => ({
          id: index.toString(),
          displayed: true
        })) ?? []
      : undefined;
  };

  #setModels = () => {
    this.#collapsedModel = [];

    if (this.model && this.collapsedItems > 0) {
      this.#collapsedModel = this.model.slice(
        this.model.length - this.collapsedItems
      );
    }
  };

  // - - - - - - - - - - - - - - - - - - - -
  //                Observers
  // - - - - - - - - - - - - - - - - - - - -
  #setResponsiveCollapse = () => {
    if (this.#isResponsiveCollapse) {
      this.#connectActionsObserver();
    }
  };

  #connectActionsObserver = () => {
    this.#updateActionsRAF ??= new SyncWithRAF();
    this.#responsiveActionsWatcher ??= new IntersectionObserver(entries => {
      // Update the visibility of each entry
      entries.forEach(entry => {
        const itemId = Number(entry.target.id);

        if (this.model[itemId].type === "slot") {
          this.#displayedMarkers[itemId].size = `${
            (entry.target as HTMLSlotElement).offsetWidth
          }px`;
        }

        this.#displayedMarkers[itemId].displayed = entry.isIntersecting;
      });

      // Queue a task to update the displayed actions in the next frame
      this.#updateActionsRAF.perform(this.#updateDisplayedActions);
    }, INTERSECTION_OPTIONS);

    // Observe the actions
    this.#actionsContainerRef
      .querySelectorAll(MARKER_CLASS_SELECTOR)
      .forEach(action => this.#responsiveActionsWatcher.observe(action));
  };

  /**
   * Update the visibility of the actions.
   * Only works if itemsOverflowBehavior === "responsive-collapse"
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #updateDisplayedActions = () => {
    const firstItemIndexThatIsNotVisible = this.#displayedMarkers.findIndex(
      markerIsDisplayed => !markerIsDisplayed.displayed
    );

    // All items are visible
    if (firstItemIndexThatIsNotVisible === -1) {
      this.collapsedItems = 0;
    }
    // There are hidden items
    else {
      this.collapsedItems = this.model.length - firstItemIndexThatIsNotVisible;
    }
  };

  #disconnectActionsObserver = () => {
    this.#updateActionsRAF?.cancel();
    this.#updateActionsRAF = undefined;

    this.#responsiveActionsWatcher?.disconnect();
    this.#responsiveActionsWatcher = undefined;
  };

  connectedCallback() {
    this.collapsedItems = 0;
    this.#isResponsiveCollapse =
      this.itemsOverflowBehavior === "responsive-collapse";

    this.#removeOrInitializeMarkersVisibility();
    this.#setModels();
  }

  componentDidRender() {
    if (this.#shouldCheckResponsiveCollapseWatcher) {
      this.#shouldCheckResponsiveCollapseWatcher = false;
      this.#setResponsiveCollapse();
    }
  }

  disconnectedCallback() {
    this.#disconnectActionsObserver();
  }

  render() {
    if (!this.model || this.model.length === 0) {
      return "";
    }

    return (
      <Host
        class={
          this.#isResponsiveCollapse ? "ch-responsive-collapse" : undefined
        }
      >
        {this.#isResponsiveCollapse && this.collapsedItems !== 0 && (
          <ch-dropdown-render
            exportparts={ACTION_MENU_ITEM_EXPORT_PARTS}
            blockAlign={this.moreActionsBlockAlign}
            disabled={this.disabled}
            getImagePathCallback={this.getImagePathCallback}
            inlineAlign={this.moreActionsInlineAlign}
            model={this.#collapsedModel}
          >
            {this.moreActionsCaption}

            {this.#collapsedModel.map(item =>
              item.type === "slot" ? (
                <slot slot={item.id} name={item.id} />
              ) : undefined
            )}
          </ch-dropdown-render>
        )}

        <ul
          class={{
            content: true,
            "responsive-collapse": this.#isResponsiveCollapse
          }}
          part={tokenMap({
            [ACTION_GROUP_PARTS_DICTIONARY.ACTIONS_CONTAINER]: true,
            [ACTION_GROUP_PARTS_DICTIONARY.ADD_SCROLL]:
              this.itemsOverflowBehavior === "add-scroll",
            [ACTION_GROUP_PARTS_DICTIONARY.MULTILINE]:
              this.itemsOverflowBehavior === "multiline",
            [ACTION_GROUP_PARTS_DICTIONARY.RESPONSIVE_COLLAPSE]:
              this.itemsOverflowBehavior === "responsive-collapse"
          })}
          ref={el => (this.#actionsContainerRef = el)}
        >
          {renderItems(
            this.model,
            this.#isResponsiveCollapse,
            this.#displayedMarkers,
            this.disabled,
            this.getImagePathCallback
          )}
        </ul>
      </Host>
    );

    // const thereAreCollapsedItems =
    //   this.itemsOverflowBehavior === "responsive-collapse" &&
    //   this.moreActionsButtonWasExpanded &&
    //   this.model != null &&
    //   this.displayedItemsCount !== -1;

    // return (
    //   <ch-action-group
    //     exportparts={this.actionGroupExportParts}
    //     itemsOverflowBehavior={this.itemsOverflowBehavior}
    //     moreActionsAccessibleName={this.moreActionsAccessibleName}
    //     // moreActionsDropdownPosition={this.moreActionsDropdownPosition}
    //     openOnFocus={this.openOnFocus}
    //     onDisplayedItemsCountChange={this.#handleDisplayedItemsCountChange}
    //     onMoreActionsButtonExpandedChange={
    //       !this.moreActionsButtonWasExpanded
    //         ? this.#handleMoreActionButtonExpandedChange
    //         : null
    //     }
    //   >
    //     {this.model.map(this.#renderItem)}
    //     {/* {this.model != null &&
    //       this.model.map((item, index) => (
    //         <ch-action-group-item
    //           slot="items"
    //           key={item.id || item.caption || index}
    //         >
    //           {this.#firstLevelRenderItem(item, index, 0)}
    //         </ch-action-group-item>
    //       ))} */}

    //     {/* {thereAreCollapsedItems &&
    //       this.model
    //         .filter((_, index) => index >= this.displayedItemsCount)
    //         .map(this.#firstLevelRenderCollapsedItem(0))} */}
    //   </ch-action-group>
    // );
  }
}
