import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";
import { state } from "lit/decorators/state.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

import {
  addCursorInDocument,
  removePointerEventsInDocumentBody,
  resetCursorInDocument,
  resetPointerEventsInDocumentBody
} from "../../utilities/cursor-and-pointer-events.js";
import { LAYOUT_SPLITTER_PARTS_DICTIONARY } from "../../utilities/reserved-names/parts/layout-splitter.js";
import { isRTL } from "../../utilities/rtl-watcher.js";
import { SyncWithRAF } from "../../utilities/sync-with-frames.js";
import { addSiblingLeaf } from "./add-sibling-item.js";
import { ROOT_VIEW } from "./constants.js";
import { NO_FIXED_SIZES_TO_UPDATE, removeItem } from "./remove-item.js";
import type {
  DragBarMouseDownEventInfo,
  GroupExtended,
  ItemExtended,
  LayoutSplitterDirection,
  LayoutSplitterGroupModel,
  LayoutSplitterItemAddResult,
  LayoutSplitterItemModel,
  LayoutSplitterItemRemoveResult,
  LayoutSplitterLeafModel,
  LayoutSplitterModel,
  LayoutSplitterSticky
} from "./types";
import {
  fixAndUpdateLayoutModel,
  FIXED_SIZES_SUM_CUSTOM_VAR,
  getMousePosition,
  sizesToGridTemplate,
  updateComponentsAndDragBar
} from "./utils.js";

import styles from "./layout-splitter.scss?inline";

type Group = LayoutSplitterGroupModel;
type Item = LayoutSplitterItemModel;

const GRID_TEMPLATE_DIRECTION_CUSTOM_VAR = "--ch-layout-splitter__distribution";
const STICKY_BLOCK_START_PROP = "inset-block-start";
const STICKY_BLOCK_END_PROP = "inset-block-end";
const STICKY_INLINE_START_PROP = "inset-inline-start";
const STICKY_INLINE_END_PROP = "inset-inline-end";

const DIRECTION_CLASS = (direction: LayoutSplitterDirection) =>
  `group direction--${direction}`;

const TEMPLATE_STYLE = (
  items: Item[],
  itemsInfo: Map<string, ItemExtended>,
  fixedSizesSum: number,
  sticky?: LayoutSplitterSticky
) => ({
  [GRID_TEMPLATE_DIRECTION_CUSTOM_VAR]: sizesToGridTemplate(
    items,
    itemsInfo,
    items.length - 1
  ),
  [FIXED_SIZES_SUM_CUSTOM_VAR]: `${fixedSizesSum}px`,
  [STICKY_BLOCK_START_PROP]: sticky?.blockStart,
  [STICKY_BLOCK_END_PROP]: sticky?.blockEnd,
  [STICKY_INLINE_START_PROP]: sticky?.inlineStart,
  [STICKY_INLINE_END_PROP]: sticky?.inlineEnd
});

const getAriaControls = (layoutItems: Item[], index: number) =>
  `${layoutItems[index].id} ${layoutItems[index + 1].id}`;

// Key codes
const ARROW_UP = "ArrowUp";
const ARROW_RIGHT = "ArrowRight";
const ARROW_DOWN = "ArrowDown";
const ARROW_LEFT = "ArrowLeft";

/**
 * This component allows us to design a layout composed by columns and rows.
 *  - Columns and rows can have relative (`fr`) or absolute (`px`) size.
 *  - The line that separates two columns or two rows will always have a drag-bar to resize the layout.
 *
 * @csspart bar - The bar that divides two columns or two rows
 */
@Component({
  styles,
  tag: "ch-layout-splitter"
})
export class ChLayoutSplitter extends KasstorElement {
  // Sync computations with frames
  #dragRAF: SyncWithRAF | undefined; // Don't allocate memory until needed when dragging

  #mouseDownInfo: DragBarMouseDownEventInfo | undefined;
  #lastMousePosition: number | undefined;
  #newMousePosition: number | undefined;

  #fixedSizesSumRoot: number | undefined;

  // Distribution of elements
  #itemsInfo: Map<string, ItemExtended> = new Map();

  @state() protected dragging = false;

  /**
   * This attribute lets you specify the label for the drag bar.
   * Important for accessibility.
   */
  @property({ attribute: "bar-accessible-name" }) barAccessibleName: string =
    "Resize";

