import {
  Component,
  Element,
  Event,
  EventEmitter,
  forceUpdate,
  h,
  Listen,
  Prop,
  Watch
} from "@stencil/core";
import {
  DropdownExpandedChangeEvent,
  DropdownItemActionable,
  DropdownItemModelExtended,
  DropdownModel,
  DropdownModelExtended
} from "./types";
import { DropdownPosition } from "./internal/dropdown/types";
import { fromGxImageToURL } from "../tree-view/genexus-implementation";
// import { dropdownKeyEventsDictionary } from "./utils";
import { getDropdownModelInEvent } from "./mouse-actions";
import { ChPopoverCustomEvent } from "../../components";

const setMainDropdownInitialModel = (): DropdownItemModelExtended => ({
  item: { caption: undefined, expanded: false },
  parentItem: undefined,
  items: []
});

@Component({
  tag: "ch-dropdown-render",
  styleUrl: "dropdown-render.scss",
  shadow: true // Necessary to avoid focus capture
})
export class ChDropdownRender {
  #mainDropdownModel: DropdownItemModelExtended = setMainDropdownInitialModel();

  @Element() el: HTMLChDropdownRenderElement;

  /**
   * This attribute lets you specify the label for the first expandable button.
   * Important for accessibility.
   */
  @Prop() readonly buttonAccessibleName: string;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxImageConstructor?: (name: string) => any;

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly gxSettings?: any;

  /**
   * This callback is executed when an item is clicked.
   */
  @Prop() readonly itemClickCallback: (
    event: UIEvent,
    target: string,
    itemId: string
  ) => void;

  /**
   * This property lets you define the model of the ch-dropdown control.
   */
  @Prop() readonly model: DropdownModel;
  @Watch("model")
  modelChanged() {
    this.#mainDropdownModel = setMainDropdownInitialModel();
    this.#setExtendedModel(this.model);
  }

  /**
   * Specifies the position of the dropdown section that is placed relative to
   * the expandable button.
   */
  @Prop() readonly position: DropdownPosition = "Center_OutsideEnd";

  /**
   * This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.
   */
  @Prop() readonly useGxRender?: boolean = false;

  /**
   * Fired when the visibility of a dropdown item is changed.
   */
  @Event() expandedChange: EventEmitter<DropdownExpandedChangeEvent>;

  @Listen("popoverClosed", { passive: true })
  onExpandedChange(event: ChPopoverCustomEvent<void>) {
    event.stopPropagation();

    // TODO: Add flag to emit the expandedChange event for every dropdown that
    // will be collapsed by this function
    this.#collapseAllItems(this.model);
    this.#mainDropdownModel.item.expanded = false;

    forceUpdate(this);
  }

