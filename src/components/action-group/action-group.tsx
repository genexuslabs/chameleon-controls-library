import {
  Component,
  Host,
  h,
  Element,
  Prop,
  State,
  Listen,
  Watch,
  Event,
  EventEmitter
} from "@stencil/core";
import {
  ActionGroupItemKeyDownEvent,
  ActionGroupItemTargetEvent
} from "../action-group-item/action-group-item";
import { Component as ChComponent } from "../../common/interfaces";
const ENTER_KEY_CODE = "Enter";
const ESCAPE_KEY_CODE = "Escape";
const SPACE_KEY_CODE = "Space";
const ARROWLEFT_KEY_CODE = "ArrowLeft";
const ARROWDOWN_KEY_CODE = "ArrowDown";
const ARROWRIGHT_KEY_CODE = "ArrowRight";
const HOME_KEY_CODE = "Home";
const END_KEY_CODE = "End";

/**
 * @part actions-container - The container where live the actions items.
 * @part more-action-btn - The button for show hidden actions items when property "itemsOverflowBehavior" is equal to 'Responsive Collapse'.
 *
 * @slot - The slot where you can put the actions items.
 */
@Component({
  tag: "ch-action-group",
  styleUrl: "action-group.scss",
  shadow: true
})
export class ChActionGroup implements ChComponent {
  private resizeContainerObserver: ResizeObserver = null;
  private resizeItemsObserver: ResizeObserver = null;
  private container: HTMLElement = null;
  private btnMenuElement: HTMLElement = null;
  private firstLevelItems: ActionGroupFirstLevelItems[] = [];
  private needForRAF = true; // To prevent redundant RAF (request animation frame) calls

  @Element() el: HTMLChActionGroupElement;

  /**
   * The items inside the actions menu button.
   */
  @State() actionsButtonItems: HTMLChActionGroupItemElement[] = [];

  /**
   * The aria label for the accessibility of the component.
   */
  @Prop() readonly caption = "";

  /**
   * If the menu is opened or closed.
   */
  @Prop() readonly closed: boolean = true;

  @Watch("closed")
  watchPropOpenItemHandler(newValue: boolean) {
    if (newValue) {
      this.closeOpenAction();
    }
  }

  /**
   *  When it's true and an action is activated close the actions menu.
   */
  @Prop() readonly closeOnActionActivated: boolean = true;

  /**
   * A CSS class to set as the `ch-action-group` element class.
   */
  @Prop() readonly cssClass: string;

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
  @Prop() readonly itemsOverflowBehavior:
    | "Add Scroll"
    | "Multiline"
    | "Responsive Collapse" = "Responsive Collapse";

  /**
   * This attribute determines the position of the More Actions button in the Action Group.
   *
   * | Value   | Details                                                               |
   * | --------| --------------------------------------------------------------------- |
   * | `Start` | The More Actions Button is displayed to the left of the ActionGroup.  |
   * | `End`   | The More Actions Button is displayed to the right of the ActionGroup. |
   */
  @Prop() readonly moreActionsButtonPosition: "Start" | "End" = "Start";

  /**
   * The index of item action that is targeted.
   */
  @Prop({ mutable: true }) openIndex: number = null;

  /**
   *  When it's true and an action is hovered show the actions menu.
   */
  @Prop() readonly showActionsMenuOnHover: boolean = true;

  /**
   * Fired when the item is targeted or not.
   */
  @Event({
    eventName: "displayedItemsCountChange"
  })
  displayedItemsCountChange: EventEmitter<number>;

