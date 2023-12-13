import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  State,
  Watch,
  h
} from "@stencil/core";
import {
  DraggableView,
  DraggableViewInfo,
  FlexibleLayoutWidget
} from "../flexible-layout/types";
import { inBetween, removeDragImage, tokenMap } from "../../common/utils";
import { TabSelectedItemInfo, TabType } from "./types";
import {
  BUTTON_CLASS,
  CAPTION_ID,
  CLOSE_BUTTON_PART,
  DRAG_PREVIEW,
  IMAGE_CLASS,
  PAGE_CLASS,
  PAGE_CONTAINER_CLASS,
  PAGE_ID,
  PAGE_NAME_CLASS,
  SELECTED_PART,
  TAB_LIST_CLASS,
  TabElementSize
} from "./utils";

const MOUSE_OFFSET_X = "--ch-tab-mouse-offset-x";
const MOUSE_OFFSET_Y = "--ch-tab-mouse-offset-y";

const MOUSE_POSITION_X = "--ch-tab-mouse-position-x";
const MOUSE_POSITION_Y = "--ch-tab-mouse-position-y";

const setMousePosition = (
  element: HTMLElement,
  positionX: number,
  positionY: number
) => {
  element.style.setProperty(MOUSE_POSITION_X, `${positionX}px`);
  element.style.setProperty(MOUSE_POSITION_Y, `${positionY}px`);
};

const setMouseOffset = (
  element: HTMLElement,
  offsetX: number,
  offsetY: number
) => {
  element.style.setProperty(MOUSE_OFFSET_X, `${offsetX}px`);
  element.style.setProperty(MOUSE_OFFSET_Y, `${offsetY}px`);
};

@Component({
  shadow: true,
  styleUrl: "tab.scss",
  tag: "ch-tab"
})
export class ChTab implements DraggableView {
  private classes: {
    BUTTON?: string;
    IMAGE?: string;
    PAGE?: string;
    PAGE_CONTAINER?: string;
    PAGE_NAME?: string;
    TAB_LIST?: string;
  } = {};
  private lastSelectedItem = -1;

  private showCaptions: boolean;

  private lastDragEvent: DragEvent;
  private needForRAF = true; // To prevent redundant RAF (request animation frame) calls

  /**
   * This variable represents the boundaries of the box where the mouse can be
   * placed when dragging a caption, to consider that the caption is within the
   * tab list.
   */
  private mouseBoundingLimits: TabElementSize;

  // Refs
  private tabListRef: HTMLDivElement;
  private tabPageRef: HTMLDivElement;

  @Element() el: HTMLChTabElement;

  @State() draggedElementIndex = -1;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element.
   */
  @Prop() readonly accessibleName: string;

  /**
   * Specifies a short string, typically 1 to 3 words, that authors associate
   * with an element to provide users of assistive technologies with a label
   * for the element. This label is used for the close button of the captions.
   */
  @Prop() readonly closeButtonAccessibleName: string = "Close";

  /**
   * `true` if the group has is view section expanded. Otherwise, only the
   * toolbar will be displayed.
   */
  @Prop() readonly expanded: boolean = true;

  /**
   * Specifies the items that are displayed in the group.
   */
  @Prop() readonly items: FlexibleLayoutWidget[];
  @Watch("items")
  handleItemsChange(newItems: FlexibleLayoutWidget[]) {
    this.updateSelectedIndex(newItems);
  }

  /**
   * `true` to display the name of the page.
   */
  @Prop() readonly showPageName: boolean = true;

  /**
   * Specifies the flexible layout type.
   */
  @Prop({ reflect: true }) readonly type: TabType;

  /**
   * Fired when an item of the main group is double clicked.
   */
  @Event() expandMainGroup: EventEmitter<string>;

  /**
   * Fired the close button of an item is clicked.
   */
  @Event() itemClose: EventEmitter<string>;

  /**
   * Fired when the selected item change.
   */
  @Event() selectedItemChange: EventEmitter<TabSelectedItemInfo>;

  /**
   * Returns the info associated to the draggable view.
   */
  @Method()
  async getDraggableViews(): Promise<DraggableViewInfo> {
    return {
      mainView: this.el,
      pageView: this.tabPageRef,
      tabListView: this.tabListRef
    };
  }

