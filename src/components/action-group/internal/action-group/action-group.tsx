import {
  Component,
  Host,
  h,
  Element,
  Prop,
  State,
  Event,
  EventEmitter,
  Watch
} from "@stencil/core";
import { ItemsOverflowBehavior } from "./types";
import {
  ACTION_GROUP_PARTS_DICTIONARY
  // DROPDOWN_PARTS_DICTIONARY,
  // DROPDOWN_ITEM_PARTS_DICTIONARY
} from "../../../../common/reserved-names";

const FLOATING_POINT_ERROR = 1;

// const MORE_ACTION_EXPORT_PARTS =
//   `${DROPDOWN_PARTS_DICTIONARY.EXPANDABLE_BUTTON}:${ACTION_GROUP_PARTS_DICTIONARY.MORE_ACTIONS_BUTTON},${DROPDOWN_ITEM_PARTS_DICTIONARY.WINDOW}:${ACTION_GROUP_PARTS_DICTIONARY.MORE_ACTIONS_WINDOW}` as const;

/**
 * @part actions - The container of the visible actions.
 * @part more-actions - The ch-dropdown control to show hidden actions when `itemsOverflowBehavior === "responsive-collapse"`.
 *
 * @slot items - The slot for the actions.
 * @slot more-items - The slot for the hidden actions when `itemsOverflowBehavior === "responsive-collapse"`.
 */
@Component({
  tag: "ch-action-group",
  styleUrl: "action-group.scss",
  shadow: true
})
export class ChActionGroup {
  #needForRAF = true; // To prevent redundant RAF (request animation frame) calls

  #totalItems = -1;

  // Observer
  #actionsContainerWatcher: ResizeObserver;
  #actionsWatcher: ResizeObserver;

  // Refs
  #actionsContainer: HTMLDivElement;
  #slotItems: HTMLSlotElement;

  @Element() el: HTMLChActionGroupElement;

  /**
   * The visible actions when `itemsOverflowBehavior === "responsive-collapse"`.
   */
  @State() displayedItems = -1;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName: string;

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
    "responsive-collapse";
  @Watch("itemsOverflowBehavior")
  handleOverflowBehaviorChange(newValue: ItemsOverflowBehavior) {
    if (newValue !== "responsive-collapse") {
      const actionGroupItems =
        this.#slotItems.assignedElements() as HTMLChActionGroupItemElement[];

      // Reset floating
      actionGroupItems.forEach(item => {
        item.floating = false;
      });
    }

    this.#setResponsiveCollapse();
  }

  /**
   * This attribute lets you specify the label for the more actions button.
   * Important for accessibility.
   */
  @Prop() readonly moreActionsAccessibleName: string = "More actions";

  /**
   * @todo Check a better convention for this property, for example, "ActionsInlineAlignment"
   * This attribute determines the position of the More Actions button in the Action Group.
   *
   * | Value   | Details                                                               |
   * | --------| --------------------------------------------------------------------- |
   * | `Start` | The More Actions Button is displayed to the left of the ActionGroup.  |
   * | `End`   | The More Actions Button is displayed to the right of the ActionGroup. |
   */
  @Prop() readonly moreActionsButtonPosition: "Start" | "End" = "Start";

  // /**
  //  * Specifies the position of the dropdown section that is placed relative to
  //  * the more actions button.
  //  */
  // @Prop() readonly moreActionsDropdownPosition: DropdownPosition =
  //   "InsideStart_OutsideEnd";

  /**
   * Determine if the dropdowns should be opened when the action is focused.
   */
  @Prop() readonly openOnFocus: boolean = false;

  /**
   * Fired when the item is targeted or not.
   */
  @Event() displayedItemsCountChange: EventEmitter<number>;

  /**
   * Fired when the more actions button is expanded or collapsed.
   */
  @Event() moreActionsButtonExpandedChange: EventEmitter<boolean>;