  componentDidLoad() {
    const items: any = this.el.querySelectorAll("ch-action-group-item");
    items.forEach((it: HTMLChActionGroupItemElement) => {
      it.showActionsMenuOnHover = this.showActionsMenuOnHover;
    });

    // Init first level action width observer
    this.firstLevelActionsChangedObserver();

    // Get first level actions
    const firstLevelItems: any = this.el.querySelectorAll(
      ':scope > ch-action-group-item[slot="list-item"]'
    );
    firstLevelItems.forEach((it: HTMLChActionGroupItemElement) => {
      it.disposedTop = true;
      it.addEventListener("actionGroupItemTargeted", this.handleActionTargeted);
      if (this.itemsOverflowBehavior === "Responsive Collapse") {
        this.firstLevelItems.push({ item: it, width: it.clientWidth });
        // Start the observation
        this.resizeItemsObserver.observe(it);
      }
    });

    if (this.itemsOverflowBehavior === "Responsive Collapse") {
      this.btnMenuElement.parentElement.addEventListener(
        "keydown",
        this.btnMenuFocusByKey
      );
    }

    window.addEventListener("click", this.onBlur);
    this.containerChangedObserver();

    // Needed for perform the position of the menu inside items
    const actionsContainer: any =
      this.el.shadowRoot.querySelector(".actions-container");
    actionsContainer.addEventListener("scroll", () => {
      /*  this.changeMenuItemsPositions(actionsContainer.scrollLeft); */
    });

    this.updateDisplayedItems();
    /* this.changeMenuItemsPositions(this.el.clientWidth); */
  }

  disconnectedCallback() {
    if (this.resizeContainerObserver) {
      this.resizeContainerObserver.disconnect();
      this.resizeContainerObserver = null;
    }
    if (this.resizeItemsObserver) {
      this.resizeItemsObserver.disconnect();
      this.resizeItemsObserver = null;
    }
  }

  /**
   * Listen when an action item is activated.
   */
  @Listen("actionGroupItemSelected")
  handleActionGroupItemSelected() {
    if (this.closeOnActionActivated) {
      if (this.openIndex) {
        this.firstLevelItems[this.openIndex].item.deactivated = true;
      }
      this.closeOpenAction();
      this.openIndex = null;
    }
  }

  /**
   * Listen when a KeyboardEvent is captured for some action item, and manage what doing for some keys.
   * Space, Enter: Activates the action item.
   * Esc: deactivated action item if is active and close the menu open if correspond.
   * ArrowUp, ArrowDown, ArrowLeft, ArrowRight: Navigate for the actions items, putting them focused.
   * Home, End: Navigate to the first or last action item.
   */
  @Listen("actionGroupItemKeyDown")
  handleActionGroupItemKeyDown(
    event: CustomEvent<ActionGroupItemKeyDownEvent>
  ) {
    const keyboardEvent = event.detail.event;
    const targetActionIndex = this.firstLevelItems.findIndex(
      it => it.item == event.detail.item
    );

    if (targetActionIndex >= 0) {
      // close on escape
      if (keyboardEvent.code === ESCAPE_KEY_CODE) {
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        this.firstLevelItems[targetActionIndex].item.deactivated = true;
        this.toggleExpand(this.openIndex, false);
      } else if (
        keyboardEvent.code === SPACE_KEY_CODE ||
        keyboardEvent.code === ENTER_KEY_CODE
      ) {
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        this.firstLevelItems[targetActionIndex].item.deactivated =
          this.openIndex === targetActionIndex;
        this.toggleExpand(
          targetActionIndex,
          this.openIndex !== targetActionIndex
        );
      } else {
        this.controlFocusByKey(keyboardEvent, targetActionIndex);
      }
    }
  }

  /**
   * Observer to listener the change of size of actions container.
   */
  private containerChangedObserver() {
    // Create instance of observer
    this.resizeContainerObserver = new ResizeObserver(entries => {
      if (!entries[0] || !this.needForRAF) {
        return;
      }

      this.needForRAF = false; // No need to call RAF up until next frame

      requestAnimationFrame(() => {
        this.needForRAF = true; // RAF now consumes the movement instruction so a new one can come

        // Reload annotations
        this.containerSizeChanged();
      });
    });

    // Start the observation
    this.resizeContainerObserver.observe(this.container);
  }

  /**
   * Observer to listener the change of size of first level actions items.
   */
  private firstLevelActionsChangedObserver() {
    // Create instance of observer
    this.resizeItemsObserver = new ResizeObserver(entries => {
      if (!entries[0] || !this.needForRAF) {
        return;
      }

      this.needForRAF = false; // No need to call RAF up until next frame

      requestAnimationFrame(() => {
        this.needForRAF = true; // RAF now consumes the movement instruction so a new one can come

        // Reload annotations
        /*  const items = entries.map(entry => entry.target as HTMLGxActionGroupItemElement); */
        /*  this.updateFirstLevelActionWidth(items); */
      });
    });
  }

