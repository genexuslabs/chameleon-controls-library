import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Method,
  Prop,
  Watch,
  h,
  writeTask
} from "@stencil/core";
import {
  TreeViewItemDragStartInfo,
  TreeViewLines,
  TreeViewItemCheckedInfo,
  TreeViewItemNewCaption,
  TreeViewItemOpenReferenceInfo,
  TreeViewItemSelected
} from "../tree-view/types";
import { mouseEventModifierKey } from "../../../common/helpers";
import {
  ChCheckboxCustomEvent,
  ChTreeViewItemCustomEvent
} from "../../../../components";
import {
  isPseudoElementImg,
  removeDragImage,
  tokenMap
} from "../../../../common/utils";
import {
  INITIAL_LEVEL,
  getTreeItemExpandedPart,
  getTreeItemLevelPart
} from "../../utils";
import { ImageRender } from "../../../../common/types";
import {
  TREE_VIEW_ITEM_CHECKBOX_EXPORT_PARTS,
  TREE_VIEW_ITEM_EXPORT_PARTS,
  TREE_VIEW_ITEM_PARTS_DICTIONARY,
  TREE_VIEW_PARTS_DICTIONARY
} from "../../../../common/reserverd-names";

// Drag and drop
export type DragState = "enter" | "none" | "start";

const DISTANCE_TO_CHECKBOX_CUSTOM_VAR =
  "--ch-tree-view-item-distance-to-checkbox";

// Selectors
const TREE_ITEM_TAG_NAME = "ch-tree-view-item";

const DIRECT_TREE_ITEM_CHILDREN = `:scope>${TREE_ITEM_TAG_NAME}`;
const FIRST_ENABLED_SUB_ITEM = `${TREE_ITEM_TAG_NAME}:not([disabled])`;
const LAST_SUB_ITEM = `:scope>${TREE_ITEM_TAG_NAME}:last-child`;

// Custom classes
const DENY_DROP_CLASS = `item-deny-drop`;

// Custom parts
const START_IMAGE_PARTS = `${TREE_VIEW_ITEM_PARTS_DICTIONARY.IMAGE} ${TREE_VIEW_ITEM_PARTS_DICTIONARY.START_IMAGE}`;
const END_IMAGE_PARTS = `${TREE_VIEW_ITEM_PARTS_DICTIONARY.IMAGE} ${TREE_VIEW_ITEM_PARTS_DICTIONARY.END_IMAGE}`;

// Keys
const EXPANDABLE_ID = "expandable";
const ENTER_KEY = "Enter";
const ESCAPE_KEY = "Escape";

@Component({
  tag: "ch-tree-view-item",
  styleUrl: "tree-view-item.scss",
  shadow: true
})
export class ChTreeViewItem {
  #watcher: ResizeObserver;

  /**
   * Useful to ignore the checkbox change when it was committed from a children.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #ignoreCheckboxChange = false;

  // Refs
  #headerRef: HTMLButtonElement;
  #inputRef: HTMLInputElement;

  @Element() el: HTMLChTreeViewItemElement;

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
    if (!this.toggleCheckboxes || this.leaf || this.#ignoreCheckboxChange) {
      this.#ignoreCheckboxChange = false;
      return;
    }

    const treeItems = this.#getDirectTreeItems();

    treeItems.forEach(treeItem => {
      if (treeItem.checked !== newValue || treeItem.indeterminate !== false) {
        treeItem.updateChecked(newValue, false);
      }
    });
  }

  /**
   * Set this attribute if you want to set a custom render for the control, by
   * passing a slot.
   */
  @Prop() readonly customRender: boolean = false;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @Prop({ reflect: true }) readonly disabled: boolean = false;

  /**
   * This attribute lets you specify if the drag operation is disabled in the
   * control. If `true`, the control can't be dragged.
   */
  @Prop() readonly dragDisabled: boolean = false;

  /**
   * This attribute lets you specify if the drop operation is disabled in the
   * control. If `true`, the control won't accept any drops.
   */
  @Prop() readonly dropDisabled: boolean = false;

  /**
   * This property lets you define the current state of the item when it's
   * being dragged.
   */
  @Prop({ mutable: true }) dragState: DragState = "none";

  /**
   * This attribute lets you specify when items are being lazy loaded in the
   * control.
   */
  @Prop({ mutable: true }) downloading = false;

