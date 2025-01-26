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
import {
  DropdownExpandedChangeEvent,
  DropdownHyperlinkClickEvent,
  DropdownItemActionableModel,
  DropdownItemTypeMapping,
  DropdownItemTypeSeparator,
  DropdownItemTypeSlot,
  DropdownKeyboardActionResult,
  DropdownModel
} from "./types";
import { fromGxImageToURL } from "../tree-view/genexus-implementation";
// import { dropdownKeyEventsDictionary } from "./utils";
import { ChPopoverAlign } from "../popover/types";
import {
  DROPDOWN_ITEM_PARTS_DICTIONARY,
  DROPDOWN_PARTS_DICTIONARY,
  KEY_CODES
} from "../../common/reserved-names";
import {
  DROPDOWN_RENDER_TAG_NAME,
  dropdownItemActionableIsExpandable,
  dropdownItemIsActionable,
  dropdownItemIsHyperlink,
  getDropdownInfoInEvent,
  WINDOW_ID
} from "./internal/utils";
import {
  collapseAllItems,
  collapseSubTree,
  expandFromRootToNode
} from "./internal/update-expanded";
import { parseSubModel } from "./internal/parse-model";
import { tokenMap } from "../../common/utils";
import { dropdownKeyEventsDictionary } from "./internal/keyboard-actions";

@Component({
  tag: "ch-dropdown-render",
  styleUrl: "dropdown-render.scss",
  shadow: true // Necessary to avoid focus capture
})
export class ChDropdownRender {
  // Refs
  #actionRef!: HTMLButtonElement;
  #popoverRef: HTMLChPopoverElement | undefined;

  @Element() el: HTMLChDropdownRenderElement;

  /**
   * This attribute lets you specify the label for the first expandable button.
   * Important for accessibility.
   */
  @Prop() readonly buttonAccessibleName: string;

  /**
   * Specifies the block alignment of the dropdown section that is placed
   * relative to the expandable button.
   */
  @Prop() readonly blockAlign: ChPopoverAlign = "center";

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop() readonly disabled: boolean = false;

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
   * This property lets you define the model of the ch-dropdown control.
   */
  @Prop() readonly model: DropdownModel | undefined;
  @Watch("model")
  modelChanged() {
    this.#setExtendedModel(this.model);
  }

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly useGxRender?: boolean = false;

  /**
   * Fired when a button is clicked.
   * This event can be prevented.
   */
  @Event() buttonClick: EventEmitter<DropdownItemActionableModel>;

  /**
   * Fired when the visibility of the main dropdown is changed.
   */
  @Event() expandedChange: EventEmitter<boolean>;

  /**
   * Fired when the visibility of a dropdown item is changed.
   */
  @Event() expandedItemChange: EventEmitter<DropdownExpandedChangeEvent>;

  /**
   * Fired when an hyperlink is clicked.
   * This event can be prevented, but the dropdown will be closed in any case
   * (prevented or not).
   */
  @Event() hyperlinkClick: EventEmitter<DropdownHyperlinkClickEvent>;

  #renderActionItem = (itemUIModel: DropdownItemActionableModel) => {
    const expandable = dropdownItemActionableIsExpandable(itemUIModel);

    return (
      <ch-dropdown
        blockAlign={itemUIModel.itemsBlockAlign ?? "inside-start"}
        caption={itemUIModel.caption}
        disabled={itemUIModel.disabled}
        endImgSrc={
          this.useGxRender
            ? fromGxImageToURL(
                itemUIModel.endImgSrc,
                this.gxSettings,
                this.gxImageConstructor
              )
            : itemUIModel.endImgSrc
        }
        endImgType={itemUIModel.endImgType ?? "background"}
        expandable={expandable}
        expanded={itemUIModel.expanded}
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
        startImgType={itemUIModel.startImgType ?? "background"}
      >
        {expandable &&
          itemUIModel.expanded &&
          this.#renderItems(itemUIModel.items)}
      </ch-dropdown>
    );
  };

