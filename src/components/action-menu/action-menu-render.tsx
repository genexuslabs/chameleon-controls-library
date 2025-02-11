import {
  Component,
  Element,
  Event,
  EventEmitter,
  forceUpdate,
  h,
  Host,
  Prop,
  Watch
} from "@stencil/core";

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
import type { ChPopoverAlign } from "../popover/types";

import { fromGxImageToURL } from "../tree-view/genexus-implementation";
import {
  ACTION_MENU_ITEM_PARTS_DICTIONARY,
  ACTION_MENU_PARTS_DICTIONARY,
  KEY_CODES
} from "../../common/reserved-names";

import { tokenMap } from "../../common/utils";
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

@Component({
  tag: "ch-action-menu-render",
  styleUrl: "action-menu-render.scss",
  shadow: true // Necessary to avoid focus capture
})
export class ChActionMenuRender {
  // Refs
  #actionRef!: HTMLButtonElement;
  #popoverRef: HTMLChPopoverElement | undefined;

  @Element() el: HTMLChActionMenuRenderElement;

  /**
   * This attribute lets you specify the label for the first expandable button.
   * Important for accessibility.
   */
  @Prop() readonly buttonAccessibleName: string;

  /**
   * Specifies the block alignment of the dropdown menu that is placed
   * relative to the expandable button.
   */
  @Prop() readonly blockAlign: ChPopoverAlign = "outside-end";

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
   * `true` to expand the dropdown window.
   */
  @Prop({ mutable: true }) expanded: boolean = false;
  @Watch("expanded")
  expandedChanged() {
    if (this.expanded) {
      this.#addCloseOnClickOutside();
    } else {
      this.#removeCloseOnClickOutside();
    }
  }

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxImageConstructor?: (name: string) => any;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxSettings?: any;

  /**
   * Specifies the inline alignment of the dropdown section that is placed
   * relative to the expandable button.
   */
  @Prop() readonly inlineAlign: ChPopoverAlign = "center";

  /**
   * This property lets you define the model of the control.
   */
  @Prop() readonly model: ActionMenuModel | undefined;
  @Watch("model")
  modelChanged() {
    this.#addMetadataToItems();
  }

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly useGxRender?: boolean = false;

  /**
   * Fired when a button is clicked.
   * This event can be prevented.
   */
  @Event() buttonClick: EventEmitter<ActionMenuItemActionableModel>;

  /**
   * Fired when the visibility of the main dropdown is changed.
   */
  @Event() expandedChange: EventEmitter<boolean>;

  /**
   * Fired when the visibility of a dropdown item is changed.
   */
  @Event() expandedItemChange: EventEmitter<ActionMenuExpandedChangeEvent>;

  /**
   * Fired when an hyperlink is clicked.
   * This event can be prevented, but the dropdown will be closed in any case
   * (prevented or not).
   */
  @Event() hyperlinkClick: EventEmitter<ActionMenuHyperlinkClickEvent>;

  #renderActionItem = (itemUIModel: ActionMenuItemActionableModel) => {
    const expandable = actionMenuItemActionableIsExpandable(itemUIModel);

    return (
      <ch-action-menu
        blockAlign={itemUIModel.itemsBlockAlign ?? "inside-start"}
        caption={itemUIModel.caption}
        disabled={itemUIModel.disabled ?? this.disabled}
        endImgSrc={
          this.useGxRender
            ? fromGxImageToURL(
                itemUIModel.endImgSrc,
                this.gxSettings,
                this.gxImageConstructor
              )
            : itemUIModel.endImgSrc
        }
        endImgType={itemUIModel.endImgType}
        expandable={expandable}
        expanded={itemUIModel.expanded}
        getImagePathCallback={this.getImagePathCallback}
        href={itemUIModel.link?.url}
        inlineAlign={itemUIModel.itemsBlockAlign ?? "outside-end"}
        model={itemUIModel}
        parts={itemUIModel.parts}
        shortcut={itemUIModel.shortcut}
        startImgSrc={
          this.useGxRender
            ? fromGxImageToURL(
                itemUIModel.startImgSrc,
                this.gxSettings,
                this.gxImageConstructor
              )
            : itemUIModel.startImgSrc
        }
        startImgType={itemUIModel.startImgType}
      >
        {expandable &&
          itemUIModel.expanded &&
          this.#renderItems(itemUIModel.items)}
      </ch-action-menu>
    );
  };

