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
  DropdownItemActionable,
  DropdownItemSeparator,
  DropdownItemSlot,
  DropdownItemTypeMapping,
  DropdownItemTypeSeparator,
  DropdownItemTypeSlot,
  DropdownModel,
  DropdownModelExtended
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
  getDropdownModelInEvent,
  WINDOW_ID
} from "./internal/utils";
import {
  collapseAllItems,
  collapseSubTree,
  expandFromRootToNode
} from "./internal/update-expanded";
import { parseSubModel } from "./internal/parse-model";
import { tokenMap } from "../../common/utils";

@Component({
  tag: "ch-dropdown-render",
  styleUrl: "dropdown-render.scss",
  shadow: true // Necessary to avoid focus capture
})
export class ChDropdownRender {
  #modelExtended: DropdownModelExtended;

  // Refs
  #actionRef!: HTMLButtonElement;

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
   * Fired when the visibility of the main dropdown is changed.
   */
  @Event() expandedChange: EventEmitter<boolean>;

  /**
   * Fired when the visibility of a dropdown item is changed.
   */
  @Event() expandedItemChange: EventEmitter<DropdownExpandedChangeEvent>;

  // #handleItemClick = (target: string, itemId: string) => (event: UIEvent) => {
  //   if (this.itemClickCallback) {
  //     this.itemClickCallback(event, target, itemId);
  //   }
  // };

  #renderActionItem = (
    item: DropdownItemActionable,
    index: number,
    parentExtendedModel: DropdownModelExtended
  ) => {
    const itemUIModelExtended = parentExtendedModel[index];
    const expandable = dropdownItemActionableIsExpandable(
      itemUIModelExtended.item
    );

    return (
      <ch-dropdown
        blockAlign={item.itemsBlockAlign ?? "inside-start"}
        caption={item.caption}
        disabled={item.disabled}
        endImgSrc={
          this.useGxRender
            ? fromGxImageToURL(
                item.endImgSrc,
                this.gxSettings,
                this.gxImageConstructor
              )
            : item.endImgSrc
        }
        endImgType={item.endImgType ?? "background"}
        expandable={expandable}
        expanded={item.expanded}
        href={item.link?.url}
        inlineAlign={item.itemsBlockAlign ?? "outside-end"}
        model={itemUIModelExtended}
        parts={item.parts}
        shortcut={item.shortcut}
        startImgSrc={
          this.useGxRender
            ? fromGxImageToURL(
                item.startImgSrc,
                this.gxSettings,
                this.gxImageConstructor
              )
            : item.startImgSrc
        }
        startImgType={item.startImgType ?? "background"}
      >
        {expandable &&
          item.expanded &&
          this.#renderItems(itemUIModelExtended.items!)}
      </ch-dropdown>
    );
  };

  #renderDictionary: {
    [key in DropdownItemTypeSeparator | DropdownItemTypeSlot]: (
      model: DropdownItemTypeMapping[key],
      index: number,
      parentExtendedModel: DropdownModelExtended
    ) => any;
  } = {
    separator: item => <hr key={item.id} part={item.part} />,
    slot: item => <slot name={item.id} />
  };

  #renderItems = (model: DropdownModelExtended) =>
    model.map((extendedItem, index) =>
      dropdownItemIsActionable(extendedItem.item)
        ? this.#renderActionItem(extendedItem.item, index, model)
        : this.#renderDictionary[
            (extendedItem.item as DropdownItemSeparator | DropdownItemSlot).type
          ]
    );

  // #handleKeyDownEvents = (event: KeyboardEvent) => {
  //   const keyEventHandler: ((event?: KeyboardEvent) => void) | undefined =
  //     dropdownKeyEventsDictionary[event.code];

  //   if (keyEventHandler) {
  //     event.stopPropagation();
  //     keyEventHandler(event);
  //   }
  // };

  #processEvent = (
    event: MouseEvent | PointerEvent,
    type: "click" | "mouseover" | "mouseout"
  ) => {
    const modelToUpdateExpanded = getDropdownModelInEvent(event);

    console.log(modelToUpdateExpanded);

    if (modelToUpdateExpanded === undefined) {
      return;
    }

    if (modelToUpdateExpanded === DROPDOWN_RENDER_TAG_NAME) {
      if (type === "click") {
        const newExpandedValue = !this.expanded;

        if (!newExpandedValue) {
          collapseAllItems(this.model);
        }

        this.expanded = newExpandedValue;
        this.expandedChange.emit(newExpandedValue);
      }

      return;
    }

    if (type === "mouseout") {
      collapseSubTree(modelToUpdateExpanded.item);

      // TODO: Emit expandedChange event
    } else {
      collapseAllItems(this.model);
      expandFromRootToNode(modelToUpdateExpanded);

      const isExpanded =
        type === "mouseover" || modelToUpdateExpanded.item.expanded;

      if (modelToUpdateExpanded.item.expanded !== isExpanded) {
        modelToUpdateExpanded.item.expanded = isExpanded;

        // Only emit the event if the expanded value was changed
        this.expandedItemChange.emit({
          item: modelToUpdateExpanded.item,
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

  // #handleDropdownKeyDown = (event: KeyboardEvent) => {};

  #closeOnClickOutside = (event: MouseEvent) => {
    const composedPath = event.composedPath();

    if (!composedPath.includes(this.el)) {
      this.#closeDropdown();
    }
  };

  #closeOnClickOutsideKeyboard = (event: KeyboardEvent) => {
    if (event.code === KEY_CODES.ESCAPE) {
      this.#closeDropdown();
    }
  };

  #closeDropdown = () => {
    collapseAllItems(this.model);

    this.expanded = false;
    this.expandedChange.emit();
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

  #setExtendedModel = (model: DropdownModel) => {
    this.#modelExtended = [];
    parseSubModel(model, this.#modelExtended, undefined);
  };

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
        // onKeyDown={canAddEventListeners && this.#handleDropdownKeyDown}
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
          <slot name="action" />
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
          >
            {this.model !== undefined && this.#renderItems(this.#modelExtended)}
          </ch-popover>
        )}
      </Host>
    );
  }
}
