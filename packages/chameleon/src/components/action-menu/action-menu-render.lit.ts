import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import {
  Event,
  type EventEmitter
} from "@genexus/kasstor-core/decorators/event.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

import { IS_SERVER } from "../../development-flags";
import { Host } from "../../utilities/host/host";
import { tokenMap } from "../../utilities/mapping/token-map";
import { createResolvedImagePathCallback } from "../../utilities/register-properties/image-path-registry";
import {
  ACTION_MENU_ITEM_PARTS_DICTIONARY,
  ACTION_MENU_PARTS_DICTIONARY
} from "../../utilities/reserved-names/reserved-names";
import { KEY_CODES } from "../../utilities/reserved-names/key-codes";
import type { ChPopover } from "../popover/popover.lit";
import type { ChPopoverAlign } from "../popover/types";
import type {
  ActionMenuExpandedChangeEvent,
  ActionMenuHyperlinkClickEvent,
  ActionMenuImagePathCallback,
  ActionMenuItemActionableModel,
  ActionMenuItemTypeMapping,
  ActionMenuItemTypeSeparator,
  ActionMenuItemTypeSlot,
  ActionMenuKeyboardActionResult,
  ActionMenuModel
} from "./types";
import { actionMenuKeyEventsDictionary } from "./internal/keyboard-actions";
import { parseSubModel } from "./internal/parse-model";
import {
  collapseAllItems,
  collapseSubTree,
  expandFromRootToNode
} from "./internal/update-expanded";
import {
  ACTION_MENU_RENDER_TAG_NAME,
  actionMenuItemActionableIsExpandable,
  actionMenuItemIsActionable,
  actionMenuItemIsHyperlink,
  getActionMenuInfoInEvent,
  WINDOW_ID
} from "./internal/utils";

// Side-effect imports to define the internal sub-components
import "./internal/action-menu/action-menu.lit";

import styles from "./action-menu-render.scss?inline";

// In the server we need to preload the ch-popover and ch-image just in case
// to properly render them, because Lit doesn't support async rendering in
// the server. In the client we can lazy load them
if (IS_SERVER) {
  await import("../popover/popover.lit");
  await import("../image/image.lit");
}

/**
 * The `ch-action-menu-render` component renders a dropdown menu triggered by an expandable button, supporting deeply nested sub-menus and full keyboard accessibility.
 *
 * @remarks
 * ## Features
 *  - Deeply nested sub-menus with mouse hover expand/collapse.
 *  - Keyboard navigation (arrow keys, Escape, Enter).
 *  - Menu items can be buttons, hyperlinks, separators, or custom slots.
 *  - Positioned using `ch-popover`; auto-closes on outside click or Escape.
 *  - Internal expansion state management -- host only supplies data and reacts to events.
 *
 * ## Use when
 *  - You need a multi-level dropdown menu with full keyboard accessibility (e.g., application menus, context menus, toolbar overflow menus).
 *  - Space is constrained and 3 or more item-level actions must be accessible (e.g., Edit, Rename, Delete in a table row).
 *  - Contextual actions that are secondary and do not need to be always visible.
 *
 * ## Do not use when
 *  - You need a flat list of selectable items without nesting -- prefer `ch-action-list-render` instead.
 *  - Fewer than 3 actions are available — show them as visible inline icon buttons (fewer clicks, more discoverable).
 *  - Selection input is needed — never use `role="menu"` semantics for a value selector; prefer `ch-combo-box-render`.
 *  - Actions should always be immediately visible and prominent — put them inline.
 *
 * ## Accessibility
 *  - The expandable button has `aria-expanded`, `aria-haspopup="true"`, `aria-controls`, and a configurable `aria-label` (`buttonAccessibleName`).
 *  - The popup window has `role="list"`.
 *  - Keyboard support: Enter/Space activates the focused item, ArrowUp/ArrowDown navigate within a menu level, ArrowRight opens a sub-menu, ArrowLeft closes it, and Escape closes the menu returning focus to the trigger button.
 *
 * @status experimental
 *
 * @part expandable-button - The top-level button that toggles the dropdown. Also receives the `expanded`, `collapsed`, and `disabled` state parts.
 * @part window - The popover container that holds the dropdown menu items.
 * @part action - The clickable row element for each menu item.
 * @part button - A `<button>`-type action row. Receives `expandable`, `expanded`, `collapsed`, and `disabled` state parts.
 * @part link - An `<a>`-type action row.
 * @part content - The content area inside each action row (caption + optional icon).
 * @part shortcut - The keyboard shortcut label rendered at the end of an action row.
 * @part separator - A horizontal divider rendered for items of `type: "separator"`.
 *
 * @part expandable - Present in the `button` part when the item has sub-items.
 * @part expanded - Present in the `button` part when the item's sub-menu is open.
 * @part collapsed - Present in the `button` part when the item's sub-menu is closed.
 * @part disabled - Present in the `button` part when the item is disabled.
 *
 * @slot - Default slot projected inside the expandable button. Use it to provide the button label or icon.
 * @slot {name} - Named slots matching each item of `type: "slot"` in the model. Use them to inject custom content at specific positions in the menu.
 */
