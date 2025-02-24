import { Component, Element, h, Host, Prop, State, Watch } from "@stencil/core";
import type {
  ActionGroupDisplayedMarkers,
  ActionGroupModel,
  ItemsOverflowBehavior
} from "./types";
// import { fromGxImageToURL } from "../tree-view/genexus-implementation";

import { ACTION_MENU_ITEM_EXPORT_PARTS } from "../../common/reserved-names";
import { SyncWithRAF } from "../../common/sync-with-frames";
import { MARKER_CLASS_SELECTOR, renderItems } from "./renders";
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

  /**
   * 0 means no collapsed items. 1 means the first items is collapsed. And so
   * on.
   */
  @State() collapsedItems = 0;
  @Watch("collapsedItems")
  collapsedItemsChanged() {
    this.#setModels();
  }

  @Element() el!: HTMLChActionGroupRenderElement;

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
  @Prop({ reflect: true })
  readonly itemsOverflowBehavior: ItemsOverflowBehavior = "responsive-collapse";
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

  // TODO: Use the getImagePath for resolving the images
  // #getImagePath = (img: string) =>
  //   this.useGxRender
  //     ? fromGxImageToURL(img, this.gxSettings, this.gxImageConstructor)
  //     : img;

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
    this.el.shadowRoot
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
    // TODO: Use role="menu"
    this.el.setAttribute("role", "list");

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
      <Host>
        {this.#isResponsiveCollapse && this.collapsedItems !== 0 && (
          <ch-action-menu-render
            key="__action-menu"
            role="listitem"
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
          </ch-action-menu-render>
        )}

        {renderItems(
          this.model,
          this.#isResponsiveCollapse,
          this.#displayedMarkers,
          this.disabled,
          this.getImagePathCallback
        )}
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