  #handleItemClick = (target: string, itemId: string) => (event: UIEvent) => {
    if (this.itemClickCallback) {
      this.itemClickCallback(event, target, itemId);
    }
  };

  #renderItem =
    (level: number, parentExtendedModel: DropdownModelExtended) =>
    (item: DropdownItemActionable, index: number) => {
      const hasItems = item.items?.length > 0;
      const itemUIModelExtended = parentExtendedModel[index];

      return (
        <ch-dropdown
          id={item.id}
          caption={item.caption}
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
          expandable={hasItems}
          expanded={item.expanded}
          href={item.link?.url}
          itemClickCallback={this.#handleItemClick(item.link?.url, item.id)}
          model={itemUIModelExtended}
          parts={item.parts}
          position={item.itemsPosition || "OutsideEnd_InsideStart"}
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
          {hasItems &&
            item.expanded &&
            item.items.map(
              this.#renderItem(level + 1, itemUIModelExtended.items!)
            )}

          {
            // Render a dummy element if the control was not expanded and has items
            hasItems && !item.expanded && (
              <ch-dropdown model={itemUIModelExtended}></ch-dropdown>
            )
          }
        </ch-dropdown>
      );
    };

  // #handleKeyDownEvents = (event: KeyboardEvent) => {
  //   const keyEventHandler: ((event?: KeyboardEvent) => void) | undefined =
  //     dropdownKeyEventsDictionary[event.code];

  //   if (keyEventHandler) {
  //     event.stopPropagation();
  //     keyEventHandler(event);
  //   }
  // };

  #collapseAllItems = (model: DropdownModel) => {
    // For loop is the fastest iterator
    for (let index = 0; index < model.length; index++) {
      const itemUIModel = model[index];

      if (itemUIModel.type !== "separator" && itemUIModel.expanded) {
        itemUIModel.expanded = false;

        if (itemUIModel.items?.length > 0) {
          this.#collapseAllItems(itemUIModel.items);
        }
      }
    }
  };

  #collapseSubTree = (item: DropdownItemActionable) => {
    item.expanded = false;

    if (item.items?.length > 0) {
      this.#collapseAllItems(item.items);
    }
  };

  #expandFromRootToNode = (itemUIModelExtended: DropdownItemModelExtended) => {
    let parentUIModelExtended = itemUIModelExtended;

    while (parentUIModelExtended !== undefined) {
      parentUIModelExtended.item.expanded = true;

      parentUIModelExtended = parentUIModelExtended.parentItem;
    }
  };

  #processEvent = (
    event: MouseEvent | PointerEvent,
    type: "click" | "mouseover" | "mouseout"
  ) => {
    const modelToUpdateExpanded = getDropdownModelInEvent(event);

    if (modelToUpdateExpanded === undefined) {
      return;
    }

    if (type === "mouseout") {
      this.#collapseSubTree(modelToUpdateExpanded.item);

      // TODO: Emit expandedChange event
    } else {
      this.#collapseAllItems(this.model);
      this.#expandFromRootToNode(modelToUpdateExpanded);

      const isExpanded =
        type === "mouseover" ? true : modelToUpdateExpanded.item.expanded;

      if (modelToUpdateExpanded.item.expanded !== isExpanded) {
        modelToUpdateExpanded.item.expanded = isExpanded;

        // Only emit the event if the expanded value was changed
        this.expandedChange.emit({
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

  #parseSubModel = (
    parentModel: DropdownModel,
    parentModelExtended: DropdownModelExtended,
    parentItem: DropdownItemModelExtended | undefined
  ) => {
    // For loop is the fastest iterator
    for (let index = 0; index < parentModel.length; index++) {
      const itemUIModel = parentModel[index];

      if (itemUIModel.type !== "separator" && itemUIModel.items?.length > 0) {
        const subModelExtended: DropdownModelExtended = [];

        const itemUIModelExtended: DropdownItemModelExtended = {
          item: itemUIModel,
          parentItem,
          items: subModelExtended
        };

        this.#parseSubModel(
          itemUIModel.items,
          subModelExtended,
          itemUIModelExtended
        );

        parentModelExtended.push(itemUIModelExtended);
      }
    }
  };

  #setExtendedModel = (model: DropdownModel) => {
    this.#parseSubModel(
      model,
      this.#mainDropdownModel.items,
      this.#mainDropdownModel
    );
  };

  connectedCallback() {
    this.#setExtendedModel(this.model);
  }

  render() {
    return (
      <ch-dropdown
        buttonAccessibleName={this.buttonAccessibleName}
        expandable
        expanded={this.#mainDropdownModel.item.expanded}
        firstLevel
        model={this.#mainDropdownModel}
        position={this.position}
        // onKeyDown={
        //   this.#mainDropdownLazyModel.wasExpanded
        //     ? this.#handleKeyDownEvents
        //     : null
        // }
        onClick={this.#handleDropdownItemClick}
        onMouseOver={this.#handleDropdownItemMouseOver}
        onMouseOut={
          this.#mainDropdownModel.item.expanded
            ? this.#handleDropdownItemMouseOut
            : undefined
        }
      >
        <slot name="action" slot="action" />

        {this.#mainDropdownModel.item.expanded &&
          this.model != null &&
          this.model.map(this.#renderItem(0, this.#mainDropdownModel.items))}
      </ch-dropdown>
    );
  }
}