@Component({
  shadow: true, // Necessary to avoid focus capture
  styles,
  tag: "ch-action-menu-render"
})
export class ChActionMenuRender extends KasstorElement {
  // Refs
  #actionRef: Ref<HTMLButtonElement> = createRef();
  #popoverRef: Ref<ChPopover> = createRef();

  /**
   * Computed signal that resolves the image path callback with the
   * following priority: local property > global registry signal.
   * Using `watch()` in the template causes pin-point updates to only the
   * `<ch-image>` bindings when the registry changes.
   */
  #resolvedImagePathCallback = createResolvedImagePathCallback(
    () => this.getImagePathCallback
  );

  /**
   * This attribute lets you specify the label for the first expandable button.
   * Important for accessibility. This property is practically required: without
   * it the trigger button has no accessible name, making the menu unusable for
   * screen-reader users.
   */
  @property({ attribute: "button-accessible-name" })
  buttonAccessibleName: string | undefined;

  /**
   * Specifies the block alignment of the dropdown menu that is placed
   * relative to the expandable button. Valid values are `"inside-start"`,
   * `"center"`, `"inside-end"`, `"outside-start"`, and `"outside-end"`.
   */
  @property({ attribute: "block-align" })
  blockAlign: ChPopoverAlign = "outside-end";

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property({ type: Boolean }) disabled: boolean = false;

  /**
   * Controls the visibility of the dropdown menu. Set to `true` to open the
   * dropdown and `false` to close it.
   */
  @property({ type: Boolean }) expanded: boolean = false;
  @Observe("expanded")
  protected expandedChanged() {
    if (this.expanded) {
      this.#addCloseOnClickOutside();
    } else {
      this.#removeCloseOnClickOutside();
    }
  }

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc or endImgSrc (of an item) needs to be resolved.
   */
  @property({ attribute: false }) getImagePathCallback:
    | ActionMenuImagePathCallback
    | undefined;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @property({ attribute: false }) gxImageConstructor:
    | ((name: string) => any)
    | undefined;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @property({ attribute: false }) gxSettings: any;

  /**
   * Specifies the inline alignment of the dropdown section that is placed
   * relative to the expandable button. Valid values are `"inside-start"`,
   * `"center"`, `"inside-end"`, `"outside-start"`, and `"outside-end"`.
   */
  @property({ attribute: "inline-align" })
  inlineAlign: ChPopoverAlign = "center";

  /**
   * This property lets you define the model of the control.
   */
  @property({ attribute: false }) model: ActionMenuModel | undefined;
  @Observe("model")
  protected modelChanged() {
    this.#addMetadataToItems();
  }

  /**
   * Specifies an alternative position to try when the popover overflows the
   * window.
   */
  @property({ attribute: "position-try" })
  positionTry: "flip-block" | "flip-inline" | "none" = "none";

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @property({ type: Boolean, attribute: "use-gx-render" })
  useGxRender: boolean = false;

  /**
   * Fired when a button is clicked.
   * This event can be prevented.
   */
  @Event() protected buttonClick!: EventEmitter<ActionMenuItemActionableModel>;

  /**
   * Fired when the visibility of the main dropdown is changed.
   */
  @Event() protected expandedChange!: EventEmitter<boolean>;

  /**
   * Fired when the visibility of a dropdown item is changed.
   */
  @Event()
  protected expandedItemChange!: EventEmitter<ActionMenuExpandedChangeEvent>;

  /**
   * Fired when an hyperlink is clicked.
   * This event can be prevented, but the dropdown will be closed in any case
   * (prevented or not).
   */
  @Event()
  protected hyperlinkClick!: EventEmitter<ActionMenuHyperlinkClickEvent>;

  #renderActionItem = (itemUIModel: ActionMenuItemActionableModel) => {
    const expandable = actionMenuItemActionableIsExpandable(itemUIModel);

    return html`<ch-action-menu
      .blockAlign=${itemUIModel.itemsBlockAlign ?? "inside-start"}
      .caption=${itemUIModel.caption}
      .disabled=${itemUIModel.disabled ?? this.disabled}
      .endImgSrc=${itemUIModel.endImgSrc}
      .endImgType=${itemUIModel.endImgType}
      .expandable=${expandable}
      .expanded=${itemUIModel.expanded}
      .resolvedImagePathCallback=${this.#resolvedImagePathCallback}
      .inlineAlign=${itemUIModel.itemsInlineAlign ?? "outside-end"}
      .link=${itemUIModel.link}
      .model=${itemUIModel}
      .parts=${itemUIModel.parts}
      .positionTry=${itemUIModel.positionTry ?? this.positionTry}
      .shortcut=${itemUIModel.shortcut}
      .startImgSrc=${itemUIModel.startImgSrc}
      .startImgType=${itemUIModel.startImgType}
    >
      ${expandable && itemUIModel.expanded
        ? this.#renderItems(itemUIModel.items)
        : nothing}
    </ch-action-menu>`;
  };

  #renderDictionary: {
    [key in ActionMenuItemTypeSeparator | ActionMenuItemTypeSlot]: (
      model: ActionMenuItemTypeMapping[key]
    ) => any;
  } = {
    separator: item =>
      html`<hr
        part=${tokenMap({
          [item.id!]: !!item.id,
          [ACTION_MENU_ITEM_PARTS_DICTIONARY.SEPARATOR]: true,
          [item.parts!]: !!item.parts
        })}
      />`,
    slot: item => html`<slot name=${item.id}></slot>`
  };

  #renderItems = (model: ActionMenuModel) =>
    model.map(itemUIModel =>
      actionMenuItemIsActionable(itemUIModel)
        ? this.#renderActionItem(itemUIModel)
        : this.#renderDictionary[itemUIModel.type](
            // TODO: Improve type inference
            itemUIModel as any
          )
    );

  #processEvent = (
    event: MouseEvent | PointerEvent,
    type: "click" | "mouseover" | "mouseout"
  ) => {
    const actionMenuInfo = getActionMenuInfoInEvent(event);

    if (actionMenuInfo === undefined) {
      return;
    }

    if (actionMenuInfo === ACTION_MENU_RENDER_TAG_NAME) {
      if (type === "click") {
        return this.expanded
          ? this.#closeActionMenu()
          : this.#openActionMenu();
      }

      return;
    }

    const itemUIModel = actionMenuInfo.model;

    // If "click" the event is a PointerEvent
    if (type === "click") {
      // Clicked a hyperlink element
      if (actionMenuItemIsHyperlink(itemUIModel)) {
        const eventInfo = this.hyperlinkClick.emit({
          item: itemUIModel,
          event: event as PointerEvent
        });

        // Prevent a tag navigation, but don't return so we can close the dropdown
        if (eventInfo.defaultPrevented) {
          event.preventDefault();
        }

        // TODO: Emit expandedChange event for all element?
        this.#closeActionMenu();

        return;
      }

      // Clicked a button element that is a leaf
      if (!actionMenuItemActionableIsExpandable(itemUIModel)) {
        const eventInfo = this.buttonClick.emit(itemUIModel);

        // Prevent button click and avoid closing the dropdown
        if (eventInfo.defaultPrevented) {
          event.preventDefault();
          return;
        }

        // TODO: Emit expandedChange event for all element?
        this.#closeActionMenu();

        return;
      }
    }

    if (type === "mouseout") {
      collapseSubTree(itemUIModel);

      // TODO: Emit expandedChange event
    } else {
      collapseAllItems(this.model);
      expandFromRootToNode(itemUIModel);

      const isExpanded = type === "mouseover" || itemUIModel.expanded;

      if (itemUIModel.expanded !== isExpanded) {
        itemUIModel.expanded = isExpanded;

        // Only emit the event if the expanded value was changed
        this.expandedItemChange.emit({
          item: itemUIModel,
          expanded: isExpanded
        });
      }
    }

    this.requestUpdate();
  };

  #handleActionMenuItemClick = (event: PointerEvent) =>
    this.#processEvent(event, "click");

  #handleActionMenuItemMouseOver = (event: MouseEvent) =>
    this.#processEvent(event, "mouseover");

  #handleActionMenuItemMouseOut = (event: MouseEvent) =>
    this.#processEvent(event, "mouseout");

  #handleActionMenuKeyDown = (event: KeyboardEvent) => {
    if (
      !this.expanded &&
      (event.code === KEY_CODES.ARROW_UP || event.code === KEY_CODES.ARROW_DOWN)
    ) {
      this.expanded = true;
      this.expandedChange.emit(true);
      return;
    }

    const keyboardEvent = actionMenuKeyEventsDictionary[event.code];

    if (keyboardEvent) {
      const result: void | ActionMenuKeyboardActionResult = keyboardEvent(
        event,
        this.#popoverRef.value!
      );

      if (!result) {
        return;
      }

      if (result.newExpanded) {
        // TODO: Emit expandedChange event for the collapsed dropdown items

        collapseAllItems(this.model);
        expandFromRootToNode(result.model);
      } else {
        collapseSubTree(result.model);
      }

      this.expandedItemChange.emit({
        item: result.model,
        expanded: result.newExpanded
      });

      this.requestUpdate();
    }
  };

  #closeOnClickOutside = (event: MouseEvent) => {
    const composedPath = event.composedPath();

    if (!composedPath.includes(this)) {
      this.#closeActionMenu();
    }
  };

  #closeOnClickOutsideKeyboard = (event: KeyboardEvent) => {
    if (event.code === KEY_CODES.ESCAPE) {
      this.#actionRef.value?.focus();
      this.#closeActionMenu();
    }
  };

  #openActionMenu = () => {
    this.expanded = true;
    this.expandedChange.emit(true);
  };

  #closeActionMenu = () => {
    collapseAllItems(this.model);

    this.expanded = false;
    this.expandedChange.emit(false);
  };

  #addCloseOnClickOutside = () => {
    document.addEventListener("click", this.#closeOnClickOutside, {
      capture: true,
      passive: true
    });
    document.addEventListener("keydown", this.#closeOnClickOutsideKeyboard, {
      capture: true,
      passive: true
    });
  };

  #removeCloseOnClickOutside = () => {
    document.removeEventListener("click", this.#closeOnClickOutside, true);
    document.removeEventListener(
      "keydown",
      this.#closeOnClickOutsideKeyboard,
      true
    );
  };

  #addMetadataToItems = () => {
    if (this.model) {
      parseSubModel(this.model, undefined);
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();

    // TODO: Check if this code should be in the constructor
    this.#addMetadataToItems();

    if (this.expanded) {
      this.#addCloseOnClickOutside();
    }
  }

  override disconnectedCallback(): void {
    this.#removeCloseOnClickOutside();
    super.disconnectedCallback();
  }

  override render() {
    const canAddEventListeners = !(this.disabled && !this.expanded);

    // TODO: Should we let expand the control if it is disabled? If so, we
    // can't disable the click interaction...
    Host(this, {
      events: canAddEventListeners
        ? {
            click: this.#handleActionMenuItemClick,
            keydown: this.#handleActionMenuKeyDown
          }
        : undefined
    });

    return html`<button
        aria-controls=${WINDOW_ID}
        aria-expanded=${this.expanded ? "true" : "false"}
        aria-haspopup="true"
        aria-label=${this.buttonAccessibleName || nothing}
        part=${tokenMap({
          [ACTION_MENU_PARTS_DICTIONARY.EXPANDABLE_BUTTON]: true,
          [ACTION_MENU_ITEM_PARTS_DICTIONARY.EXPANDED]: this.expanded,
          [ACTION_MENU_ITEM_PARTS_DICTIONARY.COLLAPSED]: !this.expanded,
          [ACTION_MENU_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled
        })}
        ?disabled=${this.disabled}
        popoverTarget=${WINDOW_ID}
        type="button"
        ${ref(this.#actionRef)}
      >
        <slot></slot>
      </button>

      ${this.expanded && this.model
        ? html`<ch-popover
            role="list"
            id=${WINDOW_ID}
            part=${ACTION_MENU_ITEM_PARTS_DICTIONARY.WINDOW}
            ?actionById=${true}
            .actionElement=${this.#actionRef.value as HTMLButtonElement}
            .blockAlign=${this.blockAlign}
            ?firstLayer=${true}
            .inlineAlign=${this.inlineAlign}
            popover="manual"
            .positionTry=${this.positionTry}
            ?show=${true}
            @mouseover=${this.#handleActionMenuItemMouseOver}
            @mouseout=${this.#handleActionMenuItemMouseOut}
            ${ref(this.#popoverRef)}
          >
            ${this.model !== undefined ? this.#renderItems(this.model) : nothing}
          </ch-popover>`
        : nothing}`;
  }
}

declare global {
  // Backward-compatible type alias for internal utilities that reference the
  // old Stencil-generated name (keyboard-actions.ts, utils.ts)
  type HTMLChPopoverElement = ChPopover;

  interface HTMLElementTagNameMap {
    "ch-action-menu-render": ChActionMenuRender;
  }
}
