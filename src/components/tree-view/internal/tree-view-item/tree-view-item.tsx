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
import {
  TreeViewImagePathCallback,
  TreeViewItemImageMultiState,
  TreeViewItemModel
} from "../../types";
import { mouseEventModifierKey } from "../../../common/helpers";
import {
  ChCheckboxCustomEvent,
  ChTreeViewItemCustomEvent
} from "../../../../components";
import {
  isPseudoElementImg,
  removeDragImage,
  tokenMap,
  updateDirectionInImageCustomVar
} from "../../../../common/utils";
import {
  INITIAL_LEVEL,
  getTreeItemExpandedPart,
  getTreeItemLevelPart
} from "../../utils";
import {
  GxImageMultiState,
  GxImageMultiStateEnd,
  GxImageMultiStateStart,
  ImageRender
} from "../../../../common/types";
import {
  TREE_VIEW_ITEM_CHECKBOX_EXPORT_PARTS,
  TREE_VIEW_ITEM_EXPORT_PARTS,
  TREE_VIEW_ITEM_PARTS_DICTIONARY,
  TREE_VIEW_PARTS_DICTIONARY
} from "../../../../common/reserved-names";
import { getControlRegisterProperty } from "../../../../common/registry-properties";

// Drag and drop
export type DragState = "enter" | "none" | "start";

let GET_IMAGE_PATH_CALLBACK_REGISTRY: TreeViewImagePathCallback | undefined;

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
const START_IMAGE_PARTS =
  `${TREE_VIEW_ITEM_PARTS_DICTIONARY.IMAGE} ${TREE_VIEW_ITEM_PARTS_DICTIONARY.START_IMAGE}` as const;
const END_IMAGE_PARTS =
  `${TREE_VIEW_ITEM_PARTS_DICTIONARY.IMAGE} ${TREE_VIEW_ITEM_PARTS_DICTIONARY.END_IMAGE}` as const;

// Keys
const EXPANDABLE_ID = "expandable";
const ENTER_KEY = "Enter";
const ESCAPE_KEY = "Escape";