  /**
   * This attribute lets you specify if the resize operation is disabled in all
   * drag bars. If `true`, the drag bars are disabled.
   */
  @property({ type: Boolean, attribute: "drag-bar-disabled" })
  dragBarDisabled: boolean = false;

  /**
   * Specifies the resizing increment (in pixel) that is applied when using the
   * keyboard to resize a drag bar.
   */
  @property({ type: Number, attribute: "increment-with-keyboard" })
  incrementWithKeyboard: number = 2;

  /**
   * Specifies the list of component that are displayed. Each component will be
   * separated via a drag bar.
   */
  @property({ attribute: false }) model: LayoutSplitterModel = {
    id: "root",
    direction: "columns",
    items: []
  };
  @Observe("model")
  protected modelChanged(newModel: LayoutSplitterModel) {
    this.#updateLayoutInfo(newModel);
  }

  /**
   * Schedules a new render of the control even if no state changed.
   */
  // @Method()
  refreshLayout() {
    this.requestUpdate();
  }

  /**
   *
   */
  // @Method()
  addSiblingLeaf(
    parentGroup: string,
    siblingItem: string,
    placedInTheSibling: "before" | "after",
    leafInfo: LayoutSplitterLeafModel,
    takeHalfTheSpaceOfTheSiblingItem: boolean
  ): LayoutSplitterItemAddResult {
    const result = addSiblingLeaf(
      parentGroup,
      siblingItem,
      placedInTheSibling,
      leafInfo,
      this.#itemsInfo,
      takeHalfTheSpaceOfTheSiblingItem
    );

    if (result.success) {
      const fixedSizesSumIncrement = result.fixedSizesSumIncrement;

      // The fixesSizesSum of the parent must be updated
      if (fixedSizesSumIncrement) {
        const parentItem = this.#itemsInfo.get(parentGroup).parentItem;

        if (parentItem === ROOT_VIEW) {
          this.#fixedSizesSumRoot += fixedSizesSumIncrement;
        } else {
          (this.#itemsInfo.get(parentItem.id) as GroupExtended).fixedSizesSum +=
            fixedSizesSumIncrement;
        }
      }

      // Queue re-renders
      this.requestUpdate();
    }

    return result;
  }

  /**
   * Removes the item that is identified by the given ID.
   * The layout is rearranged depending on the state of the removed item.
   */
  // @Method()
  removeItem(itemId: string): LayoutSplitterItemRemoveResult {
    const parentItem = this.#itemsInfo.get(itemId).parentItem;
    const result = removeItem(itemId, this.#itemsInfo);

    if (result.success) {
      const fixedSizesSumDecrement = result.fixedSizesSumDecrement;

      // The fixesSizesSum of the parent must be updated
      if (fixedSizesSumDecrement !== NO_FIXED_SIZES_TO_UPDATE) {
        if (parentItem === ROOT_VIEW) {
          this.#fixedSizesSumRoot -= fixedSizesSumDecrement;
        } else {
          (this.#itemsInfo.get(parentItem.id) as GroupExtended).fixedSizesSum -=
            fixedSizesSumDecrement;
        }
      }

      // Queue re-renders
      this.requestUpdate();
    }

    return result;
  }

  #handleBarDrag = (event: MouseEvent) => {
    event.preventDefault();
    this.#newMousePosition = getMousePosition(
      event,
      this.#mouseDownInfo.direction
    );

    this.#mouseDownInfo.mouseEvent = event;

    this.#dragRAF.perform(this.#handleBarDragRAF);
  };

  #handleBarDragRAF = (incrementInPx?: number) => {
    updateComponentsAndDragBar(
      this.#mouseDownInfo,
      this.#itemsInfo,
      incrementInPx ?? this.#newMousePosition - this.#lastMousePosition, // Increment in px
      GRID_TEMPLATE_DIRECTION_CUSTOM_VAR
    );

    // Sync new position with last
    this.#lastMousePosition = this.#newMousePosition;
  };

