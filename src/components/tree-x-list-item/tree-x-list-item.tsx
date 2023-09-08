import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  Method,
  Prop,
  Watch,
  h,
  writeTask
} from "@stencil/core";
import {
  TreeXItemDragStartInfo,
  TreeXItemDropInfo,
  TreeXListItemNewCaption,
  TreeXListItemSelectedInfo
} from "../tree-x/types";
import { mouseEventModifierKey } from "../common/helpers";

// Drag and drop
export type DragState = "enter" | "none" | "start";

const resetDragImage = new Image();

// Selectors
const TREE_ITEM_TAG_NAME = "ch-tree-x-list-item";

const DIRECT_TREE_ITEM_CHILDREN = `:scope>*>${TREE_ITEM_TAG_NAME}`;
const FIRST_ENABLED_SUB_ITEM = `${TREE_ITEM_TAG_NAME}:not([disabled])`;
const LAST_SUB_ITEM = `:scope>*>${TREE_ITEM_TAG_NAME}:last-child`;

// Keys
const EXPANDABLE_ID = "expandable";
const ENTER_KEY = "Enter";
const ESCAPE_KEY = "Escape";

/**
 * This variable specifies a reference to the main ch-tree-x element
 */
let mainTreeRef: HTMLChTreeXElement;

@Component({
  tag: "ch-tree-x-list-item",
  styleUrl: "tree-x-list-item.scss",
  shadow: true
})
export class ChTreeXListItem {
  private watcher: ResizeObserver;

  /**
   * Useful to ignore the checkbox change when it was committed from a children.
   */
  private ignoreCheckboxChange = false;

  // Refs
  private headerRef: HTMLButtonElement;
  private inputRef: HTMLInputElement;

  @Element() el: HTMLChTreeXListItemElement;

  /**
   * This attributes specifies the caption of the control
   */
  @Prop() readonly caption: string;

  /**
   * Set this attribute if you want display a checkbox in the control.
   */
  @Prop() readonly checkbox: boolean = false;

  /**
   * Set this attribute if you want the checkbox to be checked by default.
   * Only works if `checkbox = true`
   */
  @Prop({ reflect: true, mutable: true }) checked = false;
  @Watch("checked")
  updateChildrenCheckedValue(newValue: boolean) {
    if (!this.toggleCheckboxes || this.leaf || this.ignoreCheckboxChange) {
      this.ignoreCheckboxChange = false;
      return;
    }

    const treeItems = this.getDirectTreeItems();

    treeItems.forEach(treeItem => {
      treeItem.checked = newValue;
    });
  }

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop({ reflect: true }) readonly disabled: boolean = false;

  /**
   * This property lets you define the current state of the item when it's
   * being dragged.
   */
  @Prop({ mutable: true }) dragState: DragState = "none";

  /**
   * This attribute lets you specify when items are being lazy loaded in the
   * control.
   */
  @Prop() readonly downloading: boolean = false;

  /**
   * Set this attribute when the item is in edit mode
   */
  @Prop({ mutable: true }) editing = false;
  @Watch("editing")
  handleEditingChange(isEditing: boolean) {
    if (!isEditing) {
      return;
    }

    document.body.addEventListener("click", this.removeEditModeOnClick, {
      capture: true
    });

    // Wait until the input is rendered to focus it
    writeTask(() => {
      requestAnimationFrame(() => {
        if (this.inputRef) {
          this.inputRef.focus();
        }
      });
    });
  }

  /**
   * If the item has a sub-tree, this attribute determines if the subtree is
   * displayed.
   */
  @Prop({ mutable: true }) expanded = false;
  @Watch("expanded")
  handleExpandedChange(isExpanded: boolean) {
    this.lazyLoadItems(isExpanded);
  }

  /**
   * This attribute specifies if the control is the last items in its subtree
   */
  @Prop() readonly lastItem: boolean = false;
  @Watch("lastItem")
  handleLasItemChange(isLastItem: boolean) {
    if (isLastItem && this.showLines) {
      this.setResizeObserver();
    } else {
      this.disconnectObserver();
    }
  }