  private containerSizeChanged() {
    if (this.itemsOverflowBehavior === "Responsive Collapse") {
      this.updateDisplayedItems();
    }

    /*  this.changeMenuItemsPositions(this.el.clientWidth); */
  }

  /*  */
  private updateDisplayedItems() {
    if (this.firstLevelItems.length == 0) {
      return;
    }
    const availableWidth =
      this.container.clientWidth - this.btnMenuElement.clientWidth;
    let displayedItemsCount = 0;
    let itemsWidth = this.firstLevelItems[0].width;

    // Calc how much items can be displayed in the available width
    while (itemsWidth <= availableWidth) {
      displayedItemsCount++;
      if (displayedItemsCount < this.firstLevelItems.length) {
        itemsWidth += this.firstLevelItems[displayedItemsCount].width;
      } else {
        break;
      }
    }
    // Update the item's visibility
    const actionsButtonItems: HTMLChActionGroupItemElement[] = [];
    for (let index = 0; index < this.firstLevelItems.length; index++) {
      const presented = index < displayedItemsCount;
      if (!presented) {
        actionsButtonItems.push(
          (this.firstLevelItems[index].item as any).cloneNode(true)
        );
      }
      // this.firstLevelItems[index].item.presented = presented;
      // this.firstLevelItems[index].item.disabled = !presented;
    }
    this.actionsButtonItems = actionsButtonItems;

    this.displayedItemsCountChange.emit(displayedItemsCount);
    // this.updateMenuItems(actionsButtonItems);
  }

  private handleActionTargeted = (
    event: CustomEvent<ActionGroupItemTargetEvent>
  ) => {
    const actionIndex = this.firstLevelItems.findIndex(
      it => it.item == event.detail.item
    );
    if (actionIndex > -1) {
      this.toggleExpand(actionIndex, event.detail.active);
    }
  };

  private onBlur = (event: PointerEvent) => {
    const itemContainsFocus = this.el.contains(event.target as HTMLElement);
    if (!itemContainsFocus) {
      this.closeOpenAction();
      if (this.openIndex !== null) {
        this.toggleExpand(this.openIndex, false);
      }
    }
  };

  private toggleExpand(index: number, expanded: boolean) {
    const itemIndexExists =
      this.firstLevelItems[index] !== null &&
      this.firstLevelItems[index] !== undefined;

    // close open menu of item, if applicable
    if (this.openIndex !== index) {
      let closeMoreBtn = false;
      if (itemIndexExists) {
        closeMoreBtn =
          this.firstLevelItems[index].item.classList.contains(
            "first-level-action"
          );
      }
      this.closeOpenAction(closeMoreBtn);
      this.toggleExpand(this.openIndex, false);
    }

    // handle item at called index
    if (itemIndexExists) {
      this.openIndex = expanded ? index : null;
    }
  }

  /* private changeMenuItemsPositions = (value: number) => {
    setTimeout(() => {
      this.firstLevelItems.forEach(it => {
        const menu = it.item.querySelector(
          ":scope.first-level-action > ch-dropdown"
        ) as HTMLChDropdownElement;
        if (menu) {
          menu.parentSize = value;
        }
      });
    }, 150);
  }; */

  private closeOpenAction(closeMoreBtn = true) {
    if (this.openIndex !== null) {
      this.firstLevelItems[this.openIndex].item.deactivated = true;
    }
    if (this.btnMenuElement && closeMoreBtn) {
      const menu: any = this.btnMenuElement.querySelector(
        ":scope > ch-action-group-menu"
      );
      if (menu) {
        menu.closed = true;
      }
    }
  }