  #renderDictionary: {
    [key in DropdownItemTypeSeparator | DropdownItemTypeSlot]: (
      model: DropdownItemTypeMapping[key]
    ) => any;
  } = {
    separator: item => <hr key={item.id} part={item.part} />,
    slot: item => <slot name={item.id} />
  };

  #renderItems = (model: DropdownModel) =>
    model.map(itemUIModel =>
      dropdownItemIsActionable(itemUIModel)
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
    const dropdownInfo = getDropdownInfoInEvent(event);

    if (dropdownInfo === undefined) {
      return;
    }

    if (dropdownInfo === DROPDOWN_RENDER_TAG_NAME) {
      if (type === "click") {
        return this.expanded ? this.#closeDropdown() : this.#openDropdown();
      }

      return;
    }

    const itemUIModel = dropdownInfo.model;

    // If "click" the event is a PointerEvent
    if (type === "click") {
      // Clicked a hyperlink element
      if (dropdownItemIsHyperlink(itemUIModel)) {
        const eventInfo = this.hyperlinkClick.emit({
          item: itemUIModel,
          event: event as PointerEvent
        });

        // Prevent a tag navigation, but don't return so we can close the dropdown
        if (eventInfo.defaultPrevented) {
          event.preventDefault();
        }

        // TODO: Emit expandedChange event for all element?
        this.#closeDropdown();

        return;
      }

      // Clicked a button element that is a leaf
      if (!dropdownItemActionableIsExpandable(itemUIModel)) {
        const eventInfo = this.buttonClick.emit(itemUIModel);

        // Prevent button click and avoid closing the dropdown
        if (eventInfo.defaultPrevented) {
          event.preventDefault();
          return;
        }

        // TODO: Emit expandedChange event for all element?
        this.#closeDropdown();

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

  #handleDropdownItemClick = (event: PointerEvent) =>
    this.#processEvent(event, "click");

  #handleDropdownItemMouseOver = (event: MouseEvent) =>
    this.#processEvent(event, "mouseover");

  #handleDropdownItemMouseOut = (event: MouseEvent) =>
    this.#processEvent(event, "mouseout");

  #handleDropdownKeyDown = (event: KeyboardEvent) => {
    if (
      !this.expanded &&
      (event.code === KEY_CODES.ARROW_UP || event.code === KEY_CODES.ARROW_DOWN)
    ) {
      this.expanded = true;
      this.expandedChange.emit(true);
      return;
    }

    const keyboardEvent = dropdownKeyEventsDictionary[event.code];

    if (keyboardEvent) {
      const result: void | DropdownKeyboardActionResult = keyboardEvent(
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
      this.#closeDropdown();
    }
  };

  #closeOnClickOutsideKeyboard = (event: KeyboardEvent) => {
    if (event.code === KEY_CODES.ESCAPE) {
      this.#actionRef.focus();
      this.#closeDropdown();
    }
  };

  #openDropdown = () => {
    this.expanded = true;
    this.expandedChange.emit(true);
  };

  #closeDropdown = () => {
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

  #setExtendedModel = (model: DropdownModel) => parseSubModel(model, undefined);

  connectedCallback() {
    // TODO: Check if this code should be in the constructor
    this.#setExtendedModel(this.model);

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
        onClick={canAddEventListeners && this.#handleDropdownItemClick}
        onKeyDown={canAddEventListeners && this.#handleDropdownKeyDown}
      >
        <button
          aria-controls={WINDOW_ID}
          aria-expanded={this.expanded.toString()}
          aria-haspopup="true"
          aria-label={this.buttonAccessibleName}
          part={tokenMap({
            [DROPDOWN_PARTS_DICTIONARY.EXPANDABLE_BUTTON]: true,
            [DROPDOWN_ITEM_PARTS_DICTIONARY.EXPANDED]: this.expanded,
            [DROPDOWN_ITEM_PARTS_DICTIONARY.COLLAPSED]: !this.expanded,
            [DROPDOWN_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled
          })}
          disabled={this.disabled}
          popoverTarget={WINDOW_ID}
          type="button"
          ref={el => (this.#actionRef = el)}
        >
          <slot />
        </button>

        {this.expanded && (
          <ch-popover
            role="list"
            id={WINDOW_ID}
            part={DROPDOWN_ITEM_PARTS_DICTIONARY.WINDOW}
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
            onMouseOver={this.#handleDropdownItemMouseOver}
            onMouseOut={this.#handleDropdownItemMouseOut}
            ref={el => (this.#popoverRef = el)}
          >
            {this.model !== undefined && this.#renderItems(this.model)}
          </ch-popover>
        )}
      </Host>
    );
  }
}