  /**
   * Determine if the items are lazy loaded when opening the first time the
   * control.
   */
  @Prop({ mutable: true }) lazyLoad = false;

  /**
   * The presence of this attribute determine whether the item contains a
   * subtree. `true` if the item does not have a subtree.
   */
  @Prop() readonly leaf: boolean = false;

  /**
   * Set the left side icon from the available Gemini icon set : https://gx-gemini.netlify.app/?path=/story/icons-icons--controls
   */
  @Prop() readonly leftImgSrc: string;

  /**
   * Level in the tree at which the item is placed.
   */
  @Prop({ mutable: true }) level = 0;

  /**
   * `true` if the checkbox's value is indeterminate.
   */
  @Prop({ mutable: true }) indeterminate = false;

  /**
   * Set the right side icon from the available Gemini icon set : https://gx-gemini.netlify.app/?path=/story/icons-icons--controls
   */
  @Prop() readonly rightImgSrc: string;

  /**
   * This attribute lets you specify if the item is selected
   */
  @Prop({ mutable: true, reflect: true }) selected = false;

  /**
   * `true` to show the downloading spinner when lazy loading the sub items of
   * the control.
   */
  @Prop() readonly showDownloadingSpinner: boolean = true;

  /**
   * `true` to show the expandable button that allows to expand/collapse the
   * items of the control. Only works if `leaf === false`.
   */
  @Prop() readonly showExpandableButton: boolean = true;

  /**
   * `true` to display the relation between tree items and tree lists using
   * lines.
   */
  @Prop({ mutable: true }) showLines = true;
  @Watch("showLines")
  handleShowLinesChange(newShowLines: boolean) {
    if (newShowLines && this.lastItem) {
      this.setResizeObserver();
    } else {
      this.disconnectObserver();
    }

    // @todo BUG: showLines does not update in the mainTreeRef, so we have to
    // sync the ref with the new value
    mainTreeRef.showLines = newShowLines;
  }

  /**
   * Set this attribute if you want all the children item's checkboxes to be
   * checked when the parent item checkbox is checked, or to be unchecked when
   * the parent item checkbox is unchecked.
   */
  @Prop() readonly toggleCheckboxes: boolean = false;

  /**
   * Fired when the checkbox value of the control is changed.
   */
  @Event() checkboxChange: EventEmitter<boolean>;

  /**
   * Fired when the item is being dragged.
   */
  @Event() itemDragStart: EventEmitter<TreeXItemDragStartInfo>;

  /**
   * Fired when the item is no longer being dragged.
   */
  @Event() itemDragEnd: EventEmitter;

  /**
   * Fired when an element commits to drop in the control.
   */
  @Event() itemDrop: EventEmitter<TreeXItemDropInfo>;

  /**
   * Fired when the lazy control is expanded an its content must be loaded.
   */
  @Event() loadLazyContent: EventEmitter<string>;

  /**
   * Fired when the item is asking to modify its caption.
   */
  @Event() modifyCaption: EventEmitter<TreeXListItemNewCaption>;

  /**
   * Fired when the control is selected.
   */
  @Event() selectedItemChange: EventEmitter<TreeXListItemSelectedInfo>;

  @Listen("checkboxChange")
  updateCheckboxValue(event: CustomEvent<boolean>) {
    // No need to update the checkbox value based on the children checkbox
    if (!this.toggleCheckboxes) {
      return;
    }

    const updatedCheck = event.detail;
    const treeItems = this.getDirectTreeItems();

    // Check if all the items have the same value as the updated item
    const allItemsHaveTheSameCheckedValue = treeItems.every(
      treeItem => treeItem.checked === updatedCheck
    );

    this.ignoreCheckboxChange = this.checked !== updatedCheck;
    this.checked = updatedCheck;
    this.indeterminate = !allItemsHaveTheSameCheckedValue;
  }