  private controlFocusByKey(
    keyboardEvent: KeyboardEvent,
    currentIndex: number
  ) {
    switch (keyboardEvent.code) {
      case ARROWLEFT_KEY_CODE:
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        // eslint-disable-next-line no-case-declarations
        const prevIndex = Math.max(0, currentIndex - 1);
        if (
          currentIndex > -1 &&
          !this.firstLevelItems[prevIndex].item.disabled
        ) {
          this.firstLevelItems[prevIndex].item.focus();
        }
        if (
          currentIndex === 0 &&
          this.itemsOverflowBehavior === "Responsive Collapse"
        ) {
          this.btnMenuElement.parentElement.focus();
        }
        break;
      case ARROWRIGHT_KEY_CODE:
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        // eslint-disable-next-line no-case-declarations
        const nextIndex = Math.min(
          this.firstLevelItems.length - 1,
          currentIndex + 1
        );
        if (
          currentIndex > -1 &&
          !this.firstLevelItems[nextIndex].item.disabled
        ) {
          this.firstLevelItems[nextIndex].item.focus();
        }
        break;
      case ARROWDOWN_KEY_CODE:
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        // eslint-disable-next-line no-case-declarations
        const menu = this.firstLevelItems[currentIndex].item.querySelector(
          ":scope > ch-action-group-menu"
        ) as HTMLChDropdownElement;
        if (menu) {
          if (this.openIndex !== currentIndex) {
            this.firstLevelItems[currentIndex].item.deactivated =
              this.openIndex === currentIndex;
            this.toggleExpand(currentIndex, true);
          }
          const firstMenuItem = menu.querySelector(
            ":scope > ch-action-group-item"
          ) as HTMLChActionGroupItemElement;
          if (firstMenuItem) {
            setTimeout(() => {
              firstMenuItem.focus();
            }, 150);
          }
        }
        break;
      case HOME_KEY_CODE:
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        this.firstLevelItems[0].item.focus();
        break;
      case END_KEY_CODE:
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        this.firstLevelItems[this.firstLevelItems.length - 1].item.focus();
        break;
    }
  }

  private btnMenuFocusByKey = (keyboardEvent: KeyboardEvent) => {
    const menu: any = this.btnMenuElement.querySelector(
      ":scope > ch-action-group-menu"
    );
    switch (keyboardEvent.code) {
      case ESCAPE_KEY_CODE:
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        if (!menu.closed) {
          this.btnMenuElement.parentElement.click();
        }
        break;
      case ARROWRIGHT_KEY_CODE:
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        if (!this.firstLevelItems[0].item.disabled) {
          this.firstLevelItems[0].item.focus();
        }
        break;
      case SPACE_KEY_CODE:
      case ENTER_KEY_CODE:
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        this.btnMenuElement.parentElement.click();
        break;
      case ARROWDOWN_KEY_CODE:
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        if (menu.closed) {
          this.btnMenuElement.parentElement.click();
        }
        setTimeout(() => {
          if (menu.children[0]) {
            menu.children[0].focus();
          }
        }, 150);
    }
  };

  render() {
    return (
      <Host
        role="menubar"
        aria-label={this.caption}
        class={{
          [this.cssClass]: !!this.cssClass,
          ["overflow-behavior-add-scroll"]:
            this.itemsOverflowBehavior === "Add Scroll",
          ["overflow-behavior-multiline"]:
            this.itemsOverflowBehavior === "Multiline",
          ["overflow-behavior-responsive-collapse"]:
            this.itemsOverflowBehavior === "Responsive Collapse",
          ["btn-actions-position-end"]: this.moreActionsButtonPosition === "End"
        }}
      >
        {this.itemsOverflowBehavior === "Responsive Collapse" ? (
          <ch-dropdown
            align="Center"
            class="Class"
            dropdown-separation="5"
            expand-behavior="Click or hover"
            open-on-focus="false"
            position="Bottom"
            style={{ width: "auto" }}
          >
            <div
              tabindex="0"
              class="more-action-btn"
              slot="action"
              part="more-action-btn"
              ref={btnMenuElement =>
                (this.btnMenuElement = btnMenuElement as HTMLElement)
              }
            >
              <div class="more-action-btn-line"></div>
              <div class="more-action-btn-line"></div>
              <div class="more-action-btn-line"></div>
            </div>

            {/*  <ch-action-group-item
              slot="items"
              id="item3-1"
              link="http://google.com"
              css-class="itemClass1"
            >
              {" "}
              Navegar a yyy{" "}
            </ch-action-group-item> */}
            <slot name="more-button-item" slot="items"></slot>
          </ch-dropdown>
        ) : null}

        <div
          class="actions-container"
          part="actions-container"
          ref={containerElement =>
            (this.container = containerElement as HTMLElement)
          }
        >
          {this.itemsOverflowBehavior === "Responsive Collapse" ? (
            <div class="separator"></div>
          ) : null}
          <slot name="list-item"></slot>
        </div>
      </Host>
    );
  }
}

interface ActionGroupFirstLevelItems {
  item: HTMLChActionGroupItemElement;
  width: number;
}