  // Handler to remove mouse down
  #removeMouseMoveHandler = () =>
    document.removeEventListener("mousemove", this.#handleBarDrag, {
      capture: true
    });

  // Remove mousemove and mouseup handlers when mouseup
  #mouseUpHandler = () => {
    this.dragging = false;

    // Cancel RAF to prevent access to undefined references
    if (this.#dragRAF) {
      this.#dragRAF.cancel();
    }

    // Remove handlers and state after finishing the resize
    this.#removeMouseMoveHandler();
    resetCursorInDocument();

    // Add again pointer-events
    resetPointerEventsInDocumentBody();

    document.removeEventListener("mouseup", this.#mouseUpHandler, {
      capture: true
    });
  };

  #initializeDragBarValuesForResizeProcessing = (
    direction: LayoutSplitterDirection,
    index: number,
    layoutItems: Item[],
    event: Event
  ) => {
    // Initialize the values needed for drag processing
    const dragBar = event.target as HTMLElement;
    const dragBarContainer = dragBar.parentElement!;

    this.#mouseDownInfo = {
      container: dragBarContainer,
      containerSize:
        direction === "columns"
          ? dragBarContainer.clientWidth
          : dragBarContainer.clientHeight,
      direction: direction,
      dragBar: dragBar,
      fixedSizesSumRoot: this.#fixedSizesSumRoot,
      itemStartId: layoutItems[index].id,
      itemEndId: layoutItems[index + 1].id,
      layoutItems: layoutItems,
      mouseEvent: undefined, // MouseEvent is initialized as undefined, since this object is used for the keyboard event
      RTL: isRTL()
    };
  };

  #mouseDownHandler =
    (direction: LayoutSplitterDirection, index: number, layoutItems: Item[]) =>
    (event: MouseEvent) => {
      this.dragging = true;

      // Necessary to prevent selecting the inner image (or other elements) of
      // the bar item when the mouse is down
      event.preventDefault();

      this.#dragRAF ??= new SyncWithRAF();

      this.#initializeDragBarValuesForResizeProcessing(
        direction,
        index,
        layoutItems,
        event
      );

      // Set mouse cursor in the document
      addCursorInDocument(direction === "columns" ? "ew-resize" : "ns-resize");

      // Remove pointer-events during drag
      removePointerEventsInDocumentBody();

      // Mouse position
      const currentMousePosition = getMousePosition(event, direction);
      this.#lastMousePosition = currentMousePosition;
      this.#newMousePosition = currentMousePosition; // Also updated in mouse move

      // Add listeners
      document.addEventListener("mousemove", this.#handleBarDrag, {
        capture: true
      });
      document.addEventListener("mouseup", this.#mouseUpHandler, {
        capture: true,
        passive: true
      });
    };

  #handleResize =
    (direction: LayoutSplitterDirection, index: number, layoutItems: Item[]) =>
    (event: KeyboardEvent) => {
      if (
        (direction === "rows" &&
          event.code !== ARROW_UP &&
          event.code !== ARROW_DOWN) ||
        (direction === "columns" &&
          event.code !== ARROW_LEFT &&
          event.code !== ARROW_RIGHT)
      ) {
        return;
      }

      // Prevent scroll
      event.preventDefault();

      this.#initializeDragBarValuesForResizeProcessing(
        direction,
        index,
        layoutItems,
        event
      );

      const positiveIncrement =
        event.code === ARROW_RIGHT || event.code === ARROW_DOWN;

      this.#handleBarDragRAF(
        positiveIncrement
          ? this.incrementWithKeyboard
          : -this.incrementWithKeyboard
      );
    };

  #renderItem = (
    direction: LayoutSplitterDirection,
    lastComponentIndex: number,
    layoutItems: Item[],
    item: Item,
    index: number
  ): TemplateResult => {
    const itemUIModel = this.#itemsInfo.get(item.id)!;
    const isSticky = !!item.sticky;

    return [
      (item as Group).items
        ? html`<div
            id=${item.id}
            class=${classMap({
              [DIRECTION_CLASS((item as Group).direction)]: true,
              sticky: isSticky
            })}
            part=${item.id}
            style=${styleMap(
              TEMPLATE_STYLE(
                (item as Group).items,
                this.#itemsInfo,
                (itemUIModel as GroupExtended).fixedSizesSum,
                item.sticky
              )
            )}
          >
            ${this.#renderItems(
              (item as Group).direction,
              (item as Group).items,
              (item as Group).items.length - 1
            )}
          </div>`
        : html`<div
            id=${item.id}
            class=${isSticky ? "leaf sticky" : "leaf"}
            style=${isSticky
              ? styleMap({
                  [STICKY_BLOCK_START_PROP]: item.sticky?.blockStart,
                  [STICKY_BLOCK_END_PROP]: item.sticky?.blockEnd,
                  [STICKY_INLINE_START_PROP]: item.sticky?.inlineStart,
                  [STICKY_INLINE_END_PROP]: item.sticky?.inlineEnd
                })
              : nothing}
          >
            <slot name=${item.id}></slot>
          </div>`,

      item.dragBar?.hidden !== true &&
        index !== lastComponentIndex &&
        html`<div
          role="separator"
          aria-controls=${getAriaControls(layoutItems, index)}
          aria-disabled=${this.dragBarDisabled ? "true" : nothing}
          aria-label=${this.barAccessibleName}
          aria-orientation=${direction === "columns"
            ? "vertical"
            : "horizontal"}
          aria-valuetext=${
            // TODO: Add aria-valuenow
            itemUIModel.actualSize
          }
          title=${this.barAccessibleName}
          tabindex="0"
          class="bar"
          part=${item.dragBar?.part
            ? `${LAYOUT_SPLITTER_PARTS_DICTIONARY.BAR} ${item.dragBar.part}`
            : LAYOUT_SPLITTER_PARTS_DICTIONARY.BAR}
          style=${item.dragBar?.size
            ? `--size: ${item.dragBar.size}px`
            : nothing}
          @keyDown=${!this.dragBarDisabled
            ? this.#handleResize(direction, index, layoutItems)
            : nothing}
          @mouseDown=${!this.dragBarDisabled
            ? this.#mouseDownHandler(direction, index, layoutItems)
            : nothing}
        ></div>`
    ];
  };

  #renderItems = (
    direction: LayoutSplitterDirection,
    layoutItems: Item[],
    lastComponentIndex: number
  ) =>
    layoutItems.map((item, index) =>
      this.#renderItem(direction, lastComponentIndex, layoutItems, item, index)
    );

  #updateLayoutInfo = (layout: LayoutSplitterModel) => {
    // Clear old information
    this.#itemsInfo.clear();

    if (layout?.items?.length > 0) {
      this.#fixedSizesSumRoot = fixAndUpdateLayoutModel(
        layout,
        this.#itemsInfo
      );
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    this.#updateLayoutInfo(this.model);
  }

  override disconnectedCallback() {
    // Defensive programming. Make sure all event listeners are removed correctly
    this.#mouseUpHandler();

    super.disconnectedCallback();
  }

  override render() {
    const layoutModel = this.model;

    if (layoutModel?.items == null) {
      return "";
    }

    return (
      // TODO: Add unit test for checking that the dialog is not closed when
      // a layout-splitter's bar is dragged
      // TODO: We should also add a dummy node in the ch-dialog or something
      // like that to not close the dialog when the mouse is released outside
      // of the ch-layout-splitter but inside the ch-dialog
      // <Host class={this.dragging ? "ch-layout-splitter--dragging" : undefined}>
      html`<div
        class=${DIRECTION_CLASS(layoutModel.direction)}
        style=${styleMap(
          TEMPLATE_STYLE(
            layoutModel.items,
            this.#itemsInfo,
            this.#fixedSizesSumRoot
          )
        )}
      >
        ${this.#renderItems(
          layoutModel.direction,
          layoutModel.items,
          layoutModel.items.length - 1
        )}
      </div>`
      // </Host>
    );
  }
}

export default ChLayoutSplitter;

declare global {
  interface HTMLElementTagNameMap {
    "ch-layout-splitter": ChLayoutSplitter;
  }
}

// ######### Auto generated bellow #########

declare global {
  // prettier-ignore
  interface HTMLChLayoutSplitterElementCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLChLayoutSplitterElement;
  }

  /**
   * This component allows us to design a layout composed by columns and rows.
   *  - Columns and rows can have relative (`fr`) or absolute (`px`) size.
   *  - The line that separates two columns or two rows will always have a drag-bar to resize the layout.
   *
   * @csspart bar - The bar that divides two columns or two rows
   */// prettier-ignore
  interface HTMLChLayoutSplitterElement extends ChLayoutSplitter {
    // Extend the ChLayoutSplitter class redefining the event listener methods to improve type safety when using them
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  interface IntrinsicElements {
    "ch-layout-splitter": HTMLChLayoutSplitterElement;
  }

  interface HTMLElementTagNameMap {
    "ch-layout-splitter": HTMLChLayoutSplitterElement;
  }
}