  /**
   * Focus the next item in the tree. If the control is expanded, it focuses
   * the first subitem in its tree.
   */
  @Method()
  async focusNextItem(ctrlKeyPressed: boolean) {
    // Focus the first subitem if expanded
    if (!this.leaf && this.expanded) {
      const subItem = this.el.querySelector(
        FIRST_ENABLED_SUB_ITEM
      ) as HTMLChTreeXListItemElement;

      // The tree item could be empty or downloading subitem, so it is uncertain
      // if the query won't fail
      if (subItem) {
        subItem.setFocus(ctrlKeyPressed);
        return;
      }
    }

    // Otherwise, focus the next sibling
    this.focusNextSibling(ctrlKeyPressed);
  }

  /**
   * Focus the next sibling item in the tree.
   */
  @Method()
  async focusNextSibling(ctrlKeyPressed: boolean) {
    const nextSiblingItem = this.el
      .nextElementSibling as HTMLChTreeXListItemElement;

    // Focus the next sibling, if exists
    if (nextSiblingItem) {
      // If the next sibling is disabled, ask for its next sibling
      if (nextSiblingItem.disabled) {
        nextSiblingItem.focusNextItem(ctrlKeyPressed);
      } else {
        nextSiblingItem.setFocus(ctrlKeyPressed);
      }
      return;
    }

    // The item is the last one of the tree at the first level
    if (this.level === 0) {
      return;
    }

    // Otherwise, ask the parent to focus the next sibling
    const parentItem = this.el.parentElement
      .parentElement as HTMLChTreeXListItemElement;
    parentItem.focusNextSibling(ctrlKeyPressed);
  }

  /**
   * Focus the previous item in the tree. If the previous item is expanded, it focuses
   * the last subitem in its tree.
   */
  @Method()
  async focusPreviousItem(ctrlKeyPressed: boolean) {
    const previousSiblingItem = this.el
      .previousElementSibling as HTMLChTreeXListItemElement;

    // Focus last item of the previous sibling
    if (previousSiblingItem) {
      previousSiblingItem.focusLastItem(ctrlKeyPressed);
      return;
    }

    // The item is the first one of the tree at the first level
    if (this.level === 0) {
      return;
    }

    // Otherwise, set focus in the parent element
    const parentItem = this.el.parentElement
      .parentElement as HTMLChTreeXListItemElement;

    // Check if the parent is not disabled
    if (parentItem.disabled) {
      parentItem.focusPreviousItem(ctrlKeyPressed);
      return;
    }

    parentItem.setFocus(ctrlKeyPressed);
  }

  /**
   * Focus the last item in its subtree. If the control is not expanded, it
   * focus the control
   */
  @Method()
  async focusLastItem(ctrlKeyPressed: boolean) {
    // Focus the last subitem if expanded and not lazy loading
    if (!this.leaf && this.expanded) {
      const lastSubItem = this.el.querySelector(
        LAST_SUB_ITEM
      ) as HTMLChTreeXListItemElement;

      console.log("focusLastItem", lastSubItem);

      // The tree item could be empty or downloading subitem, so it is uncertain
      // if the query won't fail
      if (lastSubItem) {
        lastSubItem.focusLastItem(ctrlKeyPressed);
        return;
      }
    }

    // If the last item is disabled, try to focus the previous sibling
    if (this.disabled) {
      this.focusPreviousItem(ctrlKeyPressed);
      return;
    }

    // Otherwise, it focuses the control
    this.setFocus(ctrlKeyPressed);
  }

  /**
   * Set focus in the control
   */
  @Method()
  async setFocus(ctrlKeyPressed: boolean) {
    this.headerRef.focus();

    // Normal navigation auto selects the item.
    if (!ctrlKeyPressed) {
      this.setSelected(false);
    }
  }

  private getDirectTreeItems(): HTMLChTreeXListItemElement[] {
    return Array.from(
      this.el.querySelectorAll(DIRECT_TREE_ITEM_CHILDREN)
    ) as HTMLChTreeXListItemElement[];
  }