/**
 * @part item__action - A sub element of the header (item__header part) that contains the main information related to the item (startImage, caption/edit-caption, endImage and downloading).
 *
 * @part item__checkbox - The host element of the checkbox.
 * @part item__checkbox-container - The container that serves as a wrapper for the `input` and the `option` parts of the checkbox.
 * @part item__checkbox-input - The input element that implements the interactions for the checkbox.
 * @part item__checkbox-option - The actual "input" that is rendered above the `item__checkbox-input` part of the checkbox. This part has `position: absolute` and `pointer-events: none`.
 *
 * @part item__downloading - The spinner element that is rendered when the control is lazy loading its content. This element is rendered at the end of the `item__action` part.
 *
 * @part item__edit-caption - The input element that is rendered when the control is editing its caption. When rendered this element replaces the caption of the `item__action` part.
 *
 * @part item__expandable-button - The actionable expandable button element that is rendered when the control has subitems and the expandable button is interactive (`leaf !== true` and `expandableButton === "action"`). When rendered this element is placed at the start of the `item__action` part.
 *
 * @part item__group - The container element for the subitems of the control that is rendered when the content has been lazy loaded (`leaf !== true` and `lazyLoad !== true`).
 *
 * @part item__header - The container for all elements -excepts the subitems (`item__group` part)- of the control. It contains the `item__expandable-button`, `item_checkbox` and `item__action` parts.
 *
 * @part item__img - The img element that is rendered when the control has images (`startImgSrc` is defined and/or `endImgSrc` is defined).
 *
 * @part item__line - The element that is rendered to display the relationship between the control and its parent. Rendered if `level !== 0` and `showLines !== "none"`.
 *
 * @part disabled - Present in the `item__header`, `item__expandable-button`, `item__checkbox-input`, `item__checkbox-option` and `item__checkbox-container` parts when the control is disabled (`disabled` === `true`).
 *
 * @part expanded - Present in the `item__action`, `item__expandable-button` and `item__group` parts when the control is expanded (`expanded` === `true`).
 * @part collapsed - Present in the `item__action`, `item__expandable-button` and `item__group` parts when the control is collapsed (`expanded` !== `true`).
 *
 * @part expand-button - Present in the `item__header` part when the control has an expandable button (`level !== 0`, `leaf !== true` and `expandableButton !== "no"`).
 *
 * @part even-level - Present in the `item__group` and `item__header` parts when the control is in an even level (`level % 2 === 0`).
 * @part odd-level - Present in the `item__group` and `item__header` parts when the control is in an odd level (`level % 2 !== 0`).
 *
 * @part last-line - Present in the `item__line` part if the control is the last control of its parent item in `showLines = "last"` mode (`showLines === "last"`, `level !== 0` and `lastItem === true`).
 *
 * @part lazy-loaded - Present in the `item__group` part when the content of the control has been loaded (`leaf !== true`, `lazyLoad !== true` and `downloading !== true`).
 *
 * @part start-img - Present in the `item__img` part when the control has an start image element (`startImgSrc` is defined and `startImgType` === "img").
 * @part end-img - Present in the `item__img` part when the control has an end image element (`endImgSrc` is defined and `endImgType` === "img").
 *
 * @part editing - Present in the `item__header` and `item__action` parts when the control is in edit mode (`editable === true` and `editing === true`).
 * @part not-editing - Present in the `item__header` and `item__action` parts when the control isn't in edit mode (`editable !== true` or `editing !== true`).
 *
 * @part selected - Present in the `item__header` part when the control is selected (`selected` === `true`).
 * @part not-selected - Present in the `item__header` part when the control isn't selected (`selected` !== `true`).
 *
 * @part checked - Present in the `item__checkbox-input`, `item__checkbox-option` and `item__checkbox-container` parts when the control is checked and not indeterminate (`checked` === `true` and `indeterminate !== true`).
 * @part indeterminate - Present in the `item__checkbox-input`, `item__checkbox-option` and `item__checkbox-container` parts when the control is indeterminate (`indeterminate` === `true`).
 * @part unchecked - Present in the `item__checkbox-input`, `item__checkbox-option` and `item__checkbox-container` parts when the control is unchecked and not indeterminate (`checked` !== `true` and `indeterminate !== true`).
 *
 * @part drag-enter - Present in the `item__header` part when the control has `dragState === "enter"`.
 */
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

  #startImage: GxImageMultiStateStart | undefined;
  #startImageExpanded: GxImageMultiStateStart | undefined;
  #endImage: GxImageMultiStateEnd | undefined;
  #endImageExpanded: GxImageMultiStateEnd | undefined;

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
  @Watch("endImgSrc")
  endImgSrcChanged(newImage: string) {
    // Necessary to avoid race condition where the image is updated, the Watch
    // is dispatched and then the model is updated
    this.model.endImgSrc = newImage;
    this.#computeImage("end");
  }

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
   * This property specifies a callback that is executed when the path for an
   * item image needs to be resolved.
   */
  @Prop() readonly getImagePathCallback!: TreeViewImagePathCallback;
  @Watch("getImagePathCallback")
  getImagePathCallbackChanged() {
    this.#computeImage("start");
    this.#computeImage("end");
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
   * Specifies the model of the item.
   */
  @Prop() readonly model: TreeViewItemModel;

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
  @Watch("startImgSrc")
  startImgSrcChanged(newImage: string) {
    // Necessary to avoid race condition where the image is updated, the Watch
    // is dispatched and then the model is updated
    this.model.startImgSrc = newImage;
    this.#computeImage("start");
  }

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

  #computeImage = (direction: "start" | "end") => {
    if (
      (direction === "start" && !this.startImgSrc) ||
      (direction === "end" && !this.endImgSrc)
    ) {
      return;
    }

    const getImagePathCallback =
      this.getImagePathCallback ?? GET_IMAGE_PATH_CALLBACK_REGISTRY;

    const img = getImagePathCallback(this.model, direction);
    const imageIsString = typeof img === "string";
    const parsedImg: GxImageMultiState = imageIsString
      ? { base: img }
      : img?.default;

    if (direction === "start") {
      if (!img) {
        this.#startImage = null;
        this.#startImageExpanded = null;
        return;
      }

      // Add url("") wrapper for the image path as it is going to be used in a
      // background or mask
      if (imageIsString && this.startImgType !== "img") {
        parsedImg.base = `url("${parsedImg.base}")`;
      }
      // If the image is not a string, then the expanded member could be defined
      else {
        this.#startImageExpanded = this.startImgSrc
          ? (updateDirectionInImageCustomVar(
              (img as TreeViewItemImageMultiState).expanded,
              "start"
            ) as GxImageMultiStateStart)
          : undefined;
      }

      this.#startImage = this.startImgSrc
        ? (updateDirectionInImageCustomVar(
            parsedImg,
            "start"
          ) as GxImageMultiStateStart)
        : undefined;
    }
    // End image
    else {
      if (!img) {
        this.#endImage = null;
        this.#endImageExpanded = null;
        return;
      }

      // Add url("") wrapper for the image path as it is going to be used in a
      // background or mask
      if (imageIsString && this.endImgType !== "img") {
        parsedImg.base = `url("${parsedImg.base}")`;
      }
      // If the image is not a string, then the expanded member could be defined
      else {
        this.#endImageExpanded = this.endImgSrc
          ? (updateDirectionInImageCustomVar(
              (img as TreeViewItemImageMultiState).expanded,
              "end"
            ) as GxImageMultiStateEnd)
          : undefined;
      }

      this.#endImage = this.endImgSrc
        ? (updateDirectionInImageCustomVar(
            parsedImg,
            "end"
          ) as GxImageMultiStateEnd)
        : undefined;
    }
  };

  #getImageExpandedOrDefault = <
    T extends GxImageMultiStateStart | GxImageMultiStateEnd
  >(
    base: T,
    expanded: T
  ): T => (this.expanded ? expanded ?? base : base);

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
    imageType === "img" && (
      <img
        aria-hidden="true"
        class={`img ${cssClass}`}
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
    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??= getControlRegisterProperty(
      "getImagePathCallback",
      "ch-tree-view-render"
    );

    if (this.toggleCheckboxes) {
      this.el.addEventListener(
        "checkboxChange",
        this.#handleCheckBoxChangeInItems
      );
    }

    this.#computeImage("start");
    this.#computeImage("end");

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
          style={
            pseudoStartImage && (this.#startImage || this.#startImageExpanded)
              ? this.#getImageExpandedOrDefault(
                  this.#startImage,
                  this.#startImageExpanded
                )
              : undefined
          }
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
                    pseudoEndImage
                }}
                part={tokenMap({
                  [TREE_VIEW_ITEM_PARTS_DICTIONARY.ACTION]: true,
                  [this.editing
                    ? TREE_VIEW_ITEM_PARTS_DICTIONARY.EDITING
                    : TREE_VIEW_ITEM_PARTS_DICTIONARY.NOT_EDITING]: true,
                  [expandedPart]: !this.leaf,
                  [this.parts]: hasParts
                })}
                style={
                  pseudoEndImage && (this.#endImage || this.#endImageExpanded)
                    ? this.#getImageExpandedOrDefault(
                        this.#endImage,
                        this.#endImageExpanded
                      )
                    : undefined
                }
                onDblClick={!this.editing ? this.#handleActionDblClick : null}
              >
                {this.startImgSrc &&
                  this.#startImage &&
                  this.#renderImg(
                    hasParts
                      ? `${START_IMAGE_PARTS} ${this.parts}`
                      : START_IMAGE_PARTS,
                    this.#startImage["--ch-start-img--base"],
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

                {this.endImgSrc &&
                  this.#endImage &&
                  this.#renderImg(
                    hasParts
                      ? `${END_IMAGE_PARTS} ${this.parts}`
                      : END_IMAGE_PARTS,
                    this.#endImage["--ch-end-img--base"],
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
              key="line"
              class={{
                line: true,
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