  /**
   * Update the visibility of the actions.
   * Only works if itemsOverflowBehavior === "responsive-collapse"
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #updateDisplayedActions = () => {
    const actionGroupItems =
      this.#slotItems.assignedElements() as HTMLChActionGroupItemElement[];

    // The column-gap property must be taken into account
    const columnGap = getComputedStyle(this.#actionsContainer).columnGap;
    const columnGapValue =
      columnGap != null && columnGap.endsWith("px")
        ? Number(columnGap.replace("px", ""))
        : 0;

    // Since the last item does not add column-gap, we have to adjust the measurement
    let availableWidth =
      this.#actionsContainer.clientWidth +
      columnGapValue -
      FLOATING_POINT_ERROR;
    let displayedItems = 0;

    // Check which items are visible
    actionGroupItems.forEach(action => {
      const actionWidth = action.clientWidth;

      availableWidth -= actionWidth + columnGapValue;

      if (availableWidth >= 0) {
        action.floating = false;
        displayedItems++;
      } else {
        action.floating = true;
      }
    });

    this.#totalItems = actionGroupItems.length;
    this.displayedItems = displayedItems;
    this.displayedItemsCountChange.emit(displayedItems);
  };

  #updateDisplayedActionInFrame = () => {
    if (!this.#needForRAF) {
      return;
    }
    this.#needForRAF = false; // No need to call RAF up until next frame

    requestAnimationFrame(() => {
      this.#needForRAF = true; // RAF now consumes the movement instruction so a new one can come
      this.#updateDisplayedActions();
    });
  };

  #connectActionsObserver = () => {
    this.#actionsWatcher = new ResizeObserver(
      this.#updateDisplayedActionInFrame
    );

    // Observe the actions
    const actionGroupItems = this.#slotItems.assignedElements();
    actionGroupItems.forEach(action => {
      this.#actionsWatcher.observe(action);
    });
  };

  #connectActionsContainerObserver = () => {
    this.#actionsContainerWatcher = new ResizeObserver(
      this.#updateDisplayedActionInFrame
    );

    this.#actionsContainerWatcher.observe(this.#actionsContainer);
  };

  #disconnectActionsObserver = () => {
    if (this.#actionsWatcher) {
      this.#actionsWatcher.disconnect();
      this.#actionsWatcher = null;
    }
  };

  #disconnectActionsContainerObserver = () => {
    if (this.#actionsContainerWatcher) {
      this.#actionsContainerWatcher.disconnect();
      this.#actionsContainerWatcher = null;
    }
  };

  #setResponsiveCollapse = () => {
    this.#disconnectActionsObserver();
    this.#disconnectActionsContainerObserver();

    if (this.itemsOverflowBehavior !== "responsive-collapse") {
      return;
    }
    this.#connectActionsObserver();
    this.#connectActionsContainerObserver();
  };

  #updateActionsWatcher = () => {
    if (this.itemsOverflowBehavior !== "responsive-collapse") {
      return;
    }

    // Avoid memory leaks by disconnecting and re-connecting the observer
    this.#disconnectActionsObserver();
    this.#connectActionsObserver();
  };

  #handleMoreActionButtonExpand = (event: CustomEvent<boolean>) => {
    event.stopPropagation();
    this.moreActionsButtonExpandedChange.emit(event.detail);
  };

  componentDidLoad() {
    this.#setResponsiveCollapse();
  }

  disconnectedCallback() {
    this.#disconnectActionsObserver();
    this.#disconnectActionsContainerObserver();
  }

  render() {
    // @todo TODO: Improve accessibility and keyboard navigation

    return (
      <Host role="menubar" aria-label={this.accessibleName}>
        {
          this.itemsOverflowBehavior === "responsive-collapse" &&
            this.#totalItems !== this.displayedItems &&
            ""
          // <ch-dropdown
          //   exportparts={MORE_ACTION_EXPORT_PARTS}
          //   class="more-actions"
          //   part={ACTION_GROUP_PARTS_DICTIONARY.MORE_ACTIONS}
          //   actionGroupParent={true}
          //   buttonAccessibleName={this.moreActionsAccessibleName}
          //   // leaf={false}
          //   // level={-1}
          //   nestedDropdown={true}
          //   openOnFocus={this.openOnFocus}
          //   // position={this.moreActionsDropdownPosition}
          //   // onExpandedChange={this.#handleMoreActionButtonExpand}
          // >
          //   <slot name="more-items"></slot>
          // </ch-dropdown>
        }

        <div
          class={{
            actions: true,
            "actions--scroll": this.itemsOverflowBehavior === "add-scroll",
            "actions--multiline": this.itemsOverflowBehavior === "multiline",
            "actions--responsive":
              this.itemsOverflowBehavior === "responsive-collapse"
          }}
          part={ACTION_GROUP_PARTS_DICTIONARY.ACTIONS}
          ref={el => (this.#actionsContainer = el)}
        >
          <slot
            name="items"
            onSlotchange={this.#updateActionsWatcher}
            ref={el => (this.#slotItems = el as HTMLSlotElement)}
          ></slot>
        </div>
      </Host>
    );
  }
}