  private setResizeObserver() {
    this.watcher = new ResizeObserver(() => {
      const distanceToCheckbox =
        this.el.getBoundingClientRect().height -
        this.headerRef.getBoundingClientRect().height / 2;

      this.el.style.setProperty(
        "--distance-to-checkbox",
        distanceToCheckbox + "px"
      );
      console.log("Interrupt");
    });

    this.watcher.observe(this.el);
    this.watcher.observe(this.headerRef);

    console.log("CONNECT...", this.caption, this.el);
  }

  private disconnectObserver() {
    if (!this.watcher) {
      return;
    }
    this.watcher.disconnect();
    this.watcher = null;

    console.log("DISCONNECT...", this.caption, this.el);
  }

  private checkIfShouldRemoveEditMode = (event: KeyboardEvent) => {
    event.stopPropagation();

    if (event.code !== ENTER_KEY && event.code !== ESCAPE_KEY) {
      return;
    }

    event.preventDefault();
    const commitEdition = event.code === ENTER_KEY;
    this.removeEditMode(true, commitEdition)();
  };

  private removeEditModeOnClick = (event: PointerEvent) => {
    // The click is executed outside the input and the pointer type is defined,
    // meaning that the button click was not triggered by the Enter or Space keys
    if (!event.composedPath().includes(this.inputRef) && event.pointerType) {
      this.removeEditMode(false)();
    }
  };

  private removeEditMode =
    (shouldFocusHeader: boolean, commitEdition = false) =>
    () => {
      // When pressing the enter key in the input, the removeEditMode event is
      // triggered twice (due to the headerRef.focus() triggering the onBlur
      // event in the input), so we need to check if the edit mode was disabled
      if (!this.editing) {
        return;
      }
      this.editing = false;

      document.body.removeEventListener("click", this.removeEditModeOnClick, {
        capture: true
      });

      const newCaption = this.inputRef.value;

      if (commitEdition && newCaption.trim() !== "") {
        this.modifyCaption.emit({
          id: this.el.id,
          caption: newCaption
        });
      }

      if (shouldFocusHeader) {
        this.headerRef.focus();
      }
    };

  private toggleExpand = (event: MouseEvent) => {
    event.stopPropagation();

    if (!this.leaf) {
      this.expanded = !this.expanded;
    }

    this.selected = true;
    this.selectedItemChange.emit({
      ctrlKeyPressed: mouseEventModifierKey(event),
      expanded: this.expanded,
      goToReference: false,
      id: this.el.id,
      itemRef: this.el,
      parentId: this.el.parentElement.parentElement.id,
      selected: true
    });
  };

  private lazyLoadItems(expanded: boolean) {
    if (!this.lazyLoad || !expanded) {
      return;
    }

    // Load items
    this.lazyLoad = false;

    this.loadLazyContent.emit(this.el.id);
  }

  private toggleSelected() {
    const selected = !this.selected;
    this.selected = selected;

    this.selectedItemChange.emit({
      ctrlKeyPressed: true,
      expanded: this.expanded,
      goToReference: false,
      id: this.el.id,
      itemRef: this.el,
      parentId: this.el.parentElement.parentElement.id,
      selected: selected
    });
  }

  private setSelected(goToReference: boolean) {
    console.log("SET SELECTED");

    this.selected = true;
    this.selectedItemChange.emit({
      ctrlKeyPressed: false,
      expanded: this.expanded,
      goToReference: goToReference,
      id: this.el.id,
      itemRef: this.el,
      parentId: this.el.parentElement.parentElement.id,
      selected: true
    });
  }

  private toggleOrSelect(event: MouseEvent) {
    if (mouseEventModifierKey(event)) {
      this.toggleSelected();
    } else {
      this.setSelected(true);
    }
  }

  private handleActionDblClick = (event: PointerEvent) => {
    event.stopPropagation();

    if (mouseEventModifierKey(event)) {
      this.toggleSelected();
      return;
    }

    // The Control key is not pressed, so the control can be expanded
    this.toggleExpand(event);
  };