  private handleSelectedItemChange =
    (index: number, itemId: string) => (event: MouseEvent) => {
      event.stopPropagation();

      this.selectedItemChange.emit({
        lastSelectedIndex: this.lastSelectedItem,
        newSelectedId: itemId,
        newSelectedIndex: index,
        type: this.type
      });

      this.lastSelectedItem = index;
    };

  private updateSelectedIndex(items: FlexibleLayoutWidget[]) {
    if (items == null) {
      this.lastSelectedItem = -1;
      return;
    }

    this.lastSelectedItem = items.findIndex(item => item.selected);
  }

  private handleItemDblClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    this.expandMainGroup.emit();
  };

  private handleDragStart = (index: number) => (event: DragEvent) => {
    // Set effect
    event.dataTransfer.effectAllowed = "move";

    removeDragImage(event);

    // Store the index of the dragged element
    this.draggedElementIndex = index;

    // Read operations
    const mousePositionX = event.clientX;
    const mousePositionY = event.clientY;

    const buttonRect = (
      event.target as HTMLButtonElement
    ).getBoundingClientRect();
    const tabListRect = this.tabListRef.getBoundingClientRect();

    // Button information
    const buttonSizes: TabElementSize = {
      xStart: buttonRect.x,
      xEnd: buttonRect.x + buttonRect.width,
      yStart: buttonRect.y,
      yEnd: buttonRect.y + buttonRect.height
    };

    const mouseDistanceToButtonTopEdge = mousePositionY - buttonSizes.yStart;
    const mouseDistanceToButtonBottomEdge = buttonSizes.yEnd - mousePositionY;
    const mouseDistanceToButtonLeftEdge = mousePositionX - buttonSizes.xStart;
    const mouseDistanceToButtonRightEdge = buttonSizes.xEnd - mousePositionX;

    // Tab List information
    const tabListSizes: TabElementSize = {
      xStart: tabListRect.x,
      xEnd: tabListRect.x + tabListRect.width,
      yStart: tabListRect.y,
      yEnd: tabListRect.y + tabListRect.height
    };

    // Mouse limits
    this.mouseBoundingLimits = {
      xStart: tabListSizes.xStart - mouseDistanceToButtonRightEdge,
      xEnd: tabListSizes.xEnd + mouseDistanceToButtonLeftEdge,
      yStart: tabListSizes.yStart - mouseDistanceToButtonBottomEdge,
      yEnd: tabListSizes.yEnd + mouseDistanceToButtonTopEdge
    };

    // Initialize mouse position to avoid initial flickering
    setMousePosition(this.el, mousePositionX, mousePositionY);

    // Update mouse offset to correctly place the dragged element preview
    setMouseOffset(
      this.el,
      mouseDistanceToButtonLeftEdge,
      mouseDistanceToButtonTopEdge
    );

    document.body.addEventListener("dragover", this.handleItemDrag, {
      capture: true
    });
  };

  private handleDragEnd = () => {
    document.body.removeEventListener("dragover", this.handleItemDrag, {
      capture: true
    });

    // Restore visibility of the dragged element
    this.draggedElementIndex = -1;
  };

  private handleItemDrag = (event: DragEvent) => {
    event.preventDefault();
    this.lastDragEvent = event;

    if (!this.needForRAF) {
      return;
    }
    this.needForRAF = false; // No need to call RAF up until next frame

    requestAnimationFrame(() => {
      this.needForRAF = true; // RAF now consumes the movement instruction so a new one can come

      const mousePositionX = this.lastDragEvent.clientX;
      const mousePositionY = this.lastDragEvent.clientY;

      const mouseLimits = this.mouseBoundingLimits;

      const draggedButtonIsInsideTheTabList =
        inBetween(mouseLimits.xStart, mousePositionX, mouseLimits.xEnd) &&
        inBetween(mouseLimits.yStart, mousePositionY, mouseLimits.yEnd);

      setMousePosition(this.el, mousePositionX, mousePositionY);

      console.log(draggedButtonIsInsideTheTabList ? "INSIDE" : "outside...");
    });
  };

  private handleClose = (itemId: string) => (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    this.itemClose.emit(itemId);
  };

  private renderTabBar = () => (
    <div
      role="tablist"
      aria-label={this.accessibleName}
      class={this.classes.TAB_LIST}
      part={this.classes.TAB_LIST}
      ref={el => (this.tabListRef = el)}
    >
      {this.items.map((item, index) => (
        <button
          key={CAPTION_ID(item.id)}
          id={CAPTION_ID(item.id)}
          role="tab"
          aria-controls={PAGE_ID(item.id)}
          aria-label={!this.showCaptions ? item.name : null}
          aria-selected={(!!item.selected).toString()}
          class={{
            [this.classes.BUTTON]: true,
            "dragged-element": this.draggedElementIndex === index
          }}
          part={tokenMap({
            [this.classes.BUTTON]: true,
            [CAPTION_ID(item.id)]: true,
            [SELECTED_PART]: item.selected
          })}
          onClick={
            !item.selected
              ? this.handleSelectedItemChange(index, item.id)
              : null
          }
          onDblClick={this.type === "main" ? this.handleItemDblClick : null}
          // Drag and drop
          onDragStart={this.handleDragStart(index)}
          onDragEnd={this.handleDragEnd}
        >
          {item.startImageSrc && (
            <img
              aria-hidden="true"
              class={{ [this.classes.IMAGE]: true, "caption-image": true }}
              part={this.classes.IMAGE}
              alt=""
              src={item.startImageSrc}
              loading="lazy"
            />
          )}

          {this.showCaptions && item.name}

          {this.showCaptions && (
            <button
              aria-label={this.closeButtonAccessibleName}
              class="close-button"
              part={CLOSE_BUTTON_PART}
              type="button"
              onClick={this.handleClose(item.id)}
            ></button>
          )}
        </button>
      ))}
    </div>
  );

  private renderTabPages = () => (
    <div
      class={{
        [this.classes.PAGE_CONTAINER]: true,
        "page-container": true,
        "page-container--collapsed": !this.expanded
      }}
      part={this.classes.PAGE_CONTAINER}
      ref={el => (this.tabPageRef = el)}
    >
      {this.items.map(item => (
        <div
          key={PAGE_ID(item.id)}
          id={PAGE_ID(item.id)}
          role="tabpanel"
          aria-labelledby={CAPTION_ID(item.name)}
          class={{
            [this.classes.PAGE]: true,
            "page--hidden": !item.selected
          }}
          part={this.classes.PAGE}
        >
          {this.showPageName &&
            (this.type === "inlineStart" || this.type === "inlineEnd") && (
              <span aria-hidden="true" part={this.classes.PAGE_NAME}>
                {item.name}
              </span>
            )}
          {item.wasRendered && <slot name={item.id} />}
        </div>
      ))}
    </div>
  );

  private renderDragPreview = (
    draggedIndex: number,
    draggedElement: FlexibleLayoutWidget
  ) => (
    <button
      aria-hidden="true"
      class={{
        [this.classes.BUTTON]: true,
        [DRAG_PREVIEW]: true
      }}
      part={tokenMap({
        [this.classes.BUTTON]: true,
        [CAPTION_ID(draggedIndex.toString())]: true,
        [DRAG_PREVIEW]: true,
        [SELECTED_PART]: true
      })}
    >
      {draggedElement.startImageSrc && (
        <img
          class={{ [this.classes.IMAGE]: true, "caption-image": true }}
          part={this.classes.IMAGE}
          alt=""
          src={draggedElement.startImageSrc}
          loading="lazy"
        />
      )}

      {this.showCaptions && draggedElement.name}
    </button>
  );

  componentWillLoad() {
    this.updateSelectedIndex(this.items);

    // Initialize classes
    this.classes = {
      BUTTON: BUTTON_CLASS(this.type),
      IMAGE: IMAGE_CLASS(this.type),
      PAGE: PAGE_CLASS(this.type),
      PAGE_CONTAINER: PAGE_CONTAINER_CLASS(this.type),
      PAGE_NAME: PAGE_NAME_CLASS(this.type),
      TAB_LIST: TAB_LIST_CLASS(this.type)
    };

    this.showCaptions = this.type === "main" || this.type === "blockEnd";
  }

  render() {
    if (this.items == null || this.items.length === 0) {
      return "";
    }

    const draggedIndex = this.draggedElementIndex;
    const draggedElement = this.items[draggedIndex];

    return (
      <Host>
        {this.renderTabBar()}
        {this.renderTabPages()}

        {draggedIndex !== -1 &&
          this.renderDragPreview(draggedIndex, draggedElement)}
      </Host>
    );
  }
}