  #renderDictionary: {
    [key in ActionMenuItemTypeSeparator | ActionMenuItemTypeSlot]: (
      model: ActionMenuItemTypeMapping[key]
    ) => any;
  } = {
    separator: item => (
      <hr
        key={item.id}
        part={tokenMap({
          [item.id]: !!item.id,
          [ACTION_MENU_ITEM_PARTS_DICTIONARY.SEPARATOR]: true,
          [item.parts]: !!item.parts
        })}
      />
    ),
    slot: item => <slot name={item.id} />
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
        return this.expanded ? this.#closeActionMenu() : this.#openActionMenu();
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

    forceUpdate(this);
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
        this.#popoverRef
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

      forceUpdate(this);
    }
  };

  #closeOnClickOutside = (event: MouseEvent) => {
    const composedPath = event.composedPath();

    if (!composedPath.includes(this.el)) {
      this.#closeActionMenu();
    }
  };

  #closeOnClickOutsideKeyboard = (event: KeyboardEvent) => {
    if (event.code === KEY_CODES.ESCAPE) {
      this.#actionRef.focus();
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

  connectedCallback() {
    // TODO: Check if this code should be in the constructor
    this.#addMetadataToItems();

    if (this.expanded) {
      this.#addCloseOnClickOutside();
    }
  }

  disconnectedCallback() {
    this.#removeCloseOnClickOutside();
  }

  render() {
    const canAddEventListeners = !(this.disabled && !this.expanded);

    return (
      // TODO: Should we let expand the control if it is disabled? If so, we
      // can't disable the click interaction...
      <Host
        onClick={canAddEventListeners && this.#handleActionMenuItemClick}
        onKeyDown={canAddEventListeners && this.#handleActionMenuKeyDown}
      >
        <button
          aria-controls={WINDOW_ID}
          aria-expanded={this.expanded.toString()}
          aria-haspopup="true"
          aria-label={this.buttonAccessibleName}
          part={tokenMap({
            [ACTION_MENU_PARTS_DICTIONARY.EXPANDABLE_BUTTON]: true,
            [ACTION_MENU_ITEM_PARTS_DICTIONARY.EXPANDED]: this.expanded,
            [ACTION_MENU_ITEM_PARTS_DICTIONARY.COLLAPSED]: !this.expanded,
            [ACTION_MENU_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled
          })}
          disabled={this.disabled}
          popoverTarget={WINDOW_ID}
          type="button"
          ref={el => (this.#actionRef = el)}
        >
          <slot />
        </button>

        {this.expanded && this.model && (
          <ch-popover
            role="list"
            id={WINDOW_ID}
            part={ACTION_MENU_ITEM_PARTS_DICTIONARY.WINDOW}
            actionById
            // TODO: We must be careful with this property because the control
            // can be expanded on the initial load an the ref will not be
            // correctly computed
            actionElement={this.#actionRef as HTMLButtonElement}
            blockAlign={this.blockAlign}
            firstLayer
            inlineAlign={this.inlineAlign}
            popover="manual"
            show
            onMouseOver={this.#handleActionMenuItemMouseOver}
            onMouseOut={this.#handleActionMenuItemMouseOut}
            ref={el => (this.#popoverRef = el)}
          >
            {this.model !== undefined && this.#renderItems(this.model)}
          </ch-popover>
        )}
      </Host>
    );
  }
}