  /**
   * Event triggered by the following actions on the main button:
   *   - Click
   *   - Enter keydown
   *   - Space keydown and keyup
   */
  private handleActionClick = (event: PointerEvent) => {
    event.stopPropagation();

    // Don't perform actions when editing
    if (this.editing) {
      return;
    }

    event.preventDefault();

    // Click event
    if (event.pointerType) {
      this.toggleOrSelect(event);
      return;
    }

    // Enter or space
    this.toggleExpand(event);
  };

  /**
   * Event triggered by key events on the main button.
   */
  private handleActionKeyDown = (event: KeyboardEvent) => {
    console.log("handleActionKeyDown", event);

    // Only toggle if the Enter key was pressed with the Ctrl key
    if (mouseEventModifierKey(event) && event.code === ENTER_KEY) {
      event.stopPropagation();
      this.toggleSelected();
    }
  };

  private handleCheckedChange = (event: CustomEvent) => {
    event.stopPropagation();

    const checked = (event.target as HTMLChCheckboxElement).checked;
    this.checked = checked;
    this.checkboxChange.emit(checked);
  };

  private renderImg = (cssClass: string, src: string) => (
    <img
      aria-hidden="true"
      class={cssClass}
      part={cssClass}
      alt=""
      src={src}
      loading="lazy"
    />
  );

  private handleDragStart = (event: DragEvent) => {
    event.stopPropagation();

    // Disallow drag when editing the caption
    if (this.editing) {
      event.preventDefault();
      return;
    }

    console.log("Drag Start", event, this.el);

    event.dataTransfer.setDragImage(resetDragImage, 0, 0);

    // this.el.style.cursor = "move";

    this.dragState = "start";
    this.itemDragStart.emit({
      elem: this.el,
      dataTransfer: event.dataTransfer
    });
  };

  private handleDragEnd = () => {
    // event.preventDefault();
    console.log("Drag End");

    // this.el.style.cursor = null;
    this.dragState = "none";
    this.itemDragEnd.emit();
  };

  private handleDrop = (event: DragEvent) => {
    event.stopPropagation();
    console.log("Drag Drop", event);

    this.dragState = "none";
    this.itemDrop.emit({
      dropItemId: this.el.id,
      dataTransfer: event.dataTransfer
    });
  };

  componentWillLoad() {
    const parentElement = this.el.parentElement as HTMLChTreeXListElement;

    // Set item level
    this.level = parentElement.level;

    if (!mainTreeRef) {
      mainTreeRef = parentElement.parentElement as HTMLChTreeXElement;
    }

    this.showLines = mainTreeRef.showLines;

    // Check if must lazy load
    this.lazyLoadItems(this.expanded);

    // No need to update more the status
    if (this.level === 0) {
      return;
    }

    // Update checkbox status
    const parentElementItem =
      parentElement.parentElement as HTMLChTreeXListItemElement;

    if (parentElementItem.checkbox) {
      this.checked = parentElementItem.checked;
    }
  }

  componentDidLoad() {
    if (this.lastItem && this.showLines) {
      this.setResizeObserver();
    }
  }

  disconnectedCallback() {
    // If it was disconnected on edit mode, remove the body event handler
    if (this.editing) {
      this.removeEditMode(false);
    }

    this.disconnectObserver();
  }