  /**
   * This attribute lets you specify if the edit operation is enabled in the
   * control. If `true`, the control can edit its caption in place.
   */
  @Prop() readonly editable: boolean;

  /**
   * Set this attribute when the item is in edit mode
   */
  @Prop({ mutable: true }) editing = false;
  @Watch("editing")
  editingChanged(isEditing: boolean) {
    if (!isEditing) {
      return;
    }

    document.addEventListener("click", this.#removeEditModeOnClick, {
      capture: true
    });

    // Wait until the input is rendered to focus it
    writeTask(() => {
      requestAnimationFrame(() => {
        if (this.#inputRef) {
          this.#inputRef.focus();
        }
      });
    });
  }

  /**
   * Specifies the src of the end image.
   */
  @Prop() readonly endImgSrc: string;

  /**
   * Specifies how the end image will be rendered.
   */
  @Prop() readonly endImgType: ImageRender = "background";

  /**
   * Specifies what kind of expandable button is displayed.
   * Only works if `leaf === false`.
   *  - `"expandableButton"`: Expandable button that allows to expand/collapse
   *     the items of the control.
   *  - `"decorative"`: Only a decorative icon is rendered to display the state
   *     of the item.
   */
  @Prop() readonly expandableButton: "action" | "decorative" | "no" =
    "decorative";

  /**
   * `true` to expand the control on click interaction. If `false`, with mouse
   * interaction the control will only be expanded on double click.
   */
  @Prop() readonly expandOnClick: boolean = true;

  /**
   * If the item has a sub-tree, this attribute determines if the subtree is
   * displayed.
   */
  @Prop({ mutable: true }) expanded = false;
  @Watch("expanded")
  expandedChanged(isExpanded: boolean) {
    // Wait until all properties are updated before lazy loading. Otherwise, the
    // lazyLoad property could be updated just after the executing of the function
    setTimeout(() => {
      this.#lazyLoadItems(isExpanded);
    });
  }

  /**
   * This attribute specifies if the control is the last items in its subtree
   */
  @Prop() readonly lastItem: boolean = false;
  @Watch("lastItem")
  lastItemChanged(isLastItem: boolean) {
    if (isLastItem && this.showLines) {
      // Use RAF to set the observer after the render method has completed
      requestAnimationFrame(() => {
        this.#setResizeObserver();
      });
    } else {
      this.#disconnectObserver();
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
   * Level in the tree at which the item is placed.
   */
  @Prop() readonly level: number = INITIAL_LEVEL;

  /**
   * `true` if the checkbox's value is indeterminate.
   */
  @Prop({ mutable: true }) indeterminate = false;

  /**
   * This attribute represents additional info for the control that is included
   * when dragging the item.
   */
  @Prop() readonly metadata: string;

  /**
   * Specifies a set of parts to use in every DOM element of the control.
   */
  @Prop() readonly parts?: string;
  @Watch("parts")
  partsChanged(newParts: string) {
    this.#setExportParts(newParts);
  }

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
   * `true` to display the relation between tree items and tree lists using
   * lines.
   */
  @Prop() readonly showLines: TreeViewLines = "none";
  @Watch("showLines")
  showLinesChanged(newShowLines: TreeViewLines) {
    if (newShowLines && this.lastItem) {
      this.#setResizeObserver();
    } else {
      this.#disconnectObserver();
    }
  }

  /**
   * Specifies the src of the start image.
   */
  @Prop() readonly startImgSrc: string;

  /**
   * Specifies how the start image will be rendered.
   */
  @Prop() readonly startImgType: ImageRender = "background";

  /**
   * Set this attribute if you want all the children item's checkboxes to be
   * checked when the parent item checkbox is checked, or to be unchecked when
   * the parent item checkbox is unchecked.
   */
  @Prop() readonly toggleCheckboxes: boolean = false;
  @Watch("toggleCheckboxes")
  handleToggleCheckboxesChange(newToggleCheckboxesValue: boolean) {
    if (newToggleCheckboxesValue) {
      this.el.addEventListener(
        "checkboxChange",
        this.#handleCheckBoxChangeInItems
      );
    } else {
      this.el.removeEventListener(
        "checkboxChange",
        this.#handleCheckBoxChangeInItems
      );
    }
  }

  /**
   * Fired when the checkbox value of the control is changed.
   */
  @Event() checkboxChange: EventEmitter<TreeViewItemCheckedInfo>;

  /**
   * Fired when the checkbox value of the control is changed. This event only
   * applies when the control has `toggleCheckboxes = true`
   */
  @Event() checkboxToggleChange: EventEmitter<TreeViewItemCheckedInfo>;

  /**
   * Fired when the item is being dragged.
   */
  @Event() itemDragStart: EventEmitter<TreeViewItemDragStartInfo>;

  /**
   * Fired when the item is no longer being dragged.
   */
  @Event() itemDragEnd: EventEmitter;

  /**
   * Fired when the lazy control is expanded an its content must be loaded.
   */
  @Event() loadLazyContent: EventEmitter<string>;

  /**
   * Fired when the item is asking to modify its caption.
   */
  @Event() modifyCaption: EventEmitter<TreeViewItemNewCaption>;

  /**
   * Fired when the user interacts with the control in a way that its reference
   * must be opened.
   */
  @Event() openReference: EventEmitter<TreeViewItemOpenReferenceInfo>;

  /**
   * Fired when the selected state is updated by user interaction on the
   * control.
   */
  @Event() selectedItemChange: EventEmitter<TreeViewItemSelected>;

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
      ) as HTMLChTreeViewItemElement;

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
      .nextElementSibling as HTMLChTreeViewItemElement;

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
    if (this.level === INITIAL_LEVEL) {
      return;
    }

    // Otherwise, ask the parent to focus the next sibling
    const parentItem = this.el.parentElement as HTMLChTreeViewItemElement;
    parentItem.focusNextSibling(ctrlKeyPressed);
  }

  /**
   * Focus the previous item in the tree. If the previous item is expanded, it focuses
   * the last subitem in its tree.
   */
  @Method()
  async focusPreviousItem(ctrlKeyPressed: boolean) {
    const previousSiblingItem = this.el
      .previousElementSibling as HTMLChTreeViewItemElement;

    // Focus last item of the previous sibling
    if (previousSiblingItem) {
      previousSiblingItem.focusLastItem(ctrlKeyPressed);
      return;
    }

    // The item is the first one of the tree at the first level
    if (this.level === INITIAL_LEVEL) {
      return;
    }

    // Otherwise, set focus in the parent element
    const parentItem = this.el.parentElement as HTMLChTreeViewItemElement;

    // Check if the parent is not disabled
    if (parentItem.disabled) {
      parentItem.focusPreviousItem(ctrlKeyPressed);
      return;
    }

    parentItem.setFocus(ctrlKeyPressed);
  }

  /**
   * Focus the last item in its subtree. If the control is not expanded, it
   * focus the control.
   */
  @Method()
  async focusLastItem(ctrlKeyPressed: boolean) {
    // Focus the last subitem if expanded and not lazy loading
    if (!this.leaf && this.expanded) {
      const lastSubItem = this.el.querySelector(
        LAST_SUB_ITEM
      ) as HTMLChTreeViewItemElement;

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
   * Set focus in the control.
   */
  @Method()
  async setFocus(ctrlKeyPressed: boolean) {
    this.#headerRef.focus();

    // Normal navigation auto selects the item.
    if (!ctrlKeyPressed) {
      this.#setSelected();
    }
  }

  /**
   * Update `checked` and `indeterminate` properties.
   */
  @Method()
  async updateChecked(newChecked: boolean, newIndeterminate: boolean) {
    this.checked = newChecked;
    this.indeterminate = newIndeterminate;

    // Emit the event to sync with the UI model, even if the item does not
    // have toggleCheckboxes property
    this.checkboxToggleChange.emit({
      id: this.el.id,
      checked: newChecked,
      indeterminate: newIndeterminate
    });
  }

  #getDirectTreeItems = (): HTMLChTreeViewItemElement[] =>
    Array.from(
      this.el.querySelectorAll(DIRECT_TREE_ITEM_CHILDREN)
    ) as HTMLChTreeViewItemElement[];

  #setResizeObserver = () => {
    this.#watcher = new ResizeObserver(() => {
      const distanceToCheckbox =
        this.el.getBoundingClientRect().height -
        this.#headerRef.getBoundingClientRect().height / 2;

      this.el.style.setProperty(
        DISTANCE_TO_CHECKBOX_CUSTOM_VAR,
        distanceToCheckbox + "px"
      );
    });

    this.#watcher.observe(this.el);
    this.#watcher.observe(this.#headerRef);
  };

  #disconnectObserver = () => {
    if (!this.#watcher) {
      return;
    }
    this.#watcher.disconnect();
    this.#watcher = null;
  };

  #checkIfShouldRemoveEditMode = (event: KeyboardEvent) => {
    event.stopPropagation();

    if (event.code !== ENTER_KEY && event.code !== ESCAPE_KEY) {
      return;
    }

    event.preventDefault();
    const commitEdition = event.code === ENTER_KEY;
    this.#removeEditMode(true, commitEdition)();
  };

  #removeEditModeOnClick = (event: PointerEvent) => {
    // The click is executed outside the input and the pointer type is defined,
    // meaning that the button click was not triggered by the Enter or Space keys
    if (!event.composedPath().includes(this.#inputRef) && event.pointerType) {
      this.#removeEditMode(false)();
    }
  };

  #removeEditMode =
    (shouldFocusHeader: boolean, commitEdition = false) =>
    () => {
      // When pressing the enter key in the input, the removeEditMode event is
      // triggered twice (due to the headerRef.focus() triggering the onBlur
      // event in the input), so we need to check if the edit mode was disabled
      if (!this.editing) {
        return;
      }
      this.editing = false;

      document.removeEventListener("click", this.#removeEditModeOnClick, {
        capture: true
      });

      const newCaption = this.#inputRef.value;

      if (commitEdition && newCaption.trim() !== "") {
        this.modifyCaption.emit({
          id: this.el.id,
          caption: newCaption
        });
      }

      if (shouldFocusHeader) {
        this.#headerRef.focus();
      }
    };

  #toggleExpand = (event: MouseEvent) => {
    event.stopPropagation();

    if (!this.leaf) {
      this.expanded = !this.expanded;
    }

    this.selected = true;
    this.selectedItemChange.emit(
      this.#getSelectedInfo(mouseEventModifierKey(event), true)
    );
  };

  #lazyLoadItems = (expanded: boolean) => {
    if (!this.lazyLoad || !expanded) {
      return;
    }

    // Load items
    this.lazyLoad = false;
    this.downloading = true;

    this.loadLazyContent.emit(this.el.id);
  };

  #toggleSelected = () => {
    const selected = !this.selected;
    this.selected = selected;

    this.selectedItemChange.emit(this.#getSelectedInfo(true, selected));
  };

  #setSelected = () => {
    this.selected = true;
    this.selectedItemChange.emit(this.#getSelectedInfo(false, true));
  };

  #toggleOrSelect = (event: MouseEvent) => {
    // Ctrl key
    if (mouseEventModifierKey(event)) {
      this.#toggleSelected();
      return;
    }

    // Double click was triggered, don't update the selection or expand
    if (event.detail >= 2) {
      return;
    }

    // Expand on click interaction
    if (this.expandOnClick) {
      this.#toggleExpand(event);
    }
    // Click only selects the item
    else {
      this.#setSelected();
    }
  };

  #getSelectedInfo = (
    ctrlKeyPressed: boolean,
    selected: boolean
  ): TreeViewItemSelected => ({
    ctrlKeyPressed: ctrlKeyPressed,
    expanded: this.expanded,
    id: this.el.id,
    metadata: this.metadata,
    parentId: this.el.parentElement?.id, // TODO: Improve this
    selected: selected
  });

  #handleActionDblClick = (event: PointerEvent) => {
    event.stopPropagation();

    if (mouseEventModifierKey(event)) {
      this.#toggleSelected();
      return;
    }

    this.#emitOpenReference();

    // The Control key is not pressed, so the control can be expanded if double
    // click expands the item
    if (!this.leaf && !this.expandOnClick) {
      this.#toggleExpand(event);
    }
  };

  /**
   * Event triggered by the following actions on the main button:
   *   - Click
   *   - Enter keydown
   *   - Space keydown and keyup
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #handleActionClick = (event: PointerEvent) => {
    event.stopPropagation();

    // Don't perform actions when editing
    if (this.editing) {
      return;
    }

    event.preventDefault();

    // Click event
    if (event.pointerType) {
      this.#toggleOrSelect(event);
      return;
    }

    // The action was provoked by the keyboard, emit openReference event
    this.#emitOpenReference();

    // Enter or space
    this.#toggleExpand(event);
  };

  /**
   * Event triggered by key events on the main button.
   */
  // eslint-disable-next-line @stencil-community/own-props-must-be-private
  #handleActionKeyDown = (event: KeyboardEvent) => {
    // Only toggle if the Enter key was pressed with the Ctrl key
    if (mouseEventModifierKey(event) && event.code === ENTER_KEY) {
      event.stopPropagation();
      this.#toggleSelected();
    }
  };

  #emitOpenReference = () => {
    this.openReference.emit({
      id: this.el.id,
      leaf: this.leaf,
      metadata: this.metadata
    });
  };

  #handleCheckedChange = (event: ChCheckboxCustomEvent<any> & InputEvent) => {
    event.stopPropagation();
    const chCheckboxRef = event.target;

    const checked = chCheckboxRef.checkedValue === chCheckboxRef.value;
    this.checked = checked;
    this.indeterminate = false; // Changing the checked value makes it no longer indeterminate

    this.checkboxChange.emit({
      id: this.el.id,
      checked: this.checked,
      indeterminate: false
    });
  };

  #handleCheckBoxChangeInItems = (
    event: ChTreeViewItemCustomEvent<TreeViewItemCheckedInfo>
  ) => {
    // No need to update the checkbox value based on the children checkbox
    if (this.el === event.target) {
      return;
    }

    const updatedCheck = event.detail.checked;
    const treeItems = this.#getDirectTreeItems();

    // Check if all the items have the same value as the updated item
    const allItemsHaveTheSameCheckedValue = treeItems.every(
      treeItem => treeItem.checked === updatedCheck
    );

    const eventMustBeEmitted =
      this.checked !== updatedCheck ||
      this.indeterminate !== !allItemsHaveTheSameCheckedValue;

    this.#ignoreCheckboxChange = this.checked !== updatedCheck;
    this.checked = updatedCheck;
    this.indeterminate = !allItemsHaveTheSameCheckedValue;

    // Sync with the UI Model
    if (eventMustBeEmitted) {
      this.checkboxToggleChange.emit({
        id: this.el.id,
        checked: updatedCheck,
        indeterminate: !allItemsHaveTheSameCheckedValue
      });
    }
  };

  #renderImg = (cssClass: string, src: string, imageType: ImageRender) =>
    imageType === "img" &&
    src && (
      <img
        aria-hidden="true"
        class={cssClass}
        part={cssClass}
        alt=""
        src={src}
        loading="lazy"
      />
    );

  #handleDragStart = (event: DragEvent) => {
    // Disallow drag when editing the caption
    if (this.editing) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    removeDragImage(event);
    event.dataTransfer.effectAllowed = "move";

    this.dragState = "start";
    this.itemDragStart.emit({
      elem: this.el,
      dragEvent: event
    });
  };

  #handleDragEnd = () => {
    // event.preventDefault();

    // this.el.style.cursor = null;
    this.dragState = "none";
    this.itemDragEnd.emit();
  };

  #setExportParts = (exportparts: string | undefined) => {
    if (exportparts) {
      this.el.setAttribute(
        "exportparts",
        // Replace sequential empty characters with a comma
        `${TREE_VIEW_ITEM_EXPORT_PARTS},${exportparts.replace(/\s+/g, ",")}`
      );
    } else {
      this.el.setAttribute("exportparts", TREE_VIEW_ITEM_EXPORT_PARTS);
    }
  };

  connectedCallback() {
    if (this.toggleCheckboxes) {
      this.el.addEventListener(
        "checkboxChange",
        this.#handleCheckBoxChangeInItems
      );
    }

    // Static attributes that we including in the Host functional component to
    // eliminate additional overhead
    this.el.setAttribute("role", "treeitem");
    this.el.setAttribute("aria-level", `${this.level + 1}`);
    this.el.style.setProperty("--level", `${this.level}`);
    this.#setExportParts(this.parts);
  }

  componentWillLoad() {
    // Check if must lazy load
    this.#lazyLoadItems(this.expanded);
  }

  componentDidLoad() {
    if (this.lastItem && this.showLines) {
      this.#setResizeObserver();
    }
  }

  disconnectedCallback() {
    // If it was disconnected on edit mode, remove the body event handler
    if (this.editing) {
      this.#removeEditMode(false);
    }

    this.#disconnectObserver();

    this.el.removeEventListener(
      "checkboxChange",
      this.#handleCheckBoxChangeInItems
    );
  }

  render() {
    const evenLevel = this.level % 2 === 0;

    const hasContent = !this.leaf && !this.lazyLoad;

    const canShowLines = this.level !== INITIAL_LEVEL;
    const showAllLines = this.showLines === "all" && canShowLines;
    const showLastLine =
      this.showLines === "last" && canShowLines && this.lastItem;

    const levelPart = getTreeItemLevelPart(evenLevel);
    const expandedPart = getTreeItemExpandedPart(this.expanded);

    const pseudoStartImage = isPseudoElementImg(
      this.startImgSrc,
      this.startImgType
    );
    const pseudoEndImage = isPseudoElementImg(this.endImgSrc, this.endImgType);

    const hasParts = !!this.parts;

    return (
      <Host
        aria-selected={this.selected ? "true" : null}
        class={this.leaf ? DENY_DROP_CLASS : null}
        part={tokenMap({
          [TREE_VIEW_PARTS_DICTIONARY.ITEM]: true,
          [TREE_VIEW_PARTS_DICTIONARY.DRAG_ENTER]: this.dragState === "enter",
          [this.parts]: hasParts
        })}
      >
        <button
          aria-controls={hasContent ? EXPANDABLE_ID : null}
          aria-expanded={hasContent ? this.expanded.toString() : null}
          class={{
            header: true,
            "header--selected": this.selected,
            "header--disabled": this.disabled,

            "expandable-button-decorative":
              !this.leaf && this.expandableButton === "decorative",
            "expandable-button-decorative--collapsed":
              !this.leaf &&
              this.expandableButton === "decorative" &&
              !this.expanded
          }}
          part={tokenMap({
            [TREE_VIEW_ITEM_PARTS_DICTIONARY.HEADER]: true,
            [TREE_VIEW_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
            [TREE_VIEW_ITEM_PARTS_DICTIONARY.DRAG_ENTER]:
              this.dragState === "enter",
            [TREE_VIEW_ITEM_PARTS_DICTIONARY.SELECTED]: this.selected,
            [TREE_VIEW_ITEM_PARTS_DICTIONARY.NOT_SELECTED]: !this.selected,
            [TREE_VIEW_ITEM_PARTS_DICTIONARY.EXPAND_BUTTON]:
              canShowLines && !this.leaf && this.expandableButton !== "no",
            [this.editing
              ? TREE_VIEW_ITEM_PARTS_DICTIONARY.EDITING
              : TREE_VIEW_ITEM_PARTS_DICTIONARY.NOT_EDITING]: true,
            [levelPart]: canShowLines,
            [this.parts]: hasParts
          })}
          type="button"
          disabled={this.disabled}
          onClick={this.#handleActionClick}
          onKeyDown={!this.editing ? this.#handleActionKeyDown : null}
          // Drag and drop
          draggable={!this.dragDisabled}
          onDragStart={this.#handleDragStart}
          onDragEnd={
            !this.dragDisabled && this.dragState === "start"
              ? this.#handleDragEnd
              : null
          }
          ref={el => (this.#headerRef = el)}
        >
          {!this.leaf && this.expandableButton === "action" && (
            <button
              key="expandable-button"
              type="button"
              class={{
                "expandable-button": true,
                "expandable-button--expanded": this.expanded,
                "expandable-button--collapsed": !this.expanded
              }}
              part={tokenMap({
                [TREE_VIEW_ITEM_PARTS_DICTIONARY.EXPANDABLE_BUTTON]: true,
                [TREE_VIEW_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
                [expandedPart]: true,
                [this.parts]: hasParts
              })}
              disabled={this.disabled}
              onClick={this.#toggleExpand}
            ></button>
          )}

          {this.checkbox && (
            <ch-checkbox
              key="checkbox"
              accessibleName={this.caption}
              class="checkbox"
              exportparts={TREE_VIEW_ITEM_CHECKBOX_EXPORT_PARTS}
              part={
                hasParts
                  ? `${TREE_VIEW_ITEM_PARTS_DICTIONARY.CHECKBOX} ${this.parts}`
                  : TREE_VIEW_ITEM_PARTS_DICTIONARY.CHECKBOX
              }
              checkedValue="true"
              disabled={this.disabled}
              indeterminate={this.indeterminate}
              unCheckedValue="false"
              value={`${this.checked}`}
              onInput={this.#handleCheckedChange}
            ></ch-checkbox>
          )}

          {this.customRender ? (
            <slot name="custom-content" />
          ) : (
            [
              <div
                class={{
                  action: true,
                  "action--end-img": !!this.endImgSrc,

                  [`start-img-type--${this.startImgType} pseudo-img--start`]:
                    pseudoStartImage,
                  [`end-img-type--${this.endImgType} pseudo-img--end`]:
                    pseudoEndImage,
                  "readonly-mode": !this.editing
                }}
                part={tokenMap({
                  [TREE_VIEW_ITEM_PARTS_DICTIONARY.ACTION]: true,
                  [this.editing
                    ? TREE_VIEW_ITEM_PARTS_DICTIONARY.EDITING
                    : TREE_VIEW_ITEM_PARTS_DICTIONARY.NOT_EDITING]: true,
                  [expandedPart]: !this.leaf,
                  [this.parts]: hasParts
                })}
                style={{
                  "--ch-start-img": pseudoStartImage
                    ? `url("${this.startImgSrc}")`
                    : null,
                  "--ch-end-img": pseudoEndImage
                    ? `url("${this.endImgSrc}")`
                    : null
                }}
                onDblClick={!this.editing ? this.#handleActionDblClick : null}
              >
                {this.#renderImg(
                  hasParts
                    ? `${START_IMAGE_PARTS} ${this.parts}`
                    : START_IMAGE_PARTS,
                  this.startImgSrc,
                  this.startImgType
                )}

                {this.editable && this.editing ? (
                  <input
                    key="edit-caption"
                    class="edit-caption"
                    part={
                      hasParts
                        ? `${TREE_VIEW_ITEM_PARTS_DICTIONARY.EDIT_CAPTION} ${this.parts}`
                        : TREE_VIEW_ITEM_PARTS_DICTIONARY.EDIT_CAPTION
                    }
                    disabled={this.disabled}
                    type="text"
                    value={this.caption}
                    onBlur={this.#removeEditMode(false)}
                    onKeyDown={this.#checkIfShouldRemoveEditMode}
                    ref={el => (this.#inputRef = el)}
                  />
                ) : (
                  this.caption
                )}

                {this.#renderImg(
                  hasParts
                    ? `${END_IMAGE_PARTS} ${this.parts}`
                    : END_IMAGE_PARTS,
                  this.endImgSrc,
                  this.endImgType
                )}
              </div>,

              this.showDownloadingSpinner && !this.leaf && this.downloading && (
                <div
                  class="downloading"
                  part={
                    hasParts
                      ? `${TREE_VIEW_ITEM_PARTS_DICTIONARY.DOWNLOADING} ${this.parts}`
                      : TREE_VIEW_ITEM_PARTS_DICTIONARY.DOWNLOADING
                  }
                ></div>
              )
            ]
          )}

          {(showAllLines || showLastLine) && (
            <div
              key="dashed-line"
              class={{
                "dashed-line": true,
                "last-all-line": showAllLines && this.lastItem,
                "last-line": showLastLine
              }}
              part={tokenMap({
                [TREE_VIEW_ITEM_PARTS_DICTIONARY.LINE]: true,
                [TREE_VIEW_ITEM_PARTS_DICTIONARY.LAST_LINE]: this.lastItem,
                [this.parts]: hasParts
              })}
            ></div>
          )}
        </button>

        {hasContent && (
          <div
            role="group"
            aria-busy={(!!this.downloading).toString()}
            aria-live={this.downloading ? "polite" : null}
            id={EXPANDABLE_ID}
            class={{
              expandable: true,
              "expandable--collapsed": !this.expanded,
              "expandable--lazy-loaded": !this.downloading,

              "expandable--even": canShowLines && evenLevel,
              "expandable--odd": canShowLines && !evenLevel
            }}
            part={tokenMap({
              [TREE_VIEW_ITEM_PARTS_DICTIONARY.GROUP]: true,
              [TREE_VIEW_ITEM_PARTS_DICTIONARY.LAZY_LOADED]: !this.downloading,
              [expandedPart]: true,
              [levelPart]: canShowLines,
              [this.parts]: hasParts
            })}
          >
            <slot />
          </div>
        )}
      </Host>
    );
  }
}