  render() {
    const evenLevel = this.level % 2 === 0;
    const expandableButtonVisible = !this.leaf && this.showExpandableButton;
    const expandableButtonNotVisible = !this.leaf && !this.showExpandableButton;

    const acceptDrop = !this.leaf && this.dragState !== "start";
    const hasContent = !this.leaf && !this.lazyLoad;

    return (
      <Host
        role="treeitem"
        class={{
          [TREE_ITEM_TAG_NAME + "--downloading"]: this.downloading,
          [TREE_ITEM_TAG_NAME + "--editing"]: this.editing,
          [TREE_ITEM_TAG_NAME + "--drag-" + this.dragState]:
            this.dragState !== "none" && this.dragState !== "start",
          [TREE_ITEM_TAG_NAME + "--accept-drop"]: acceptDrop
        }}
        style={{ "--level": `${this.level}` }}
        // Drag and drop
        onDrop={acceptDrop ? this.handleDrop : null}
      >
        <button
          aria-controls={hasContent ? EXPANDABLE_ID : null}
          aria-expanded={hasContent ? this.expanded.toString() : null}
          class={{
            header: true,
            "header--selected": this.selected,
            "header--disabled": this.disabled,

            "header--expandable-offset": expandableButtonVisible,
            "header--checkbox-offset":
              expandableButtonNotVisible && this.checkbox,

            "header--even": evenLevel,
            "header--odd": !evenLevel,
            "header--even-expandable": evenLevel && expandableButtonVisible,
            "header--odd-expandable": !evenLevel && expandableButtonVisible,
            "header--level-0": this.level === 0
          }}
          part={`header${this.disabled ? " disabled" : ""}${
            this.selected ? " selected" : ""
          }`}
          type="button"
          disabled={this.disabled}
          onClick={this.handleActionClick}
          onKeyDown={!this.editing ? this.handleActionKeyDown : null}
          // Drag and drop
          draggable
          onDragStart={this.handleDragStart}
          onDragEnd={this.handleDragEnd}
          ref={el => (this.headerRef = el)}
        >
          {!this.leaf && this.showExpandableButton && (
            <button
              type="button"
              class={{
                "expandable-button": true,
                "expandable-button--expanded": this.expanded,
                "expandable-button--collapsed": !this.expanded
              }}
              part={`expandable-button${this.disabled ? " disabled" : ""}${
                this.expanded ? " expanded" : " collapsed"
              }`}
              disabled={this.disabled}
              onClick={this.toggleExpand}
            ></button>
          )}

          {this.checkbox && (
            <ch-checkbox
              accessibleName={this.caption}
              class="checkbox"
              part={`checkbox${this.disabled ? " disabled" : ""}${
                this.checked ? " checked" : ""
              }${this.indeterminate ? " indeterminate" : ""}`}
              checkedValue="true"
              disabled={this.disabled}
              indeterminate={this.indeterminate}
              unCheckedValue="false"
              value={`${this.checked}`}
              onInput={this.handleCheckedChange}
            ></ch-checkbox>
          )}

          <div
            class={{
              action: true,
              "readonly-mode": !this.editing
            }}
            onDblClick={!this.leaf ? this.handleActionDblClick : null}
          >
            {this.leftImgSrc && this.renderImg("left-img", this.leftImgSrc)}

            {this.editing ? (
              <input
                class="edit-name"
                part="edit-name"
                disabled={this.disabled}
                type="text"
                value={this.caption}
                onBlur={this.removeEditMode(false)}
                onKeyDown={this.checkIfShouldRemoveEditMode}
                ref={el => (this.inputRef = el)}
              />
            ) : (
              this.caption
            )}

            {this.rightImgSrc && this.renderImg("right-img", this.rightImgSrc)}
          </div>

          {this.showDownloadingSpinner && !this.leaf && this.downloading && (
            <div class="downloading" part="downloading"></div>
          )}

          {this.showLines && this.level !== 0 && (
            <div
              class={{ "dashed-line": true, "last-dashed-line": this.lastItem }}
              part={`dashed-line${this.lastItem ? " last-dashed-line" : ""}`}
            ></div>
          )}
        </button>

        {hasContent && (
          <div
            aria-busy={this.downloading.toString()}
            aria-live={this.downloading ? "polite" : null}
            id={EXPANDABLE_ID}
            class={{ expandable: true, expanded: this.expanded }}
            part={`expandable${this.expanded ? " expanded" : ""}`}
          >
            <slot name="tree" />
          </div>
        )}
      </Host>
    );
  }
}
